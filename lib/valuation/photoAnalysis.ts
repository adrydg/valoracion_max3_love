/**
 * Análisis de fotos con Claude Vision
 *
 * Usa el modelo Claude 3.5 Sonnet con capacidades de visión para analizar
 * fotos de propiedades y extraer características relevantes.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface PhotoAnalysisResult {
  photoQuality: "excelente" | "buena" | "regular" | "deficiente";
  photoCount: number;
  detectedFeatures: string[];
  propertyConditionEstimate: string;
  luminosityLevel: "excelente" | "buena" | "regular" | "baja";
  conservationState: "excelente" | "bueno" | "regular" | "necesita-reforma";
  suggestedImprovements: string[];
  overallScore: number; // 0-100
}

interface Base64Photo {
  data: string; // base64 sin el prefijo "data:image/jpeg;base64,"
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

/**
 * Convierte un array de File a base64
 */
export async function convertPhotosToBase64(photos: File[]): Promise<Base64Photo[]> {
  const conversions = photos.map(async (photo) => {
    return new Promise<Base64Photo>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Extraer solo el base64 (sin el prefijo data:image/jpeg;base64,)
        const base64Data = base64String.split(',')[1];

        // Determinar media type
        let mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg";
        if (photo.type === "image/png") mediaType = "image/png";
        if (photo.type === "image/webp") mediaType = "image/webp";

        resolve({ data: base64Data, mediaType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(photo);
    });
  });

  return Promise.all(conversions);
}

/**
 * Analiza fotos de una propiedad con Claude Vision
 *
 * @param photos - Array de fotos en base64
 * @param propertyContext - Contexto adicional de la propiedad
 * @returns Análisis estructurado de las fotos
 */
