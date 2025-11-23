/**
 * Servicio OpenAI para FASE 2 - Análisis de Fotos con Visión
 * Usa gpt-4o (visión) para analizar fotos del inmueble
 */

import OpenAI from "openai";
import { OPENAI_CONFIG } from "./config";
import type {
  CaracteristicasVisual,
  ValoracionDetallada,
  Fase2Input,
  DatosBasicosInput,
} from "./types";

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Schema para análisis visual (Paso 2.1)
 */
const VISION_RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "caracteristicas_visual",
    strict: true,
    schema: {
      type: "object",
      properties: {
        estado_real: {
          type: "string",
          enum: ["a_reformar", "normal", "reformado", "lujo"],
        },
        calidad_acabados: {
          type: "string",
          enum: ["baja", "media", "alta"],
        },
        luminosidad: {
          type: "string",
          enum: ["baja", "media", "alta"],
        },
        cocina_reformada: { type: "boolean" },
        banos_reformados: { type: "boolean" },
        tiene_terraza_o_balcon: { type: "boolean" },
        tiene_aire_acondicionado_visible: { type: "boolean" },
        carpinteria_ventanas: { type: "string" },
        observaciones_tecnicas: { type: "string" },
      },
      required: [
        "estado_real",
        "calidad_acabados",
        "luminosidad",
        "cocina_reformada",
        "banos_reformados",
        "tiene_terraza_o_balcon",
        "tiene_aire_acondicionado_visible",
        "carpinteria_ventanas",
        "observaciones_tecnicas",
      ],
      additionalProperties: false,
    },
  },
} as const;

/**
 * Schema para valoración detallada (Paso 2.2)
 */
const DETAILED_RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "valoracion_detallada_con_fotos",
    strict: true,
    schema: {
      type: "object",
      properties: {
        ajustes_adicionales_porcentuales: {
          type: "object",
          properties: {
            estado_real_vs_declarado: { type: "number" },
            calidad_acabados: { type: "number" },
            luminosidad: { type: "number" },
            extras: { type: "number" },
          },
          required: [
            "estado_real_vs_declarado",
            "calidad_acabados",
            "luminosidad",
            "extras",
          ],
          additionalProperties: false,
        },
        mensaje_para_cliente: { type: "string" },
      },
      required: ["ajustes_adicionales_porcentuales", "mensaje_para_cliente"],
      additionalProperties: false,
    },
  },
} as const;

/**
 * System prompt para análisis visual (Paso 2.1)
 */
const VISION_SYSTEM_PROMPT = `Eres un tasador profesional especializado en analizar fotos de inmuebles en España.

Vas a ver varias fotos de un piso (salón, cocina, baños, dormitorios, etc.) y tu tarea es identificar características objetivas del estado del inmueble:

1. Estado general: a_reformar / normal / reformado / lujo.
2. Calidad de acabados: baja / media / alta.
3. Luminosidad: baja / media / alta.
4. Si la cocina parece reformada (muebles modernos, encimera actual, electrodomésticos integrados…).
5. Si los baños parecen reformados.
6. Tipo de carpintería de ventanas (madera vieja, aluminio simple, climalit moderno, etc.).
7. Si se observa aire acondicionado, radiadores, suelo de tarima, mármol, gres, etc.

Devuelve SIEMPRE SOLO un JSON con el esquema especificado y sin texto adicional.
No hagas valoraciones estéticas (no digas si es bonito o feo), limítate a lo funcional.`;

/**
 * System prompt para ajuste de valoración (Paso 2.2)
 */
