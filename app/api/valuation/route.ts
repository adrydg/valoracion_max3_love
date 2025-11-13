import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Inicializar cliente de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

    const hasPhotos = photos.length > 0;

    // Construir el mensaje para Claude
    const content: Anthropic.MessageCreateParams["content"] = [
      {
        type: "text",
        text: `Eres un tasador inmobiliario experto en España con más de 15 años de experiencia y acceso a datos actualizados del mercado inmobiliario español.

${hasPhotos
  ? 'Necesito que analices las fotos de esta propiedad y proporciones una tasación realista basada en los datos proporcionados y el análisis visual.'
  : '⚠️ IMPORTANTE: No se han proporcionado fotos de la propiedad. Proporciona una tasación basada ÚNICAMENTE en los datos técnicos proporcionados. La valoración tendrá menor precisión sin inspección visual.'
}

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
${hasPhotos
  ? `1. Analiza cuidadosamente CADA UNA de las fotos proporcionadas de forma INDIVIDUAL
2. Para CADA foto, describe ESPECÍFICAMENTE lo que ves en ella
3. Para CADA foto, indica claramente:
   - ¿Qué estancia o zona de la vivienda se muestra?
   - ¿Qué elementos concretos puedes apreciar? (suelos, paredes, muebles, ventanas, etc.)
   - ¿Qué estado tienen esos elementos? (nuevo, desgastado, limpio, sucio, etc.)
   - ¿Qué NO has podido apreciar o verificar en esa foto?
4. Evalúa el estado global de la propiedad basándote en lo que SÍ has visto
5. Considera la ubicación en España (si puedes inferir la ciudad/zona)
6. Proporciona un rango de valoración realista en euros`
  : `1. Proporciona una valoración basada en los datos técnicos y la ubicación
2. NO intentes analizar fotos (no hay ninguna disponible)
3. En "analisis_fotos" devuelve un array VACÍO: []
4. En "mejoras_con_roi" devuelve un array VACÍO: [] (no se pueden recomendar mejoras sin inspección visual)
5. Establece "confianza" como "baja" debido a la falta de inspección visual
6. En "score_global", usa valores estimados basándote únicamente en los datos técnicos proporcionados
7. Proporciona un rango de valoración MÁS AMPLIO debido a la incertidumbre`
}

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

    // Agregar las imágenes al contenido (solo si hay fotos)
    if (hasPhotos) {
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

    // Guardar el lead (datos del cliente)
    const leadData = {
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
    };

    console.log("Lead generado:", leadData);

    // Enviar emails
    try {
      // Email al administrador con los datos del lead
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@tudominio.com",
        to: process.env.ADMIN_EMAIL || "a.durandez@gmail.com",
        subject: `🏠 Nuevo Lead - Valoración de ${address}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
                .label { font-weight: bold; color: #1e40af; }
                .value { color: #4b5563; }
                .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
                .score.high { color: #22c55e; }
                .score.medium { color: #84cc16; }
                .score.low { color: #f97316; }
                .score.critical { color: #ef4444; }
                .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🎯 Nuevo Lead Generado</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Valoración de inmueble completada</p>
                </div>
                <div class="content">
                  <!-- Datos del Cliente -->
                  <div class="section">
                    <h2 style="margin-top: 0; color: #1e40af;">👤 Datos del Cliente</h2>
                    <p><span class="label">Nombre:</span> <span class="value">${name}</span></p>
                    <p><span class="label">Email:</span> <span class="value">${email}</span></p>
                    <p><span class="label">Teléfono:</span> <span class="value">${phone}</span></p>
                    <p><span class="label">Fecha:</span> <span class="value">${new Date().toLocaleString('es-ES')}</span></p>
                  </div>

                  <!-- Datos de la Propiedad -->
                  <div class="section">
                    <h2 style="margin-top: 0; color: #1e40af;">🏠 Datos de la Propiedad</h2>
                    <p><span class="label">Dirección:</span> <span class="value">${address}</span></p>
                    <p><span class="label">Tipo:</span> <span class="value">${propertyTypeMap[propertyType] || propertyType}</span></p>
                    <p><span class="label">Superficie:</span> <span class="value">${squareMeters} m²</span></p>
                    <p><span class="label">Habitaciones:</span> <span class="value">${bedrooms}</span></p>
                    <p><span class="label">Baños:</span> <span class="value">${bathrooms}</span></p>
                    <p><span class="label">Antigüedad:</span> <span class="value">${buildingAgeMap[buildingAge] || buildingAge}</span></p>
                    <p><span class="label">Planta:</span> <span class="value">${floorMap[floor] || floor}</span></p>
                    <p><span class="label">Ascensor:</span> <span class="value">${hasElevator === "si" ? "Sí" : "No"}</span></p>
                    <p><span class="label">Garaje:</span> <span class="value">${hasGarage === "si" ? "Sí" : "No"}</span></p>
                    <p><span class="label">Exterior:</span> <span class="value">${terraceMap[hasTerrace] || hasTerrace}</span></p>
                    <p><span class="label">Estado:</span> <span class="value">${conditionMap[condition] || condition}</span></p>
                  </div>

                  <!-- Valoración -->
                  <div class="section">
                    <h2 style="margin-top: 0; color: #1e40af;">💰 Valoración Estimada</h2>
                    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #3b82f6; margin: 20px 0;">
                      ${valuation.valoracion_minima?.toLocaleString() || 'N/A'}€ - ${valuation.valoracion_maxima?.toLocaleString() || 'N/A'}€
                    </p>
                    <p style="text-align: center;"><span class="label">Valor medio:</span> <span style="font-size: 20px; font-weight: bold; color: #1e40af;">${valuation.valoracion_media?.toLocaleString() || 'N/A'}€</span></p>
                    ${valuation.score_global ? `
                      <div class="score ${valuation.score_global.puntuacion_total >= 75 ? 'high' : valuation.score_global.puntuacion_total >= 50 ? 'medium' : valuation.score_global.puntuacion_total >= 25 ? 'low' : 'critical'}">
                        ${valuation.score_global.puntuacion_total}/100
                      </div>
                      <p style="text-align: center; font-weight: bold; color: #4b5563;">${valuation.score_global.categoria}</p>
                    ` : ''}
                    ${valuation.tiempo_venta_estimado ? `<p><span class="label">Tiempo estimado de venta:</span> <span class="value">${valuation.tiempo_venta_estimado}</span></p>` : ''}
                  </div>

                  ${valuation.resumen_roi ? `
                  <!-- ROI Recomendado -->
                  <div class="section">
                    <h2 style="margin-top: 0; color: #1e40af;">📈 Potencial de Mejora (ROI)</h2>
                    <p><span class="label">Inversión recomendada:</span> <span class="value">${valuation.resumen_roi.inversion_total_recomendada?.toLocaleString() || 'N/A'}€</span></p>
                    <p><span class="label">Incremento de valor:</span> <span style="color: #22c55e; font-weight: bold;">+${valuation.resumen_roi.incremento_valor_total?.toLocaleString() || 'N/A'}€</span></p>
                    <p><span class="label">ROI:</span> <span style="color: #3b82f6; font-weight: bold;">${valuation.resumen_roi.roi_total_porcentaje || 'N/A'}%</span></p>
                    ${valuation.valoracion_con_mejoras ? `<p><span class="label">Valor con mejoras:</span> <span style="font-size: 18px; font-weight: bold; color: #22c55e;">${valuation.valoracion_con_mejoras.toLocaleString()}€</span></p>` : ''}
                  </div>
                  ` : ''}
                </div>
                <div class="footer">
                  <p>Este lead fue generado automáticamente desde tu landing de valoraciones.</p>
                  <p style="margin: 0;">Contacta al cliente lo antes posible para cerrar la venta 🚀</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      // Email al cliente con su informe de valoración
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@tudominio.com",
        to: email,
        subject: `✨ Tu Valoración de ${address} está lista`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .section { background: white; padding: 25px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .price-box { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid #3b82f6; }
                .price { font-size: 36px; font-weight: bold; color: #1e40af; margin: 10px 0; }
                .score-badge { display: inline-block; padding: 15px 30px; border-radius: 50px; font-size: 24px; font-weight: bold; margin: 20px 0; }
                .score-badge.high { background: #dcfce7; color: #166534; border: 2px solid #22c55e; }
                .score-badge.medium { background: #fef9c3; color: #854d0e; border: 2px solid #84cc16; }
                .score-badge.low { background: #fed7aa; color: #9a3412; border: 2px solid #f97316; }
                .score-badge.critical { background: #fee2e2; color: #991b1b; border: 2px solid #ef4444; }
                .cta-button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
                ul { list-style: none; padding: 0; }
                li { padding: 8px 0; padding-left: 25px; position: relative; }
                li:before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">¡Hola ${name}! 👋</h1>
                  <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Tu valoración personalizada está lista</p>
                </div>
                <div class="content">
                  <div class="section">
                    <h2 style="margin-top: 0; color: #1e40af; text-align: center;">🏠 ${address}</h2>

                    <div class="price-box">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Valoración Estimada</p>
                      <div class="price">${valuation.valoracion_minima?.toLocaleString() || 'N/A'}€ - ${valuation.valoracion_maxima?.toLocaleString() || 'N/A'}€</div>
                      <p style="margin: 5px 0 0 0; color: #4b5563; font-size: 16px;">
                        Valor medio: <strong>${valuation.valoracion_media?.toLocaleString() || 'N/A'}€</strong>
                      </p>
                    </div>

                    ${valuation.score_global ? `
                      <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Score de tu Propiedad</p>
                        <div class="score-badge ${valuation.score_global.puntuacion_total >= 75 ? 'high' : valuation.score_global.puntuacion_total >= 50 ? 'medium' : valuation.score_global.puntuacion_total >= 25 ? 'low' : 'critical'}">
                          ${valuation.score_global.puntuacion_total}/100 - ${valuation.score_global.categoria}
                        </div>
                        <p style="color: #4b5563; margin-top: 15px;">${valuation.score_global.explicacion || ''}</p>
                      </div>
                    ` : ''}
                  </div>

                  ${valuation.analisis ? `
                  <div class="section">
                    <h3 style="color: #1e40af; margin-top: 0;">📊 Análisis de tu Propiedad</h3>
                    ${valuation.analisis.puntos_fuertes?.length > 0 ? `
                    <h4 style="color: #22c55e; margin-bottom: 10px;">✅ Puntos Fuertes</h4>
                    <ul>
                      ${valuation.analisis.puntos_fuertes.map((punto: string) => `<li>${punto}</li>`).join('')}
                    </ul>
                    ` : ''}
                    ${valuation.analisis.puntos_debiles?.length > 0 ? `
                    <h4 style="color: #f97316; margin-bottom: 10px; margin-top: 20px;">⚠️ Áreas de Mejora</h4>
                    <ul style="list-style: none; padding: 0;">
                      ${valuation.analisis.puntos_debiles.map((punto: string) => `<li style="padding-left: 25px; position: relative;"><span style="position: absolute; left: 0;">•</span> ${punto}</li>`).join('')}
                    </ul>
                    ` : ''}
                  </div>
                  ` : ''}

                  ${valuation.resumen_roi && valuation.mejoras_con_roi?.length > 0 ? `
                  <div class="section">
                    <h3 style="color: #1e40af; margin-top: 0;">💰 Potencial de Rentabilidad</h3>
                    <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      Invirtiendo <strong>${valuation.resumen_roi.inversion_total_recomendada?.toLocaleString() || 'N/A'}€</strong> en mejoras,
                      podrías aumentar el valor de tu propiedad en <strong style="color: #22c55e;">+${valuation.resumen_roi.incremento_valor_total?.toLocaleString() || 'N/A'}€</strong>
                      <br><br>
                      <span style="font-size: 20px; color: #3b82f6;">ROI: ${valuation.resumen_roi.roi_total_porcentaje || 'N/A'}%</span>
                    </p>
                    ${valuation.valoracion_con_mejoras ? `
                    <p style="text-align: center; margin-top: 20px;">
                      <strong>Nuevo valor estimado:</strong> <span style="font-size: 24px; color: #22c55e; font-weight: bold;">${valuation.valoracion_con_mejoras.toLocaleString()}€</span>
                    </p>
                    ` : ''}
                  </div>
                  ` : ''}

                  ${valuation.tiempo_venta_estimado ? `
                  <div class="section" style="text-align: center;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">⚡ Tiempo estimado de venta</p>
                    <p style="font-size: 28px; font-weight: bold; color: #3b82f6; margin: 10px 0 0 0;">${valuation.tiempo_venta_estimado}</p>
                  </div>
                  ` : ''}

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:a.durandez@gmail.com" class="cta-button">📞 Contactar con un Asesor</a>
                  </div>
                </div>
                <div class="footer">
                  <p><strong>¿Quieres vender tu propiedad al mejor precio?</strong></p>
                  <p style="margin: 10px 0;">Nuestro equipo está listo para ayudarte a maximizar el valor de tu inmueble.</p>
                  <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af;">
                    Este informe fue generado automáticamente mediante inteligencia artificial basándose en los datos y fotos proporcionadas.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log("✅ Emails enviados correctamente");
    } catch (emailError) {
      // No fallar la request si los emails fallan, solo loggear el error
      console.error("⚠️ Error enviando emails:", emailError);
    }

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
