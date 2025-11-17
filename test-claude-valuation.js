/**
 * Script para probar valoraciones de Claude sin nuestros ratios
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const casos = [
  {
    nombre: "CASO 1: Piso Básico Malo",
    propertyType: "piso",
    squareMeters: 100,
    bedrooms: 3,
    bathrooms: 1,
    floor: "3-5",
    hasElevator: false,
    buildingAge: "muy-antigua", // >50 años
  },
  {
    nombre: "CASO 2: Piso Básico Bueno",
    propertyType: "piso",
    squareMeters: 100,
    bedrooms: 3,
    bathrooms: 2,
    floor: "1-2",
    hasElevator: true,
    buildingAge: "moderna", // 15-30 años
  },
  {
    nombre: "CASO 3: Piso Premium",
    propertyType: "piso",
    squareMeters: 100,
    bedrooms: 4,
    bathrooms: 2,
    floor: "3-5",
    hasElevator: true,
    buildingAge: "nueva", // <5 años
  },
  {
    nombre: "CASO 4: Ático Premium",
    propertyType: "piso",
    squareMeters: 100,
    bedrooms: 4,
    bathrooms: 3,
    floor: "atico",
    hasElevator: true,
    buildingAge: "reciente", // 5-15 años
  },
  {
    nombre: "CASO 5: Planta Baja Antiguo",
    propertyType: "piso",
    squareMeters: 100,
    bedrooms: 3,
    bathrooms: 1,
    floor: "bajo",
    hasElevator: true,
    buildingAge: "antigua", // 30-50 años
  },
];

const floorLabels = {
  'bajo': 'Planta baja',
  'entresuelo': 'Entresuelo',
  '1-2': 'Planta 1ª-2ª',
  '3-5': 'Planta 3ª-5ª',
  '6+': 'Planta 6ª o superior',
  'atico': 'Ático'
};

const ageLabels = {
  'nueva': 'Menos de 5 años',
  'reciente': 'Entre 5-15 años',
  'moderna': 'Entre 15-30 años',
  'antigua': 'Entre 30-50 años',
  'muy-antigua': 'Más de 50 años'
};

function buildPrompt(property) {
  const floorLabel = floorLabels[property.floor] || property.floor;
  const ageLabel = ageLabels[property.buildingAge] || property.buildingAge;

  return `Eres un tasador inmobiliario experimentado y realista. Basándote en tu conocimiento actualizado del mercado inmobiliario español, analiza y proporciona datos de precios para esta propiedad:

📍 UBICACIÓN:
- Población/Municipio: Guadarrama
- Código Postal: 28440
- Provincia: Madrid

🏠 CARACTERÍSTICAS DE LA PROPIEDAD:
- Tipo: ${property.propertyType}
- Superficie vivienda: ${property.squareMeters} m²
- Habitaciones: ${property.bedrooms}
- Baños: ${property.bathrooms}
- Planta: ${floorLabel}
- Ascensor: ${property.hasElevator ? 'Sí' : 'No'}
- Antigüedad: ${ageLabel}

IMPORTANTE: Actúa como un tasador inmobiliario experimentado y realista. Usa tu conocimiento actualizado del mercado inmobiliario 2025 para proporcionar una valoración precisa considerando TODAS las características de la propiedad.

Proporciona ÚNICAMENTE un JSON con este formato exacto (sin texto adicional):
{
  "precio_min_m2": número (precio mínimo €/m² para esta propiedad en esta zona),
  "precio_medio_m2": número (precio medio €/m² considerando todas las características),
  "precio_max_m2": número (precio máximo €/m² para esta propiedad en esta zona),
  "municipality": "Guadarrama",
  "neighborhood": "nombre del barrio si se puede identificar",
  "province": "Madrid",
  "demanda_zona": "alta" | "media" | "baja",
  "tendencia": "subiendo" | "estable" | "bajando",
  "descripcion_zona": "breve descripción de 1-2 líneas sobre características de la zona que afectan al precio",
  "valoracion_total_min": número (valoración total mínima en €),
  "valoracion_total_media": número (valoración total media en €),
  "valoracion_total_max": número (valoración total máxima en €),
  "justificacion": "explicación breve de los ajustes aplicados por características"
}`;
}

async function testClaude(property) {
  const prompt = buildPrompt(property);

  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🧪 ${property.nombre}`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`📝 Características:`);
  console.log(`   - ${property.squareMeters}m², ${property.bedrooms} hab, ${property.bathrooms} baños`);
  console.log(`   - ${floorLabels[property.floor]} ${property.hasElevator ? 'CON' : 'SIN'} ascensor`);
  console.log(`   - ${ageLabels[property.buildingAge]}`);
  console.log(`\n🤖 Consultando a Claude...`);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
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

    const claudeData = JSON.parse(responseText);

    console.log(`\n📊 RESULTADO DE CLAUDE:`);
    console.log(`   Precio medio: ${claudeData.precio_medio_m2} €/m²`);
    console.log(`   Rango: ${claudeData.precio_min_m2} - ${claudeData.precio_max_m2} €/m²`);
    console.log(`\n💰 VALORACIÓN TOTAL:`);
    console.log(`   Mínimo:  ${claudeData.valoracion_total_min?.toLocaleString('es-ES') || 'N/A'} €`);
    console.log(`   Medio:   ${claudeData.valoracion_total_media?.toLocaleString('es-ES') || (claudeData.precio_medio_m2 * property.squareMeters).toLocaleString('es-ES')} €`);
    console.log(`   Máximo:  ${claudeData.valoracion_total_max?.toLocaleString('es-ES') || 'N/A'} €`);
    console.log(`\n📝 Justificación:`);
    console.log(`   ${claudeData.justificacion || claudeData.descripcion_zona}`);

    return claudeData;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`🏠 COMPARATIVA: CLAUDE vs NUESTROS RATIOS`);
  console.log(`📍 Ubicación: Guadarrama (CP 28440)`);
  console.log(`📏 Superficie: 100m² en todos los casos`);
  console.log(`${'═'.repeat(80)}\n`);

  console.log(`ℹ️  Precio de Registradores 2024: 2.015 €/m²`);
  console.log(`ℹ️  Nuestro sistema lo incrementa +15%: 2.317 €/m²\n`);

  const resultados = [];

  for (const caso of casos) {
    const resultado = await testClaude(caso);
    if (resultado) {
      resultados.push({
        nombre: caso.nombre,
        claude: resultado,
        nuestroSistema: caso, // para referencia
      });
    }
    // Pequeña pausa entre llamadas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumen comparativo
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📊 RESUMEN COMPARATIVO`);
  console.log(`${'═'.repeat(80)}\n`);

  resultados.forEach((r, i) => {
    const valoracionClaudeMedia = r.claude.valoracion_total_media ||
                                   (r.claude.precio_medio_m2 * 100);

    console.log(`${i + 1}. ${r.nombre}`);
    console.log(`   Claude: ${Math.round(valoracionClaudeMedia).toLocaleString('es-ES')} € (${r.claude.precio_medio_m2} €/m²)`);
    console.log(``);
  });

  console.log(`\n✅ Comparación completada\n`);
}

main();
