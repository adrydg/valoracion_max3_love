# 📊 Guía de Monitorización - Sistema de Valoración

Guía completa para monitorizar:
- Consultas al JSON de códigos postales
- Cálculos y resultados
- Llamadas a Claude AI
- Tokens ahorrados
- Estadísticas en tiempo real

---

## 🎯 Resumen Rápido

```bash
# Ver estadísticas en tiempo real
curl https://valoracionmax.es/api/analytics/valuation

# Local
curl http://localhost:3001/api/analytics/valuation

# Resetear estadísticas
curl -X DELETE https://valoracionmax.es/api/analytics/valuation
```

---

## 📈 1. ENDPOINT DE ANALYTICS (Nuevo)

### **GET /api/analytics/valuation**

Devuelve estadísticas completas del sistema de valoración.

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "stats": {
    "totalCalls": 47,
    "callsWithRegistradores": 45,
    "callsWithoutRegistradores": 2,
    "tokensSaved": 22500,
    "totalValuations": 47,
    "percentageWithJSON": "95.7%",
    "percentageWithoutJSON": "4.3%",
    "estimatedCostSaved": "$0.0225"
  },
  "timestamp": "2025-11-16T22:00:00.000Z"
}
```

**Interpretación:**
- `callsWithRegistradores`: Valoraciones que usaron el JSON (⚡ sin Claude)
- `callsWithoutRegistradores`: Valoraciones que llamaron a Claude
- `tokensSaved`: Tokens ahorrados por NO llamar a Claude
- `estimatedCostSaved`: Dinero ahorrado (aproximado)

**Cómo usar:**

```bash
# En producción
curl https://valoracionmax.es/api/analytics/valuation | jq

# En local
curl http://localhost:3001/api/analytics/valuation | jq

# Solo ver porcentajes
curl http://localhost:3001/api/analytics/valuation | jq '.stats.percentageWithJSON'
```

---

## 🔍 2. LOGS EN PRODUCCIÓN (Vercel)

### **Método 1: Dashboard de Vercel**

1. Ve a https://vercel.com/adurandez-6563s-projects/valoracion-max3-love
2. Haz clic en la pestaña **"Logs"**
3. Filtra por función: `api/valuation/basic`

**Qué verás en los logs:**

```
✅ Precio de Registradores encontrado en JSON: 2875€/m²
⏭️  NO se llamará a Claude (ahorro de tokens)
💰 Precio en JSON encontrado: 2875€/m²
⏭️  SALTANDO llamada a Claude (ahorro de tokens)
```

O si NO hay precio en JSON:

```
⚠️  No hay precio de Registradores para CP 99999
🤖 Se consultará a Claude como fallback
🤖 Consultando a Claude...
```

### **Método 2: CLI de Vercel**

```bash
# Ver logs en tiempo real
vercel logs --follow

# Filtrar solo valoraciones
vercel logs --follow | grep "NUEVA VALORACIÓN"

# Ver logs de las últimas 24h
vercel logs --since 24h

# Ver logs de producción
vercel logs --prod
```

### **Método 3: Inspect Deployment**

```bash
# Ver logs de un deployment específico
vercel inspect valoracion-max3-love-ocdkoe8on-adurandez-6563s-projects.vercel.app --logs
```

---

## 💻 3. LOGS EN LOCAL (Desarrollo)

### **Logs en consola del servidor**

Cuando corres `npm run dev`, verás logs detallados:

```bash
PORT=3001 npm run dev
```

**Ejemplo de output para CP CON precio en JSON (28001):**

```
═══════════════════════════════════════════════════════════
🏠 NUEVA VALORACIÓN - 16/11/2025 22:30:15
═══════════════════════════════════════════════════════════

✅ Precio de Registradores encontrado en JSON: 2875€/m² (original: 2.500 €/m²)
⏭️  NO se llamará a Claude (ahorro de tokens)

