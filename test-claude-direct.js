/**
 * Test directo de Claude API para diagnosticar el error
 */

import Anthropic from '@anthropic-ai/sdk';

const testPhoto = {
  data: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
  mediaType: "image/jpeg"
};

async function testClaude() {
  console.log('🧪 TEST DIRECTO DE CLAUDE API');
  console.log('═'.repeat(80));
  console.log('');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY no configurada');
    console.log('');
    console.log('Ejecuta:');
    console.log('  ANTHROPIC_API_KEY="tu-key" node test-claude-direct.js');
    process.exit(1);
  }

  console.log('✅ API Key encontrada:', apiKey.substring(0, 15) + '...');
  console.log('');

  try {
    const anthropic = new Anthropic({ apiKey });

    console.log('📡 Llamando a Claude Vision...');
    console.log('');

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: testPhoto.data,
              },
            },
            {
              type: "text",
              text: "Describe esta imagen brevemente.",
            },
          ],
        },
      ],
    });

    console.log('✅ RESPUESTA DE CLAUDE:');
    console.log('');
    console.log('Model:', response.model);
    console.log('Role:', response.role);
    console.log('Content:', JSON.stringify(response.content, null, 2));
    console.log('');
    console.log('═'.repeat(80));
    console.log('✅ Claude API funciona correctamente');
    console.log('');

  } catch (error) {
    console.error('❌ ERROR AL LLAMAR A CLAUDE:');
    console.log('');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.log('');

    if (error.status) {
      console.error('Status HTTP:', error.status);
    }

    if (error.error) {
      console.error('Error details:', JSON.stringify(error.error, null, 2));
    }

    console.log('');
    console.log('💡 POSIBLES CAUSAS:');
    console.log('  - API key inválida o expirada');
    console.log('  - Rate limit excedido');
    console.log('  - Problema de permisos de la API key');
    console.log('  - Región no soportada');
    console.log('');

    process.exit(1);
  }
}

testClaude();
