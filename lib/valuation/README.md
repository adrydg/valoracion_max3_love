# Sistema de Valoración Modular

Sistema completo y modular para valorar propiedades inmobiliarias con **prioridad absoluta al JSON de códigos postales** sobre Claude AI.

> 📖 **Documentación completa**: Ver `/SISTEMA_VALORACION.md` en la raíz del proyecto

## 🚀 Quick Start

```typescript
import {
  getMarketDataSmart,
  calculateValuation,
  parsePrecioRegistradores,
  generateAuditReport,
  printAuditReport,
} from '@/lib/valuation';
import preciosPorCP from '@/data/precios_por_cp.json';

// 1. Buscar precio en JSON
const precioRegistradores = preciosPorCP[postalCode]?.precio
  ? parsePrecioRegistradores(preciosPorCP[postalCode].precio)
  : null;

// 2. Obtener datos de mercado (JSON > Claude automáticamente)
const marketData = await getMarketDataSmart(property, precioRegistradores);

// 3. Calcular valoración
const valuation = calculateValuation(property, marketData, precioRegistradores);

// 4. Ver informe de auditoría
const auditReport = generateAuditReport(property, marketData, valuation);
printAuditReport(auditReport);
```

### ⚙️ Modificar Factores

**Archivo**: `config.ts`

```typescript
export const VALUATION_CONFIG = {
  OPTIMISM_FACTOR: 1.15,  // De +10% a +15%
  UNCERTAINTY: 0.03,      // De ±2% a ±3%
  // ...
};
```

## 📁 Estructura

```
lib/valuation/
├── types.ts              # Tipos TypeScript compartidos
├── config.ts             # Configuración centralizada (¡modifica aquí!)
├── calculator.ts         # Lógica pura de cálculo (sin Claude)
├── claudeIntegration.ts  # Todo lo relacionado con Claude API
├── index.ts              # Exporta todo de forma organizada
└── README.md             # Esta documentación
```

## 🎯 Propósito

Separar responsabilidades para facilitar:
- ✅ **Testing**: Probar cálculos sin llamar a Claude
- ✅ **Modificación**: Cambiar prompts sin tocar cálculos
- ✅ **Auditoría**: Ver qué factores afectan las valoraciones
- ✅ **Control**: Ajustar comportamiento desde un solo lugar

---

## 🔧 Cómo Modificar Cada Parte

### 1. Cambiar Factores de Ajuste

**Archivo**: `config.ts`

**Ejemplo**: Cambiar el factor de optimismo de +10% a +15%

```typescript
export const VALUATION_CONFIG = {
  OPTIMISM_FACTOR: 1.15,  // Cambiar de 1.10 a 1.15
  // ... resto igual
};
```

**Ejemplo**: Ajustar penalización por planta baja

```typescript
FLOOR_WITH_ELEVATOR: {
  'bajo': { factor: 0.95, label: "..." },  // Cambiar de 0.90 a 0.95 (-5% en vez de -10%)
  // ... resto
}
```

### 2. Modificar Prompts de Claude

**Archivo**: `claudeIntegration.ts`

**Función**: `buildMarketDataPrompt()`

**Ejemplo**: Cambiar el tono del prompt

```typescript
return `Eres un tasador inmobiliario [MUY conservador/neutral/optimista].
...
`;
```

**Ejemplo**: Añadir instrucción específica

```typescript
5. Ser optimista en la valoración...
6. NUEVA INSTRUCCIÓN: Considerar el transporte público cercano...
```

### 3. Cambiar Modelo o Tokens de Claude

**Archivo**: `config.ts`

**Ejemplo**: Usar modelo más potente

```typescript
export const CLAUDE_CONFIG = {
  MARKET_DATA: {
    model: "claude-3-5-sonnet-20241022",  // Cambiar de haiku a sonnet
    maxTokens: 1000,  // Aumentar tokens
    temperature: 0.5,  // Menos creativo, más preciso
  },
};
```

### 4. Modificar la Lógica de Cálculo

**Archivo**: `calculator.ts`

**Función**: `calculateAdjustments()`

**Ejemplo**: Añadir nuevo ajuste por orientación