📊 OBTENIENDO DATOS DE MERCADO...
💰 Precio en JSON encontrado: 2875€/m²
⏭️  SALTANDO llamada a Claude (ahorro de tokens)
✅ Usando precio de Registradores: 2875€/m² (SIN llamar a Claude)

💰 CALCULANDO VALORACIÓN...
🧮 INICIANDO CÁLCULO DE VALORACIÓN
1️⃣  PRECIO BASE: 2875 €/m² × 75 m² = 215,625 €
2️⃣  AJUSTES:
   • Planta 3ª-5ª (con ascensor): +3%
   • Múltiples baños: +5%
3️⃣  PRECIO AJUSTADO: 215,625 × 1.0815 = 233,193 €
4️⃣  OPTIMISMO (+10%): 233,193 × 1.10 = 256,512 €
5️⃣  RANGO (±2%): 251,382 - 261,642 €

═══════════════════════════════════════════════════════════
📊 INFORME DE AUDITORÍA - VALORACIÓN
═══════════════════════════════════════════════════════════
[... detalles completos del cálculo ...]

✅ Valoración completada para lead ABC123
```

**Ejemplo de output para CP SIN precio en JSON (99999):**

```
═══════════════════════════════════════════════════════════
🏠 NUEVA VALORACIÓN - 16/11/2025 22:30:15
═══════════════════════════════════════════════════════════

⚠️  No hay precio de Registradores para CP 99999
🤖 Se consultará a Claude como fallback

📊 OBTENIENDO DATOS DE MERCADO...
⚠️  No hay precio en JSON para CP 99999
🤖 Consultando a Claude...
📤 Enviando prompt a Claude API...
📥 Respuesta recibida de Claude
✅ Datos de mercado obtenidos de Claude

[... resto del cálculo ...]
```

---

## 📋 4. QUÉ MONITORIZAR (Checklist)

### **Diariamente:**
- [ ] Ver estadísticas en `/api/analytics/valuation`
- [ ] Comprobar porcentaje de uso de JSON (debería ser ~95%)
- [ ] Verificar que no hay errores en logs de Vercel

### **Semanalmente:**
- [ ] Revisar tokens ahorrados acumulados
- [ ] Verificar que las valoraciones se calculan correctamente
- [ ] Comprobar que los emails llegan correctamente

### **Mensualmente:**
- [ ] Resetear estadísticas: `DELETE /api/analytics/valuation`
- [ ] Calcular coste real de Claude (tokens × precio)
- [ ] Comparar con meses anteriores

---

## 📊 5. MÉTRICAS CLAVE

### **🎯 Métricas de Uso**

| Métrica | Qué es | Dónde verlo | Valor ideal |
|---------|--------|-------------|-------------|
| `percentageWithJSON` | % de valoraciones que usan JSON | `/api/analytics/valuation` | ~95% |
| `percentageWithoutJSON` | % de valoraciones que llaman a Claude | `/api/analytics/valuation` | ~5% |
| `tokensSaved` | Tokens ahorrados por NO llamar a Claude | `/api/analytics/valuation` | Alto |
| `estimatedCostSaved` | Dinero ahorrado (aprox) | `/api/analytics/valuation` | Alto |

### **💰 Métricas de Coste**

**Precio de Claude 3 Haiku:**
- ~$0.001 por 1M tokens de entrada
- Estimación: ~500 tokens por valoración con Claude

**Cálculo de ahorro:**
```
Tokens ahorrados × $0.000001 = Dinero ahorrado
Ejemplo: 22,500 tokens × $0.000001 = $0.0225
```

**Si usaras Claude para TODAS las valoraciones:**
```
100 valoraciones × 500 tokens × $0.000001 = $0.05
1,000 valoraciones × 500 tokens × $0.000001 = $0.50
10,000 valoraciones × 500 tokens × $0.000001 = $5.00
```

**Con el sistema actual (95% JSON):**
```
100 valoraciones × 5% × 500 tokens × $0.000001 = $0.0025 (ahorro de $0.0475)
1,000 valoraciones × 5% × 500 tokens × $0.000001 = $0.025 (ahorro de $0.475)
10,000 valoraciones × 5% × 500 tokens × $0.000001 = $0.25 (ahorro de $4.75)
```

---

## 🔔 6. ALERTAS Y AVISOS

### **⚠️ Cuándo preocuparse:**

1. **Porcentaje de JSON < 90%**
   - Significa que muchos CPs no están en el JSON
   - Acción: Revisar si el JSON `precios_por_cp.json` está actualizado

2. **Muchas llamadas a Claude**
   - Puede indicar que los usuarios usan CPs poco comunes
   - Acción: Añadir más CPs al JSON

3. **Errores en logs de Vercel**
   - `Error llamando a Claude`
   - `Error calculando valoración`
   - Acción: Revisar variables de entorno (`ANTHROPIC_API_KEY`)

---

## 🛠️ 7. COMANDOS ÚTILES

### **Ver estadísticas:**
```bash
# Producción
curl https://valoracionmax.es/api/analytics/valuation | jq

