import { NextResponse } from "next/server";
import { Resend } from "resend";
import preciosPorCP from "@/data/precios_por_cp.json";

// Importar el sistema modular de valoración
import {
  calculateValuation,
  getMarketDataSmart,
  parsePrecioRegistradores,
  generateAuditReport,
  printAuditReport,
  trackClaudeUsage,
  addToHistory,
  type PropertyData,
  type MarketData,
} from "@/lib/valuation";

// Inicializar Resend para emails
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    // Timestamp de inicio (para medir duración)
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    console.log(`\n${'═'.repeat(80)}`);
    console.log(`🏠 NUEVA VALORACIÓN - ${new Date().toLocaleString('es-ES')}`);
    console.log(`${'═'.repeat(80)}\n`);

    // 1. BUSCAR PRECIO EN JSON DE REGISTRADORES
    const cpData = (preciosPorCP as any)[postalCode];
    const precioRegistradores = cpData?.precio ? parsePrecioRegistradores(cpData.precio) : null;

    if (precioRegistradores) {
      console.log(`✅ Precio de Registradores encontrado en JSON: ${precioRegistradores}€/m² (original: ${cpData.precio})`);
      console.log(`⏭️  NO se llamará a Claude (ahorro de tokens)`);
    } else {
      console.log(`⚠️  No hay precio de Registradores para CP ${postalCode}`);
      console.log(`🤖 Se consultará a Claude como fallback`);
    }

    // 2. PREPARAR DATOS DE PROPIEDAD
    const property: PropertyData = {
      postalCode,
      municipality,
      street,
      squareMeters,
      landSize: body.landSize,
      bedrooms,
      bathrooms,
      floor,
      hasElevator,
      buildingAge,
      propertyType,
    };

    // 3. OBTENER DATOS DE MERCADO (con prioridad JSON > Claude)
    console.log(`\n📊 OBTENIENDO DATOS DE MERCADO...`);
    const { marketData, prompt } = await getMarketDataSmart(property, precioRegistradores);

    // Trackear uso de Claude (para estadísticas)
    const calledClaude = !precioRegistradores; // Solo llamamos a Claude si no hay precio
    trackClaudeUsage(calledClaude, !!precioRegistradores);

    // 4. CALCULAR VALORACIÓN
    console.log(`\n💰 CALCULANDO VALORACIÓN...`);
    const valuation = calculateValuation(property, marketData, precioRegistradores);

    // 5. GENERAR Y MOSTRAR INFORME DE AUDITORÍA
    const auditReport = generateAuditReport(property, marketData, valuation);
    printAuditReport(auditReport);

    console.log(`\n✅ Valoración completada para lead ${leadId}`);

    // 6. GUARDAR EN HISTORIAL
    const duration = Date.now() - startTime;
    const historyId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    addToHistory({
      id: historyId,
      timestamp,
      property,
      marketData,
      valuation,
      usedJSON: !!precioRegistradores,
      calledClaude,
      precioRegistradores,
      tokensUsed: calledClaude ? 500 : 0, // Estimación
      prompt: prompt,
      duration,
    });

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
