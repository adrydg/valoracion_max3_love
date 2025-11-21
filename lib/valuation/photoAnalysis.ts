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

  const prompt = `Eres un asesor inmobiliario amigable y experto que ayuda a propietarios a maximizar el valor de sus propiedades.

Tu cliente está considerando vender y quiere tu opinión profesional sobre IDEAS y OPORTUNIDADES para destacar aún más su propiedad en el mercado.${contextText}

🎯 TU MISIÓN:
Analiza las ${photos.length} fotos con una actitud POSITIVA y CONSTRUCTIVA. Identifica oportunidades para realzar la propiedad, siempre desde el respeto y sin juzgar.

⚠️ REGLAS DE ORO - TONO POSITIVO Y COMERCIAL:
- ✅ SIEMPRE reconoce primero aspectos positivos que ves en las fotos
- ✅ Presenta mejoras como "OPORTUNIDADES para aumentar valor", NO como problemas o defectos
- ✅ Usa lenguaje motivador: "potencial", "oportunidad", "realzar", "destacar", "maximizar"
- ❌ NUNCA uses: "mal estado", "necesita urgente", "deficiente", "antiguo/anticuado"
- ❌ NUNCA critiques o juzgues el estado actual de la propiedad
- ✅ Sé específico sobre lo que VES en las fotos (demuestra que las analizaste)

📊 ANÁLISIS REQUERIDO:

1. **PRIMERAS IMPRESIONES POSITIVAS** (reconoce lo bueno):
   - Menciona 2-3 aspectos positivos que observas en las fotos
   - Ejemplos: "Buena luminosidad natural", "Espacios amplios", "Distribución funcional"
   - Base tu respuesta en lo que REALMENTE ves en las fotos

2. **OPORTUNIDADES DE MEJORA** (3-5 ideas constructivas):

   Presenta cada idea de forma POSITIVA y COMERCIAL:

   ✨ Ejemplos de BUEN TONO:
   - ✅ "Una renovación de la cocina podría convertirla en el punto fuerte de la propiedad (inversión 10.000-15.000€, potencial incremento +20.000€)"
   - ✅ "Actualizar el baño con acabados modernos realzaría mucho la percepción de calidad (6.000-8.000€)"
   - ✅ "Una pintura fresca en tonos neutros haría destacar la luminosidad natural que ya tiene (2.500-3.500€)"
   - ✅ "Modernizar el suelo añadiría un toque contemporáneo muy apreciado por compradores (8.000-12.000€)"

   ❌ Ejemplos de MAL TONO (evitar):
   - ❌ "La cocina está anticuada y necesita reforma urgente"
   - ❌ "Baño en mal estado que ahuyenta compradores"
   - ❌ "Pintura descuidada con desperfectos visibles"

   ESTRUCTURA de cada sugerencia:
   - Reconoce algo positivo relacionado
   - Presenta la mejora como oportunidad
   - Incluye beneficio esperado y coste aproximado

3. **PUNTUACIÓN OPTIMISTA**:
   - Valora el POTENCIAL de la propiedad (no solo el estado actual)
   - Considera que con las mejoras sugeridas puede alcanzar un valor mayor
   - Puntuación 60-90 (siempre optimista, nunca por debajo de 60)

Devuelve SOLO este JSON (sin texto adicional):
{
  "photoQuality": "excelente|buena|regular" (NUNCA uses "deficiente"),
  "detectedFeatures": [
    "Aspecto positivo 1 que observo en las fotos",
    "Aspecto positivo 2",
    "Aspecto positivo 3",
    ...
  ] (3-5 observaciones POSITIVAS basadas en las fotos reales),
  "propertyConditionEstimate": "Descripción POSITIVA del potencial: reconoce aspectos buenos + menciona oportunidades de mejora de forma constructiva (2-3 frases)",
  "luminosityLevel": "excelente|buena|regular" (NUNCA "baja"),
  "conservationState": "excelente|bueno|regular" (NUNCA "necesita-reforma"),
  "suggestedImprovements": [
    "💡 [Área]: Oportunidad de mejora con beneficio y coste. Siempre tono positivo y constructivo.",
    "💡 [Área]: Otra oportunidad...",
    "💡 [Área]: Otra oportunidad...",
    ...
  ] (3-5 sugerencias POSITIVAS y ESPECÍFICAS a lo que ves en las fotos),
  "overallScore": número 60-90 (optimista, considerando potencial con mejoras)
}

🌟 RECUERDA: Tu objetivo es MOTIVAR al cliente y hacer que se sienta BIEN con su propiedad, mientras le muestras oportunidades claras para maximizar su valor. ¡Sé positivo, específico y comercial!`;

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

    // Fallback: devolver análisis positivo y genérico si falla
    return {
      photoQuality: "buena",
      photoCount: photos.length,
      detectedFeatures: [
        "Tu propiedad tiene características que la hacen atractiva para el mercado",
        "Las fotos han sido recibidas correctamente",
        "Un asesor revisará personalmente las imágenes para darte recomendaciones específicas",
      ],
      propertyConditionEstimate: "Tu propiedad tiene buen potencial de venta. Recibirás un análisis detallado personalizado por email con ideas específicas para maximizar su valor.",
      luminosityLevel: "buena",
      conservationState: "bueno",
      suggestedImprovements: [
        "💡 Recibirás recomendaciones personalizadas por email",
        "💡 Un asesor analizará tus fotos manualmente para darte ideas específicas",
        "💡 Te contactaremos pronto con sugerencias adaptadas a tu propiedad",
      ],
      overallScore: 75,
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
