/**
 * API Route: POST /api/valuation-openai/detailed
 * FASE 2 - Valoración Detallada con Visión (fotos)
 */

import { NextRequest, NextResponse } from "next/server";
import { valorarConOpenAIFase2 } from "@/lib/openai-valuation";
import type { Fase2Input } from "@/lib/openai-valuation";
import { enviarLogsValoracion } from "@/lib/email/logsService";

export async function POST(request: NextRequest) {
  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📍 API ENDPOINT: /api/valuation-openai/detailed`);
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

    // Validar estructura
    if (!body.datos_fase_1 || !body.valoracion_fase_1 || !body.fotos) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: datos_fase_1, valoracion_fase_1, fotos" },
        { status: 400 }
      );
    }

    // Validar que hay fotos
    const fotosArray = Object.values(body.fotos);
    if (fotosArray.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos una foto" },
        { status: 400 }
      );
    }

    if (fotosArray.length > 10) {
      return NextResponse.json(
        { error: "Máximo 10 fotos permitidas" },
        { status: 400 }
      );
    }

    console.log(`📝 Input recibido:`);
    console.log(`   ID Inmueble: ${body.id_inmueble}`);
    console.log(`   Fotos: ${fotosArray.length}`);
    console.log(`   Valoración Fase 1: ${body.valoracion_fase_1.valoracion_media?.toLocaleString() || "N/A"}€`);

    // Construir input
    const input: Fase2Input = {
      id_inmueble: body.id_inmueble,
      datos_fase_1: body.datos_fase_1,
      valoracion_fase_1: body.valoracion_fase_1,
      descripcion_libre_usuario: body.descripcion_libre_usuario,
      fotos: body.fotos,
    };

    // Timestamp de inicio
    const startTime = Date.now();

    // Llamar al servicio de OpenAI Fase 2
    const resultado = await valorarConOpenAIFase2(input);

    // Calcular nueva valoración ajustada
    const valoracionBase = body.valoracion_fase_1.valoracion_media || 0;

    const ajustesAdicionales = resultado.valoracion_detallada.ajustes_adicionales_porcentuales;
    const factorAdicional =
      1 +
      (ajustesAdicionales.estado_real_vs_declarado +
        ajustesAdicionales.calidad_acabados +
        ajustesAdicionales.luminosidad +
        ajustesAdicionales.extras) /
        100;

    const nuevaValoracionMedia = Math.round(valoracionBase * factorAdicional);
    const nuevaValoracionMinima = Math.round(nuevaValoracionMedia * 0.98);
    const nuevaValoracionMaxima = Math.round(nuevaValoracionMedia * 1.02);

    const duration = Date.now() - startTime;

    console.log(`\n💎 VALORACIÓN DETALLADA CALCULADA:`);
    console.log(`   Valoración base: ${valoracionBase.toLocaleString()}€`);
    console.log(`   Factor adicional: ${((factorAdicional - 1) * 100).toFixed(1)}%`);
    console.log(`   Nueva valoración: ${nuevaValoracionMinima.toLocaleString()}€ - ${nuevaValoracionMaxima.toLocaleString()}€`);
    console.log(`   Duración: ${(duration / 1000).toFixed(2)}s`);
    console.log(`${"=".repeat(80)}\n`);

    // Enviar logs por email (no bloqueante)
    const logsData = (resultado as any)._logs;
    if (logsData) {
      enviarLogsValoracion({
        tipo: "detallado",
        timestamp: new Date().toLocaleString("es-ES"),
        datosEntrada: input,
        promptEntrada: `${logsData.visionPrompt}\n\n---\n\n${logsData.detailedPrompt}`,
        respuestaModelo: {
          visionResponse: logsData.visionResponse,
          detailedResponse: logsData.detailedResponse,
        },
        calculos: [
          {
            descripcion: "Análisis visual (Paso 2.1)",
            valores: {
              estado_real: logsData.visionResponse.estado_real,
              calidad_acabados: logsData.visionResponse.calidad_acabados,
              luminosidad: logsData.visionResponse.luminosidad,
              cocina_reformada: logsData.visionResponse.cocina_reformada,
              banos_reformados: logsData.visionResponse.banos_reformados,
              tiene_terraza: logsData.visionResponse.tiene_terraza_o_balcon,
              aire_acondicionado: logsData.visionResponse.tiene_aire_acondicionado_visible,
              observaciones: logsData.visionResponse.observaciones_tecnicas,
            },
          },
          {
            descripcion: "Ajustes adicionales (Paso 2.2)",
            valores: {
              estado_vs_declarado: `${ajustesAdicionales.estado_real_vs_declarado}%`,
              calidad_acabados: `${ajustesAdicionales.calidad_acabados}%`,
              luminosidad: `${ajustesAdicionales.luminosidad}%`,
              extras: `${ajustesAdicionales.extras}%`,
              factor_total: `${((factorAdicional - 1) * 100).toFixed(1)}%`,
            },
          },
          {
            descripcion: "Valoración final detallada",
            valores: {
              valoracion_base: valoracionBase,
              nueva_valoracion_minima: nuevaValoracionMinima,
              nueva_valoracion_media: nuevaValoracionMedia,
              nueva_valoracion_maxima: nuevaValoracionMaxima,
              num_fotos_analizadas: fotosArray.length,
            },
          },
        ],
        resultado: {
          valoracion_minima: nuevaValoracionMinima,
          valoracion_media: nuevaValoracionMedia,
          valoracion_maxima: nuevaValoracionMaxima,
          precio_m2: Math.round(nuevaValoracionMedia / (body.datos_fase_1.inmueble.superficie_m2 || 1)),
          confianza: "alta",
          explicacion: resultado.valoracion_detallada.mensaje_para_cliente,
        },
        modelo: "gpt-4o (vision) + gpt-4o-mini (text)",
      }).catch((error) => {
        console.error("❌ Error enviando logs por email:", error);
        // No bloqueamos la respuesta si falla el email
      });
    }

    // Preparar respuesta (sin logs)
    const { _logs, ...resultadoSinLogs } = resultado as any;

    // Respuesta final
    return NextResponse.json({
      success: true,
      caracteristicas_visual: resultadoSinLogs.caracteristicas_visual,
      valoracion_detallada: {
        ...resultadoSinLogs.valoracion_detallada,
        nueva_valoracion_minima: nuevaValoracionMinima,
        nueva_valoracion_media: nuevaValoracionMedia,
        nueva_valoracion_maxima: nuevaValoracionMaxima,
      },
      metadata: {
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        modelos_usados: ["gpt-4o (vision)", "gpt-4o-mini (text)"],
        num_fotos_analizadas: fotosArray.length,
      },
    });
  } catch (error: any) {
    console.error("❌ ERROR EN ENDPOINT:", error);
    return NextResponse.json(
      {
        error: "Error procesando la valoración detallada",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