```typescript
// En calculateAdjustments(), añadir:

// 5. AJUSTE POR ORIENTACIÓN
if (property.orientation) {
  const orientationConfig = VALUATION_CONFIG.ORIENTATION_ADJUSTMENTS[property.orientation];
  if (orientationConfig) {
    const factor = orientationConfig.factor;
    const percentage = (factor - 1) * 100;
    adjustments.push({
      factor: orientationConfig.label,
      value: `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`,
      percentage: percentage,
    });
    totalFactor *= factor;
  }
}
```

Y añadir en `config.ts`:

```typescript
ORIENTATION_ADJUSTMENTS: {
  'sur': { factor: 1.05, label: "Orientación sur" },
  'norte': { factor: 0.98, label: "Orientación norte" },
  // ...
}
```

---

## 📊 Uso en tu API

**Archivo actual**: `/app/api/valuation/basic/route.ts`

**Ejemplo de uso simplificado**:

```typescript
import {
  getMarketDataWithFallback,
  calculateValuation,
  parsePrecioRegistradores,
  type PropertyData,
} from '@/lib/valuation';
import preciosPorCP from "@/data/precios_por_cp.json";

export async function POST(request: Request) {
  const body = await request.json();

  // 1. Preparar datos de propiedad
  const property: PropertyData = {
    postalCode: body.postalCode,
    municipality: body.municipality,
    street: body.street,
    squareMeters: body.squareMeters,
    landSize: body.landSize,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    floor: body.floor,
    hasElevator: body.hasElevator,
    buildingAge: body.buildingAge,
    propertyType: body.propertyType,
  };

  // 2. Obtener precio de Registradores (si existe)
  const cpData = preciosPorCP[body.postalCode];
  const precioRegistradores = cpData?.precio
    ? parsePrecioRegistradores(cpData.precio)
    : null;

  // 3. Obtener datos de mercado con Claude (con fallback automático)
  const marketData = await getMarketDataWithFallback(property, precioRegistradores);

  // 4. Calcular valoración
  const valuation = calculateValuation(property, marketData, precioRegistradores);

  // 5. Devolver resultado
  return NextResponse.json({ success: true, valuation });
}
```

---

## 🧪 Testing Sin Claude

Puedes testear los cálculos sin hacer llamadas a Claude:

```typescript
import { calculateValuation } from '@/lib/valuation';

// Datos de prueba
const property = {
  postalCode: "28001",
  squareMeters: 75,
  bedrooms: 2,
  // ...
};

const marketData = {
  precio_medio_m2: 3500,
  precio_min_m2: 3200,
  precio_max_m2: 3800,
  municipality: "Madrid",
  // ...
};

// Calcular sin llamar a Claude
const result = calculateValuation(property, marketData);
console.log(result);
```

---

## 📝 Flujo Completo

```
1. Usuario envía datos → API recibe request
                           ↓
2. Buscar precio Registradores en Excel (parsePrecioRegistradores)
                           ↓
3. Llamar a Claude para datos de mercado (getMarketDataWithFallback)
                           ↓
4. Calcular valoración con factores (calculateValuation)
                           ↓
5. Devolver resultado → Cliente recibe valoración
```

---

## 🎛️ Orden de Control

**Quieres cambiar...**

| Qué | Dónde | Función/Sección |
|-----|-------|----------------|
| Factores de ajuste (%, valores) | `config.ts` | `VALUATION_CONFIG` |
| Optimismo o incertidumbre | `config.ts` | `OPTIMISM_FACTOR`, `UNCERTAINTY` |
| Modelo de Claude | `config.ts` | `CLAUDE_CONFIG` |
| Prompt enviado a Claude | `claudeIntegration.ts` | `buildMarketDataPrompt()` |
| Lógica de cálculo | `calculator.ts` | `calculateValuation()` |
| Parseo de respuestas | `claudeIntegration.ts` | `getMarketDataFromClaude()` |
| Fallback si falla Claude | `claudeIntegration.ts` | `getMarketDataWithFallback()` |

---

## ⚠️ Importante

- **NO modifiques `types.ts`** a menos que añadas nuevos campos
- **Testea cambios en local** antes de desplegar
- **Revisa logs** para ver el flujo de cálculo completo
- **Documenta cambios** si modificas factores importantes

---

## 📚 Recursos

- Documentación de Claude: https://docs.anthropic.com/
- Datos de Registradores: `/data/precios_por_cp.json`
- API Route actual: `/app/api/valuation/basic/route.ts`