export async function analyzePhotosWithClaude(
  photos: Base64Photo[],
  propertyContext?: {
    propertyType?: string;
    postalCode?: string;
    municipality?: string;
    squareMeters?: number;
    landSize?: number;
    bedrooms?: number;
    bathrooms?: number;
    floor?: string;
    hasElevator?: boolean;
    buildingAge?: string;
    orientation?: string;
    propertyCondition?: string;
    hasTerrace?: boolean;
    terraceSize?: number;
    hasGarage?: boolean;
    hasStorage?: boolean;
    quality?: string;
  }
): Promise<PhotoAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log(`🖼️  Analizando ${photos.length} fotos con Claude Vision...`);

  // Preparar el contexto completo de la propiedad
  const contextText = propertyContext
    ? `\n📋 INFORMACIÓN COMPLETA DE LA PROPIEDAD:

UBICACIÓN:
- Código Postal: ${propertyContext.postalCode || 'No especificado'}
- Municipio: ${propertyContext.municipality || 'No especificado'}

CARACTERÍSTICAS:
- Tipo: ${propertyContext.propertyType || 'No especificado'}
- Superficie: ${propertyContext.squareMeters || 'No especificado'} m²${propertyContext.landSize ? `\n- Terreno: ${propertyContext.landSize} m²` : ''}
- Habitaciones: ${propertyContext.bedrooms || 'No especificado'}
- Baños: ${propertyContext.bathrooms || 'No especificado'}
- Planta: ${propertyContext.floor || 'No especificado'}${propertyContext.hasElevator !== undefined ? `\n- Ascensor: ${propertyContext.hasElevator ? 'Sí' : 'No'}` : ''}
- Antigüedad: ${propertyContext.buildingAge || 'No especificado'}

ESTADO Y CALIDAD:
- Orientación: ${propertyContext.orientation || 'No especificado'}
- Estado: ${propertyContext.propertyCondition || 'No especificado'}
- Calidad: ${propertyContext.quality || 'No especificado'}

EXTRAS:
- Terraza: ${propertyContext.hasTerrace ? `Sí (${propertyContext.terraceSize || '?'} m²)` : 'No'}
- Garaje: ${propertyContext.hasGarage ? 'Sí' : 'No'}
- Trastero: ${propertyContext.hasStorage ? 'Sí' : 'No'}`
    : '';

  // Construir el mensaje con las imágenes
  const imageBlocks = photos.slice(0, 5).map((photo) => ({ // Limitar a 5 fotos para no exceder tokens
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: photo.mediaType,
      data: photo.data,
    },
  }));

  const prompt = `Eres un asesor inmobiliario experto en MAXIMIZAR EL VALOR DE VENTA de propiedades.

Tu cliente quiere vender su propiedad y necesita tu asesoramiento profesional sobre QUÉ MEJORAS realizar para AUMENTAR el precio de venta y vender más rápido.${contextText}

🎯 TU MISIÓN:
Analiza las ${photos.length} fotos proporcionadas junto con toda la información del formulario y proporciona RECOMENDACIONES ESTRATÉGICAS para incrementar el valor de mercado.

⚠️ IMPORTANTE - NO DESCRIBAS lo que ya se ve (el cliente ya conoce su propiedad):
- ❌ NO digas "tiene suelos de parquet" o "la cocina está equipada"
- ❌ NO describas colores, muebles o distribución básica
- ✅ SÍ ENFÓCATE en qué CAMBIAR, MEJORAR o RENOVAR para AUMENTAR EL VALOR

📊 ANÁLISIS REQUERIDO:

1. **EVALUACIÓN RÁPIDA DEL ESTADO** (solo para contexto):
   - Calidad de las fotos: excelente/buena/regular/deficiente
   - Luminosidad: excelente/buena/regular/baja
   - Estado general: excelente/bueno/regular/necesita-reforma
   - Puntuación 0-100 (considerando potencial de venta)

2. **PUNTOS CLAVE DETECTADOS** (breve, máximo 5 observaciones relevantes):
   - Solo menciona aspectos que AFECTAN AL VALOR o que deberían MEJORARSE
   - Ejemplo: "Cocina con acabados antiguos que penalizan el valor"
   - Ejemplo: "Baño principal necesita actualización"

3. **RECOMENDACIONES ESTRATÉGICAS PARA AUMENTAR VALOR** (LO MÁS IMPORTANTE):

   Proporciona AL MENOS 3-5 MEJORAS CONCRETAS priorizadas por impacto en precio:

   🔴 CRÍTICAS (urgentes para vender bien):
   - Mejoras que SÍ o SÍ deben hacerse antes de vender
   - Defectos que ahuyentan compradores o bajan el precio
   - Estimación de coste si es posible

   🟡 RECOMENDADAS (alto ROI):
   - Mejoras que aumentarán significativamente el valor
   - Renovaciones que justifican subir el precio
   - Actualizaciones que diferencian la propiedad
   - Coste vs incremento de valor esperado

   🟢 OPCIONALES (mejora percepción):
   - Cambios estéticos que facilitan la venta
   - Detalles que mejoran la presentación
   - Home staging y pequeños arreglos

EJEMPLOS DE RECOMENDACIONES CONCRETAS:
- "Renovar cocina completa: encimera, muebles y electrodomésticos modernos (inversión 10.000-15.000€, incremento valor +20.000€)"
- "Actualizar baño principal: alicatado moderno, sanitarios suspendidos y mampara (6.000-8.000€, aumenta atractivo)"
- "Pintura neutra completa + reparar desperfectos en paredes (2.500-3.500€, esencial para buena primera impresión)"
- "Cambiar suelo a tarima/porcelánico imitación madera en toda la vivienda (8.000-12.000€, moderniza mucho)"
- "Renovar instalación eléctrica y enchufes (anticuados, riesgo para comprador) (3.000-5.000€)"
- "Eliminar gotelé y aplicar pintura lisa moderna (1.500-2.500€, actualiza mucho)"
- "Cambiar carpintería exterior por PVC con doble acristalamiento (8.000-12.000€, ahorro energético)"

Devuelve SOLO este JSON (sin texto adicional):
{
  "photoQuality": "excelente|buena|regular|deficiente",
  "detectedFeatures": ["observación crítica 1", "observación 2", ...] (máximo 5, solo lo relevante),
  "propertyConditionEstimate": "Breve evaluación del estado actual y potencial de venta en 2 frases",
  "luminosityLevel": "excelente|buena|regular|baja",
  "conservationState": "excelente|bueno|regular|necesita-reforma",
  "suggestedImprovements": [
    "🔴 CRÍTICO: Mejora urgente con coste",
    "🟡 RECOMENDADO: Mejora importante con ROI",
    "🟡 RECOMENDADO: Otra mejora con impacto",
    "🟢 OPCIONAL: Mejora estética",
    ...
  ] (mínimo 3-5 recomendaciones CONCRETAS con costes estimados),
  "overallScore": número 0-100 (basado en potencial de venta actual)
}

🎯 PRIORIZA recomendaciones por impacto en PRECIO DE VENTA, no por orden de las fotos.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Modelo con visión compatible con Tier 1
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extraer el texto de la respuesta
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No se recibió respuesta de texto de Claude");
    }

    console.log("📥 Respuesta de Claude Vision:", textContent.text);

    // Parsear el JSON (puede venir con ```json o sin él)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const analysis: PhotoAnalysisResult = JSON.parse(jsonText);

    // Añadir el conteo real de fotos
    analysis.photoCount = photos.length;

    console.log("✅ Análisis completado:", {
      calidad: analysis.photoQuality,
      características: analysis.detectedFeatures.length,
      puntuación: analysis.overallScore,
    });

    return analysis;
  } catch (error) {
    console.error("❌ Error analizando fotos con Claude:", error);

    // Fallback: devolver análisis genérico si falla
    return {
      photoQuality: "buena",
      photoCount: photos.length,
      detectedFeatures: [
        "Análisis no disponible (error de conexión)",
        "Por favor, revisa las fotos manualmente en el email",
      ],
      propertyConditionEstimate: "No se pudo determinar",
      luminosityLevel: "regular",
      conservationState: "regular",
      suggestedImprovements: ["Análisis manual requerido"],
      overallScore: 50,
    };
  }
}

/**
 * Convierte el análisis a un formato legible para mostrar al usuario
 */
export function formatAnalysisForDisplay(analysis: PhotoAnalysisResult): string {
  const sections = [
    `📊 Calidad de fotos: ${analysis.photoQuality}`,
    `💡 Luminosidad: ${analysis.luminosityLevel}`,
    `🏠 Estado: ${analysis.conservationState}`,
    `⭐ Puntuación general: ${analysis.overallScore}/100`,
    ``,
    `✨ Características detectadas:`,
    ...analysis.detectedFeatures.map(f => `  • ${f}`),
  ];

  if (analysis.suggestedImprovements.length > 0) {
    sections.push('');
    sections.push('💡 Mejoras sugeridas:');
    sections.push(...analysis.suggestedImprovements.map(m => `  • ${m}`));
  }

  return sections.join('\n');
}