# Local
curl http://localhost:3001/api/analytics/valuation | jq
```

### **Resetear estadísticas:**
```bash
# Producción
curl -X DELETE https://valoracionmax.es/api/analytics/valuation

# Local
curl -X DELETE http://localhost:3001/api/analytics/valuation
```

### **Ver logs en Vercel:**
```bash
# Tiempo real
vercel logs --follow

# Últimas 24h
vercel logs --since 24h

# Filtrar por valoraciones
vercel logs | grep "NUEVA VALORACIÓN"

# Filtrar por errores
vercel logs | grep "Error"
```

### **Ver logs de un deployment específico:**
```bash
vercel inspect <deployment-url> --logs
```

---

## 📱 8. MONITORIZACIÓN POR EMAIL

Los emails enviados a `a.durandez@gmail.com` incluyen:

```
📧 Nuevo Lead FASE 1 - [Nombre] - [Municipio]

Datos de la Propiedad:
  • Código Postal: 28001
  • Municipio: Madrid
  • Superficie: 75 m²
  • ...

Valoración Básica (±2%):
  251,382€ - 261,642€
  Valor medio: 256,512€
  Precio/m²: 3,420€

Datos de Mercado:
  • Precio medio zona: 2,875€/m²
  • Fuente: Registradores 2024  ← INDICA QUE USÓ JSON
```

**Si la fuente dice "Claude"** → Se llamó a Claude API

---

## 🎨 9. DASHBOARD SIMPLE (Opcional)

Si quieres crear un dashboard visual simple:

```tsx
// app/admin/analytics/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/analytics/valuation')
      .then(res => res.json())
      .then(data => setStats(data.stats))
  }, [])

  if (!stats) return <div>Cargando...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics de Valoración</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2>Total Valoraciones</h2>
          <p className="text-3xl">{stats.totalValuations}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2>Uso de JSON</h2>
          <p className="text-3xl">{stats.percentageWithJSON}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2>Tokens Ahorrados</h2>
          <p className="text-3xl">{stats.tokensSaved.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2>Dinero Ahorrado</h2>
          <p className="text-3xl">{stats.estimatedCostSaved}</p>
        </div>
      </div>
    </div>
  )
}
```

---

## ✅ Resumen

**Para monitorizar el sistema, tienes:**

1. **Endpoint de analytics**: `/api/analytics/valuation`
2. **Logs de Vercel**: Dashboard web + CLI
3. **Logs locales**: Consola del servidor
4. **Emails**: Info en cada valoración
5. **Tracking automático**: Cada valoración se trackea

**Métricas principales:**
- % de uso de JSON (ideal ~95%)
- Tokens ahorrados
- Dinero ahorrado
- Llamadas a Claude

**Acciones recomendadas:**
- Ver stats diariamente
- Revisar logs semanalmente
- Resetear stats mensualmente
- Añadir CPs al JSON si el % baja de 90%
