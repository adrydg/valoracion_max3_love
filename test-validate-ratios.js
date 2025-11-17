/**
 * Script para validar los ratios de valoración con Claude
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const prompt = `Eres un tasador inmobiliario experimentado en España con 20 años de experiencia. Te voy a explicar nuestro sistema de valoración automática y necesito tu opinión experta.

## CONTEXTO DEL SISTEMA

Tenemos un sistema que valora pisos/casas automáticamente siguiendo estos pasos:

1. **Precio base**: Tomamos el precio oficial del Colegio de Registradores de España (datos de transacciones reales 2024)
2. **Incremento inicial**: Le aplicamos +15% porque los datos de Registradores son históricos (6-12 meses atrás)
3. **Ajustes por características**: Aplicamos factores multiplicativos según:
   - Superficie (pequeña/grande)
   - Planta + Ascensor (combinación crítica)
   - Antigüedad del edificio
   - Número de baños
4. **Optimismo**: Aplicamos +10% final para ser optimistas (captar leads)
5. **Rango de incertidumbre**: ±2% para dar un rango min-max

## PROBLEMA DETECTADO

Hicimos pruebas comparando nuestro sistema con valoraciones de Claude (IA con conocimiento actualizado del mercado) y encontramos que:

❌ **Nuestros ratios penalizan DEMASIADO** las propiedades con defectos:
- Piso 4ª planta SIN ascensor + muy antiguo → Nuestra valoración es 28% MÁS BAJA que Claude
- Planta baja + antiguo → Nuestra valoración es 15% MÁS BAJA que Claude

✅ **Acertamos** en propiedades modernas bien ubicadas (diferencia <1%)

## EJEMPLO REAL (Guadarrama, Madrid - 100m²)

**Precio Registradores**: 2.015 €/m²
**Nuestro precio base**: 2.317 €/m² (+15%)

### Caso: Piso 4ª planta SIN ascensor, >50 años antiguo, 1 baño

**Ajustes actuales (PROBLEMA):**
- Planta 4ª sin ascensor: -25%
- Muy antiguo: -10%
- TOTAL: 0.75 × 0.90 = 0.675 (-32.5%)
- Con optimismo: 0.675 × 1.10 = 0.743 (-25.7% final)
- **Resultado**: 172.000 €

**Claude valora**: 220.000 €
**Diferencia**: -48.000 € (-28%)

## PROPUESTA DE SOLUCIÓN

Implementar **límites a los ajustes acumulados**:

\`\`\`javascript
AJUSTES ACUMULADOS (antes del optimismo):
- Límite inferior: 0.90 (máximo -10% de penalización acumulada)
- Límite superior: 1.25 (máximo +25% de bonificación acumulada)

CON OPTIMISMO (+10%) DESPUÉS:
- Peor caso final: 0.90 × 1.10 = 0.99 (-1%)
- Mejor caso final: 1.25 × 1.10 = 1.375 (+37.5%)
\`\`\`

**Además, suavizar los ratios más agresivos:**

\`\`\`javascript
SIN ASCENSOR (actual → propuesto):
- 3ª-5ª planta: -25% → -12%
- 6ª+ planta: -30% → -15%

PLANTA BAJA:
- Con ascensor: -10% → -5%

ANTIGÜEDAD:
- Muy antiguo: -10% → -5%
- Antiguo: -5% → -3%
\`\`\`

## TU TAREA

Como tasador experimentado, necesito que me digas:

1. **¿Te parecen razonables estos límites (0.90 - 1.25)?**
   - ¿Es lógico que una propiedad NUNCA baje más del 10% del precio base (incluso con todos los defectos)?
   - ¿Es realista que una propiedad premium pueda valer hasta +37.5% más?

2. **¿Los ajustes suavizados son correctos?**
   - ¿-12% para 4ª planta sin ascensor es razonable o sigue siendo mucho?
   - ¿-5% por planta baja es suficiente penalización?
   - ¿-5% por muy antiguo (>50 años) es poco o está bien?

3. **¿Falta algún factor importante?**
   - ¿Deberíamos considerar algo más?
   - ¿Hay algún ajuste que no tenga sentido?

4. **¿El orden de aplicación es correcto?**
   Aplicamos: (Superficie) × (Planta+Ascensor) × (Antigüedad) × (Baños) × (Optimismo)

5. **¿El +15% inicial sobre Registradores es adecuado?**
   - Los datos de Registradores son de transacciones reales pero con 6-12 meses de retraso
   - ¿Debería ser +10%, +15%, +20%?

**IMPORTANTE**: Responde como un tasador práctico que:
- Ha valorado miles de propiedades
- Conoce el mercado español actual (2025)
- Entiende que queremos ser OPTIMISTAS pero CREÍBLES
- Sabe que si valoramos demasiado alto, el cliente se decepciona después
- Sabe que si valoramos demasiado bajo, perdemos el lead

Proporciona tu respuesta en formato JSON:

\`\`\`json
{
  "limites_parecem_razonables": true/false,
  "comentario_limites": "explicación...",
  "ajustes_suavizados_correctos": true/false,
  "comentario_ajustes": "explicación...",
  "incremento_registradores_adecuado": true/false,
  "incremento_sugerido": 15,
  "factores_faltantes": ["factor1", "factor2"],
  "recomendaciones": [
    "recomendación 1",
    "recomendación 2"
  ],
  "valoracion_general": "tu opinión general sobre el sistema"
}
\`\`\``;

async function validateWithClaude() {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🤖 CONSULTANDO A CLAUDE - EXPERTO EN TASACIÓN`);
  console.log(`${'═'.repeat(80)}\n`);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    console.log(`📋 RESPUESTA COMPLETA:\n`);
    console.log(responseText);
    console.log(`\n${'═'.repeat(80)}\n`);

    // Intentar parsear el JSON si está presente
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log(`\n📊 ANÁLISIS ESTRUCTURADO:\n`);
        console.log(JSON.stringify(analysis, null, 2));
      }
    } catch (e) {
      // Si no hay JSON, no pasa nada
    }

    console.log(`\n✅ Consulta completada\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

validateWithClaude();
