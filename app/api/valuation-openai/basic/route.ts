/**
 * API Route: POST /api/valuation-openai/basic
 * FASE 1 - Valoración Básica con OpenAI
 */

import { NextRequest, NextResponse } from "next/server";
import { valorarConOpenAIFase1 } from "@/lib/openai-valuation";
import type { Fase1Input, ValoracionBasica } from "@/lib/openai-valuation";
import { enviarLogsValoracion } from "@/lib/email/logsService";

export async function POST(request: NextRequest) {
  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📍 API ENDPOINT: /api/valuation-openai/basic`);
    console.log(`Timestamp: ${new Date().toLocaleString("es-ES")}`);
    console.log(`${"=".repeat(80)}\n`);

    // Validar API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY no configurada");
      return NextResponse.json(
        { error: "Servidor no configurado correctamente" },
        { status: 500 }
      );
    }

    // Parsear body
    const body = await request.json();

    // Validar estructura mínima
    if (!body.ubicacion || !body.inmueble) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: ubicacion, inmueble" },
        { status: 400 }
      );
    }

    if (!body.ubicacion.municipio || !body.ubicacion.provincia) {
      return NextResponse.json(
        { error: "Ubicación debe incluir municipio y provincia" },
        { status: 400 }
      );
    }

    if (!body.inmueble.superficie_m2 || !body.inmueble.habitaciones) {
      return NextResponse.json(
        { error: "Inmueble debe incluir superficie_m2 y habitaciones" },
        { status: 400 }
      );
    }

    // Construir input
    const input: Fase1Input = {
      ubicacion: {
        cp: body.ubicacion.cp,
        municipio: body.ubicacion.municipio,
        provincia: body.ubicacion.provincia,
        barrio_usuario: body.ubicacion.barrio_usuario,
      },
      inmueble: {
        tipo_inmueble: body.inmueble.tipo_inmueble || "piso",
        superficie_m2: body.inmueble.superficie_m2,
        habitaciones: body.inmueble.habitaciones,
        banos: body.inmueble.banos || 1,
        planta: body.inmueble.planta || 0,
        total_plantas_edificio: body.inmueble.total_plantas_edificio,
        ascensor: body.inmueble.ascensor || false,
        antiguedad_rango: body.inmueble.antiguedad_rango || "segunda_mano",
        estado_declarado_usuario: body.inmueble.estado_declarado_usuario || "normal",
      },
    };

    console.log(`📝 Input recibido:`);
    console.log(`   CP: ${input.ubicacion.cp || "No proporcionado"}`);
    console.log(`   Municipio: ${input.ubicacion.municipio}`);
    console.log(`   Superficie: ${input.inmueble.superficie_m2} m²`);
    console.log(`   Habitaciones: ${input.inmueble.habitaciones}`);

    // Timestamp de inicio
    const startTime = Date.now();

    // Llamar al servicio de OpenAI
    const valoracion: ValoracionBasica = await valorarConOpenAIFase1(input);

    // Calcular valoraciones finales (min/media/max)
    const superficie = input.inmueble.superficie_m2;
    const precioBase = valoracion.precio_m2_base_actualizado;

    // Calcular factor total de ajustes
    const ajustes = valoracion.ajustes_porcentuales;
    const factorAjustes =
      1 +
      (ajustes.planta +
        ajustes.ascensor +
        ajustes.antiguedad +
        ajustes.estado +
        ajustes.banos) /
        100;

    const factorMercado = valoracion.factor_mercado_local;

    // Precio ajustado por m²
    const precioM2Ajustado = Math.round(precioBase * factorAjustes * factorMercado);

    // Valoraciones totales
    const valoracionMedia = Math.round(superficie * precioM2Ajustado);
    const valoracionMinima = Math.round(valoracionMedia * 0.98); // -2%
    const valoracionMaxima = Math.round(valoracionMedia * 1.02); // +2%

    const duration = Date.now() - startTime;

    console.log(`\n💰 VALORACIÓN CALCULADA:`);
    console.log(`   Precio m² base: ${precioBase.toLocaleString()} €/m²`);
    console.log(`   Factor ajustes: ${((factorAjustes - 1) * 100).toFixed(1)}%`);
    console.log(`   Factor mercado: ${((factorMercado - 1) * 100).toFixed(1)}%`);
    console.log(`   Precio m² final: ${precioM2Ajustado.toLocaleString()} €/m²`);
    console.log(`   Valoración: ${valoracionMinima.toLocaleString()}€ - ${valoracionMaxima.toLocaleString()}€`);
    console.log(`   Duración: ${(duration / 1000).toFixed(2)}s`);
    console.log(`${"=".repeat(80)}\n`);

    // Enviar logs por email (no bloqueante)
    const logsData = (valoracion as any)._logs;
    if (logsData) {
      enviarLogsValoracion({
        tipo: "basico",
        timestamp: new Date().toLocaleString("es-ES"),
        datosEntrada: input,
        promptEntrada: `SYSTEM PROMPT:\n${logsData.systemPrompt}\n\nUSER MESSAGE:\n${logsData.userMessage}`,
        respuestaModelo: logsData.parsedResponse,
        calculos: [
          {
            descripcion: "Cálculo del precio base por m²",
            valores: {
              precio_m2_base: precioBase,
              zona: valoracion.tipo_zona,
              fuente: "Registradores + OpenAI",
            },
          },
          {
            descripcion: "Aplicación de ajustes porcentuales",
            valores: {
              planta: `${ajustes.planta}%`,
              ascensor: `${ajustes.ascensor}%`,
              antiguedad: `${ajustes.antiguedad}%`,
              estado: `${ajustes.estado}%`,
              banos: `${ajustes.banos}%`,
              factor_total: `${((factorAjustes - 1) * 100).toFixed(1)}%`,
            },
          },
          {
            descripcion: "Factor de mercado local",
            valores: {
              factor_mercado: factorMercado,
              porcentaje: `${((factorMercado - 1) * 100).toFixed(1)}%`,
            },
          },
          {
            descripcion: "Valoración final",
            valores: {
              superficie_m2: superficie,
              precio_m2_final: precioM2Ajustado,
              valoracion_minima: valoracionMinima,
              valoracion_media: valoracionMedia,
              valoracion_maxima: valoracionMaxima,
            },
          },
        ],
        resultado: {
          valoracion_minima: valoracionMinima,
          valoracion_media: valoracionMedia,
          valoracion_maxima: valoracionMaxima,
          precio_m2: precioM2Ajustado,
          confianza: valoracion.confianza,
          explicacion: valoracion.explicacion_breve,
        },
        modelo: "gpt-4o-mini",
      }).catch((error) => {
        console.error("❌ Error enviando logs por email:", error);
        // No bloqueamos la respuesta si falla el email
      });
    }

    // Preparar respuesta (sin logs)
    const { _logs, ...valoracionSinLogs } = valoracion as any;

    // Respuesta final
    return NextResponse.json({
      success: true,
      valoracion: {
        ...valoracionSinLogs,
        valoracion_minima: valoracionMinima,
        valoracion_media: valoracionMedia,
        valoracion_maxima: valoracionMaxima,
        precio_m2_ajustado: precioM2Ajustado,
        superficie_m2: superficie,
      },
      metadata: {
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        modelo_usado: "gpt-4o-mini",
      },
    });
  } catch (error: any) {
    console.error("❌ ERROR EN ENDPOINT:", error);
    return NextResponse.json(
      {
        error: "Error procesando la valoración",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
