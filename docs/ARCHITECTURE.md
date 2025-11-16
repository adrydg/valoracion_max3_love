# Arquitectura Técnica - ValoracionMax

## Índice
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Flujo de Datos](#flujo-de-datos)
5. [Componentes Principales](#componentes-principales)
6. [APIs y Servicios Externos](#apis-y-servicios-externos)
7. [Gestión de Estado](#gestión-de-estado)
8. [Sistema de Emails](#sistema-de-emails)
9. [Seguridad y Validación](#seguridad-y-validación)

---

## Visión General

ValoracionMax es una aplicación web de valoración inmobiliaria que utiliza inteligencia artificial (Claude de Anthropic) para proporcionar estimaciones de precios basadas en características de propiedades y datos de mercado actualizados.

### Objetivo
Capturar leads cualificados ofreciendo valoraciones instantáneas de propiedades inmobiliarias en España.

### Flujo Principal
```
Usuario completa formulario (10 pasos)
    ↓
Paso 3: Envía datos personales → Email "formulario corto" + Valoración básica con Claude
    ↓
Paso 4: Muestra valoración estimada al usuario
    ↓
Usuario continúa con características avanzadas (pasos 5-8)
    ↓
Paso 8: Sube fotos → Email "formulario largo" con datos completos + fotos
    ↓
Usuario ve valoración final mejorada
```

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 16.0.2 (App Router)
- **Lenguaje**: TypeScript 5.7
- **UI Library**: React 19.0.0
- **Componentes UI**: shadcn/ui (basado en Radix UI)
- **Estilos**: Tailwind CSS 3.4.1
- **Validación de formularios**: Validación custom con React hooks
- **Gestión de estado**: Zustand 5.0.2 con persistencia localStorage
- **Generación de IDs**: nanoid 5.0.9

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **API Routes**: Next.js App Router API handlers
- **Base de datos**: Ninguna (los leads se envían por email)

### Servicios Externos
- **IA**: Anthropic Claude API (claude-3-haiku-20240307)
- **Email**: Resend API
- **Hosting**: Vercel
- **Dominio**: valoracionmax.es

### Herramientas de Desarrollo
- **Bundler**: Turbopack (experimental)
- **Linting**: ESLint 9
- **Package Manager**: npm

---

## Arquitectura del Sistema

### Estructura de Directorios

```
voloracion_max3/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── lead/
│   │   │   └── send-progress-email/
│   │   │       └── route.ts      # Envío de emails con Resend
│   │   └── valuation/
│   │       └── basic/
│   │           └── route.ts      # Llamada a Claude para valoración
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Estilos globales
├── components/                   # Componentes React
│   ├── ui/                       # shadcn/ui components
│   ├── wizard/                   # Componentes del wizard (10 pasos)
│   │   ├── Step1Ubicacion.tsx
│   │   ├── Step2Caracteristicas.tsx
│   │   ├── Step3DatosPersonales.tsx
│   │   ├── Step4Loading.tsx
│   │   ├── Step5ResultadoValoracion.tsx
│   │   ├── Step6DirectOffer.tsx
│   │   ├── Step7CaracteristicasAvanzadas.tsx
│   │   ├── Step8PhotoUpload.tsx
│   │   ├── Step9Loading.tsx
│   │   └── Step10ResultadoFinal.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PropertyValuationWizard.tsx
│   └── ScrollToFormButton.tsx
├── store/                        # Zustand stores
│   └── useWizardStore.ts         # Estado global del wizard
├── lib/                          # Utilidades
│   └── utils.ts                  # Helpers (cn, etc.)
├── hooks/                        # Custom React hooks
├── public/                       # Assets estáticos
│   ├── logo.svg
│   └── ...
├── docs/                         # Documentación
│   ├── ARCHITECTURE.md
│   └── TECHNICAL_DECISIONS.md
├── .env.local                    # Variables de entorno (no en git)
├── package.json
└── README.md
```

---

## Flujo de Datos

### 1. Captura de Datos del Usuario

```typescript
// Zustand Store (store/useWizardStore.ts)
interface WizardState {
  // Paso 1: Ubicación y tamaño
  postalCode: string;
  street: string;
  squareMeters: number | null;

  // Paso 2: Características básicas
  propertyType: "piso" | "chalet" | "casa";
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  hasElevator: boolean | null;
  buildingAge: string | null;
  landSize: number | null;

  // Paso 3: Datos personales
  name: string;
  email: string;
  phone: string;
  additionalComments: string;
  consentMarketing: boolean;
  consentDataProcessing: boolean;

  // Paso 6: Oferta directa
  directOfferInterest: string | null;
  agencyStatus: string | null;

  // Paso 7: Características avanzadas
  orientation: string | null;
  propertyCondition: string | null;
  hasTerrace: boolean | null;
  terraceSize: number | null;
  hasGarage: boolean | null;
  hasStorage: boolean | null;
  quality: string | null;

  // Paso 8: Fotos
  photos: File[];
  photoUrls: string[];

  // Sistema
  currentStep: number;
  leadId: string;
}
```

### 2. Persistencia de Estado

- **Tecnología**: Zustand con middleware `persist`
- **Storage**: localStorage del navegador
- **Key**: `"wizard-storage"`
- **Beneficios**:
  - Los usuarios pueden cerrar el navegador y retomar el formulario
  - No se pierden datos entre pasos
  - Mejor UX en formularios largos

```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: "wizard-storage",
    partialize: (state) => ({
      // Solo persiste datos del usuario, no estado temporal
      postalCode: state.postalCode,
      street: state.street,
      // ... etc
    }),
  }
)
```

### 3. Llamadas a APIs

#### API 1: Valoración Básica con Claude

**Endpoint**: `POST /api/valuation/basic`

**Request**:
```json
{
  "propertyType": "piso",
  "bedrooms": 3,
  "postalCode": "28010",
  "street": "Calle Serrano 45",
  "squareMeters": 80,
  "bathrooms": 2,
  "floor": "3-5",
  "hasElevator": true,
  "buildingAge": "moderna"
}
```

**Proceso**:
1. Construye prompt estructurado con todas las características
2. Traduce valores técnicos a lenguaje natural (floor, buildingAge)
3. Envía prompt a Claude API
4. Claude responde con JSON de precios de mercado
5. Calcula valoración con ajustes según características
6. Devuelve resultado al frontend

**Response**:
```json
{
  "basePrice": 495000,
  "minPrice": 396000,
  "maxPrice": 594000,
  "pricePerSqm": 6188,
  "marketData": {
    "municipality": "Madrid",
    "neighborhood": "Salamanca",
    "province": "Madrid",
    "demanda_zona": "alta",
    "tendencia": "subiendo",
    "descripcion_zona": "Zona exclusiva..."
  }
}
```

#### API 2: Envío de Emails

**Endpoint**: `POST /api/lead/send-progress-email`

**Request - Formulario Corto**:
```json
{
  "formType": "short",
  "leadId": "abc123",
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "phone": "612345678",
  "additionalComments": "Propiedad en buen estado",
  "propertyType": "piso",
  "bedrooms": 3,
  "postalCode": "28010",
  "street": "Calle Serrano 45",
  "squareMeters": 80,
  "bathrooms": 2,
  "floor": "3-5",
  "hasElevator": true,
  "buildingAge": "moderna",
  "landSize": null,
  "consentMarketing": true,
  "directOfferInterest": "open-to-offers",
  "agencyStatus": "no"
}
```

**Request - Formulario Largo**:
```json
{
  "formType": "long",
  // ... todos los campos del formulario corto +
  "orientation": "sur",
  "propertyCondition": "buen-estado",
  "hasTerrace": true,
  "terraceSize": 15,
  "hasGarage": true,
  "hasStorage": false,
  "quality": "media-alta",
  "photos": [
    {
      "filename": "salon.jpg",
      "content": "base64encodedstring...",
      "type": "image/jpeg"
    }
  ]
}
```

**Proceso**:
1. Valida datos recibidos
2. Construye email HTML según formType (short/long)
3. Si hay fotos, las añade como attachments
4. Envía email a a.durandez@gmail.com via Resend API
5. Devuelve confirmación

---

## Componentes Principales

### PropertyValuationWizard

**Ubicación**: `components/PropertyValuationWizard.tsx`

**Responsabilidad**: Orquestador principal del wizard multi-paso.

**Funcionalidad**:
- Renderiza el paso actual según `currentStep` del store
- Maneja navegación entre pasos
- Valida transiciones entre pasos

```typescript
const renderStep = () => {
  switch (currentStep) {
    case 1: return <Step1Ubicacion />;
    case 2: return <Step2Caracteristicas />;
    case 3: return <Step3DatosPersonales />;
    case 4: return <Step4Loading />; // Loading durante llamada a Claude
    case 5: return <Step5ResultadoValoracion />;
    case 6: return <Step6DirectOffer />;
    case 7: return <Step7CaracteristicasAvanzadas />;
    case 8: return <Step8PhotoUpload />;
    case 9: return <Step9Loading />; // Loading durante envío de email
    case 10: return <Step10ResultadoFinal />;
    default: return <Step1Ubicacion />;
  }
};
```

### Step3DatosPersonales

**Archivo**: `components/wizard/Step3DatosPersonales.tsx`

**Responsabilidades**:
- Captura datos de contacto (nombre, email, teléfono)
- Captura comentarios adicionales
- Valida campos obligatorios
- **Acción crítica**: Envía primer email y dispara llamada a Claude

**Flujo al hacer clic en "Continuar"**:
```typescript
const handleContinue = async () => {
  // 1. Validar campos
  if (!name || !email || !phone || !consentDataProcessing) {
    setErrors(...);
    return;
  }

  // 2. Generar leadId
  const fakeLeadId = nanoid();
  setLeadId(fakeLeadId);

  // 3. Enviar email formulario corto
  await fetch("/api/lead/send-progress-email", {
    method: "POST",
    body: JSON.stringify({ formType: "short", ... })
  });

  // 4. Continuar a Step4Loading (que llama a Claude)
  nextStep();
};
```

### Step4Loading

**Archivo**: `components/wizard/Step4Loading.tsx`

**Responsabilidades**:
- Muestra animación de loading
- **Acción crítica**: Llama a `/api/valuation/basic` para obtener valoración
- Guarda resultado en el store
- Navega automáticamente a Step5 cuando recibe respuesta

**Flujo**:
```typescript
useEffect(() => {
  const fetchValuation = async () => {
    const response = await fetch("/api/valuation/basic", {
      method: "POST",
      body: JSON.stringify({
        propertyType, bedrooms, postalCode, street,
        squareMeters, bathrooms, floor, hasElevator, buildingAge
      })
    });

    const data = await response.json();

    // Guardar en store
    setBasicValuation({
      basePrice: data.basePrice,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      pricePerSqm: data.pricePerSqm,
      marketData: data.marketData
    });

    // Auto-navegar a resultado
    setTimeout(() => nextStep(), 500);
  };

  fetchValuation();
}, []);
```

### Step8PhotoUpload

**Archivo**: `components/wizard/Step8PhotoUpload.tsx`

**Responsabilidades**:
- Permite subir hasta 10 fotos
- Valida tipo (JPG, PNG, WebP) y tamaño (máx 10MB)
- Convierte fotos a base64
- **Acción crítica**: Envía email formulario largo con todas las fotos

**Gestión de Fotos**:
```typescript
const handleFileSelect = (files: FileList) => {
  const validFiles: File[] = [];

  Array.from(files).forEach(file => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      // Error: formato no válido
    } else if (file.size > MAX_FILE_SIZE) {
      // Error: archivo muy grande
    } else {
      validFiles.push(file);
    }
  });

  if (validFiles.length > 0) {
    addPhotos(validFiles); // Guarda en store

    // Crear URLs para preview
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      photoUrls.push(url);
    });
  }
};

const handleContinue = async () => {
  // Convertir fotos a base64
  const photosAttachments = await Promise.all(
    photos.map(async (photo) => ({
      filename: photo.name,
      content: await fileToBase64(photo),
      type: photo.type
    }))
  );

  // Enviar email con fotos
  await fetch("/api/lead/send-progress-email", {
    method: "POST",
    body: JSON.stringify({
      formType: "long",
      photos: photosAttachments,
      // ... todos los demás campos
    })
  });

  nextStep();
};
```

---

## APIs y Servicios Externos

### Anthropic Claude API

**Propósito**: Obtener estimaciones de precios de mercado inmobiliario usando IA.

**Modelo**: `claude-3-haiku-20240307`
- **Por qué Haiku**: Balance entre costo y calidad. Para análisis de precios no necesitamos Opus/Sonnet.
- **Costo**: ~$0.25 por millón de tokens de input, ~$1.25 por millón de tokens de output
- **Max tokens**: 500 (suficiente para respuesta JSON)

**Configuración**:
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Ejemplo de Prompt Enviado**:
```
Basándote en tu conocimiento actualizado del mercado inmobiliario español,
analiza y proporciona datos de precios para esta propiedad:

📍 UBICACIÓN:
- Dirección: Calle Serrano 45
- Código Postal: 28010

🏠 CARACTERÍSTICAS DE LA PROPIEDAD:
- Tipo: piso
- Superficie: 80 m²
- Habitaciones: 3
- Baños: 2
- Planta: Planta 3ª-5ª
- Ascensor: Sí
- Antigüedad: Entre 15-30 años

IMPORTANTE: Usa tu conocimiento actualizado del mercado inmobiliario 2025 para:
1. Identificar la ciudad/municipio del código postal 28010
2. Identificar el barrio o zona si es posible
3. Analizar TODAS las características de la propiedad
4. Proporcionar precios realistas de mercado para ESA ZONA ESPECÍFICA

Proporciona ÚNICAMENTE un JSON con este formato exacto (sin texto adicional):
{
  "precio_min_m2": número,
  "precio_medio_m2": número,
  "precio_max_m2": número,
  "municipality": "nombre del municipio",
  "neighborhood": "nombre del barrio",
  "province": "nombre de la provincia",
  "demanda_zona": "alta" | "media" | "baja",
  "tendencia": "subiendo" | "estable" | "bajando",
  "descripcion_zona": "breve descripción de 1-2 líneas"
}
```

**Ejemplo de Respuesta de Claude**:
```json
{
  "precio_min_m2": 4800,
  "precio_medio_m2": 6500,
  "precio_max_m2": 8500,
  "municipality": "Madrid",
  "neighborhood": "Salamanca",
  "province": "Madrid",
  "demanda_zona": "alta",
  "tendencia": "subiendo",
  "descripcion_zona": "Barrio residencial de alto standing, zona muy demandada por su ubicación céntrica y servicios."
}
```

**Manejo de Errores**:
- Si Claude no responde con JSON válido → Fallback a precios por defecto
- Si API falla → Devuelve error 500 al frontend
- Logging completo para debugging (📤 ENVIANDO, 📥 RESPUESTA)

### Resend API

**Propósito**: Envío transaccional de emails con leads a admin.

**Dominio verificado**: valoracionmax.es

**Configuración**:
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
```

**Dos Tipos de Email**:

1. **Formulario Corto** (Step 3):
   - Asunto: "🏠 Nuevo Lead - Formulario Corto - [Nombre]"
   - Contiene: Datos básicos + valoración inicial

2. **Formulario Largo** (Step 8):
   - Asunto: "🏡 Nuevo Lead - Formulario Completo - [Nombre]"
   - Contiene: Datos completos + características avanzadas + fotos adjuntas

**Template HTML**:
- Estilos inline para compatibilidad con clientes de email
- Diseño responsive
- Secciones color-coded:
  - 👤 Datos Personales (azul)
  - 🏠 Datos de la Propiedad (verde)
  - 💬 Comentarios Adicionales (amarillo)
  - 🎁 Interés en Ofertas (naranja)
  - 🔧 Características Avanzadas (morado)
  - 📸 Fotos (gris)

**Ejemplo de Envío**:
```typescript
await resend.emails.send({
  from: "Valoración Max <noreply@valoracionmax.es>",
  to: ["a.durandez@gmail.com"],
  subject: `🏠 Nuevo Lead - ${name}`,
  html: htmlTemplate,
  attachments: photos.map(photo => ({
    filename: photo.filename,
    content: Buffer.from(photo.content, 'base64'),
  })),
});
```

---

## Gestión de Estado

### Zustand Store

**Archivo**: `store/useWizardStore.ts`

**Por qué Zustand**:
- Más simple que Redux
- Excelente TypeScript support
- Middleware de persistencia built-in
- Pequeño bundle size (~1KB)
- No requiere Context Providers

**Estructura**:
```typescript
interface WizardState {
  // Estado de datos (35+ campos)
  postalCode: string;
  street: string;
  // ... etc

  // Estado UI
  currentStep: number;

  // Resultados
  basicValuation: ValuationResult | null;
  leadId: string;

  // Setters
  setPostalCode: (code: string) => void;
  setStreet: (street: string) => void;
  // ... etc

  // Navegación
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Utilidades
  resetWizard: () => void;
}
```

**Persistencia**:
```typescript
persist(
  (set, get) => ({
    // ... state implementation
  }),
  {
    name: "wizard-storage", // localStorage key
    partialize: (state) => ({
      // Solo persiste datos del usuario, no estado temporal
      postalCode: state.postalCode,
      // ... etc
    }),
  }
)
```

**Uso en Componentes**:
```typescript
const Step1Ubicacion = () => {
  const {
    postalCode,
    street,
    squareMeters,
    setPostalCode,
    setStreet,
    setSquareMeters,
    nextStep
  } = useWizardStore();

  return (
    <form>
      <Input
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
      />
      {/* ... */}
    </form>
  );
};
```

---

## Sistema de Emails

### HTML Email Templates

**Características**:
- Inline CSS para máxima compatibilidad
- Mobile-first responsive design
- Secciones con color-coding
- Emojis para mejor legibilidad

**Secciones del Email**:

```html
<!-- Header -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <h1>🏠 Nuevo Lead - Formulario [Corto/Completo]</h1>
</div>

<!-- Lead ID Badge -->
<div style="background: #f3f4f6;">
  <strong>ID del Lead:</strong> abc123xyz
</div>

<!-- Sección 1: Datos Personales -->
<div class="section">
  <div class="section-title">👤 Datos Personales</div>
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Nombre</div>
      <div class="info-value">Juan Pérez</div>
    </div>
    <!-- ... -->
  </div>
</div>

<!-- Sección 2: Datos de la Propiedad -->
<div class="section">
  <div class="section-title">🏠 Datos de la Propiedad</div>
  <!-- ... -->
</div>

<!-- Sección 3: Comentarios Adicionales (si existe) -->
<div class="section">
  <div class="section-title">💬 Comentarios adicionales</div>
  <div style="background: #fef3c7; padding: 15px;">
    {{ additionalComments }}
  </div>
</div>

<!-- Sección 4: Interés en Ofertas -->
<div class="section">
  <div class="section-title">🎁 Interés en Ofertas</div>
  <!-- ... -->
</div>

<!-- Solo en Formulario Largo: Características Avanzadas -->
<div class="section">
  <div class="section-title">🔧 Características Avanzadas</div>
  <!-- ... -->
</div>

<!-- Solo en Formulario Largo: Fotos -->
<div class="section">
  <div class="section-title">📸 Fotos de la Propiedad</div>
  <p>{{ photos.length }} fotos adjuntas</p>
</div>
```

### Helper Functions para Emails

```typescript
// Traduce interés en ofertas
const getOfferInterestText = (value: string | null) => {
  if (!value) return 'No especificado';
  if (value === 'open-to-offers') return '✅ SÍ - Interesado en escuchar ofertas';
  if (value === 'not-interested') return '❌ NO - Solo quiere la valoración';
  return 'No especificado';
};

// Traduce estado de agencias
const getAgencyStatusText = (value: string | null) => {
  if (!value) return 'No especificado';
  if (value === 'yes') return 'Sí, publicado en agencias';
  if (value === 'no') return 'No publicado';
  if (value === 'soon') return 'Próximamente';
  if (value === 'no-agencies') return 'No quiere agencias';
  return 'No especificado';
};

// Traduce tipo de propiedad
const getPropertyTypeText = (type: string) => {
  const types = {
    'piso': 'Piso',
    'chalet': 'Chalet/Casa adosada',
    'casa': 'Casa independiente'
  };
  return types[type] || type;
};

// ... etc para otros campos
```

---

## Seguridad y Validación

### Validación Frontend

**Campos Obligatorios** (Step 3):
- Nombre: mínimo 2 caracteres
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Teléfono: 9 dígitos
- Consentimiento de privacidad: obligatorio

```typescript
const handleContinue = () => {
  const newErrors: Record<string, string> = {};

  if (!name || name.trim().length < 2) {
    newErrors.name = "Nombre inválido";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    newErrors.email = "Email inválido";
  }

  const phoneRegex = /^[0-9]{9}$/;
  if (!phone || !phoneRegex.test(phone.replace(/\s/g, ""))) {
    newErrors.phone = "Teléfono inválido (9 dígitos)";
  }

  if (!consentDataProcessing) {
    newErrors.consentDataProcessing = "Debes aceptar la política de privacidad";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Continuar...
};
```

**Validación de Archivos** (Step 8):
```typescript
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const handleFileSelect = (files: FileList) => {
  // Validar cantidad
  if (photos.length + files.length > MAX_PHOTOS) {
    setErrors(`Solo puedes subir un máximo de ${MAX_PHOTOS} fotos`);
    return;
  }

  // Validar cada archivo
  Array.from(files).forEach(file => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Formato no válido`);
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: Archivo muy grande (máx 10MB)`);
    } else {
      validFiles.push(file);
    }
  });
};
```

### Variables de Entorno

**Archivo**: `.env.local` (no commiteado a git)

```env
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Resend API
RESEND_API_KEY=re_...

# URLs (opcionales)
NEXT_PUBLIC_SITE_URL=https://valoracionmax.es
```

**Acceso en código**:
```typescript
// Solo accesible en server-side (API routes)
const apiKey = process.env.ANTHROPIC_API_KEY;

// Accesible en client-side (con prefix NEXT_PUBLIC_)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

### Protección de Datos

- **No hay base de datos**: Los datos se envían directamente por email
- **No se almacenan fotos**: Se convierten a base64 y se envían por email, luego se descartan
- **localStorage**: Solo para mejorar UX, se puede borrar en cualquier momento
- **HTTPS**: Todo el tráfico está encriptado (Vercel)
- **Consentimiento**: Usuario debe aceptar política de privacidad obligatoriamente

### Rate Limiting

**Actualmente**: No implementado

**Recomendación para producción**:
```typescript
// Ejemplo con Vercel Edge Config o Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests por hora
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for");
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  // Continuar con lógica normal...
}
```

---

## Diagramas

### Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js + React)                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PropertyValuationWizard                               │  │
│  │  ├─ Step1: Ubicación                                   │  │
│  │  ├─ Step2: Características básicas                     │  │
│  │  ├─ Step3: Datos personales  ──┐                       │  │
│  │  ├─ Step4: Loading (Claude)    │                       │  │
│  │  ├─ Step5: Resultado básico    │                       │  │
│  │  ├─ Step6: Oferta directa      │                       │  │
│  │  ├─ Step7: Características av. │                       │  │
│  │  ├─ Step8: Fotos  ─────────────┼───┐                   │  │
│  │  ├─ Step9: Loading             │   │                   │  │
│  │  └─ Step10: Resultado final    │   │                   │  │
│  └────────────────────────────────┼───┼───────────────────┘  │
│                                   │   │                      │
│  ┌────────────────────────────────┼───┼───────────────────┐  │
│  │  Zustand Store (localStorage)  │   │                   │  │
│  │  - Todos los campos del wizard │   │                   │  │
│  │  - Estado de navegación        │   │                   │  │
│  │  - Resultados de valoración    │   │                   │  │
│  └────────────────────────────────┼───┼───────────────────┘  │
└────────────────────────────────────┼───┼──────────────────────┘
                                    │   │
                ┌───────────────────┘   └─────────────────┐
                ▼                                         ▼
┌──────────────────────────────┐      ┌──────────────────────────────┐
│  API: /api/valuation/basic   │      │  API: /api/lead/send-email   │
│  ─────────────────────────   │      │  ───────────────────────────  │
│  1. Recibe datos propiedad   │      │  1. Recibe datos completos   │
│  2. Construye prompt         │      │  2. Convierte fotos a base64 │
│  3. Llama a Claude API ──┐   │      │  3. Genera HTML template     │
│  4. Parsea respuesta     │   │      │  4. Envía via Resend ──┐     │
│  5. Calcula valoración   │   │      │                         │     │
│  6. Devuelve resultado   │   │      │                         │     │
└──────────────────────────┼───┘      └─────────────────────────┼─────┘
                          │                                     │
                          ▼                                     ▼
              ┌────────────────────────┐      ┌────────────────────────────┐
              │  Anthropic Claude API  │      │      Resend API            │
              │  ────────────────────  │      │  ─────────────────────     │
              │  - Modelo: Haiku       │      │  - Dominio: valoracionmax  │
              │  - Prompt: precios     │      │  - To: a.durandez@gmail    │
              │  - Response: JSON      │      │  - Attachments: Fotos      │
              └────────────────────────┘      └────────────────────────────┘
```

---

## Consideraciones de Escalabilidad

### Estado Actual
- Servidor: Vercel Serverless Functions
- Límite: 10 segundos por request (Hobby plan)
- Base de datos: Ninguna
- Storage: Ninguno

### Limitaciones Actuales
1. **No hay histórico de leads**: Solo emails, sin CRM integrado
2. **No hay rate limiting**: Vulnerable a spam/abuse
3. **Timeout potencial**: Si Claude tarda >10s, la función falla
4. **Costos de API**: Sin caché, cada valoración llama a Claude

### Mejoras Sugeridas para Escala

#### 1. Añadir Base de Datos
```typescript
// Ejemplo con Prisma + PostgreSQL (Vercel Postgres)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Guardar lead en DB además de enviar email
await prisma.lead.create({
  data: {
    leadId,
    name,
    email,
    phone,
    propertyType,
    // ... etc
  }
});
```

#### 2. Implementar Caché de Valoraciones
```typescript
// Caché de precios por código postal (Redis o Edge Config)
const cacheKey = `valuation:${postalCode}:${propertyType}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return cached; // Evita llamada a Claude
}

const valuation = await callClaude(...);
await redis.set(cacheKey, valuation, { ex: 86400 }); // 24h TTL
```

#### 3. Queue System para Procesamiento Largo
```typescript
// Usar Inngest o similar para procesamiento asíncrono
import { inngest } from "./inngest/client";

// En el API route
await inngest.send({
  name: "lead.submitted",
  data: { leadId, photos, ... }
});

// En la función de Inngest (sin límite de tiempo)
export default inngest.createFunction(
  { name: "Process Lead Photos" },
  { event: "lead.submitted" },
  async ({ event }) => {
    // Procesar fotos con Claude Vision
    // Enviar email con análisis completo
  }
);
```

---

## Debugging y Monitoreo

### Logs de Desarrollo

**Console.log estratégico con emojis**:
```typescript
console.log("📤 ENVIANDO A CLAUDE:");
console.log("═══════════════════════════════════════");
console.log(marketPrompt);
console.log("═══════════════════════════════════════");

console.log("📥 RESPUESTA DE CLAUDE:");
console.log("═══════════════════════════════════════");
console.log(marketText);
console.log("═══════════════════════════════════════");

console.log("✅ Precio medio obtenido:", precio_medio_m2, "€/m² para", municipality);
```

### Verificación de Funcionamiento

**3 métodos**:

1. **Logs de servidor** (desarrollo):
   - Terminal muestra todo el flujo
   - Emojis para identificar rápidamente

2. **Emails** (desarrollo y producción):
   - Cada lead genera email automático
   - Verificar en a.durandez@gmail.com

3. **DevTools del navegador**:
   - Network tab → ver requests/responses
   - Console → ver errores frontend
   - Application → ver localStorage

### Monitoreo en Producción

**Vercel Dashboard**:
- Logs en tiempo real
- Analytics de uso
- Error tracking automático
- Performance metrics

**Recomendación**: Añadir Sentry para error tracking avanzado
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Conclusión

La arquitectura actual es simple pero efectiva para:
- Captura de leads
- Valoraciones con IA
- Notificaciones por email

Para escalar a producción con alto tráfico, se recomienda:
1. Añadir base de datos (Postgres)
2. Implementar caché (Redis)
3. Añadir rate limiting
4. Integrar con CRM
5. Monitoreo avanzado (Sentry, LogRocket)
6. Queue system para procesamiento pesado

La documentación debe actualizarse con cada cambio significativo en la arquitectura.
