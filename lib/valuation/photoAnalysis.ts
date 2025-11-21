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
    squareMeters?: number;
    bedrooms?: number;
    bathrooms?: number;
  }
): Promise<PhotoAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log(`🖼️  Analizando ${photos.length} fotos con Claude Vision...`);

  // Preparar el contexto
  const contextText = propertyContext
    ? `\nContexto de la propiedad:
- Tipo: ${propertyContext.propertyType || 'No especificado'}
- Superficie: ${propertyContext.squareMeters || 'No especificado'} m²
- Habitaciones: ${propertyContext.bedrooms || 'No especificado'}
- Baños: ${propertyContext.bathrooms || 'No especificado'}`
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

  const prompt = `Analiza estas ${photos.length} fotos de una propiedad inmobiliaria como si fueras un tasador profesional.${contextText}

Por favor, evalúa minuciosamente:

1. **Calidad de las fotos**: ¿Son claras, bien iluminadas y representativas?

2. **Características detectadas**: Identifica TODOS los elementos visibles:
   - Luminosidad natural (ventanas, orientación aparente)
   - Acabados (suelos, paredes, techos, carpintería)
   - Distribución de espacios
   - Mobiliario y decoración
   - Electrodomésticos y equipamiento
   - Estado de pintura, puertas, ventanas
   - Instalaciones visibles (electricidad, fontanería, climatización)

3. **Estado de conservación**:
   - ¿La propiedad está en buen estado o necesita reformas?
   - ¿Hay signos de desgaste, humedad, grietas, desperfectos?
   - ¿Los acabados son modernos o anticuados?

4. **Luminosidad**: ¿Qué tan luminosa es la propiedad? (excelente/buena/regular/baja)

5. **Puntuación general**: Del 0 al 100, valora:
   - Estado general (0-40 puntos)
   - Acabados y calidad (0-30 puntos)
   - Luminosidad y distribución (0-30 puntos)

6. **MEJORAS Y REFORMAS SUGERIDAS** (MUY IMPORTANTE):
   Sé ESPECÍFICO y PRÁCTICO. Indica:
   - ¿Qué reformas o mejoras son NECESARIAS? (problemas que hay que solucionar)
   - ¿Qué mejoras son RECOMENDABLES? (para aumentar el valor)
   - ¿Qué cambios ESTÉTICOS mejorarían la propiedad? (pintura, actualización)

   Ejemplos de mejoras específicas:
   - "Renovar cocina: cambiar encimera y electrodomésticos (estimado 8.000-12.000€)"
   - "Actualizar baño: cambiar sanitarios y alicatado (estimado 4.000-6.000€)"
   - "Pintura completa de la vivienda (estimado 2.000-3.000€)"
   - "Cambiar suelo de toda la vivienda a tarima (estimado 5.000-8.000€)"
   - "Renovar instalación eléctrica (señales de antigüedad)"
   - "Reparar humedades visibles en pared del salón"
   - "Actualizar puertas interiores (modelo antiguo)"
   - "Mejorar iluminación: añadir puntos de luz adicionales"

Devuelve tu análisis en formato JSON con esta estructura:
{
  "photoQuality": "excelente|buena|regular|deficiente",
  "detectedFeatures": ["característica 1", "característica 2", ...] (mínimo 5 características),
  "propertyConditionEstimate": "descripción detallada del estado general en 2-3 frases",
  "luminosityLevel": "excelente|buena|regular|baja",
  "conservationState": "excelente|bueno|regular|necesita-reforma",
  "suggestedImprovements": ["mejora específica 1 con coste estimado", "mejora 2", ...] (mínimo 3 mejoras concretas),
  "overallScore": número entre 0-100
}

IMPORTANTE:
- Responde SOLO con el JSON válido, sin texto adicional antes ni después
- Sé específico en las mejoras: indica QUÉ reformar/cambiar y COSTE aproximado si es relevante
- Si no detectas necesidad de reformas importantes, indica mejoras estéticas o de actualización`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest", // Cambiado para compatibilidad
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