const DETAILED_SYSTEM_PROMPT = `Eres un tasador profesional y asesor inmobiliario en España.

Vas a recibir:
1. La valoración básica de un inmueble (valoración de Fase 1).
2. Las características visuales reales extraídas de las fotos.
3. Una descripción libre del cliente (si la hay).

Tu tarea es:
1. Proponer ajustes porcentuales adicionales (positivos o negativos) en función del estado real, calidades, luminosidad y extras (cocina/baños reformados, aire acondicionado, terraza…).

2. Generar un texto explicativo para el cliente:
   - Siempre en tono positivo, profesional y constructivo.
   - Señalando los puntos fuertes del inmueble (luz, reforma, barrio, etc.).
   - Proponiendo oportunidades de mejora de forma cuidadosa y respetuosa, sin criticar ni ofender.
   - Nunca usar términos despectivos (por ejemplo: no decir que algo es "feo" o "cutre") sino frases tipo "una actualización de la cocina podría incrementar aún más el valor de mercado".

AJUSTES SUGERIDOS:
- estado_real_vs_declarado: Si el estado visual coincide con lo declarado = 0%. Si es mejor = +5 a +15%. Si es peor = -5 a -15%.
- calidad_acabados: baja = -10%, media = 0%, alta = +10%
- luminosidad: baja = -5%, media = 0%, alta = +5%
- extras: cocina reformada +5%, baños reformados +5%, A/A +3%, terraza/balcón +5%

El mensaje_para_cliente debe ser de al menos 200 palabras, muy profesional y motivador.`;

/**
 * Paso 2.1 - Analizar fotos con visión
 */
export async function analizarFotosConVision(
  fotos: string[], // URLs o base64
  datosInmueble: DatosBasicosInput
): Promise<CaracteristicasVisual> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🖼️  OPENAI FASE 2.1 - ANÁLISIS VISUAL`);
  console.log(`Modelo: ${OPENAI_CONFIG.MODELS.FASE_2_VISION}`);
  console.log(`Fotos a analizar: ${fotos.length}`);
  console.log(`${"=".repeat(80)}\n`);

  // Construir contexto del inmueble
  const contexto = `Inmueble: ${datosInmueble.inmueble.tipo_inmueble}, ${datosInmueble.inmueble.superficie_m2}m², ${datosInmueble.inmueble.habitaciones} hab, ${datosInmueble.inmueble.banos} baños, planta ${datosInmueble.inmueble.planta}, ${datosInmueble.inmueble.ascensor ? "con" : "sin"} ascensor, ${datosInmueble.inmueble.antiguedad_rango}.

Analiza las siguientes fotos del inmueble y extrae las características técnicas objetivas.`;

  // Preparar mensajes con imágenes
  const content: OpenAI.Chat.ChatCompletionContentPart[] = [
    { type: "text", text: contexto },
  ];

  // Añadir cada foto
  for (const foto of fotos.slice(0, 10)) {
    // Máximo 10 fotos
    if (foto.startsWith("http")) {
      // URL
      content.push({
        type: "image_url",
        image_url: { url: foto },
      });
    } else {
      // Base64
      content.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${foto}` },
      });
    }
  }

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.MODELS.FASE_2_VISION,
    messages: [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      { role: "user", content },
    ],
    temperature: OPENAI_CONFIG.GENERATION.temperature,
    max_tokens: 1500,
    response_format: VISION_RESPONSE_SCHEMA,
  });

  const content_response = response.choices[0]?.message.content;
  if (!content_response) {
    throw new Error("OpenAI no devolvió content");
  }

  const analisis: CaracteristicasVisual = JSON.parse(content_response);

  console.log(`✅ Análisis visual completado:`);
  console.log(`   Estado: ${analisis.estado_real}`);
  console.log(`   Calidad: ${analisis.calidad_acabados}`);
  console.log(`   Luminosidad: ${analisis.luminosidad}`);
  console.log(`   Cocina reformada: ${analisis.cocina_reformada}`);
  console.log(`   Baños reformados: ${analisis.banos_reformados}`);
  console.log(`${"=".repeat(80)}\n`);

  return analisis;
}

/**
 * Paso 2.2 - Ajustar valoración con análisis visual
 */
