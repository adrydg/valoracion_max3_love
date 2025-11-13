#!/usr/bin/env node
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

// Leer la API key del .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  console.error('❌ No se encontró ANTHROPIC_API_KEY en .env.local');
  process.exit(1);
}

console.log('🔑 API Key encontrada:', apiKey.substring(0, 20) + '...');

const client = new Anthropic({ apiKey });

// Lista de modelos a probar
const modelsToTest = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-sonnet-latest',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
];

console.log('\n📋 Probando modelos disponibles...\n');

for (const model of modelsToTest) {
  try {
    console.log(`Probando: ${model}...`);

    const message = await client.messages.create({
      model: model,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Di hola en una palabra',
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log(`  ✅ FUNCIONA - Respuesta: "${response}"`);

  } catch (error) {
    if (error.status === 404) {
      console.log(`  ❌ NO DISPONIBLE (404)`);
    } else if (error.status === 401) {
      console.log(`  ❌ ERROR DE AUTENTICACIÓN (401) - API key inválida`);
    } else {
      console.log(`  ❌ ERROR ${error.status}: ${error.message}`);
    }
  }
}

console.log('\n✅ Prueba completada\n');
