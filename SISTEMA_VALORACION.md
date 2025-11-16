# 📘 Sistema Modular de Valoración Inmobiliaria

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Prioridad de Datos: JSON > Claude](#prioridad-de-datos-json--claude)
- [Estructura de Archivos](#estructura-de-archivos)
- [Cómo Modificar Factores](#cómo-modificar-factores)
- [Sistema de Auditoría](#sistema-de-auditoría)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Flujo Completo](#flujo-completo)
- [Testing](#testing)
- [Optimización de Tokens](#optimización-de-tokens)

---

## 🎯 Descripción General

Sistema modular y auditable para valorar propiedades inmobiliarias con **prioridad absoluta** al archivo JSON de códigos postales sobre llamadas a Claude AI.

### Características Principales

✅ **Prioridad JSON**: Siempre usa datos del JSON antes de llamar a Claude
✅ **Ahorro de tokens**: ~500 tokens por valoración cuando hay datos en JSON
✅ **Modular**: Separación clara entre configuración, cálculo y APIs externas
✅ **Auditable**: Informes detallados paso a paso de cada cálculo
✅ **Testeable**: Lógica de cálculo pura sin dependencias externas
✅ **Configurable**: Todos los factores en un solo archivo

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA MODULAR                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   API Route      │  /app/api/valuation/basic/route.ts
│  (Entrada)       │  - Recibe request
└────────┬─────────┘  - Valida datos
         │            - Coordina flujo
         ▼
┌──────────────────────────────────────────────────────────────┐
│                     LIB/VALUATION/                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   types.ts  │  │  config.ts   │  │ calculator.ts│       │
│  │   (Tipos)   │  │ (Factores)   │  │  (Cálculo)   │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │ marketData.ts   │  │claudeIntegration │                  │
│  │ (JSON > Claude) │  │   (Claude API)   │                  │
│  └─────────────────┘  └──────────────────┘                  │
│                                                               │
│  ┌─────────────────┐                                         │
│  │    audit.ts     │                                         │
│  │  (Auditoría)    │                                         │
│  └─────────────────┘                                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│   Resultado      │  ValuationResult
│   (Salida)       │  + AuditReport
└──────────────────┘
```

---

## 🎯 Prioridad de Datos: JSON > Claude

### Flujo de Decisión

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO DE OBTENCIÓN DE DATOS                     │
└─────────────────────────────────────────────────────────────┘

    API recibe valoración
           ↓
    ┌──────────────────────┐
    │ Buscar en JSON       │  preciosPorCP[postalCode]
    │ (Registradores)      │
    └──────────┬───────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ┌───────┐     ┌───────┐
    │ EXISTE│     │NO EXISTE
    └───┬───┘     └───┬────┘
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Usar JSON    │  │ Llamar Claude│
│ SIN Claude   │  │ (fallback)   │
│ 💰 0 tokens  │  │ 💸 ~500 tok  │
└──────────────┘  └──────────────┘
        │             │
        └──────┬──────┘
               ▼
    ┌──────────────────┐
    │ MarketData       │
    │ (Datos de mercado│
    └──────────────────┘
```

### Implementación

**Archivo**: `/lib/valuation/marketData.ts`

```typescript
export async function getMarketDataSmart(
  property: PropertyData,
  precioRegistradores: number | null
): Promise<MarketData> {

  // ✅ CASO 1: HAY PRECIO EN JSON → NO llamar a Claude
  if (precioRegistradores) {
    console.log(`✅ Usando precio de Registradores: ${precioRegistradores}€/m²`);
    console.log(`⏭️  SALTANDO llamada a Claude (ahorro de tokens)`);

    return buildMarketDataFromRegistradores(property, precioRegistradores);
  }

  // ❌ CASO 2: NO HAY PRECIO → SÍ llamar a Claude
  console.log(`⚠️  No hay precio en JSON para CP ${property.postalCode}`);
  console.log(`🤖 Consultando a Claude...`);

  return await getMarketDataFromClaude(property, null);
}
```

### Logs en Consola

**Cuando HAY precio en JSON:**
```
✅ Precio de Registradores encontrado en JSON: 3500€/m² (original: 3.044 €/m²)
⏭️  NO se llamará a Claude (ahorro de tokens)
💰 Usando precio de Registradores: 3500€/m² (SIN llamar a Claude)
```

**Cuando NO HAY precio en JSON:**
```
⚠️  No hay precio de Registradores para CP 28999
🤖 Se consultará a Claude como fallback
📤 ENVIANDO A CLAUDE:
═══════════════════════════════════════
[Prompt completo]
═══════════════════════════════════════
```

---

## 📁 Estructura de Archivos

```
/lib/valuation/
├── types.ts              # Tipos TypeScript compartidos
├── config.ts             # ⚙️  CONFIGURACIÓN (modifica aquí)
├── calculator.ts         # 🧮 Lógica de cálculo pura
├── claudeIntegration.ts  # 🤖 Integración con Claude API
├── marketData.ts         # 💰 Gestión inteligente (JSON > Claude)
├── audit.ts              # 📋 Sistema de auditoría
├── index.ts              # Exportaciones organizadas
└── README.md             # Documentación del módulo

/app/api/valuation/basic/
└── route.ts              # ✅ API actualizada (usa el sistema modular)

/data/
└── precios_por_cp.json   # 📊 JSON de códigos postales (PRIORIDAD)
```

### Descripción de Cada Archivo

#### `types.ts` - Tipos Compartidos
Define todas las interfaces TypeScript:
- `PropertyData`: Datos de la propiedad
- `MarketData`: Datos del mercado
- `ValuationResult`: Resultado de valoración
- `AuditReport`: Informe de auditoría

#### `config.ts` - Configuración Centralizada
**⚙️ ARCHIVO CLAVE PARA MODIFICAR FACTORES**

Contiene:
- `OPTIMISM_FACTOR`: Factor de optimismo (+10% por defecto)
- `UNCERTAINTY`: Rango de incertidumbre (±2% por defecto)
- `REGISTRADORES_INCREMENT`: Incremento sobre precio JSON (+15%)
- `SURFACE_ADJUSTMENTS`: Ajustes por superficie
- `FLOOR_WITH_ELEVATOR`: Ajustes por planta con ascensor
- `FLOOR_WITHOUT_ELEVATOR`: Ajustes por planta sin ascensor
- `BUILDING_AGE_ADJUSTMENTS`: Ajustes por antigüedad
- `MULTIPLE_BATHROOMS`: Ajuste por múltiples baños
- `CLAUDE_CONFIG`: Configuración de Claude (modelo, tokens)

#### `calculator.ts` - Lógica de Cálculo Pura
Funciones de cálculo sin dependencias externas:
- `calculateValuation()`: Función principal de valoración
- `calculateAdjustments()`: Calcula ajustes aplicables
- `applyAdjustmentFactor()`: Aplica un factor de ajuste
- `parsePrecioRegistradores()`: Parsea precio del JSON

#### `claudeIntegration.ts` - Integración con Claude
Todo lo relacionado con Claude AI:
- `buildMarketDataPrompt()`: Construye el prompt
- `getMarketDataFromClaude()`: Llama a Claude API
- `getMarketDataWithFallback()`: Con fallback automático
- `analyzeClaudeResponse()`: Analiza respuesta (debugging)

#### `marketData.ts` - Gestión Inteligente de Datos
**💰 ARCHIVO CLAVE PARA PRIORIDAD JSON > CLAUDE**

Funciones:
- `getMarketDataSmart()`: Decide entre JSON o Claude
- `buildMarketDataFromRegistradores()`: Construye datos solo con JSON
- `shouldCallClaude()`: Verifica si debe llamar a Claude
- `trackClaudeUsage()`: Estadísticas de uso de Claude

#### `audit.ts` - Sistema de Auditoría
Genera informes detallados:
- `generateAuditReport()`: Genera informe completo
- `printAuditReport()`: Imprime en consola
- `exportAuditReportJSON()`: Exporta a JSON
- `exportAuditReportCSV()`: Exporta a CSV
- `validateAuditReport()`: Valida consistencia

---

## ⚙️ Cómo Modificar Factores

### Archivo: `/lib/valuation/config.ts`

#### 1. Cambiar Factor de Optimismo

**De +10% a +15%:**
```typescript
export const VALUATION_CONFIG = {
  OPTIMISM_FACTOR: 1.15,  // Cambiar de 1.10 a 1.15
  // ...
};
```

#### 2. Cambiar Rango de Incertidumbre

**De ±2% a ±3%:**
```typescript
export const VALUATION_CONFIG = {
  UNCERTAINTY: 0.03,  // Cambiar de 0.02 a 0.03
  // ...
};
```

#### 3. Modificar Ajuste por Superficie

**Superficie pequeña (<50m²): de +10% a +12%:**
```typescript
SURFACE_ADJUSTMENTS: {
  SMALL: {
    threshold: 50,
    factor: 1.12,  // Cambiar de 1.10 a 1.12
    label: "Superficie pequeña (<50m²)"
  },
  LARGE: {
    threshold: 150,
    factor: 0.95,  // -5% para >150m²
    label: "Superficie grande (>150m²)"
  }
}
```

#### 4. Ajustar Penalización por Planta Baja

**De -10% a -5%:**
```typescript
FLOOR_WITH_ELEVATOR: {
  'bajo': {
    factor: 0.95,  // Cambiar de 0.90 a 0.95
    label: "Planta baja (con ascensor)"
  },
  // ...
}
```

#### 5. Modificar Ajuste por Ático

**De +8% a +10%:**
```typescript
FLOOR_WITH_ELEVATOR: {
  // ...
  'atico': {
    factor: 1.10,  // Cambiar de 1.08 a 1.10
    label: "Ático (con ascensor)"
  }
}
```

#### 6. Cambiar Modelo de Claude

**De Haiku a Sonnet:**
```typescript
export const CLAUDE_CONFIG = {
  MARKET_DATA: {
    model: "claude-3-5-sonnet-20241022",  // Era "claude-3-haiku-20240307"
    maxTokens: 1000,  // Aumentar tokens
    temperature: 0.5,  // Más preciso
  }
};
```

### Tabla de Todos los Factores Configurables

| Factor | Ubicación | Valor Actual | Descripción |
|--------|-----------|--------------|-------------|
| **Optimismo** | `OPTIMISM_FACTOR` | 1.10 (+10%) | Factor de optimismo final |
| **Incertidumbre** | `UNCERTAINTY` | 0.02 (±2%) | Rango de la valoración |
| **Incremento Registradores** | `REGISTRADORES_INCREMENT` | 1.15 (+15%) | Incremento sobre precio JSON |
| **Superficie pequeña** | `SURFACE_ADJUSTMENTS.SMALL.factor` | 1.10 (+10%) | Pisos <50m² |
| **Superficie grande** | `SURFACE_ADJUSTMENTS.LARGE.factor` | 0.95 (-5%) | Pisos >150m² |
| **Planta baja + ascensor** | `FLOOR_WITH_ELEVATOR.bajo` | 0.90 (-10%) | Planta baja con ascensor |
| **Ático + ascensor** | `FLOOR_WITH_ELEVATOR.atico` | 1.08 (+8%) | Ático con ascensor |
| **Planta 3-5 sin ascensor** | `FLOOR_WITHOUT_ELEVATOR.3-5` | 0.75 (-25%) | Plantas altas sin ascensor |
| **Edificio nuevo** | `BUILDING_AGE_ADJUSTMENTS.nueva` | 1.10 (+10%) | <5 años |
| **Edificio antiguo** | `BUILDING_AGE_ADJUSTMENTS.antigua` | 0.95 (-5%) | 30-50 años |
| **Múltiples baños** | `MULTIPLE_BATHROOMS` | 1.05 (+5%) | ≥2 baños en piso ≥2 hab |

---

## 📊 Sistema de Auditoría

### Generar Informe de Auditoría

```typescript
import { generateAuditReport, printAuditReport } from '@/lib/valuation';

// Después de calcular valoración
const auditReport = generateAuditReport(property, marketData, valuation);

// Imprimir en consola
printAuditReport(auditReport);
```

### Ejemplo de Informe en Consola

```
═══════════════════════════════════════════════════════════════════════════════
📋 INFORME DE AUDITORÍA DE VALORACIÓN
═══════════════════════════════════════════════════════════════════════════════
⏰ Timestamp: 2025-01-16T10:30:00.000Z
📍 Propiedad: Calle Mayor 123, 28001
📏 Superficie: 75 m²
───────────────────────────────────────────────────────────────────────────────

1. Cálculo de precio base
   📐 Fórmula: 3,500 €/m² × 75 m² = 262,500 €
   📥 Input: { precio_m2: 3500, superficie: 75 }
   📤 Output: { precio_base: 262500 }

2. Ajuste: Superficie pequeña (<50m²)
   Aplicar +10%
   📐 Fórmula: 262,500 € × 1.1 = 288,750 €
   📥 Input: { precio_antes: 262500, factor_ajuste: 1.1, porcentaje: 10 }
   📤 Output: { precio_despues: 288750, diferencia: 26250 }

3. Ajuste: Planta 3ª-5ª (con ascensor)
   Aplicar +3%
   📐 Fórmula: 288,750 € × 1.03 = 297,412 €
   📥 Input: { precio_antes: 288750, factor_ajuste: 1.03, porcentaje: 3 }
   📤 Output: { precio_despues: 297412, diferencia: 8662 }

4. Ajuste: Edificio moderno (15-30 años)
   Aplicar 0%
   📐 Fórmula: 297,412 € × 1 = 297,412 €
   📥 Input: { precio_antes: 297412, factor_ajuste: 1, porcentaje: 0 }
   📤 Output: { precio_despues: 297412, diferencia: 0 }

5. Factor de optimismo
   Aplicar 10% de optimismo
   📐 Fórmula: 297,412 € × 1.1 = 327,153 €
   📥 Input: { precio_ajustado: 297412, factor_optimismo: 1.1 }
   📤 Output: { precio_optimista: 327153, aumento: 29741 }

6. Rango de incertidumbre
   Calcular rango ±2%
   📐 Fórmula: 327,153 € ± 2% = [320,610 - 333,696] €
   📥 Input: { precio_medio: 327153, margen_incertidumbre: 0.02 }
   📤 Output: { precio_minimo: 320610, precio_medio: 327153, precio_maximo: 333696 }

───────────────────────────────────────────────────────────────────────────────
📊 RESUMEN FINAL
───────────────────────────────────────────────────────────────────────────────
Total de ajustes aplicados: 3
Factor total aplicado: 1.133 (+13.3%)
Incremento total: 64,653 € (+24.6%)

💰 VALORACIÓN FINAL:
   Mínimo:  320,610 €
   Medio:   327,153 €
   Máximo:  333,696 €
   €/m²:    4,362 €
═══════════════════════════════════════════════════════════════════════════════
```

### Exportar a CSV

```typescript
import { exportAuditReportCSV } from '@/lib/valuation';

const csvContent = exportAuditReportCSV(auditReport);

// Guardar en archivo
fs.writeFileSync('audit-report.csv', csvContent);
```

### Exportar a JSON

```typescript
import { exportAuditReportJSON } from '@/lib/valuation';

const jsonContent = exportAuditReportJSON(auditReport);

// Guardar en archivo
fs.writeFileSync('audit-report.json', jsonContent);
```

### Validar Informe

```typescript
import { validateAuditReport } from '@/lib/valuation';

const validation = validateAuditReport(auditReport);

if (!validation.isValid) {
  console.error('❌ Errores en el informe:', validation.errors);
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Valoración Básica (con precio en JSON)

```typescript
import {
  calculateValuation,
  getMarketDataSmart,
  parsePrecioRegistradores,
  type PropertyData,
} from '@/lib/valuation';
import preciosPorCP from '@/data/precios_por_cp.json';

// 1. Preparar datos de propiedad
const property: PropertyData = {
  postalCode: '28001',
  municipality: 'Madrid',
  street: 'Calle Mayor 123',
  squareMeters: 75,
  bedrooms: 2,
  bathrooms: 1,
  floor: '3-5',
  hasElevator: true,
  buildingAge: 'moderna',
  propertyType: 'piso',
};

// 2. Buscar precio en JSON
const cpData = preciosPorCP['28001'];
const precioRegistradores = cpData?.precio
  ? parsePrecioRegistradores(cpData.precio)
  : null;
// → precioRegistradores = 3500 (de "3.044 €/m²" → 3044 * 1.15 = 3500)

// 3. Obtener datos de mercado (usará JSON, NO llamará a Claude)
const marketData = await getMarketDataSmart(property, precioRegistradores);
// Logs:
// ✅ Precio de Registradores: 3500€/m²
// ⏭️  SALTANDO llamada a Claude (ahorro de tokens)

// 4. Calcular valoración
const valuation = calculateValuation(property, marketData, precioRegistradores);
// → valuation = { avg: 327153, min: 320610, max: 333696, ... }

console.log(`Valoración: ${valuation.avg.toLocaleString()}€`);
// → "Valoración: 327,153€"
```

### Ejemplo 2: Valoración sin precio en JSON (llama a Claude)

```typescript
const property: PropertyData = {
  postalCode: '99999',  // No existe en JSON
  municipality: 'Ciudad Desconocida',
  squareMeters: 80,
  bedrooms: 3,
  // ...
};

// Buscar precio en JSON
const precioRegistradores = null;  // No existe

// Obtener datos de mercado (llamará a Claude)
const marketData = await getMarketDataSmart(property, precioRegistradores);
// Logs:
// ⚠️  No hay precio en JSON para CP 99999
// 🤖 Consultando a Claude...
// 📤 ENVIANDO A CLAUDE: [prompt]
// 📥 RESPUESTA DE CLAUDE: {...}

const valuation = calculateValuation(property, marketData, null);
```

### Ejemplo 3: Testing sin Claude

```typescript
import { calculateValuation } from '@/lib/valuation';

// Crear datos de mercado mock (sin llamar a Claude)
const mockMarketData = {
  postalCode: '28001',
  municipality: 'Madrid',
  neighborhood: 'Sol',
  province: 'Madrid',
  precio_medio_m2: 3500,
  precio_min_m2: 3200,
  precio_max_m2: 3800,
  demanda_zona: 'alta' as const,
  tendencia: 'subiendo' as const,
  descripcion_zona: 'Zona céntrica de Madrid',
  fuente: 'Test',
  fecha_actualizacion: '2025-01-16',
};

const property = {
  postalCode: '28001',
  squareMeters: 75,
  bedrooms: 2,
  // ...
};

// Calcular valoración sin llamar a Claude
const valuation = calculateValuation(property, mockMarketData);

// Verificar resultado
expect(valuation.avg).toBeGreaterThan(0);
expect(valuation.adjustments).toHaveLength(3);
```

### Ejemplo 4: Generar Informe Completo

```typescript
import {
  calculateValuation,
  getMarketDataSmart,
  generateAuditReport,
  printAuditReport,
  exportAuditReportCSV,
} from '@/lib/valuation';

// 1. Obtener datos y calcular
const marketData = await getMarketDataSmart(property, precioRegistradores);
const valuation = calculateValuation(property, marketData, precioRegistradores);

// 2. Generar informe de auditoría
const auditReport = generateAuditReport(property, marketData, valuation);

// 3. Imprimir en consola
printAuditReport(auditReport);

// 4. Exportar a CSV
const csvContent = exportAuditReportCSV(auditReport);
fs.writeFileSync(`audit-${property.postalCode}.csv`, csvContent);

// 5. Validar
const validation = validateAuditReport(auditReport);
console.log('Válido:', validation.isValid);
```

---

## 🔄 Flujo Completo

### Flujo de una Valoración (de inicio a fin)

```
1️⃣  API RECIBE REQUEST
    ↓
    POST /api/valuation/basic
    {
      postalCode: "28001",
      squareMeters: 75,
      bedrooms: 2,
      ...
    }

2️⃣  BUSCAR PRECIO EN JSON
    ↓
    preciosPorCP["28001"]
    → { precio: "3.044 €/m²" }
    → parsePrecioRegistradores("3.044 €/m²")
    → 3044 * 1.15 = 3500€/m²

3️⃣  PREPARAR DATOS DE PROPIEDAD
    ↓
    PropertyData = {
      postalCode: "28001",
      squareMeters: 75,
      bedrooms: 2,
      floor: "3-5",
      hasElevator: true,
      buildingAge: "moderna"
    }

4️⃣  OBTENER DATOS DE MERCADO
    ↓
    getMarketDataSmart(property, 3500)

    ┌─────────────────────┐
    │ ¿Hay precio en JSON?│
    └──────────┬──────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ┌───────┐     ┌──────────┐
    │  SÍ   │     │   NO     │
    │ 3500  │     │  null    │
    └───┬───┘     └────┬─────┘
        │              │
        ▼              ▼
    ┌──────────┐  ┌──────────────┐
    │ Usar JSON│  │Llamar Claude │
    │0 tokens  │  │~500 tokens   │
    └────┬─────┘  └──────┬───────┘
         │               │
         └───────┬───────┘
                 ▼
         ┌─────────────┐
         │ MarketData  │
         └─────────────┘

5️⃣  CALCULAR VALORACIÓN
    ↓
    calculateValuation(property, marketData, 3500)

    5.1 Precio base
        → 3500€/m² × 75m² = 262,500€

    5.2 Ajustes
        → Superficie pequeña: +10% → 288,750€
        → Planta 3-5 + ascensor: +3% → 297,412€
        → Edificio moderno: 0% → 297,412€

    5.3 Factor de optimismo
        → +10% → 327,153€

    5.4 Rango de incertidumbre
        → ±2% → [320,610€ - 333,696€]

6️⃣  GENERAR INFORME DE AUDITORÍA
    ↓
    generateAuditReport(property, marketData, valuation)
    → AuditReport con todos los pasos

7️⃣  IMPRIMIR INFORME
    ↓
    printAuditReport(auditReport)
    → Logs detallados en consola

8️⃣  ENVIAR EMAIL (si aplica)
    ↓
    resend.emails.send({
      to: admin@email.com,
      subject: "Nuevo Lead",
      html: [Email con datos de valoración]
    })

9️⃣  DEVOLVER RESULTADO
    ↓
    return NextResponse.json({
      success: true,
      valuation: {
        avg: 327153,
        min: 320610,
        max: 333696,
        pricePerM2: 4362,
        adjustments: [...],
        marketData: {...}
      }
    })
```

---

## 🧪 Testing

### Test de Cálculo Sin Claude

```typescript
import { calculateValuation } from '@/lib/valuation';

describe('Valoración', () => {
  it('calcula correctamente con datos mock', () => {
    const property = {
      postalCode: '28001',
      squareMeters: 75,
      bedrooms: 2,
      floor: '3-5' as const,
      hasElevator: true,
      buildingAge: 'moderna' as const,
    };

    const marketData = {
      postalCode: '28001',
      municipality: 'Madrid',
      province: 'Madrid',
      precio_medio_m2: 3500,
      precio_min_m2: 3200,
      precio_max_m2: 3800,
      demanda_zona: 'alta' as const,
      tendencia: 'subiendo' as const,
      fuente: 'Test',
      fecha_actualizacion: '2025-01-16',
    };

    const valuation = calculateValuation(property, marketData);

    // Verificaciones
    expect(valuation.avg).toBe(327153);
    expect(valuation.min).toBe(320610);
    expect(valuation.max).toBe(333696);
    expect(valuation.pricePerM2).toBe(4362);
    expect(valuation.adjustments).toHaveLength(2);
  });
});
```

### Test de Prioridad JSON > Claude

```typescript
import { getMarketDataSmart } from '@/lib/valuation';

describe('Prioridad de datos', () => {
  it('usa JSON cuando está disponible', async () => {
    const property = { postalCode: '28001', ... };
    const precioRegistradores = 3500;

    const marketData = await getMarketDataSmart(property, precioRegistradores);

    expect(marketData.precio_medio_m2).toBe(3500);
    expect(marketData.fuente).toBe('Registradores 2024');
    // No debería haber llamado a Claude
  });

  it('llama a Claude cuando no hay JSON', async () => {
    const property = { postalCode: '99999', ... };
    const precioRegistradores = null;

    const marketData = await getMarketDataSmart(property, null);

    expect(marketData.precio_medio_m2).toBeGreaterThan(0);
    expect(marketData.fuente).toContain('Claude');
  });
});
```

---

## 💰 Optimización de Tokens

### Estadísticas de Ahorro

Con el sistema de prioridad JSON > Claude:

| Escenario | Tokens Usados | Ahorro |
|-----------|---------------|--------|
| **Código postal en JSON** | 0 | ✅ ~500 tokens |
| **Código postal NO en JSON** | ~500 | ❌ 0 ahorro |

### Estimación de Ahorro Anual

Si el **95% de códigos postales** están en el JSON:

```
Valoraciones al día: 100
Valoraciones al año: 100 × 365 = 36,500

Con JSON (95%):
- Valoraciones con JSON: 34,675
- Tokens ahorrados: 34,675 × 500 = 17,337,500 tokens
- Coste ahorrado (aprox): 17.3M tokens × $0.025/1M = $433/año

Sin JSON (5%):
- Valoraciones sin JSON: 1,825
- Tokens usados: 1,825 × 500 = 912,500 tokens
- Coste: 912.5K tokens × $0.025/1M = $23/año

AHORRO TOTAL: ~$433/año
```

### Función de Tracking

```typescript
import { trackClaudeUsage, getClaudeUsageStats } from '@/lib/valuation';

// Después de cada valoración
trackClaudeUsage(
  calledClaude,      // true si llamó a Claude
  hadRegistradores   // true si había precio en JSON
);

// Ver estadísticas
const stats = getClaudeUsageStats();
console.log(`
  Total llamadas a Claude: ${stats.totalCalls}
  Con precio en JSON: ${stats.callsWithRegistradores}
  Sin precio en JSON: ${stats.callsWithoutRegistradores}
  Tokens ahorrados: ${stats.tokensSaved}
`);
```

---

## 📖 Resumen

### Ventajas del Sistema Modular

✅ **Prioridad JSON**: Siempre usa datos oficiales primero
✅ **Ahorro**: ~$400-500/año en tokens de Claude
✅ **Modular**: Fácil de mantener y modificar
✅ **Auditable**: Informes detallados de cada cálculo
✅ **Testeable**: Lógica pura sin dependencias
✅ **Configurable**: Un solo archivo para todos los factores
✅ **Documentado**: Código y logs auto-explicativos

### Archivos Clave

| Archivo | Propósito | Cuándo Modificar |
|---------|-----------|------------------|
| `config.ts` | Factores y configuración | Para ajustar porcentajes |
| `marketData.ts` | Prioridad JSON > Claude | Ya está optimizado ✅ |
| `calculator.ts` | Lógica de cálculo | Para cambiar fórmulas |
| `audit.ts` | Informes de auditoría | Para añadir métricas |
| `route.ts` | API endpoint | Para cambiar flujo API |

### Próximos Pasos

1. ✅ **Implementado**: Sistema modular completo
2. ✅ **Implementado**: Prioridad JSON > Claude
3. ✅ **Implementado**: Sistema de auditoría
4. 🔜 **Pendiente**: Testing en local
5. 🔜 **Pendiente**: Deployment a producción

---

## 📞 Soporte

Para modificar factores: Edita `/lib/valuation/config.ts`
Para ver auditorías: Revisa los logs en consola
Para testear: Usa `calculateValuation()` directamente

**Última actualización**: 16 de enero de 2025
