import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  // Instanciar Resend solo en runtime, no en build time
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { formType, ...data } = body;

    // Validación básica
    if (!data.email || !data.name) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (email, name)" },
        { status: 400 }
      );
    }

    // Email al administrador
    const adminEmail = process.env.ADMIN_EMAIL || "a.durandez@gmail.com";
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    // Construir el HTML del email según el tipo de formulario
    const emailHtml = formType === "short"
      ? buildShortFormEmail(data)
      : buildLongFormEmail(data);

    const subject = formType === "short"
      ? `📝 Nuevo lead - Formulario CORTO - ${data.name}`
      : `📸 Lead completado - Formulario LARGO - ${data.name}`;

    // Enviar email
    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: subject,
      html: emailHtml,
    });

    console.log(`✅ Email ${formType} enviado:`, emailResult);

    return NextResponse.json({
      success: true,
      message: `Email ${formType} enviado correctamente`,
      emailId: emailResult.data?.id,
    });
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return NextResponse.json(
      {
        error: "Error al enviar email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Template para formulario corto (Paso 3)
function buildShortFormEmail(data: any) {
  const {
    name,
    email,
    phone,
    propertyType,
    bedrooms,
    postalCode,
    street,
    squareMeters,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    landSize,
    consentMarketing,
    leadId,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: rgba(255,255,255,0.15);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .badge {
          display: inline-block;
          background: #fbbf24;
          color: #78350f;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 10px;
          text-transform: uppercase;
        }
        .content {
          background: white;
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          color: #667eea;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-item {
          background: #f9fafb;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }
        .info-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 14px;
          color: #111827;
          font-weight: 600;
        }
        .contact-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .contact-box a {
          color: white;
          text-decoration: none;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Nuevo Lead - Formulario Corto</h1>
          <span class="badge">Formulario Básico Completado</span>
        </div>

        <div class="content">
          <!-- Datos Personales -->
          <div class="section">
            <div class="section-title">👤 Datos de Contacto</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nombre</div>
                <div class="info-value">${name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teléfono</div>
                <div class="info-value">${phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Marketing</div>
                <div class="info-value">${consentMarketing ? '✅ Acepta' : '❌ No acepta'}</div>
              </div>
            </div>
          </div>

          <!-- Datos de Propiedad -->
          <div class="section">
            <div class="section-title">🏠 Datos de la Propiedad</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Tipo</div>
                <div class="info-value">${propertyType || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Código Postal</div>
                <div class="info-value">${postalCode || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Dirección</div>
                <div class="info-value">${street || 'No especificada'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Metros²</div>
                <div class="info-value">${squareMeters ? `${squareMeters} m²` : 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Habitaciones</div>
                <div class="info-value">${bedrooms || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Baños</div>
                <div class="info-value">${bathrooms || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Planta</div>
                <div class="info-value">${floor || 'No especificada'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ascensor</div>
                <div class="info-value">${hasElevator === true ? '✅ Sí' : hasElevator === false ? '❌ No' : 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Antigüedad</div>
                <div class="info-value">${buildingAge || 'No especificada'}</div>
              </div>
              ${landSize ? `
              <div class="info-item">
                <div class="info-label">Tamaño terreno</div>
                <div class="info-value">${landSize} m²</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Contact Box -->
          <div class="contact-box">
            <strong>📞 Contactar cliente:</strong><br>
            Email: <a href="mailto:${email}">${email}</a><br>
            Teléfono: <a href="tel:${phone}">${phone}</a>
          </div>

          ${leadId ? `
          <div class="footer">
            Lead ID: <code>${leadId}</code>
          </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template para formulario largo (Paso 8)
function buildLongFormEmail(data: any) {
  const {
    name,
    email,
    phone,
    propertyType,
    bedrooms,
    postalCode,
    street,
    squareMeters,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    landSize,
    // Datos avanzados
    orientation,
    propertyCondition,
    hasTerrace,
    terraceSize,
    hasGarage,
    hasStorage,
    quality,
    photos,
    consentMarketing,
    leadId,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          background: rgba(255,255,255,0.15);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .badge {
          display: inline-block;
          background: #fbbf24;
          color: #78350f;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 10px;
          text-transform: uppercase;
        }
        .content {
          background: white;
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          color: #10b981;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-item {
          background: #f0fdf4;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #10b981;
        }
        .info-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 14px;
          color: #111827;
          font-weight: 600;
        }
        .contact-box {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .contact-box a {
          color: white;
          text-decoration: none;
          font-weight: 600;
        }
        .photo-notice {
          background: #dbeafe;
          border: 2px solid #3b82f6;
          color: #1e40af;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📸 Lead Completo - Formulario Largo</h1>
          <span class="badge">Formulario Completo + Fotos</span>
        </div>

        <div class="content">
          <!-- Datos Personales -->
          <div class="section">
            <div class="section-title">👤 Datos de Contacto</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nombre</div>
                <div class="info-value">${name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Teléfono</div>
                <div class="info-value">${phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Marketing</div>
                <div class="info-value">${consentMarketing ? '✅ Acepta' : '❌ No acepta'}</div>
              </div>
            </div>
          </div>

          <!-- Datos Básicos de Propiedad -->
          <div class="section">
            <div class="section-title">🏠 Datos Básicos</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Tipo</div>
                <div class="info-value">${propertyType || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Código Postal</div>
                <div class="info-value">${postalCode || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Dirección</div>
                <div class="info-value">${street || 'No especificada'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Metros²</div>
                <div class="info-value">${squareMeters ? `${squareMeters} m²` : 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Habitaciones</div>
                <div class="info-value">${bedrooms || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Baños</div>
                <div class="info-value">${bathrooms || 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Planta</div>
                <div class="info-value">${floor || 'No especificada'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ascensor</div>
                <div class="info-value">${hasElevator === true ? '✅ Sí' : hasElevator === false ? '❌ No' : 'No especificado'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Antigüedad</div>
                <div class="info-value">${buildingAge || 'No especificada'}</div>
              </div>
              ${landSize ? `
              <div class="info-item">
                <div class="info-label">Tamaño terreno</div>
                <div class="info-value">${landSize} m²</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Características Avanzadas -->
          <div class="section">
            <div class="section-title">⭐ Características Avanzadas</div>
            <div class="info-grid">
              ${orientation ? `
              <div class="info-item">
                <div class="info-label">Orientación</div>
                <div class="info-value">${orientation}</div>
              </div>
              ` : ''}
              ${propertyCondition ? `
              <div class="info-item">
                <div class="info-label">Estado</div>
                <div class="info-value">${propertyCondition}</div>
              </div>
              ` : ''}
              ${quality ? `
              <div class="info-item">
                <div class="info-label">Calidad</div>
                <div class="info-value">${quality}</div>
              </div>
              ` : ''}
              ${hasTerrace !== null ? `
              <div class="info-item">
                <div class="info-label">Terraza</div>
                <div class="info-value">${hasTerrace ? `✅ Sí${terraceSize ? ` (${terraceSize} m²)` : ''}` : '❌ No'}</div>
              </div>
              ` : ''}
              ${hasGarage !== null ? `
              <div class="info-item">
                <div class="info-label">Garaje</div>
                <div class="info-value">${hasGarage ? '✅ Sí' : '❌ No'}</div>
              </div>
              ` : ''}
              ${hasStorage !== null ? `
              <div class="info-item">
                <div class="info-label">Trastero</div>
                <div class="info-value">${hasStorage ? '✅ Sí' : '❌ No'}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Fotos -->
          ${photos && photos > 0 ? `
          <div class="section">
            <div class="photo-notice">
              📸 El cliente ha subido ${photos} foto${photos > 1 ? 's' : ''} de la propiedad
            </div>
          </div>
          ` : ''}

          <!-- Contact Box -->
          <div class="contact-box">
            <strong>📞 Contactar cliente:</strong><br>
            Email: <a href="mailto:${email}">${email}</a><br>
            Teléfono: <a href="tel:${phone}">${phone}</a>
          </div>

          ${leadId ? `
          <div class="footer">
            Lead ID: <code>${leadId}</code>
          </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}
