/**
 * Servicio de envío de logs por email
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface LogData {
  tipo: "basico" | "detallado";
  timestamp: string;
  datosEntrada: any;
  promptEntrada: string;
  promptSalida?: string;
  respuestaModelo: any;
  calculos: {
    descripcion: string;
    valores: any;
  }[];
  resultado: any;
  modelo: string;
}

/**
 * Formatea los logs en HTML para el email
 */
function formatLogHTML(log: LogData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; background: #f5f5f5; padding: 20px; }
    .container { background: white; padding: 20px; border-radius: 8px; max-width: 1200px; margin: 0 auto; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; border-left: 4px solid #3b82f6; padding-left: 10px; }
    .section { background: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #e2e8f0; }
    pre { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; }
    .meta { color: #64748b; font-size: 14px; }
    .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 3px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 LOG DE VALORACIÓN ${log.tipo.toUpperCase()}</h1>

    <div class="meta">
      <strong>Timestamp:</strong> ${log.timestamp}<br>
      <strong>Modelo:</strong> <span class="highlight">${log.modelo}</span><br>
      <strong>Tipo:</strong> ${log.tipo}
    </div>

    <h2>📥 DATOS DE ENTRADA</h2>
    <div class="section">
      <h3>Datos recibidos del cliente:</h3>
      <pre>${JSON.stringify(log.datosEntrada, null, 2)}</pre>
    </div>

    <h2>💬 PROMPT ENVIADO AL MODELO</h2>
    <div class="section">
      <h3>Prompt completo (versión larga):</h3>
      <pre>${log.promptEntrada}</pre>
    </div>

    <h2>🤖 RESPUESTA DEL MODELO</h2>
    <div class="section">
      <h3>Respuesta completa:</h3>
      <pre>${JSON.stringify(log.respuestaModelo, null, 2)}</pre>
    </div>

    ${
      log.promptSalida
        ? `
    <h2>📤 PROMPT DE SALIDA (si aplica)</h2>
    <div class="section">
      <pre>${log.promptSalida}</pre>
    </div>
    `
        : ""
    }

    <h2>🧮 CÁLCULOS REALIZADOS</h2>
    ${log.calculos
      .map(
        (calculo, idx) => `
    <div class="section">
      <h3>${idx + 1}. ${calculo.descripcion}</h3>
      <table>
        ${Object.entries(calculo.valores)
          .map(
            ([key, value]) => `
        <tr>
          <th>${key}</th>
          <td>${
            typeof value === "number"
              ? value.toLocaleString("es-ES")
              : JSON.stringify(value)
          }</td>
        </tr>
        `
          )
          .join("")}
      </table>
    </div>
    `
      )
      .join("")}

    <h2>✅ RESULTADO FINAL</h2>
    <div class="section">
      <pre>${JSON.stringify(log.resultado, null, 2)}</pre>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 2px solid #e2e8f0;">
    <p style="color: #64748b; text-align: center; font-size: 12px;">
      Este email contiene logs técnicos de la valoración realizada en ValoraciónMAX
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Envía logs por email
 */
export async function enviarLogsValoracion(log: LogData): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: "ValoraciónMAX Logs <logs@valoracionmax.es>",
      to: ["adrian.durandez@gmail.com"], // Email del administrador
      subject: `📊 LOG ${log.tipo.toUpperCase()} - ${log.timestamp}`,
      html: formatLogHTML(log),
    });

    if (error) {
      console.error("❌ Error enviando logs por email:", error);
      throw error;
    }

    console.log("✅ Logs enviados por email:", data?.id);
  } catch (error) {
    console.error("❌ Error en enviarLogsValoracion:", error);
    // No lanzamos el error para no afectar la valoración
  }
}

/**
 * Email cuando un usuario solicita consulta con experto
 */
export async function enviarSolicitudExperto(datos: {
  nombre: string;
  telefono: string;
  valoracionId?: string;
  datosInmueble: any;
  valoracionCalculada: any;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { background: white; padding: 30px; border-radius: 8px; max-width: 800px; margin: 0 auto; }
    h1 { color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 10px; }
    h2 { color: #991b1b; margin-top: 25px; }
    .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .section { background: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .contact { background: #dbeafe; padding: 20px; border-radius: 8px; border: 2px solid #3b82f6; margin: 20px 0; }
    .contact h3 { color: #1e40af; margin-top: 0; }
    .contact p { font-size: 18px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚨 SOLICITUD DE CONSULTA CON EXPERTO</h1>

    <div class="alert">
      <strong>⚠️ ACCIÓN REQUERIDA:</strong> Un usuario quiere que un experto le informe sobre el precio del mercado en su zona.
    </div>

    <div class="contact">
      <h3>📞 DATOS DE CONTACTO DEL CLIENTE</h3>
      <p><strong>Nombre:</strong> ${datos.nombre}</p>
      <p><strong>Teléfono:</strong> <a href="tel:${datos.telefono}" style="color: #2563eb; font-size: 20px;">${datos.telefono}</a></p>
    </div>

    <h2>🏠 DATOS DEL INMUEBLE</h2>
    <div class="section">
      <table>
        <tr><th>Ubicación</th><td>${datos.datosInmueble.ubicacion?.municipio || "N/A"} (CP: ${datos.datosInmueble.ubicacion?.cp || "N/A"})</td></tr>
        <tr><th>Tipo</th><td>${datos.datosInmueble.inmueble?.tipo_inmueble || "N/A"}</td></tr>
        <tr><th>Superficie</th><td>${datos.datosInmueble.inmueble?.superficie_m2 || "N/A"} m²</td></tr>
        <tr><th>Habitaciones</th><td>${datos.datosInmueble.inmueble?.habitaciones || "N/A"}</td></tr>
        <tr><th>Baños</th><td>${datos.datosInmueble.inmueble?.banos || "N/A"}</td></tr>
        <tr><th>Estado</th><td>${datos.datosInmueble.inmueble?.estado_declarado_usuario || "N/A"}</td></tr>
      </table>
    </div>

    <h2>💰 VALORACIÓN CALCULADA POR EL SISTEMA</h2>
    <div class="section">
      <table>
        <tr><th>Valoración Mínima</th><td style="font-size: 16px; font-weight: bold;">${(datos.valoracionCalculada.valoracion_minima || 0).toLocaleString("es-ES")} €</td></tr>
        <tr><th>Valoración Media</th><td style="font-size: 18px; font-weight: bold; color: #2563eb;">${(datos.valoracionCalculada.valoracion_media || 0).toLocaleString("es-ES")} €</td></tr>
        <tr><th>Valoración Máxima</th><td style="font-size: 16px; font-weight: bold;">${(datos.valoracionCalculada.valoracion_maxima || 0).toLocaleString("es-ES")} €</td></tr>
      </table>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 2px solid #e2e8f0;">

    <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
      <strong>📋 SIGUIENTE PASO:</strong> Contactar al cliente por teléfono para informarle del precio del último piso similar vendido en la zona.
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: "ValoraciónMAX Solicitudes <solicitudes@valoracionmax.es>",
      to: ["adrian.durandez@gmail.com"],
      subject: `🚨 SOLICITUD EXPERTO - ${datos.nombre} - ${datos.telefono}`,
      html,
    });

    if (error) {
      console.error("❌ Error enviando solicitud de experto:", error);
      throw error;
    }

    console.log("✅ Solicitud de experto enviada:", data?.id);
  } catch (error) {
    console.error("❌ Error en enviarSolicitudExperto:", error);
    throw error;
  }
}
