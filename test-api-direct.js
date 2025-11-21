/**
 * Test directo del API de análisis de fotos
 */

// Imagen de prueba mínima en base64 (1x1 pixel rojo JPG)
const testPhoto = {
  data: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
  mediaType: "image/jpeg"
};

async function testAPI() {
  console.log('🧪 TEST DIRECTO DEL API');
  console.log('═'.repeat(80));
  console.log('');

  const url = 'https://www.valoracionmax.es/api/valuation/analyze-photos';

  console.log('📡 Endpoint:', url);
  console.log('📸 Enviando 1 foto de prueba...');
  console.log('');

  const payload = {
    photos: [testPhoto],
    propertyContext: {
      propertyType: 'piso',
      squareMeters: 90,
      bedrooms: 3,
      bathrooms: 2
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📊 Status:', response.status, response.statusText);
    console.log('');

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ ERROR RESPONSE:');
      console.error(error);
      console.log('');
      return;
    }

    const result = await response.json();

    console.log('✅ RESPUESTA EXITOSA:');
    console.log('');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('═'.repeat(80));
    console.log('✅ Test completado - El API funciona correctamente');
    console.log('');

  } catch (error) {
    console.error('❌ ERROR EN LA LLAMADA:');
    console.error(error.message);
    console.log('');

    if (error.message.includes('fetch')) {
      console.log('💡 El endpoint puede no estar disponible o hay un problema de red');
    }
  }
}

testAPI();
