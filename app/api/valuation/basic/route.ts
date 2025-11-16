import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import preciosPorCP from "@/data/precios_por_cp.json";

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Inicializar Resend para emails
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper para parsear precio de formato "1.866 €/m²" a número
function parsePrecioRegistradores(precioTexto: string): number | null {
  try {
    // "1.866 €/m²" → quitar todo excepto números y coma → "1866" → 1866 → aplicar 15%
    const numero = precioTexto
      .replace(/[€\/m²\s]/g, '')  // quitar €, /, m², espacios
      .replace(/\./g, '')          // quitar puntos (separadores de miles)
      .replace(',', '.');          // cambiar coma decimal por punto
    const precioBase = parseFloat(numero);
    return Math.round(precioBase * 1.15); // Aplicar 15% adicional
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      leadId,
      postalCode,
      municipality,
      street,
      squareMeters,
      bedrooms,
      bathrooms,
      floor,
      hasElevator,
      buildingAge,
      propertyType,
      name,
      email,
      phone,
    } = body;

    // Validaciones
    if (!postalCode || !squareMeters || !bedrooms) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para la valoración" },
        { status: 400 }
      );
    }

    // Buscar precio de Registradores si existe
    const cpData = (preciosPorCP as any)[postalCode];
    const precioRegistradores = cpData?.precio ? parsePrecioRegistradores(cpData.precio) : null;

    console.log(`🔍 FASE 1: Buscando precio de mercado para ${street || 'Sin dirección'}, ${municipality || 'Sin municipio'}, CP: ${postalCode}`);
    if (precioRegistradores) {
      console.log(`💰 Precio Registradores encontrado: ${precioRegistradores}€/m² (${cpData.precio})`);
    } else {
      console.log(`⚠️ No hay precio de Registradores para CP ${postalCode}, consultando a Claude...`);
    }

    // 1. Buscar datos de mercado usando Claude
    let marketData: any = null;

    try {
      // Mapear valores para hacerlos más legibles
      const floorMap: Record<string, string> = {
        "bajo": "Planta baja",
        "entresuelo": "Entresuelo",
        "1-2": "Planta 1ª-2ª",
        "3-5": "Planta 3ª-5ª",
        "6+": "Planta 6ª o superior",
        "atico": "Ático"
      };

      const buildingAgeMap: Record<string, string> = {
        "nueva": "Menos de 5 años",
        "reciente": "Entre 5-15 años",
        "moderna": "Entre 15-30 años",
        "antigua": "Entre 30-50 años",
        "muy-antigua": "Más de 50 años"
      };

      const marketPrompt = `Eres un tasador inmobiliario experimentado y optimista. Basándote en tu conocimiento actualizado del mercado inmobiliario español, analiza y proporciona datos de precios para esta propiedad:

📍 UBICACIÓN:
- Población/Municipio: ${municipality || 'No especificado'}
- Código Postal: ${postalCode}
- Dirección: ${street || 'No especificada'}

${precioRegistradores ? `📊 PRECIO DE REFERENCIA (Registradores 2024):
- Precio medio zona según datos oficiales: ${precioRegistradores} €/m²
- Fuente: Colegio de Registradores de España

` : ''}🏠 CARACTERÍSTICAS DE LA PROPIEDAD:
- Tipo: ${propertyType || 'piso'}
- Superficie vivienda: ${squareMeters} m²${body.landSize ? `\n- Tamaño del terreno: ${body.landSize} m² (IMPORTANTE: Si es una casa con terreno, el tamaño del terreno es un factor CLAVE que aumenta significativamente el valor)` : ''}
- Habitaciones: ${bedrooms}
- Baños: ${bathrooms || 'No especificado'}
- Planta: ${floor ? floorMap[floor] : 'No especificado'}
- Ascensor: ${hasElevator === true ? 'Sí' : hasElevator === false ? 'No' : 'No especificado'}
- Antigüedad: ${buildingAge ? buildingAgeMap[buildingAge] : 'No especificado'}

IMPORTANTE: Actúa como un tasador inmobiliario experimentado y optimista. Usa tu conocimiento actualizado del mercado inmobiliario 2025 para:
1. ${precioRegistradores
   ? `Usa el precio de Registradores (${precioRegistradores} €/m²) como BASE PRINCIPAL y ajústalo según las características específicas de la propiedad`
   : `Analizar el mercado en ${municipality || 'la zona del código postal ' + postalCode} para determinar el precio base`}
2. Identificar el barrio o zona dentro del municipio si es posible
3. Analizar TODAS las características de la propiedad (tamaño, habitaciones, planta, ascensor, antigüedad)${body.landSize ? '\n4. Si es una casa con terreno, VALORAR MUY POSITIVAMENTE el tamaño del terreno como un activo importante' : '\n4. Proporcionar precios realistas de mercado'}
5. Ser optimista en la valoración, destacando los aspectos positivos de la propiedad

Proporciona ÚNICAMENTE un JSON con este formato exacto (sin texto adicional):
{
  "precio_min_m2": número (precio mínimo €/m² para esta propiedad en esta zona),
  "precio_medio_m2": número (precio medio €/m² considerando todas las características),
  "precio_max_m2": número (precio máximo €/m² para esta propiedad en esta zona),
  "municipality": "nombre del municipio",
  "neighborhood": "nombre del barrio si se puede identificar",
  "province": "nombre de la provincia",
  "demanda_zona": "alta" | "media" | "baja",
  "tendencia": "subiendo" | "estable" | "bajando",
  "descripcion_zona": "breve descripción de 1-2 líneas sobre características de la zona que afectan al precio"
}`;

      console.log("📤 ENVIANDO A CLAUDE:");
      console.log("═══════════════════════════════════════");
      console.log(marketPrompt);
      console.log("═══════════════════════════════════════");

      const marketResponse = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: marketPrompt,
          },
        ],
      });

      const marketText = marketResponse.content[0].type === "text"
        ? marketResponse.content[0].text
        : "";

      console.log("📥 RESPUESTA DE CLAUDE:");
      console.log("═══════════════════════════════════════");
      console.log(marketText);
      console.log("═══════════════════════════════════════");

      // Parsear JSON
      const marketJson = JSON.parse(marketText);
      marketData = {
        ...marketJson,
        postalCode,
        fuente: "análisis de mercado actualizado",
        fecha_actualizacion: new Date().toISOString().split("T")[0],
      };

      console.log(`✅ Precio medio obtenido: ${marketData.precio_medio_m2}€/m² para ${marketData.municipality}`);
    } catch (error) {
      console.error("❌ Error consultando precios de mercado:", error);
      // Fallback a datos genéricos
      marketData = {
        postalCode,
        province: "Madrid",
        municipality: "Madrid",
        neighborhood: "Centro",
        precio_medio_m2: 3800,
        precio_min_m2: 3400,
        precio_max_m2: 4200,
        demanda_zona: "media",
        tendencia: "estable",
        fuente: "estimación genérica",
        fecha_actualizacion: new Date().toISOString().split("T")[0],
      };
    }

    // 2. Calcular precio base
    let basePrice = marketData.precio_medio_m2 * squareMeters;

    // 3. Aplicar ajustes
    const adjustments: any[] = [];
    let totalFactor = 1.0;

    // Ajuste por superficie
    if (squareMeters < 50) {
      adjustments.push({
        factor: "Superficie pequeña",
        value: "+10%",
        percentage: 10,
      });
      totalFactor *= 1.10;
    } else if (squareMeters > 150) {
      adjustments.push({
        factor: "Superficie grande",
        value: "-5%",
        percentage: -5,
      });
      totalFactor *= 0.95;
    }

    // Ajuste por planta + ascensor
    if (floor && hasElevator !== null) {
      let floorAdjustment = 0;
      let floorLabel = "";

      if (hasElevator) {
        switch (floor) {
          case "bajo":
            floorAdjustment = -10;
            floorLabel = "Planta baja (con ascensor)";
            break;
          case "entresuelo":
            floorAdjustment = -5;
            floorLabel = "Entresuelo (con ascensor)";
            break;
          case "1-2":
            floorAdjustment = 0;
            floorLabel = "Planta 1ª-2ª (con ascensor)";
            break;
          case "3-5":
            floorAdjustment = 3;
            floorLabel = "Planta 3ª-5ª (con ascensor)";
            break;
          case "6+":
            floorAdjustment = 5;
            floorLabel = "Planta 6ª+ (con ascensor)";
            break;
          case "atico":
            floorAdjustment = 8;
            floorLabel = "Ático (con ascensor)";
            break;
        }
      } else {
        switch (floor) {
          case "bajo":
            floorAdjustment = -10;
            floorLabel = "Planta baja (sin ascensor)";
            break;
          case "1-2":
            floorAdjustment = -5;
            floorLabel = "Planta 1ª-2ª (sin ascensor)";
            break;
          case "3-5":
            floorAdjustment = -25;
            floorLabel = "Planta 3ª-5ª (sin ascensor)";
            break;
          case "6+":
            floorAdjustment = -30;
            floorLabel = "Planta 6ª+ (sin ascensor)";
            break;
          case "atico":
            floorAdjustment = -20;
            floorLabel = "Ático (sin ascensor)";
            break;
        }
      }

      if (floorAdjustment !== 0) {
        adjustments.push({
          factor: floorLabel,
          value: `${floorAdjustment > 0 ? "+" : ""}${floorAdjustment}%`,
          percentage: floorAdjustment,
        });
        totalFactor *= 1 + floorAdjustment / 100;
      }
    }

    // Ajuste por antigüedad
    if (buildingAge) {
      let ageAdjustment = 0;
      let ageLabel = "";

      switch (buildingAge) {
        case "nueva":
          ageAdjustment = 10;
          ageLabel = "Edificio nuevo (<5 años)";
          break;
        case "reciente":
          ageAdjustment = 5;
          ageLabel = "Edificio reciente (5-15 años)";
          break;
        case "moderna":
          ageAdjustment = 0;
          ageLabel = "Edificio moderno (15-30 años)";
          break;
        case "antigua":
          ageAdjustment = -5;
          ageLabel = "Edificio antiguo (30-50 años)";
          break;
        case "muy-antigua":
          ageAdjustment = -10;
          ageLabel = "Edificio muy antiguo (>50 años)";
          break;
      }

      if (ageAdjustment !== 0) {
        adjustments.push({
          factor: ageLabel,
          value: `${ageAdjustment > 0 ? "+" : ""}${ageAdjustment}%`,
          percentage: ageAdjustment,
        });
        totalFactor *= 1 + ageAdjustment / 100;
      }
    }

    // Ajuste por baños múltiples
    if (bathrooms && bathrooms >= 2 && bedrooms && bedrooms >= 2) {
      adjustments.push({
        factor: "Múltiples baños",
        value: "+5%",
        percentage: 5,
      });
      totalFactor *= 1.05;
    }

    // 4. Aplicar factor total
    const adjustedPrice = basePrice * totalFactor;

    // 4.5. Aplicar optimismo del 10% al precio final
    const optimismFactor = 1.10;
    const optimisticPrice = adjustedPrice * optimismFactor;

    console.log(`📈 Aplicando optimismo del 10%: ${Math.round(adjustedPrice).toLocaleString()}€ → ${Math.round(optimisticPrice).toLocaleString()}€`);

    // 5. Calcular rango con incertidumbre ±2%
    const uncertainty = 0.02;
    const min = Math.round(optimisticPrice * (1 - uncertainty));
    const max = Math.round(optimisticPrice * (1 + uncertainty));
    const avg = Math.round(optimisticPrice);

    // 6. Calcular precio por m²
    const pricePerM2 = Math.round(avg / squareMeters);

    const valuation = {
      avg,
      min,
      max,
      uncertainty: "±2%",
      pricePerM2,
      precioZona: precioRegistradores || null, // Precio del Excel o null
      adjustments,
      marketData,
      calculatedAt: new Date().toISOString(),
      disclaimer: "Valoración sin comisiones e impuestos",
    };

    console.log(`Valoración calculada para lead ${leadId}:`, valuation);

    // Enviar email al administrador con los datos del lead
    try {
      if (!resend) {
        console.log("⚠️ Resend no configurado - saltando envío de email");
      } else if (name && email) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || "onboarding@tudominio.com",
          to: process.env.ADMIN_EMAIL || "a.durandez@gmail.com",
          subject: `🏠 Nuevo Lead FASE 1 - ${name} - ${marketData.municipality || postalCode}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
                  .label { font-weight: bold; color: #1e40af; }
                  .value { color: #4b5563; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">📊 Lead FASE 1 - Valoración Básica</h1>
                    <p style="margin: 10px 0 0 0;">Datos básicos + Búsqueda de mercado completada</p>
                  </div>
                  <div class="content">
                    <div class="section">
                      <h2 style="margin-top: 0; color: #1e40af;">👤 Datos del Cliente</h2>
                      <p><span class="label">Nombre:</span> <span class="value">${name}</span></p>
                      <p><span class="label">Email:</span> <span class="value">${email}</span></p>
                      <p><span class="label">Teléfono:</span> <span class="value">${phone || 'No proporcionado'}</span></p>
                      <p><span class="label">Fecha:</span> <span class="value">${new Date().toLocaleString('es-ES')}</span></p>
                    </div>

                    <div class="section">
                      <h2 style="margin-top: 0; color: #1e40af;">🏠 Datos de la Propiedad</h2>
                      <p><span class="label">Dirección:</span> <span class="value">${street || 'No proporcionada'}</span></p>
                      <p><span class="label">Código Postal:</span> <span class="value">${postalCode}</span></p>
                      <p><span class="label">Municipio:</span> <span class="value">${marketData.municipality || 'Desconocido'}</span></p>
                      <p><span class="label">Barrio:</span> <span class="value">${marketData.neighborhood || 'No identificado'}</span></p>
                      <p><span class="label">Tipo:</span> <span class="value">${propertyType || 'No especificado'}</span></p>
                      <p><span class="label">Superficie:</span> <span class="value">${squareMeters} m²</span></p>
                      <p><span class="label">Habitaciones:</span> <span class="value">${bedrooms}</span></p>
                      <p><span class="label">Baños:</span> <span class="value">${bathrooms || 'No especificado'}</span></p>
                    </div>

                    <div class="section">
                      <h2 style="margin-top: 0; color: #1e40af;">💰 Valoración Básica (±2%)</h2>
                      <p style="text-align: center; font-size: 24px; font-weight: bold; color: #3b82f6;">
                        ${valuation.min.toLocaleString()}€ - ${valuation.max.toLocaleString()}€
                      </p>
                      <p style="text-align: center; margin-top: 10px;">
                        <span class="label">Valor medio:</span> <span style="font-size: 20px; font-weight: bold;">${valuation.avg.toLocaleString()}€</span>
                      </p>
                      <p><span class="label">Precio/m²:</span> <span class="value">${valuation.pricePerM2.toLocaleString()}€</span></p>
                      <p style="text-align: center; margin-top: 10px; color: #6b7280; font-size: 14px;">Sin comisiones e impuestos</p>
                    </div>

                    <div class="section">
                      <h2 style="margin-top: 0; color: #1e40af;">📊 Datos de Mercado</h2>
                      <p><span class="label">Precio medio zona:</span> <span class="value">${marketData.precio_medio_m2?.toLocaleString() || 'N/A'}€/m²</span></p>
                      <p><span class="label">Rango zona:</span> <span class="value">${marketData.precio_min_m2?.toLocaleString() || 'N/A'}€ - ${marketData.precio_max_m2?.toLocaleString() || 'N/A'}€/m²</span></p>
                      <p><span class="label">Demanda:</span> <span class="value">${marketData.demanda_zona || 'No disponible'}</span></p>
                      <p><span class="label">Tendencia:</span> <span class="value">${marketData.tendencia || 'No disponible'}</span></p>
                      ${marketData.descripcion_zona ? `<p><span class="label">Zona:</span> <span class="value">${marketData.descripcion_zona}</span></p>` : ''}
                    </div>

                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
                      <p style="margin: 0; font-size: 14px;"><strong>⏭️ Próximo paso:</strong> El cliente continuará con la FASE 2 (datos avanzados + fotos) para obtener una valoración aún más precisa</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        console.log("✅ Email enviado a", process.env.ADMIN_EMAIL);
      }
    } catch (emailError) {
      console.error("⚠️ Error enviando email:", emailError);
    }

    return NextResponse.json({
      success: true,
      valuation,
    });
  } catch (error) {
    console.error("Error calculando valoración:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
