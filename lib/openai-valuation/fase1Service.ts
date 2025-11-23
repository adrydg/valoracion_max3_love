/**
 * Servicio OpenAI para FASE 1 - Valoración Básica
 * Usa gpt-4o-mini con tools (get_registro_cp y buscar_en_web)
 */

import OpenAI from "openai";
import { OPENAI_CONFIG } from "./config";
import { getRegistroCP } from "./registradores";
import { buscarEnWeb } from "./webSearch";
import type { Fase1Input, ValoracionBasica } from "./types";

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Definición de las tools que OpenAI puede usar
 * NOTA: Por ahora SOLO usamos get_registro_cp (web scraping deshabilitado temporalmente)
 */
const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_registro_cp",
      description:
        "Obtiene datos oficiales del Colegio de Registradores de España por código postal. Devuelve precio medio €/m² del Registro (suele estar 10-30% por debajo del valor actual de mercado) y año del dato.",
      parameters: {
        type: "object",
        properties: {
          cp: {
            type: "string",
            description: "Código postal de 5 dígitos, por ejemplo '28010'",
          },
        },
        required: ["cp"],
      },
    },
  },
  // Web scraping temporalmente deshabilitado (OpenAI llama demasiadas veces sin devolver respuesta)
  // {
  //   type: "function",
  //   function: {
  //     name: "buscar_en_web",
  //     description: "...",
  //     parameters: { ... },
  //   },
  // },
];

/**
 * Schema de respuesta JSON esperado de OpenAI (Fase 1)
 */
const RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "valoracion_basica_zona",
    strict: true,
    schema: {
      type: "object",
      properties: {
        tipo_zona: {
          type: "string",
          enum: ["prime", "buena", "media", "periferia"],
        },
        precio_m2_base_actualizado: {
          type: "number",
        },
        ajustes_porcentuales: {
          type: "object",
          properties: {
            planta: { type: "number" },
            ascensor: { type: "number" },
            antiguedad: { type: "number" },
            estado: { type: "number" },
            banos: { type: "number" },
          },
          required: ["planta", "ascensor", "antiguedad", "estado", "banos"],
          additionalProperties: false,
        },
        factor_mercado_local: { type: "number" },
        confianza: {
          type: "string",
          enum: ["alta", "media", "baja"],
        },
        explicacion_breve: { type: "string" },
      },
      required: [
        "tipo_zona",
        "precio_m2_base_actualizado",
        "ajustes_porcentuales",
        "factor_mercado_local",
        "confianza",
        "explicacion_breve",
      ],
      additionalProperties: false,
    },
  },
} as const;

/**
 * Construye el system prompt para Fase 1
 */
function buildSystemPrompt(): string {
  return `Eres un tasador profesional de inmuebles en España, experto en el mercado de Madrid y sus barrios (especialmente zonas prime como Salamanca, Retiro, Chamberí, Justicia, Castellana, Goya) y también en zonas periféricas y metropolitanas.

Vas a recibir:
- Los datos básicos de un piso (ubicación y características).
- Opcionalmente, datos del Registro de la Propiedad por código postal, provenientes de una tool.
- Opcionalmente, información adicional de internet sobre precios por m², también vía tool.

REGLAS DE NEGOCIO:
1. El dato de registradores suele estar entre un 10% y un 30% por debajo del valor real actual.
2. En zonas prime de Madrid (Salamanca, Recoletos, Castellana, Goya, Chamberí, Justicia, Retiro zonas buenas) las subidas recientes suelen estar más cerca del +25–30%.
3. En zonas medias y periferia, las subidas suelen ser más moderadas, en torno al +10–20%.
4. Debes combinar datos de Registro + datos de internet para estimar un precio m² base actualizado en la fecha actual (2025).

CARACTERÍSTICAS DEL INMUEBLE QUE AFECTAN VALOR:
- Planta: plantas intermedias (3–5) suelen valorarse mejor que bajo o ático sin ascensor.
- Ascensor: piso sin ascensor penaliza el valor (especialmente en plantas altas).
- Antigüedad: pisos muy antiguos y sin reforma restan valor.
- Estado (a_reformar / normal / reformado / lujo) ajusta el valor de forma significativa.
- Número de baños, m² y número de habitaciones también influyen (más baños y buena distribución, más valor).

USO DE TOOLS:
- Si recibes un código postal (cp), usa la tool get_registro_cp para obtener datos oficiales.
- Después de llamar a la tool (o si no hay CP), INMEDIATAMENTE debes calcular la valoración y devolver el JSON.

IMPORTANTE - PROCESO:
1. Si hay CP: Llama get_registro_cp → Obtienes precio base de 2024
2. INMEDIATAMENTE después, calcula el precio actualizado aplicando factor de zona
3. Devuelve el JSON final SIN MÁS tool calls

TU OBJETIVO:
1. Clasificar la zona: "prime", "buena", "media", o "periferia" (según barrio/CP)
2. Calcular precio_m2_base_actualizado: Si tienes dato de Registro de 2024, aplica factor de subida según zona (+10% a +30%). Si no tienes datos, usa tu conocimiento del mercado de Madrid.
3. Definir ajustes porcentuales:
   - planta: ej. bajo=-15%, 3-5=+5%, ático sin ascensor=-10%
   - ascensor: con ascensor=0%, sin ascensor en planta alta=-15%
   - antiguedad: nueva/reciente=+5%, muy antigua=-10%
   - estado: a_reformar=-20%, normal=0%, reformado=+15%, lujo=+30%
   - banos: 2+ baños=+5%
4. factor_mercado_local: prime=1.15, buena=1.08, media=1.05, periferia=1.02
5. confianza: alta si tienes datos de Registro, media si solo web, baja si ninguno

CRITICAL: Después de usar máximo 2 tools, DEBES DEVOLVER el JSON final inmediatamente. NO sigas buscando datos indefinidamente.`;
}

