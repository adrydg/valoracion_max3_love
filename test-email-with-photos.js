const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// API Key real
const RESEND_API_KEY = 're_Ao1SYdd7_GjsziFyE2orqZzHjKAYoKdTh';

// Función para convertir imagen a base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

async function testEmailWithPhotos() {
  try {
    console.log('🧪 Probando envío de email con fotos adjuntas...\n');

    const resend = new Resend(RESEND_API_KEY);

    // Crear una imagen de prueba simple (1x1 pixel rojo en PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    // Simular datos del formulario largo con fotos
    const testData = {
      formType: "long",
      leadId: "test-photos-" + Date.now(),
      // Datos personales
      name: "Juan Pérez Test",
      email: "test@ejemplo.com",
      phone: "612345678",
      consentMarketing: true,
      // Datos básicos
      propertyType: "piso",
      bedrooms: 3,
      postalCode: "28001",
      street: "Calle Gran Vía 28",
      squareMeters: 75,
      bathrooms: 2,
      floor: "3-5",
      hasElevator: true,
      buildingAge: "moderna",
      // Características avanzadas
      orientation: "sur",
      propertyCondition: "buen-estado",
      hasTerrace: true,
      terraceSize: 15,
      hasGarage: true,
      hasStorage: false,
      quality: "alta",
      // Fotos simuladas (3 fotos de prueba)
      photos: [
        {
          filename: 'foto-salon.png',
          content: testImageBase64,
          type: 'image/png'
        },
        {
          filename: 'foto-cocina.png',
          content: testImageBase64,
          type: 'image/png'
        },
        {
          filename: 'foto-habitacion.png',
          content: testImageBase64,
          type: 'image/png'
        }
      ]
    };

    console.log('📋 Datos a enviar:');
    console.log(`- Nombre: ${testData.name}`);
    console.log(`- Email: ${testData.email}`);
    console.log(`- Propiedad: ${testData.propertyType}, ${testData.bedrooms} hab, ${testData.squareMeters}m²`);
    console.log(`- Fotos: ${testData.photos.length} adjuntas\n`);

    console.log('📧 Enviando email de prueba con fotos...\n');

    // Construir HTML (simplificado para el test)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>🧪 TEST - Lead con Fotos</h1>
        <p><strong>Nombre:</strong> ${testData.name}</p>
        <p><strong>Email:</strong> ${testData.email}</p>
        <p><strong>Teléfono:</strong> ${testData.phone}</p>
        <p><strong>Propiedad:</strong> ${testData.propertyType}</p>
        <p><strong>Fotos adjuntas:</strong> ${testData.photos.length}</p>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px;">
          📎 ${testData.photos.length} fotos adjuntas en este email
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['a.durandez@gmail.com'],
      subject: `🧪 TEST - Lead con ${testData.photos.length} fotos - ${testData.name}`,
      html: emailHtml,
      attachments: testData.photos.map(photo => ({
        filename: photo.filename,
        content: photo.content,
      })),
    });

    if (result.error) {
      console.error('\n❌ Error enviando email:', result.error);
      return;
    }

    console.log('\n✅ Email con fotos enviado correctamente!');
    console.log('📬 Email ID:', result.data?.id);
    console.log('\n📨 Revisa tu bandeja de entrada en a.durandez@gmail.com');
    console.log('\nEl email debe incluir:');
    console.log('  - Datos del lead (nombre, email, teléfono, propiedad)');
    console.log(`  - ${testData.photos.length} fotos adjuntas:`);
    testData.photos.forEach((photo, i) => {
      console.log(`    ${i + 1}. ${photo.filename}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testEmailWithPhotos();
