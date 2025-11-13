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

**INSTRUCCIONES:**
1. Analiza cuidadosamente TODAS las fotos proporcionadas
2. Evalúa el estado de la propiedad (conservación, acabados, iluminación)
3. Identifica características positivas y negativas
4. Considera la ubicación en España (si puedes inferir la ciudad/zona)
5. Proporciona un rango de valoración realista en euros

**FORMATO DE RESPUESTA (JSON):**
{
  "valoracion_minima": número (en euros),
  "valoracion_maxima": número (en euros),
  "valoracion_media": número (en euros),
  "confianza": "alta" | "media" | "baja",
  "analisis": {
    "estado_general": "descripción breve del estado",
    "puntos_fuertes": ["punto 1", "punto 2", "punto 3"],
    "puntos_debiles": ["punto 1", "punto 2"],
    "ubicacion_valoracion": "análisis de la ubicación si es posible inferirla"
  },
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "tiempo_venta_estimado": "X-Y días",
  "mejoras_sugeridas": ["mejora 1", "mejora 2"]
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
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
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