/**
 * Ejecuta una tool call (llamada a función)
 */
async function executeToolCall(
  toolName: string,
  args: any
): Promise<{ result: string; success: boolean }> {
  try {
    if (toolName === "get_registro_cp") {
      const datos = getRegistroCP(args.cp);
      if (datos) {
        return {
          result: JSON.stringify(datos, null, 2),
          success: true,
        };
      } else {
        return {
          result: JSON.stringify({
            error: `No hay datos de Registradores para el CP ${args.cp}`,
          }),
          success: false,
        };
      }
    } else if (toolName === "buscar_en_web") {
      const resultado = await buscarEnWeb(args.query);
      return {
        result: JSON.stringify(resultado, null, 2),
        success: true,
      };
    } else {
      return {
        result: JSON.stringify({ error: `Tool desconocida: ${toolName}` }),
        success: false,
      };
    }
  } catch (error: any) {
    console.error(`❌ Error ejecutando tool ${toolName}:`, error);
    return {
      result: JSON.stringify({ error: error.message }),
      success: false,
    };
  }
}

/**
 * FUNCIÓN PRINCIPAL - Fase 1: Valoración Básica con OpenAI
 * Ahora devuelve también logs detallados
 */
export async function valorarConOpenAIFase1(
  input: Fase1Input
): Promise<ValoracionBasica & { _logs?: any }> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🤖 OPENAI FASE 1 - VALORACIÓN BÁSICA`);
  console.log(`Modelo: ${OPENAI_CONFIG.MODELS.FASE_1_TEXTO}`);
  console.log(`${"=".repeat(80)}\n`);

  // Construir el user message con los datos del inmueble
  const userMessage = `Valora este inmueble:

UBICACIÓN:
- Código Postal: ${input.ubicacion.cp || "No proporcionado"}
- Municipio: ${input.ubicacion.municipio}
- Provincia: ${input.ubicacion.provincia}
- Barrio (usuario): ${input.ubicacion.barrio_usuario || "No especificado"}

INMUEBLE:
- Tipo: ${input.inmueble.tipo_inmueble}
- Superficie: ${input.inmueble.superficie_m2} m²
- Habitaciones: ${input.inmueble.habitaciones}
- Baños: ${input.inmueble.banos}
- Planta: ${input.inmueble.planta}${input.inmueble.total_plantas_edificio ? ` de ${input.inmueble.total_plantas_edificio}` : ""}
- Ascensor: ${input.inmueble.ascensor ? "Sí" : "No"}
- Antigüedad: ${input.inmueble.antiguedad_rango}
- Estado declarado: ${input.inmueble.estado_declarado_usuario}

Usa las tools disponibles para obtener datos de mercado y valorar este inmueble.`;

  // Mensajes iniciales
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: userMessage },
  ];

  let iteration = 0;
  const MAX_ITERATIONS = 5; // Máximo de llamadas tool para evitar loops

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    console.log(`\n🔄 Iteración ${iteration}/${MAX_ITERATIONS}`);

    // Llamada a OpenAI
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODELS.FASE_1_TEXTO,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: OPENAI_CONFIG.GENERATION.temperature,
      max_tokens: OPENAI_CONFIG.GENERATION.max_tokens,
      response_format: RESPONSE_SCHEMA,
    });

    const message = response.choices[0]?.message;
    if (!message) {
      throw new Error("OpenAI no devolvió un mensaje válido");
    }

    // Si hay tool calls, ejecutarlas
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log(`📞 OpenAI solicita ${message.tool_calls.length} tool call(s)`);

      // Añadir el mensaje del asistente
      messages.push(message);

      // Ejecutar cada tool call
      for (const toolCall of message.tool_calls) {
        // Solo procesar function tool calls
        if (!('function' in toolCall)) {
          console.warn('Skipping non-function tool call:', toolCall);
          continue;
        }

        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`   → ${functionName}(${JSON.stringify(args)})`);

        const { result } = await executeToolCall(functionName, args);

        // Añadir el resultado de la tool
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Continuar el loop para que OpenAI procese los resultados
      continue;
    }

    // Si no hay más tool calls, tenemos la respuesta final
    if (message.content) {
      console.log(`\n✅ Respuesta final recibida`);
      console.log(`${"=".repeat(80)}\n`);

      const valoracion: ValoracionBasica = JSON.parse(message.content);

      // Agregar logs detallados para enviar por email
      return {
        ...valoracion,
        _logs: {
          systemPrompt: buildSystemPrompt(),
          userMessage: userMessage,
          allMessages: messages,
          finalResponse: message,
          rawContent: message.content,
          parsedResponse: valoracion,
        },
      };
    }

    // Si llegamos aquí sin content ni tool_calls, algo salió mal
    throw new Error("OpenAI no devolvió content ni tool_calls");
  }

  throw new Error(`Máximo de iteraciones alcanzado (${MAX_ITERATIONS})`);
}
