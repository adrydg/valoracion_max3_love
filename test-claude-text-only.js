/**
 * Test simple de Claude API (sin imágenes)
 */

import Anthropic from '@anthropic-ai/sdk';

async function testClaude() {
  console.log('🧪 TEST SIMPLE DE CLAUDE API (SIN IMÁGENES)');
  console.log('═'.repeat(80));
  console.log('');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY no configurada');
    process.exit(1);
  }

  console.log('✅ API Key encontrada:', apiKey.substring(0, 15) + '...');
  console.log('');

  try {
    const anthropic = new Anthropic({ apiKey });

    console.log('📡 Llamando a Claude Haiku 3...');
    console.log('');

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: "Di 'hola' en JSON: {\"saludo\": \"...\"}",
        },
      ],
    });

    console.log('✅ RESPUESTA DE CLAUDE:');
    console.log('');
    console.log('Model:', response.model);
    console.log('Content:', JSON.stringify(response.content, null, 2));
    console.log('');
    console.log('═'.repeat(80));
    console.log('✅ Claude API funciona correctamente');
    console.log('');

  } catch (error) {
    console.error('❌ ERROR AL LLAMAR A CLAUDE:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Status HTTP:', error.status);
    if (error.error) {
      console.error('Error details:', JSON.stringify(error.error, null, 2));
    }
    process.exit(1);
  }
}

testClaude();
