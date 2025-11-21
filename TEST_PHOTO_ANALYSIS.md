# 🧪 Instrucciones para Probar el Análisis de Fotos en LOCAL

## 📋 Pre-requisitos

1. **API Key de Anthropic** (Claude)
   - Ve a: https://console.anthropic.com/settings/keys
   - Crea una API key si no tienes una
   - Cópiala (empieza con `sk-ant-...`)

2. **Fotos de prueba**
   - 2-5 fotos de una propiedad
   - Formatos: JPG, PNG o WebP
   - Máximo 10MB por foto

---

## 🚀 Método 1: Script de Node.js (Recomendado)

### Paso 1: Preparar fotos de prueba

```bash
# Crear carpeta para fotos
mkdir -p public/test-photos

# Copiar tus fotos (ejemplo)
cp ~/Downloads/foto-salon.jpg public/test-photos/
cp ~/Downloads/foto-cocina.jpg public/test-photos/
cp ~/Downloads/foto-habitacion.jpg public/test-photos/
```

### Paso 2: Ejecutar el script

```bash
# Con tu API key
ANTHROPIC_API_KEY='sk-ant-api03-tu-key-aqui' node test-photo-analysis.js
```

### Resultado esperado:

```
🧪 TEST: Análisis de Fotos con Claude Vision
════════════════════════════════════════════════════════════════════════════════

📸 Fotos encontradas: 3
   1. foto-salon.jpg (2.34 MB)
   2. foto-cocina.jpg (1.89 MB)
   3. foto-habitacion.jpg (2.12 MB)

🔄 Convirtiendo fotos a base64...
✅ 3 fotos convertidas (máx 5 para análisis)

🤖 Analizando con Claude Vision...
⏳ Esto puede tardar 5-10 segundos...

════════════════════════════════════════════════════════════════════════════════
✅ ANÁLISIS COMPLETADO
════════════════════════════════════════════════════════════════════════════════

📊 RESULTADOS:

  🎨 Calidad de fotos: buena
  💡 Luminosidad: excelente
  🏠 Estado de conservación: bueno
  ⭐ Puntuación general: 82/100

✨ CARACTERÍSTICAS DETECTADAS:
  1. Amplia luminosidad natural por ventanas grandes
  2. Suelos de parquet en buen estado
  3. Cocina moderna con electrodomésticos integrados
  4. Baño reformado recientemente
  5. Espacios bien distribuidos

💬 DESCRIPCIÓN GENERAL:
  Propiedad en buen estado general con acabados modernos. La cocina y baño han sido reformados recientemente. Buena iluminación natural en todas las estancias.

🔧 MEJORAS SUGERIDAS:
  1. Pintura completa de la vivienda (estimado 2.000-3.000€)
  2. Actualizar algunas tomas de corriente antiguas
  3. Mejorar iluminación LED en pasillos
```

---

## 🌐 Método 2: Probar desde la Web (Local)

### Paso 1: Iniciar servidor local

```bash
# Asegúrate de tener las variables de entorno
echo "ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui" >> .env.local

# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar en modo desarrollo
npm run dev
```

### Paso 2: Abrir en el navegador

```
http://localhost:3000
```

### Paso 3: Completar el formulario

1. **Paso 1-7:** Rellena los datos básicos
2. **Paso 8 (Fotos):** Sube 2-5 fotos de una propiedad
3. **Paso 9:** Espera el análisis (verás la animación de "Analizando fotos...")
4. **Paso 10:** Verás el resultado con el análisis REAL de Claude

---

## 🔍 Verificar que funciona

### En la consola del navegador (F12):

Deberías ver logs como:
```
🖼️ Analizando 3 fotos con Claude Vision...
✅ Análisis de fotos completado: {photoQuality: "buena", ...}
💎 Valoración detallada con análisis real: {...}
```

### En la terminal del servidor:

```
════════════════════════════════════════════════════════════════════════════════
🖼️  ANÁLISIS DE FOTOS CON CLAUDE VISION - 21/11/2025 18:30:45
════════════════════════════════════════════════════════════════════════════════
📸 Fotos recibidas: 3
📋 Contexto: {tipo: "piso", m2: 90, habitaciones: 3, baños: 2}

✅ ANÁLISIS COMPLETADO en 6.23s
📊 Resultados:
   - Calidad: buena
   - Luminosidad: excelente
   - Estado: bueno
   - Puntuación: 82/100
   - Características detectadas: 7
════════════════════════════════════════════════════════════════════════════════
```

---

## 📧 Verificar email

Después de completar el formulario, deberías recibir un email a `a.durandez@gmail.com` con:
- ✅ Las fotos adjuntas (todas las que subiste)
- ✅ Datos de la propiedad
- ✅ Valoración calculada

---

## ⚠️ Troubleshooting

### Error: "ANTHROPIC_API_KEY no está configurada"
```bash
# Verifica que esté en .env.local
cat .env.local | grep ANTHROPIC_API_KEY

# Si no está, añádela:
echo "ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui" >> .env.local

# Reinicia el servidor
npm run dev
```

### Error: "No se encontraron fotos"
```bash
# Verifica que las fotos estén en la carpeta correcta
ls -lh public/test-photos/

# Formatos aceptados: .jpg, .jpeg, .png, .webp
```

### Error: "Rate limit exceeded"
- Espera 1-2 minutos entre pruebas
- La API de Anthropic tiene límites por minuto

### Error: "Image too large"
- Las fotos deben ser < 10MB cada una
- Comprime las imágenes si son muy grandes

---

## 💰 Costes de Prueba

| Pruebas | Fotos/prueba | Tokens | Coste |
|---------|-------------|--------|-------|
| 1 prueba | 3 fotos | ~4.500 | $0.014 |
| 5 pruebas | 3 fotos | ~22.500 | $0.070 |
| 10 pruebas | 3 fotos | ~45.000 | $0.140 |

**Modelo:** `claude-3-5-sonnet-20241022`
**Precio:** ~$3 por millón de tokens

---

## ✅ Checklist de Prueba

- [ ] API key configurada en `.env.local`
- [ ] Fotos copiadas a `public/test-photos/`
- [ ] Script ejecutado sin errores
- [ ] Análisis muestra características detectadas
- [ ] Mejoras sugeridas son específicas con costes
- [ ] Puntuación entre 0-100 tiene sentido
- [ ] Email recibido con fotos adjuntas

---

## 🎯 Próximos Pasos

Una vez verificado que funciona en local:

1. ✅ Commit de los cambios
2. ✅ Push a GitHub
3. ✅ Deploy automático en Vercel
4. 🧪 Probar en producción: https://www.valoracionmax.es

---

**Creado:** 21 Nov 2025
**Modelo:** Claude 3.5 Sonnet con Vision
**Límite:** 5 fotos analizadas por valoración
