import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mapeos de valores a texto legible
const propertyTypeMap: Record<string, string> = {
  piso: "Piso",
  casa: "Casa unifamiliar",
  atico: "Ático",
  duplex: "Dúplex",
};

const buildingAgeMap: Record<string, string> = {
  nueva: "Obra nueva (menos de 5 años)",
  reciente: "Edificio reciente (5-15 años)",
  moderna: "Edificio de 15-30 años",
  antigua: "Edificio de 30-50 años",
  "muy-antigua": "Edificio de más de 50 años",
};

const floorMap: Record<string, string> = {
  bajo: "Planta baja",
  "1-2": "Planta 1ª a 2ª",
  "3-5": "Planta 3ª a 5ª",
  "6+": "Planta 6ª o superior",
  atico: "Ático",
};

const orientationMap: Record<string, string> = {
  norte: "Norte",
  sur: "Sur",
  este: "Este",
  oeste: "Oeste",
  noreste: "Noreste",
  noroeste: "Noroeste",
  sureste: "Sureste",
  suroeste: "Suroeste",
};

const conditionMap: Record<string, string> = {
  "a-estrenar": "A estrenar / Nunca habitado",
  reformado: "Reformado recientemente",
  "buen-estado": "Buen estado general",
  "para-reformar": "Para reformar / Necesita actualización",
};

const qualityMap: Record<string, string> = {
  lujo: "Calidades de lujo / Premium",
  alta: "Calidades altas / Superiores",
  media: "Calidades medias / Estándar",
  basica: "Calidades básicas / Económicas",
};

// Función auxiliar para extraer ciudad de código postal o municipio
function extractLocation(postalCode: string, municipality: string): { city: string; province: string } {
  // Usar el municipio directamente
  let city = municipality || "Madrid";

  // Intentar inferir provincia del código postal
  const cpPrefix = postalCode.substring(0, 2);
  const provinceMap: Record<string, string> = {
    "28": "Madrid",
    "08": "Barcelona",
    "46": "Valencia",
    "41": "Sevilla",
    "29": "Málaga",
    "03": "Alicante",
    "30": "Murcia",
    "50": "Zaragoza",
    "18": "Granada",
    "14": "Córdoba",
    // Añade más si es necesario
  };

  const province = provinceMap[cpPrefix] || "Madrid";

  return { city, province };
}

