/**
 * Script de prueba para el análisis de fotos con Claude Vision
 *
 * USO EN LOCAL:
 * 1. Asegúrate de tener ANTHROPIC_API_KEY en .env.local
 * 2. Copia 2-5 fotos de una propiedad en la carpeta /public/test-photos/
 * 3. Ejecuta: ANTHROPIC_API_KEY='tu-key' node test-photo-analysis.js
 *
 * El script convertirá las fotos a base64 y las analizará con Claude Vision
 */

const fs = require('fs');
const path = require('path');

// Configuración
const TEST_PHOTOS_DIR = path.join(__dirname, 'public', 'test-photos');
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: ANTHROPIC_API_KEY no está configurada');
  console.log('');
  console.log('Ejecuta:');
  console.log('  ANTHROPIC_API_KEY="tu-api-key" node test-photo-analysis.js');
  process.exit(1);
}

// Importar la función de análisis
async function testPhotoAnalysis() {
  console.log('🧪 TEST: Análisis de Fotos con Claude Vision');
  console.log('═'.repeat(80));
  console.log('');

  // Verificar si existe la carpeta de fotos de prueba
  if (!fs.existsSync(TEST_PHOTOS_DIR)) {
    console.log('📁 Creando carpeta de fotos de prueba...');
    fs.mkdirSync(TEST_PHOTOS_DIR, { recursive: true });
    console.log('');
    console.log('✅ Carpeta creada: public/test-photos/');
    console.log('');
    console.log('⚠️  INSTRUCCIONES:');
    console.log('   1. Copia 2-5 fotos de una propiedad a: public/test-photos/');
    console.log('   2. Formatos aceptados: JPG, PNG, WebP');
    console.log('   3. Vuelve a ejecutar este script');
    console.log('');
    process.exit(0);
  }

  // Leer fotos de la carpeta
  const photoFiles = fs.readdirSync(TEST_PHOTOS_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  if (photoFiles.length === 0) {
    console.error('❌ No se encontraron fotos en public/test-photos/');
    console.log('');
    console.log('Por favor, copia algunas fotos (JPG, PNG, WebP) a esa carpeta.');
    process.exit(1);
  }

  console.log(`📸 Fotos encontradas: ${photoFiles.length}`);
  photoFiles.forEach((file, i) => {
    const stats = fs.statSync(path.join(TEST_PHOTOS_DIR, file));
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ${i + 1}. ${file} (${sizeMB} MB)`);
  });
  console.log('');

  // Convertir fotos a base64
  console.log('🔄 Convirtiendo fotos a base64...');
  const photosBase64 = photoFiles.slice(0, 5).map(file => {
    const filePath = path.join(TEST_PHOTOS_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');

    const ext = path.extname(file).toLowerCase();
    let mediaType = 'image/jpeg';
    if (ext === '.png') mediaType = 'image/png';
    if (ext === '.webp') mediaType = 'image/webp';

    return { data: base64, mediaType };
  });

  console.log(`✅ ${photosBase64.length} fotos convertidas (máx 5 para análisis)`);
  console.log('');

  // Importar y ejecutar análisis
  console.log('🤖 Analizando con Claude Vision...');
  console.log('⏳ Esto puede tardar 5-10 segundos...');
  console.log('');

  try {
    // Importar dinámicamente (ES modules en CommonJS)
    const { analyzePhotosWithClaude } = await import('./lib/valuation/photoAnalysis.ts');

    const propertyContext = {
      propertyType: 'piso',
      squareMeters: 90,
      bedrooms: 3,
      bathrooms: 2,
    };

    const result = await analyzePhotosWithClaude(photosBase64, propertyContext);

    console.log('═'.repeat(80));
    console.log('✅ ANÁLISIS COMPLETADO');
    console.log('═'.repeat(80));
    console.log('');

    console.log('📊 RESULTADOS:');
    console.log('');
    console.log(`  🎨 Calidad de fotos: ${result.photoQuality}`);
    console.log(`  💡 Luminosidad: ${result.luminosityLevel}`);
    console.log(`  🏠 Estado de conservación: ${result.conservationState}`);
    console.log(`  ⭐ Puntuación general: ${result.overallScore}/100`);
    console.log('');

    console.log('✨ CARACTERÍSTICAS DETECTADAS:');
    result.detectedFeatures.forEach((feature, i) => {
      console.log(`  ${i + 1}. ${feature}`);
    });
    console.log('');

    console.log('💬 DESCRIPCIÓN GENERAL:');
    console.log(`  ${result.propertyConditionEstimate}`);
    console.log('');

    if (result.suggestedImprovements.length > 0) {
      console.log('🔧 MEJORAS SUGERIDAS:');
      result.suggestedImprovements.forEach((improvement, i) => {
        console.log(`  ${i + 1}. ${improvement}`);
      });
      console.log('');
    }

    console.log('═'.repeat(80));
    console.log('');
    console.log('✅ Test completado exitosamente');
    console.log('');
    console.log('💡 TIP: Puedes modificar las fotos en public/test-photos/ y volver a probar');
    console.log('');

  } catch (error) {
    console.error('❌ Error en el análisis:', error);
    console.log('');

    if (error.message?.includes('API key')) {
      console.log('⚠️  Verifica que ANTHROPIC_API_KEY sea correcta');
    }

    process.exit(1);
  }
}

// Ejecutar test
testPhotoAnalysis().catch(console.error);