export async function ajustarValoracionConFotos(
  valoracionFase1: any,
  caracteristicasVisual: CaracteristicasVisual,
  datosInmueble: DatosBasicosInput,
  descripcionUsuario?: string
): Promise<ValoracionDetallada> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`💎 OPENAI FASE 2.2 - AJUSTE DE VALORACIÓN`);
  console.log(`Modelo: ${OPENAI_CONFIG.MODELS.FASE_1_TEXTO}`);
  console.log(`${"=".repeat(80)}\n`);

  const userMessage = `VALORACIÓN FASE 1:
${JSON.stringify(valoracionFase1, null, 2)}

CARACTERÍSTICAS VISUALES DE LAS FOTOS:
${JSON.stringify(caracteristicasVisual, null, 2)}

DATOS DEL INMUEBLE:
${JSON.stringify(datosInmueble, null, 2)}

${descripcionUsuario ? `DESCRIPCIÓN DEL CLIENTE:\n${descripcionUsuario}\n` : ""}

Proporciona los ajustes adicionales y un mensaje profesional y positivo para el cliente explicando la valoración final.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.MODELS.FASE_1_TEXTO,
    messages: [
      { role: "system", content: DETAILED_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: OPENAI_CONFIG.GENERATION.temperature,
    max_tokens: OPENAI_CONFIG.GENERATION.max_tokens,
    response_format: DETAILED_RESPONSE_SCHEMA,
  });

  const content_response = response.choices[0]?.message.content;
  if (!content_response) {
    throw new Error("OpenAI no devolvió content");
  }

  const valoracionDetallada: ValoracionDetallada = JSON.parse(content_response);

  console.log(`✅ Valoración detallada completada`);
  console.log(`   Ajuste estado: ${valoracionDetallada.ajustes_adicionales_porcentuales.estado_real_vs_declarado}%`);
  console.log(`   Ajuste calidad: ${valoracionDetallada.ajustes_adicionales_porcentuales.calidad_acabados}%`);
  console.log(`   Ajuste luminosidad: ${valoracionDetallada.ajustes_adicionales_porcentuales.luminosidad}%`);
  console.log(`   Ajuste extras: ${valoracionDetallada.ajustes_adicionales_porcentuales.extras}%`);
  console.log(`${"=".repeat(80)}\n`);

  return valoracionDetallada;
}

/**
 * FUNCIÓN PRINCIPAL - Fase 2 completa
 */
export async function valorarConOpenAIFase2(
  input: Fase2Input
): Promise<{
  caracteristicas_visual: CaracteristicasVisual;
  valoracion_detallada: ValoracionDetallada;
  _logs?: {
    visionPrompt: string;
    visionResponse: CaracteristicasVisual;
    detailedPrompt: string;
    detailedResponse: ValoracionDetallada;
  };
}> {
  // Convertir objeto de fotos a array
  const fotosArray = Object.values(input.fotos);

  // Paso 2.1: Análisis visual
  const caracteristicas_visual = await analizarFotosConVision(
    fotosArray,
    input.datos_fase_1
  );

  // Paso 2.2: Ajuste de valoración
  const valoracion_detallada = await ajustarValoracionConFotos(
    input.valoracion_fase_1,
    caracteristicas_visual,
    input.datos_fase_1,
    input.descripcion_libre_usuario
  );

  // Construir logs para email
  const contextoVision = `Inmueble: ${input.datos_fase_1.inmueble.tipo_inmueble}, ${input.datos_fase_1.inmueble.superficie_m2}m², ${input.datos_fase_1.inmueble.habitaciones} hab, ${input.datos_fase_1.inmueble.banos} baños, planta ${input.datos_fase_1.inmueble.planta}, ${input.datos_fase_1.inmueble.ascensor ? "con" : "sin"} ascensor, ${input.datos_fase_1.inmueble.antiguedad_rango}.

Analiza las siguientes fotos del inmueble y extrae las características técnicas objetivas.`;

  const userMessageDetailed = `VALORACIÓN FASE 1:
${JSON.stringify(input.valoracion_fase_1, null, 2)}

CARACTERÍSTICAS VISUALES DE LAS FOTOS:
${JSON.stringify(caracteristicas_visual, null, 2)}

DATOS DEL INMUEBLE:
${JSON.stringify(input.datos_fase_1, null, 2)}

${input.descripcion_libre_usuario ? `DESCRIPCIÓN DEL CLIENTE:\n${input.descripcion_libre_usuario}\n` : ""}

Proporciona los ajustes adicionales y un mensaje profesional y positivo para el cliente explicando la valoración final.`;

  return {
    caracteristicas_visual,
    valoracion_detallada,
    _logs: {
      visionPrompt: `SYSTEM:\n${VISION_SYSTEM_PROMPT}\n\nUSER:\n${contextoVision}\n[${fotosArray.length} fotos adjuntas]`,
      visionResponse: caracteristicas_visual,
      detailedPrompt: `SYSTEM:\n${DETAILED_SYSTEM_PROMPT}\n\nUSER:\n${userMessageDetailed}`,
      detailedResponse: valoracion_detallada,
    },
  };
}