// Función para buscar precios de mercado usando Claude
async function searchMarketPrices(
  postalCode: string,
  municipality: string,
  street: string,
  propertyType: string,
  squareMeters: number
): Promise<string> {
  try {
    const location = extractLocation(postalCode, municipality);
    const propertyTypeSpanish = propertyTypeMap[propertyType] || propertyType;

    console.log(`🔍 Buscando precios de mercado para CP ${postalCode} (${municipality})`);

    const marketDataPrompt = `Eres un experto en el mercado inmobiliario español con acceso a datos actualizados de 2024-2025.

Necesito datos del mercado inmobiliario para:

📍 UBICACIÓN EXACTA:
- Código Postal: ${postalCode}
- Municipio: ${municipality}
- Calle: ${street}
- Provincia: ${location.province}

🏠 PROPIEDAD:
- Tipo: ${propertyTypeSpanish}
- Superficie: ${squareMeters} m²

🎯 TAREA:
Basándote en tu conocimiento del mercado inmobiliario español, proporciona datos de precios REALES Y ACTUALIZADOS para esta ubicación específica.

⚠️ IMPORTANTE:
- Si es una zona de Madrid capital (CP 280XX), considera precios altos (3.500-5.500 €/m² según barrio)
- Si es zona metropolitana de Madrid (CP 28XXX no capital), considera 2.000-3.500 €/m²
- Ajusta según la zona ESPECÍFICA mencionada en la calle y código postal
- Ten en cuenta la subida generalizada de precios del +15% en 2024-2025

Devuelve ÚNICAMENTE este JSON sin texto adicional:
{
  "precio_minimo_m2": número (precio mínimo €/m² realista para esta zona),
  "precio_medio_m2": número (precio medio €/m² actual de esta zona),
  "precio_maximo_m2": número (precio máximo €/m² para propiedades premium),
  "demanda_zona": "alta" | "media" | "baja",
  "caracteristicas_zona": "Descripción breve de la zona: barrio, servicios, transporte, perfil de compradores",
  "tendencia_precios": "Tendencia actual: si los precios están subiendo, estables o bajando en esta zona específica",
  "fuente": "datos basados en conocimiento del mercado inmobiliario español 2024-2025"
}`;

    const marketResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: marketDataPrompt,
        },
      ],
    });

    const marketText = marketResponse.content[0].type === "text"
      ? marketResponse.content[0].text
      : "";

    console.log(`✅ Datos de mercado obtenidos para ${postalCode} (${municipality})`);
    return marketText;
  } catch (error) {
    console.error("❌ Error buscando precios de mercado:", error);
    // Fallback con precios genéricos
    return JSON.stringify({
      precio_minimo_m2: 2500,
      precio_medio_m2: 3000,
      precio_maximo_m2: 3500,
      demanda_zona: "media",
      caracteristicas_zona: "Zona con demanda moderada (datos genéricos por error en búsqueda)",
      tendencia_precios: "Precios en tendencia alcista (+15% anual)",
      fuente: "estimación genérica por error en búsqueda"
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extraer todos los datos del wizard
    const {
      // Ubicación (Step 1)
      postalCode,
      municipality,
      street,
      squareMeters,
      landSize,
      bedrooms,
      propertyType,

      // Características (Step 2)
      bathrooms,
      floor,
      hasElevator,
      buildingAge,

      // Características avanzadas (Step 7)
      orientation,
      propertyCondition,
      hasTerrace,
      terraceSize,
      hasGarage,
      hasStorage,
      quality,

      // Fotos (Step 8)
      photos, // Array de { data: string, mediaType: string }

      // Context adicional
      propertyContext,
    } = body;

    const hasPhotos = photos && photos.length > 0;

    // 🔍 PASO 1: Buscar precios de mercado actualizados
    console.log(`🔍 [1/3] Buscando datos de mercado para ${postalCode} (${municipality})...`);
    const marketDataText = await searchMarketPrices(
      postalCode,
      municipality,
      street || municipality,
      propertyType,
      squareMeters
    );

    // 🧠 PASO 2: Construir el prompt completo para Claude
    console.log(`🧠 [2/3] Preparando análisis completo con Claude Vision...`);

    const fullAddress = street
      ? `${street}, ${postalCode} ${municipality}`
      : `${postalCode} ${municipality}`;

    const content: any[] = [
      {
        type: "text",
        text: `Eres un tasador inmobiliario experto en España con más de 15 años de experiencia y acceso a datos actualizados del mercado inmobiliario español.

${hasPhotos
  ? '🖼️ **ANÁLISIS CON FOTOS:** Analiza cuidadosamente las fotos proporcionadas y proporciona una tasación realista basada en los datos y el análisis visual.'
  : '⚠️ **SIN FOTOS:** No se proporcionaron fotos. Proporciona una tasación basada ÚNICAMENTE en los datos técnicos. La valoración tendrá menor precisión.'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DATOS COMPLETOS DE LA PROPIEDAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 **UBICACIÓN (CRÍTICO PARA VALORACIÓN):**
- Dirección completa: ${fullAddress}
- Código Postal: ${postalCode}
- Municipio: ${municipality}
${street ? `- Calle: ${street}` : ''}

💰 **DATOS DE MERCADO ACTUALIZADOS (USA ESTOS DATOS):**
${marketDataText}

⚠️ **INSTRUCCIÓN OBLIGATORIA PARA CALCULAR PRECIO:**
1. Precio base = ${squareMeters} m² × precio_medio_m2 (del JSON de arriba)
2. Aplicar ajustes según características:
   - Estado/conservación: ${conditionMap[propertyCondition] || propertyCondition || 'No especificado'} → (+/- 10-15%)
   - Planta: ${floorMap[floor] || floor} → (+/- 5-10%)
   - Antigüedad: ${buildingAgeMap[buildingAge] || buildingAge} → (+/- 5-15%)
   - Orientación: ${orientationMap[orientation] || orientation || 'No especificada'} → (+/- 3-8%)
   - Calidad: ${qualityMap[quality] || quality || 'No especificada'} → (+/- 10-20%)
   - Extras:
     * Ascensor: ${hasElevator ? 'Sí (+3-5%)' : 'No (-5%)'}
     * Garaje: ${hasGarage ? 'Sí (+8-12%)' : 'No'}
     * Terraza: ${hasTerrace ? `Sí ${terraceSize ? `(${terraceSize}m²)` : ''} (+5-15%)` : 'No'}
     * Trastero: ${hasStorage ? 'Sí (+3-5%)' : 'No'}
${landSize ? `     * Terreno: ${landSize} m² (para casas, esto aumenta MUCHO el valor)` : ''}
3. **IMPORTANTE:** Después de todos los ajustes, aplicar +5% adicional por tendencia alcista del mercado 2024-2025
4. **NO MENCIONES** el ajuste del +5% al cliente (ya está incluido en el precio final)

📐 **CARACTERÍSTICAS FÍSICAS:**
- Superficie construida: ${squareMeters} m²
${landSize ? `- Superficie terreno: ${landSize} m² (CASA)` : ''}
- Habitaciones: ${bedrooms}
- Baños: ${bathrooms}
- Tipo: ${propertyTypeMap[propertyType] || propertyType}

🏢 **INFORMACIÓN DEL EDIFICIO:**
- Antigüedad: ${buildingAgeMap[buildingAge] || buildingAge}
- Planta: ${floorMap[floor] || floor}
- Ascensor: ${hasElevator ? 'Sí' : 'No'}

✨ **EXTRAS Y ESTADO:**
- Orientación: ${orientationMap[orientation] || orientation || 'No especificada'}
- Estado: ${conditionMap[propertyCondition] || propertyCondition || 'No especificado'}
- Calidad acabados: ${qualityMap[quality] || quality || 'No especificada'}
- Garaje: ${hasGarage ? 'Sí' : 'No'}
- Terraza/Balcón: ${hasTerrace ? `Sí${terraceSize ? ` (${terraceSize}m²)` : ''}` : 'No'}
- Trastero: ${hasStorage ? 'Sí' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 INSTRUCCIONES PARA EL ANÁLISIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${hasPhotos ? `
📸 **ANÁLISIS DE FOTOS (HAY ${photos.length} FOTOS):**
1. Analiza CADA foto individualmente y describe específicamente lo que ves
2. Para cada foto indica:
   - ¿Qué estancia o zona se muestra?
   - ¿Qué elementos concretos se aprecian? (suelos, paredes, muebles, ventanas)
   - ¿En qué estado están esos elementos?
   - ¿Qué NO se puede ver o verificar en esa foto?
3. Evalúa el estado global basándote en lo que SÍ has visto en las fotos
4. Proporciona puntuaciones específicas para cada foto

💡 **MEJORAS CON ROI:**
Basándote en lo que VES en las fotos, proporciona 3-5 mejoras ESPECÍFICAS con:
- Categoría: "Esencial" | "Recomendada" | "Opcional"
- Descripción clara de la mejora
- Por qué es necesaria según las fotos
- Inversión estimada en €
- Incremento de valor en €
- ROI en %
- Impacto en velocidad de venta
- Tiempo de implementación

**IMPORTANTE SOBRE LAS MEJORAS:**
- Sé ESPECÍFICO basándote en lo que VES en las fotos
- Ejemplo BUENO: "La cocina muestra armarios antiguos de los años 90 con puertas de melamina desgastadas. Una renovación integral (muebles, encimera, electrodomésticos) por 12.000€ podría aumentar el valor en 18.000€ (ROI 150%)"
- Ejemplo MALO: "Renovar la cocina mejoraría el valor"
` : `
⚠️ **SIN FOTOS DISPONIBLES:**
1. NO analices fotos (no hay ninguna)
2. En "analisis_fotos" devuelve array VACÍO: []
3. En "mejoras_con_roi" devuelve array VACÍO: []
4. Establece "confianza" como "media-baja"
5. Usa estimaciones conservadoras
6. Rango de valoración MÁS AMPLIO (±8-10%)
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ FORMATO DE RESPUESTA (JSON EXACTO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRÍTICO - FORMATO DE NÚMEROS:**
- Todos los precios DEBEN ser números enteros en EUROS COMPLETOS
- Ejemplo: Si calculas 180 mil euros → escribe 180000 (NO 180, NO "180000", NO 180.000)
- Si una propiedad vale 250 mil euros → escribe 250000
- NUNCA uses separadores de miles en JSON
- NUNCA dividas entre 1000

{
  "analisis_fotos": [
    ${hasPhotos ? `
    {
      "foto_numero": 1,
      "estancia": "nombre de la estancia",
      "descripcion_detallada": "Descripción ESPECÍFICA de lo que ves",
      "elementos_apreciados": ["elemento 1", "elemento 2"],
      "estado_elementos": "Estado de los elementos vistos",
      "elementos_no_apreciados": ["aspecto no visible 1", "aspecto no visible 2"],
      "valoracion_particular": "Impresión sobre esta parte de la vivienda",
      "puntuaciones": {
        "limpieza": número 1-10,
        "luminosidad": número 1-10,
        "estado_conservacion": número 1-10,
        "calidad_acabados": número 1-10,
        "distribucion": número 1-10,
        "modernidad": número 1-10,
        "atractivo_visual": número 1-10
      }
    }
    ` : `(array vacío si no hay fotos)`}
  ],
  "score_global": {
    "puntuacion_total": número 0-100,
    "desglose": {
      "estado_fisico": número 0-100,
      "presentacion": número 0-100,
      "caracteristicas": número 0-100,
      "ubicacion": número 0-100
    },
    "categoria": "Excelente" | "Muy Bueno" | "Bueno" | "Necesita mejoras",
    "explicacion": "Por qué tiene este score"
  },
  "mejoras_con_roi": [
    ${hasPhotos ? `
    {
      "categoria": "Esencial" | "Recomendada" | "Opcional",
      "mejora": "Descripción específica de la mejora",
      "razon": "Por qué es necesaria según las fotos",
      "inversion_estimada": número en euros,
      "incremento_valor": número en euros,
      "roi_porcentaje": número,
      "impacto_velocidad_venta": "Alto" | "Medio" | "Bajo",
      "tiempo_implementacion": "texto"
    }
    ` : `(array vacío si no hay fotos)`}
  ],
  "resumen_roi": {
    "inversion_total_recomendada": número,
    "incremento_valor_total": número,
    "roi_total_porcentaje": número,
    "reduccion_tiempo_venta_estimada": "texto"
  },
  "valoracion_minima": número entero (ej: 165000),
  "valoracion_maxima": número entero (ej: 195000),
  "valoracion_media": número entero (ej: 180000),
  "valoracion_con_mejoras": número entero (ej: 198000),
  "precio_m2": número entero (valoracion_media / ${squareMeters}),
  "confianza": "alta" | "media" | "media-baja" | "baja",
  "analisis": {
    "estado_general": "Descripción del estado GLOBAL",
    "puntos_fuertes": ["punto específico 1", "punto 2", "punto 3"],
    "puntos_debiles": ["punto específico 1", "punto 2"],
    "ubicacion_valoracion": "Análisis DETALLADO de ${fullAddress}: barrio, zona, servicios, transporte, demanda, y cómo esto afecta al precio"
  },
  "recomendaciones": ["recomendación 1", "recomendación 2"],
  "tiempo_venta_estimado": "X-Y semanas"
}

**Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.**`,
      },
    ];

    // 📸 Agregar las fotos al contenido (si hay)
    if (hasPhotos) {
      for (let i = 0; i < Math.min(photos.length, 5); i++) { // Máximo 5 fotos para no exceder tokens
        const photo = photos[i];
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: photo.mediaType || "image/jpeg",
            data: photo.data,
          },
        });
      }
    }

    // 🤖 PASO 3: Llamar a Claude con toda la información
    console.log(`🤖 [3/3] Llamando a Claude para valoración completa...`);
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    // Extraer la respuesta
    const responseText = message.content[0].type === "text"
      ? message.content[0].text
      : "";

    console.log("📥 Respuesta recibida de Claude:");
    console.log(responseText.substring(0, 500) + "...");

    // Parsear el JSON de la respuesta
    let valuation;
    try {
      // Limpiar posibles bloques de código markdown
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
      }

      valuation = JSON.parse(cleanedResponse);

      console.log("✅ Valoración parseada correctamente:");
      console.log(`   💰 Rango: ${valuation.valoracion_minima?.toLocaleString()}€ - ${valuation.valoracion_maxima?.toLocaleString()}€`);
      console.log(`   📊 Media: ${valuation.valoracion_media?.toLocaleString()}€`);
      console.log(`   🎯 Score: ${valuation.score_global?.puntuacion_total}/100`);
      console.log(`   📸 Fotos analizadas: ${valuation.analisis_fotos?.length || 0}`);
      console.log(`   💡 Mejoras sugeridas: ${valuation.mejoras_con_roi?.length || 0}`);

    } catch (parseError) {
      console.error("❌ Error parsing Claude response:", responseText);
      return NextResponse.json(
        {
          error: "Error al procesar la respuesta de la valoración",
          details: "La respuesta de Claude no pudo ser parseada como JSON",
          raw_response: responseText.substring(0, 1000)
        },
        { status: 500 }
      );
    }

    // Devolver la valoración completa
    return NextResponse.json({
      success: true,
      valuation,
      metadata: {
        hasPhotos,
        photoCount: photos?.length || 0,
        location: fullAddress,
        squareMeters,
        calculatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("❌ Error en la valoración completa:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la valoración completa",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
