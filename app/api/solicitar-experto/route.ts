/**
 * API Route: POST /api/solicitar-experto
 * Envía solicitud de consulta con experto por email
 */

import { NextRequest, NextResponse } from "next/server";
import { enviarSolicitudExperto } from "@/lib/email/logsService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (!body.nombre || !body.telefono) {
      return NextResponse.json(
        { error: "Nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    if (!body.datosInmueble || !body.valoracionCalculada) {
      return NextResponse.json(
        { error: "Datos del inmueble y valoración son necesarios" },
        { status: 400 }
      );
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(`📞 SOLICITUD DE EXPERTO`);
    console.log(`Nombre: ${body.nombre}`);
    console.log(`Teléfono: ${body.telefono}`);
    console.log(`${"=".repeat(80)}\n`);

    // Enviar email
    await enviarSolicitudExperto({
      nombre: body.nombre,
      telefono: body.telefono,
      valoracionId: body.valoracionId,
      datosInmueble: body.datosInmueble,
      valoracionCalculada: body.valoracionCalculada,
    });

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente. Un experto te contactará pronto.",
    });
  } catch (error: any) {
    console.error("❌ ERROR EN SOLICITUD DE EXPERTO:", error);
    return NextResponse.json(
      {
        error: "Error procesando la solicitud",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
