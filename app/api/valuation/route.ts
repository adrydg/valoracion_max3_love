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
  nuevo: "Obra nueva (menos de 2 años)",
  "<10": "Edificio reciente (menos de 10 años)",
  "10-30": "Edificio de 10-30 años",
  ">30": "Edificio de más de 30 años",
};

const floorMap: Record<string, string> = {
  bajo: "Planta baja",
  "1-3": "Planta 1ª a 3ª",
  "4-6": "Planta 4ª a 6ª",
  "7+": "Planta 7ª o superior",
  "atico-planta": "Planta ático",
};

const terraceMap: Record<string, string> = {
  no: "Sin terraza ni balcón",
  balcon: "Con balcón",
  terraza: "Con terraza",
};

const conditionMap: Record<string, string> = {
  perfecto: "Estado perfecto / reformado recientemente",
  bueno: "Buen estado general",
  reformar: "Necesita reforma",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Datos de la propiedad
    const address = formData.get("address") as string;
    const squareMeters = formData.get("squareMeters") as string;
    const bedrooms = formData.get("bedrooms") as string;
    const bathrooms = formData.get("bathrooms") as string;
    const propertyType = formData.get("propertyType") as string;
    const buildingAge = formData.get("buildingAge") as string;
    const floor = formData.get("floor") as string;
    const hasElevator = formData.get("hasElevator") as string;
    const hasGarage = formData.get("hasGarage") as string;
    const hasTerrace = formData.get("hasTerrace") as string;
    const condition = formData.get("condition") as string;

    // Datos de contacto
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    // Obtener las fotos
    const photos: string[] = [];
    let photoIndex = 0;
    while (formData.has(`photo_${photoIndex}`)) {
      const file = formData.get(`photo_${photoIndex}`) as File;
      if (file) {
        // Convertir imagen a base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");

        // Detectar tipo MIME
        const mimeType = file.type || "image/jpeg";
        photos.push(`data:${mimeType};base64,${base64}`);
      }
      photoIndex++;
    }

    if (photos.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos una foto" },
        { status: 400 }
      );
    }

    // Construir el mensaje para Claude con visión
    const content: Anthropic.MessageCreateParams["content"] = [
      {
        type: "text",
        text: `Eres un tasador inmobiliario experto en España con más de 15 años de experiencia y acceso a datos actualizados del mercado inmobiliario español.

Necesito que analices las fotos de esta propiedad y proporciones una tasación realista basada en los datos proporcionados y el análisis visual.

**DATOS COMPLETOS DE LA PROPIEDAD:**

📍 **Ubicación:**
- Dirección: ${address}

📐 **Características físicas:**
- Superficie: ${squareMeters} m²
- Habitaciones: ${bedrooms}
- Baños: ${bathrooms}
- Tipo de vivienda: ${propertyTypeMap[propertyType] || propertyType}

🏢 **Información del edificio:**
- Antigüedad: ${buildingAgeMap[buildingAge] || buildingAge}
- Planta: ${floorMap[floor] || floor}
- Ascensor: ${hasElevator === "si" ? "Sí" : "No"}

✨ **Extras y estado:**
- Garaje incluido: ${hasGarage === "si" ? "Sí" : "No"}
- Exterior: ${terraceMap[hasTerrace] || hasTerrace}
- Estado de conservación: ${conditionMap[condition] || condition}

**INSTRUCCIONES CRÍTICAS:**
1. Analiza cuidadosamente CADA UNA de las fotos proporcionadas de forma INDIVIDUAL
2. Para CADA foto, describe ESPECÍFICAMENTE lo que ves en ella
3. Para CADA foto, indica claramente:
   - ¿Qué estancia o zona de la vivienda se muestra?
   - ¿Qué elementos concretos puedes apreciar? (suelos, paredes, muebles, ventanas, etc.)
   - ¿Qué estado tienen esos elementos? (nuevo, desgastado, limpio, sucio, etc.)
   - ¿Qué NO has podido apreciar o verificar en esa foto?
4. Evalúa el estado global de la propiedad basándote en lo que SÍ has visto
5. Considera la ubicación en España (si puedes inferir la ciudad/zona)
6. Proporciona un rango de valoración realista en euros

**FORMATO DE RESPUESTA (JSON):**
{
  "analisis_fotos": [
    {
      "foto_numero": 1,
      "estancia": "nombre de la estancia (ej: salón, cocina, dormitorio principal, baño, etc.)",
      "descripcion_detallada": "Descripción específica de lo que ves en esta foto: elementos, colores, materiales, distribución",
      "elementos_apreciados": ["elemento 1 visto", "elemento 2 visto", "elemento 3 visto"],
      "estado_elementos": "Evaluación del estado de los elementos vistos en esta foto",
      "elementos_no_apreciados": ["aspecto 1 que no se puede ver", "aspecto 2 que no se puede ver"],
      "valoracion_particular": "Impresión sobre esta parte específica de la vivienda",
      "puntuaciones": {
        "limpieza": número 1-10 (estado de limpieza visible),
        "luminosidad": número 1-10 (luz natural/artificial),
        "estado_conservacion": número 1-10 (paredes, suelos, techos),
        "calidad_acabados": número 1-10 (materiales, terminaciones),
        "distribucion": número 1-10 (aprovechamiento espacio),
        "modernidad": número 1-10 (actualización, estilo contemporáneo),
        "atractivo_visual": número 1-10 (presentación para venta)
      }
    }
  ],
  "score_global": {
    "puntuacion_total": número 0-100 (puntuación final del inmueble),
    "desglose": {
      "estado_fisico": número 0-100 (30% del total),
      "presentacion": número 0-100 (25% del total),
      "caracteristicas": número 0-100 (25% del total),
      "ubicacion": número 0-100 (20% del total)
    },
    "categoria": "Excelente" | "Muy Bueno" | "Bueno" | "Necesita mejoras" | "Requiere reforma",
    "explicacion": "Breve explicación de por qué tiene este score"
  },
  "mejoras_con_roi": [
    {
      "categoria": "Esencial" | "Recomendada" | "Opcional",
      "mejora": "Descripción de la mejora (ej: Pintura completa del piso)",
      "razon": "Por qué esta mejora es importante basado en las fotos",
      "inversion_estimada": número en euros,
      "incremento_valor": número en euros (cuánto más podrás vender),
      "roi_porcentaje": número (retorno de inversión en %),
      "impacto_velocidad_venta": "Alto" | "Medio" | "Bajo",
      "tiempo_implementacion": "1-3 días" | "1 semana" | "2-4 semanas" | "1-2 meses"
    }
  ],
  "resumen_roi": {
    "inversion_total_recomendada": número en euros,
    "incremento_valor_total": número en euros,
    "roi_total_porcentaje": número,
    "reduccion_tiempo_venta_estimada": "X días/semanas"
  },
  "valoracion_minima": número (en euros),
  "valoracion_maxima": número (en euros),
  "valoracion_media": número (en euros),
  "valoracion_con_mejoras": número (en euros, nuevo precio estimado tras mejoras),
  "confianza": "alta" | "media" | "baja",
  "analisis": {
    "estado_general": "descripción breve del estado GLOBAL basado en lo visto en las fotos",
    "puntos_fuertes": ["punto 1 específico visto en las fotos", "punto 2", "punto 3"],
    "puntos_debiles": ["punto 1 específico visto en las fotos", "punto 2"],
    "ubicacion_valoracion": "análisis de la ubicación si es posible inferirla"
  },
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "tiempo_venta_estimado": "X-Y días"
}

Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.`,
      },
    ];

    // Agregar las imágenes al contenido
    for (const photo of photos) {
      // Extraer el base64 y el media_type
      const match = photo.match(/data:([^;]+);base64,(.+)/);
      if (match) {
        const mediaType = match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        const base64Data = match[2];

        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        });
      }
    }

    // Llamar a la API de Anthropic con visión
    // Usando claude-3-haiku-20240307 (modelo disponible en la cuenta)
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2048,
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

    // Parsear el JSON de la respuesta
    let valuation;
    try {
      valuation = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing Claude response:", responseText);
      return NextResponse.json(
        { error: "Error al procesar la respuesta de la tasación" },
        { status: 500 }
      );
    }

    // Guardar el lead (datos del cliente) - aquí podrías guardarlo en Supabase
    console.log("Lead generado:", {
      name,
      email,
      phone,
      property: {
        address,
        squareMeters,
        bedrooms,
        bathrooms,
        propertyType,
        buildingAge,
        floor,
        hasElevator,
        hasGarage,
        hasTerrace,
        condition,
      },
      valuation,
      timestamp: new Date().toISOString(),
    });

    // Devolver la valoración
    return NextResponse.json({
      success: true,
      valuation,
    });

  } catch (error) {
    console.error("Error en la tasación:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la tasación",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
