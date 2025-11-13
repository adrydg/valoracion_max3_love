# 📧 Configuración de Resend para Envío de Emails

## ✅ Lo que se ha implementado

El sistema ahora envía automáticamente 2 emails cuando se completa una valoración:

1. **Email al administrador** (a.durandez@gmail.com)
   - Notificación de nuevo lead
   - Todos los datos del cliente
   - Detalles completos de la propiedad
   - Valoración y score
   - Análisis de ROI

2. **Email al cliente**
   - Informe personalizado de valoración
   - Precio estimado
   - Score de la propiedad
   - Puntos fuertes y débiles
   - Potencial de rentabilidad (ROI)
   - Botón CTA para contactar

## 📋 Pasos para activar el envío de emails

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Verificar tu dominio

Para poder enviar emails desde `onboarding@tudominio.com`, necesitas:

1. En el dashboard de Resend, ve a **Domains**
2. Haz clic en **Add Domain**
3. Introduce tu dominio (ej: `tudominio.com`)
4. Resend te dará registros DNS que debes añadir en tu proveedor de dominio:
   - **SPF** (TXT)
   - **DKIM** (TXT)
   - **DMARC** (TXT)

5. Espera la verificación (puede tardar hasta 48h, pero normalmente es rápido)

**ALTERNATIVA (para testing):**
Si no quieres configurar tu dominio aún, puedes usar el dominio de testing de Resend:
- `onboarding@resend.dev`
- Los emails llegarán, pero con limitaciones (solo a emails verificados)

### 3. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre (ej: "Valoraciones Landing")
4. Selecciona permisos: **Send emails**
5. Copia la API key (empieza con `re_...`)

### 4. Configurar variables de entorno

Abre el archivo `.env.local` y configura:

```bash
# Resend API Key
RESEND_API_KEY=re_tu_api_key_aqui

# Email del administrador que recibirá las notificaciones
ADMIN_EMAIL=a.durandez@gmail.com

# Email desde el cual se enviarán los correos
FROM_EMAIL=onboarding@tudominio.com
# O si usas el dominio de testing:
# FROM_EMAIL=onboarding@resend.dev
```

### 5. Reiniciar el servidor

Después de configurar las variables:

```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
PORT=3001 npm run dev
```

## 🧪 Probar el envío de emails

1. Ve a http://localhost:3001
2. Completa el formulario de valoración
3. Usa tu email real en el paso 4
4. Envía el formulario
5. Deberías recibir 2 emails:
   - Uno como administrador (a.durandez@gmail.com)
   - Uno como cliente (tu email de prueba)

## 📊 Plantillas de Email

### Email al Administrador

Incluye:
- ✅ Datos del cliente (nombre, email, teléfono)
- ✅ Datos completos de la propiedad
- ✅ Valoración estimada
- ✅ Score del inmueble (0-100)
- ✅ Análisis de ROI
- ✅ Diseño profesional con gradientes azules

### Email al Cliente

Incluye:
- ✅ Saludo personalizado
- ✅ Valoración en formato destacado
- ✅ Score visual con badge de colores
- ✅ Puntos fuertes y débiles
- ✅ Potencial de rentabilidad
- ✅ Tiempo estimado de venta
- ✅ Botón CTA para contactar
- ✅ Diseño elegante con gradientes azul-morado

## 💰 Costos

**Plan gratuito de Resend:**
- 100 emails/día
- 3,000 emails/mes
- Gratis para siempre

**Para la mayoría de landings, el plan gratuito es más que suficiente.**

Si necesitas más:
- Plan Pro: $20/mes por 50,000 emails

## 🔧 Personalización

Puedes personalizar los emails editando el archivo:
`app/api/valuation/route.ts`

Busca las secciones:
- `// Email al administrador con los datos del lead`
- `// Email al cliente con su informe de valoración`

## ⚠️ Importante

- El archivo `.env.local` **NO se sube a GitHub** (está en `.gitignore`)
- Si despliegas a producción (Vercel, etc), configura las variables de entorno en el dashboard
- Los emails se envían después de generar la valoración
- Si falla el envío de emails, la valoración se devuelve igual (no bloquea el flujo)

## 🚀 Producción (Vercel)

Para configurar en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `FROM_EMAIL`
4. Redespliega tu aplicación

---

**Creado**: 13 Nov 2024
**Servicio**: Resend
**Documentación**: https://resend.com/docs
