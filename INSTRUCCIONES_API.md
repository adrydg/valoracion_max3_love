# 🤖 Configuración de la API de Anthropic para Tasación IA

## ✅ Lo que se ha implementado

Se ha integrado la API de Claude (Anthropic) para realizar tasaciones automáticas de inmuebles basadas en:
- Análisis visual de fotos del inmueble (Computer Vision)
- Datos proporcionados: dirección, tamaño
- Generación de informe completo con valoración económica

## 📋 Paso a paso para activar la funcionalidad

### 1. Obtener API Key de Anthropic

1. Ve a https://console.anthropic.com/
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú
4. Crea una nueva API key
5. Copia la key (empieza con `sk-ant-...`)

### 2. Configurar la API Key

Abre el archivo `.env.local` en la raíz del proyecto y reemplaza:

```bash
ANTHROPIC_API_KEY=tu_api_key_aqui
```

Por tu API key real:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

### 3. Reiniciar el servidor de desarrollo

Después de configurar la API key, reinicia el servidor:

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
PORT=3001 npm run dev
```

## 🎯 Cómo funciona

1. **Paso 1-3**: El usuario completa el formulario (dirección, tamaño, fotos)
2. **Paso 4**: Ingresa sus datos de contacto
3. **Al hacer clic en "Siguiente"**:
   - Las fotos y datos se envían a `/api/valuation`
   - La API llama a Claude con visión (modelo `claude-3-5-sonnet-20241022`)
   - Claude analiza las fotos y genera una tasación detallada
   - Se muestra un loader: "Analizando tu propiedad con inteligencia artificial..."
4. **Paso 5**: Se muestra el informe completo con:
   - Valoración económica (min, max, media)
   - Nivel de confianza
   - Estado general del inmueble
   - Puntos fuertes y débiles
   - Recomendaciones
   - Tiempo estimado de venta
   - Mejoras sugeridas

## 📁 Archivos modificados/creados

- ✅ `app/api/valuation/route.ts` - API route para procesar tasaciones
- ✅ `components/ValuationModal.tsx` - Modal con integración IA
- ✅ `.env.local` - Archivo de configuración (placeholder)
- ✅ `package.json` - Añadido `@anthropic-ai/sdk`

## 💰 Costos

**Modelo**: `claude-3-5-sonnet-20241022`

**Precios aproximados** (a Nov 2024):
- Input: ~$3 por millón de tokens
- Output: ~$15 por millón de tokens

**Estimación por tasación**:
- ~2000 tokens de entrada (prompt + imágenes)
- ~500 tokens de salida (JSON de respuesta)
- **Costo aproximado**: $0.01 - $0.03 por tasación

Para una landing page con 100 tasaciones/día:
- **Costo mensual**: ~$30-90

## 🧪 Probar la funcionalidad

1. Ve a http://localhost:3001
2. Haz clic en "Obtener valoración" o similar
3. Completa el wizard:
   - Paso 1: Ingresa una dirección
   - Paso 2: Selecciona el tamaño
   - Paso 3: Sube al menos 1 foto del inmueble
   - Paso 4: Ingresa tus datos de contacto
4. Haz clic en "Siguiente" en el paso 4
5. Observa el loader mientras Claude analiza
6. ¡Verás la tasación real generada por IA!

## ⚠️ Importante

- El archivo `.env.local` **NO se sube a GitHub** (está en `.gitignore`)
- La API key es **secreta**, no la compartas públicamente
- Si subes el proyecto a producción (Vercel, etc), configura la variable de entorno en el dashboard

## 🔐 Seguridad

- La API key solo se usa en el servidor (API Route)
- El cliente nunca ve la API key
- Las fotos se procesan en base64 y se envían directamente a Anthropic
- Los datos del lead se registran en console.log (puedes conectarlo a Supabase después)

## 🚀 Siguiente paso: Guardar leads en Supabase

Actualmente los leads se loggean en consola. Para guardarlos en Supabase:

1. Crea una tabla `leads` con campos:
   - id, name, email, phone, address, size
   - valuation_data (JSONB)
   - created_at

2. En `app/api/valuation/route.ts`, reemplaza el `console.log` con:
   ```typescript
   await supabase.from('leads').insert({
     name,
     email,
     phone,
     address,
     size,
     valuation_data: valuation,
   });
   ```

---

**Creado**: 13 Nov 2024
**Modelo IA**: Claude 3.5 Sonnet (20241022)
