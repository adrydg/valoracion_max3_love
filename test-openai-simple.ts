/**
 * Test simplificado SIN tools - Solo prompt directo
 */

import OpenAI from "openai";
import { getRegistroCP } from "./lib/openai-valuation/registradores";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testSimple() {
  console.log("\n🧪 PRUEBA SIMPLIFICADA - SIN TOOLS\n");

  // 1. Obtener datos de Registradores manualmente
  const cp = "28009";
  const datosRegistro = getRegistroCP(cp);

  // 2. Construir prompt con TODOS los datos
  const prompt = `Eres un tasador inmobiliario experto en Madrid.

INMUEBLE A VALORAR:
- Ubicación: CP ${cp}, Madrid, barrio Goya
- Tipo: Piso
- Superficie: 85 m²
- Habitaciones: 3
- Baños: 2
- Planta: 4 de 7
- Ascensor: Sí
- Antigüedad: Segunda mano
- Estado: Reformado

DATOS DE MERCADO (Registradores 2024):
- Precio medio zona ${cp}: ${datosRegistro?.precio_m2_registro_cp.toLocaleString() || "No disponible"} €/m²
- Año del dato: 2024

TU TAREA:
1. El CP 28009 (Goya) es zona PRIME de Madrid → aplicar factor +28% sobre datos Registradores
2. Calcular precio_m2_base_actualizado para 2025
3. Aplicar ajustes por características del inmueble:
   - Planta 4: +5%
   - Ascensor: 0%
   - Segunda mano: -5%
   - Reformado: +15%
   - 2 baños: +5%
4. Factor mercado local zona prime: 1.15

Devuelve SOLO este JSON (sin texto adicional):
{
  "tipo_zona": "prime",
  "precio_m2_base_actualizado": número (Registradores * 1.28),
  "ajustes_porcentuales": {
    "planta": 5,
    "ascensor": 0,
    "antiguedad": -5,
    "estado": 15,
    "banos": 5
  },
  "factor_mercado_local": 1.15,
  "confianza": "alta",
  "explicacion_breve": "Breve explicación de 1-2 frases"
}`;

  console.log("📤 Enviando a OpenAI (gpt-4o-mini)...\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }, // JSON mode simple (no strict)
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error("No content in response");
  }

  const valoracion = JSON.parse(content);

  console.log("✅ RESULTADO:\n");
  console.log(JSON.stringify(valoracion, null, 2));

  // Calcular valoración total
  const superficie = 85;
  const precioBase = valoracion.precio_m2_base_actualizado;
  const ajustes = valoracion.ajustes_porcentuales;

  const factorAjustes =
    1 + (ajustes.planta + ajustes.ascensor + ajustes.antiguedad + ajustes.estado + ajustes.banos) / 100;

  const factorMercado = valoracion.factor_mercado_local;
  const precioM2Final = Math.round(precioBase * factorAjustes * factorMercado);
  const valoracionMedia = Math.round(superficie * precioM2Final);

  console.log("\n💰 VALORACIÓN CALCULADA:");
  console.log(`   Precio m² base: ${precioBase.toLocaleString()} €/m²`);
  console.log(`   Factor ajustes: ${((factorAjustes - 1) * 100).toFixed(1)}%`);
  console.log(`   Factor mercado: ${((factorMercado - 1) * 100).toFixed(1)}%`);
  console.log(`   Precio m² final: ${precioM2Final.toLocaleString()} €/m²`);
  console.log(`   VALORACIÓN TOTAL: ${valoracionMedia.toLocaleString()} €`);
  console.log(`\n   ${valoracion.explicacion_breve}\n`);

  console.log("✅ Test completado exitosamente!\n");
}

testSimple().catch(console.error);
