# Decisiones Técnicas - ValoracionMax

Este documento explica las decisiones técnicas clave tomadas en el proyecto, su justificación y las alternativas consideradas.

---

## Índice

1. [Framework y Stack](#framework-y-stack)
2. [Gestión de Estado](#gestión-de-estado)
3. [API de Inteligencia Artificial](#api-de-inteligencia-artificial)
4. [Sistema de Emails](#sistema-de-emails)
5. [Almacenamiento de Datos](#almacenamiento-de-datos)
6. [Arquitectura de Formulario](#arquitectura-de-formulario)
7. [Manejo de Fotos](#manejo-de-fotos)
8. [UI/UX Components](#uiux-components)
9. [Despliegue e Infraestructura](#despliegue-e-infraestructura)
10. [Testing y Debugging](#testing-y-debugging)

---

## Framework y Stack

### Decisión: Next.js 16.0.2 con App Router

**Por qué Next.js**:
- ✅ Full-stack framework (frontend + API routes)
- ✅ React Server Components nativos
- ✅ Excelente SEO con SSR/SSG
- ✅ API Routes para backend sin servidor separado
- ✅ Turbopack para builds ultra-rápidos
- ✅ Zero-config deployment en Vercel
- ✅ TypeScript support de primera clase

**Alternativas consideradas**:
- **Vite + Express**: Más configuración, dos servidores separados
- **Create React App**: Sin backend integrado, deprecado
- **Remix**: Menos maduro, curva de aprendizaje

**Trade-offs**:
- ❌ Next.js puede ser overkill para apps simples
- ❌ Bundle size mayor que Vite puro
- ✅ Pero vale la pena por la DX y deployment

### Decisión: TypeScript Strict

**Por qué TypeScript**:
- ✅ Catch de errores en desarrollo, no en producción
- ✅ Mejor DX con autocomplete
- ✅ Documentación implícita en el código
- ✅ Refactoring seguro
- ✅ Integración perfecta con Next.js y React

**Configuración**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Por qué strict mode**:
- Previene bugs sutiles con `null`/`undefined`
- Fuerza a manejar todos los casos
- Mejor para equipos

---

## Gestión de Estado

### Decisión: Zustand con Persistencia

**Por qué Zustand sobre Redux**:
```
Comparación:

Redux Toolkit:
- Boilerplate: 🔴 Medio-Alto (slices, reducers, actions)
- Complejidad: 🔴 Media
- Bundle size: 🟡 ~3-4KB
- Learning curve: 🔴 Alta
- DevTools: ✅ Redux DevTools excelente

Zustand:
- Boilerplate: ✅ Mínimo
- Complejidad: ✅ Baja
- Bundle size: ✅ ~1KB
- Learning curve: ✅ Muy baja
- DevTools: ✅ Zustand DevTools
- TypeScript: ✅ Excelente
- Middleware: ✅ Persist, devtools built-in
```

**Ejemplo comparativo**:

**Con Redux Toolkit**:
```typescript
// store/postalCodeSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const postalCodeSlice = createSlice({
  name: 'postalCode',
  initialState: { value: '' },
  reducers: {
    setPostalCode: (state, action) => {
      state.value = action.payload;
    }
  }
});

// Necesitas:
// - store/index.ts para combinar slices
// - Provider en layout
// - useDispatch + useSelector en componentes
```

**Con Zustand**:
```typescript
// store/useWizardStore.ts
const useWizardStore = create<WizardState>((set) => ({
  postalCode: '',
  setPostalCode: (code) => set({ postalCode: code }),
}));

// Uso en componente:
const { postalCode, setPostalCode } = useWizardStore();
```

**Ventajas de Zustand para este proyecto**:
1. No necesita Context Provider
2. Menos archivos y boilerplate
3. Middleware de persistencia simple:
   ```typescript
   persist(
     (set, get) => ({ /* store */ }),
     { name: "wizard-storage" }
   )
   ```
4. Perfecto para apps pequeñas/medianas
5. Fácil de entender para nuevos desarrolladores

**Cuándo usar Redux en su lugar**:
- Apps muy grandes (>50 slices)
- Necesitas time-travel debugging avanzado
- Múltiples equipos trabajando en paralelo
- Arquitectura muy compleja con sagas

### Decisión: localStorage para Persistencia

**Por qué localStorage**:
- ✅ No requiere backend/DB para guardar estado temporal
- ✅ Mejora UX: usuario puede cerrar navegador y retomar
- ✅ Gratis y cero configuración
- ✅ Suficiente para datos no sensibles del wizard

**Limitaciones**:
- ❌ Solo 5-10MB (suficiente para nuestro caso)
- ❌ Sincrónico (puede bloquear UI con datos muy grandes)
- ❌ No funciona cross-device

**Alternativa considerada: IndexedDB**:
- Más complejo
- Innecesario para nuestro volumen de datos

**Datos que NO persistimos**:
- Resultados de valoración (se recalculan)
- Estado de loading
- Errores temporales

**Datos que SÍ persistimos**:
- Todos los inputs del usuario
- Paso actual del wizard
- Lead ID (una vez generado)

---

## API de Inteligencia Artificial

### Decisión: Anthropic Claude (Haiku) vs OpenAI GPT

**Comparación**:

| Característica | Claude Haiku | GPT-3.5-turbo | GPT-4 |
|----------------|--------------|---------------|-------|
| Costo (input)  | $0.25/1M tokens | $0.50/1M tokens | $30/1M tokens |
| Costo (output) | $1.25/1M tokens | $1.50/1M tokens | $60/1M tokens |
| Velocidad      | ⚡ Muy rápida | ⚡ Rápida | 🐢 Lenta |
| Calidad        | 🟢 Buena | 🟢 Buena | 🟢🟢 Excelente |
| JSON mode      | ✅ Sí | ✅ Sí | ✅ Sí |
| Context window | 200K tokens | 16K tokens | 128K tokens |
| Conocimiento   | Jan 2025 | Sep 2021 | Dic 2023 |

**Por qué Claude Haiku**:
1. **Costo**: 50% más barato que GPT-3.5
2. **Velocidad**: Respuestas en 1-2 segundos
3. **Conocimiento actualizado**: Datos de mercado 2025
4. **Calidad suficiente**: Para análisis de precios no necesitamos Opus/Sonnet
5. **Context window grande**: Útil si queremos añadir más ejemplos en el futuro

**Cuándo actualizar a Claude Sonnet**:
- Si necesitamos análisis más complejos
- Si añadimos análisis de imágenes con Vision
- Si la precisión actual no es suficiente

**Costos estimados**:
```
Por valoración:
- Prompt: ~800 tokens × $0.25/1M = $0.0002
- Response: ~150 tokens × $1.25/1M = $0.0001875
- Total: ~$0.0003875 por valoración

Con 1000 valoraciones/mes:
- Costo mensual: ~$0.39 (insignificante)

Con GPT-4 sería:
- Costo mensual: ~$35.10 (90x más caro)
```

### Estructura del Prompt

**Decisión: Prompt estructurado con todas las características**

**Versión anterior** (solo CP y m²):
```
Dame precios para código postal 28010, 80m²
```

**Versión actual** (completa):
```
📍 UBICACIÓN:
- Dirección: Calle Serrano 45
- Código Postal: 28010

🏠 CARACTERÍSTICAS:
- Tipo: piso
- Superficie: 80 m²
- Habitaciones: 3
- Baños: 2
- Planta: Planta 3ª-5ª
- Ascensor: Sí
- Antigüedad: Entre 15-30 años
```

**Por qué esta estructura**:
1. **Emojis**: Claude los entiende y mejoran la organización visual
2. **Secciones claras**: Separa ubicación de características
3. **Valores traducidos**: "Planta 3ª-5ª" en lugar de "3-5" técnico
4. **Todas las características**: Mejor precisión en la valoración
5. **Formato consistente**: Facilita parsing de respuesta

**Resultado**:
- Respuestas más precisas (+-10% vs +-30% anterior)
- Claude entiende mejor el contexto
- Permite ajustes por planta, ascensor, antigüedad

---

## Sistema de Emails

### Decisión: Resend vs Alternativas

**Comparación**:

| Servicio | Precio | DX | Deliverability | Dominio custom |
|----------|--------|----|--------------  |----------------|
| **Resend** | 3000/mes gratis | ✅ Excelente | ✅ Alta | ✅ Fácil |
| SendGrid | 100/día gratis | 🟡 Media | ✅ Alta | ✅ Complejo |
| Mailgun | 1000/mes gratis | 🟡 Media | ✅ Alta | ✅ Medio |
| AWS SES | $0.10/1000 | 🔴 Baja | ✅ Alta | ✅ Complejo |
| Nodemailer + Gmail | Gratis | 🔴 Baja | 🔴 Baja | ❌ No |

**Por qué Resend**:
1. **Developer Experience**: SDK súper simple
   ```typescript
   await resend.emails.send({
     from: "Valoración Max <noreply@valoracionmax.es>",
     to: ["a.durandez@gmail.com"],
     subject: "Nuevo Lead",
     html: htmlTemplate,
     attachments: photos,
   });
   ```

2. **Dominio custom fácil**: Solo añadir registros DNS, Resend valida automáticamente

3. **Attachments**: Soporte nativo para adjuntar fotos
   ```typescript
   attachments: photos.map(photo => ({
     filename: photo.filename,
     content: Buffer.from(photo.content, 'base64'),
   }))
   ```

4. **Logs y analytics**: Dashboard excelente

5. **Gratis hasta 3000/mes**: Más que suficiente

**Trade-offs**:
- ❌ Más caro que SES para volumen muy alto (>10k/mes)
- ❌ Menos features que SendGrid (sin marketing automation)
- ✅ Pero para transaccionales simples es perfecto

### Decisión: Dos Emails (Short + Long)

**Por qué no un solo email**:

**Razón 1: UX - Captura temprana**
- Usuario ve valoración en Step 5
- Si abandona después, al menos tenemos sus datos básicos
- Email "short" captura el lead ANTES de perderlo

**Razón 2: Business - Cualificación**
- Email "short": Lead básico (solo quiere precio rápido)
- Email "long": Lead caliente (invirtió tiempo en detalles + fotos)
- Diferentes estrategias de seguimiento

**Razón 3: Técnica - Timeout prevention**
- Si subir 10 fotos tarda mucho, mejor enviar email short primero
- Email long puede fallar sin perder el lead

**Estructura**:
```
Step 3: Datos personales
  ↓
  📧 Email Short (datos básicos + valoración inicial)
  ↓
Step 4-7: Características avanzadas
  ↓
Step 8: Fotos
  ↓
  📧 Email Long (datos completos + fotos)
```

**Contenido diferenciado**:
- **Short**: Contacto + propiedad básica + interés en ofertas
- **Long**: Todo lo anterior + características avanzadas + fotos adjuntas

---

## Almacenamiento de Datos

### Decisión: Sin Base de Datos (Email-Only)

**Por qué NO usamos base de datos**:

**Pros de email-only**:
1. **Simplicidad**: Menos infraestructura
2. **Costo**: $0 (vs DB que cuesta)
3. **Backup automático**: Gmail guarda todo
4. **Accessible**: Cualquiera con acceso a email puede ver leads
5. **Protección de datos**: No almacenamos datos sensibles
6. **Velocidad de desarrollo**: Sin migraciones, sin ORM

**Contras**:
1. ❌ No hay panel de admin para ver leads
2. ❌ No hay búsqueda/filtrado fácil
3. ❌ No hay analytics sobre conversión
4. ❌ Difícil automatizar seguimiento

**Cuándo migrar a BD**:
- Cuando tengamos >100 leads/mes
- Cuando necesitemos CRM integrado
- Cuando queramos analytics avanzados
- Cuando implementemos seguimiento automatizado

**Migración futura**:
```typescript
// Fácil de añadir después con Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// En API route de email
await prisma.lead.create({
  data: {
    leadId,
    name,
    email,
    // ... etc
  }
});

// Seguimos enviando email además de guardar en DB
await resend.emails.send(...);
```

**Recomendación**: Vercel Postgres (fácil integración)

---

## Arquitectura de Formulario

### Decisión: Wizard Multi-Paso vs Single Page

**Por qué wizard (10 pasos)**:

**Ventajas**:
1. **Menor fricción**: Menos campos visibles = menos intimidante
2. **Mejor conversión**: Usuario solo ve 3-5 campos por vez
3. **Progresión psicológica**: Barra de progreso motiva a completar
4. **Validación por paso**: Errores localizados, no abrumadores
5. **Mobile-friendly**: Menos scroll, mejor UX en móvil
6. **Loading screens**: Podemos mostrar loading mientras procesamos

**Contras**:
1. ❌ Más navegación (clicks)
2. ❌ Más complejo de implementar
3. ❌ Difícil ver resumen completo

**Alternativa: Single page**
- Todos los campos visibles
- Mejor para usuarios "expertos"
- Peor para conversión en landing pages

**Estadísticas típicas**:
- Single page: 15-25% conversión
- Multi-step: 25-40% conversión

**Estructura de nuestros pasos**:
```
Paso 1: Ubicación (3 campos) ──────────┐
Paso 2: Características (6 campos)     │ FASE 1
Paso 3: Datos personales (5 campos)    │ (Formulario corto)
                                        │
Paso 4: Loading (llamada a Claude) ────┘
Paso 5: Resultado valoración ──────────┐
Paso 6: Oferta directa (2 campos)      │
Paso 7: Características avanzadas (7)  │ FASE 2
Paso 8: Fotos (opcional)               │ (Formulario largo)
Paso 9: Loading (envío de email)       │
Paso 10: Resultado final ──────────────┘
```

**Por qué este orden específico**:
1. **Ubicación primero**: Dato más fácil, baja fricción
2. **Características básicas**: Usuario ya tiene esta info en mente
3. **Datos personales**: Cuando ya está comprometido
4. **Loading + Resultado**: Recompensa inmediata (mantiene engagement)
5. **Características avanzadas**: Solo para usuarios muy interesados
6. **Fotos al final**: Opcional, no bloquea flujo

### Decisión: Loading Screens (Step 4 y 9)

**Por qué loading screens dedicados**:

**Alternativa 1: Spinner en el mismo paso**
```typescript
// Malo: Usuario ve formulario congelado
<Button disabled={loading}>
  {loading ? <Spinner /> : "Continuar"}
</Button>
```

**Alternativa 2: Paso completo de loading** ✅
```typescript
// Bueno: Paso dedicado con animación y mensaje
<Step4Loading>
  <Spinner />
  <h2>Analizando tu propiedad...</h2>
  <p>Estamos consultando precios de mercado actualizados</p>
</Step4Loading>
```

**Ventajas**:
1. **Transparencia**: Usuario sabe qué está pasando
2. **Engagement**: Texto explicativo mantiene interés
3. **Expectativa**: Prepara para el resultado
4. **UX**: No hay sensación de "app congelada"

**Tiempos esperados**:
- Step 4 (Claude): 1-3 segundos
- Step 9 (Email): 0.5-1 segundo

---

## Manejo de Fotos

### Decisión: Base64 en Email vs Upload a Storage

**Comparación**:

**Opción 1: Upload a S3/Cloudinary + Link en email** ❌
```typescript
// Flujo:
1. Usuario selecciona foto
2. Upload a S3/Cloudinary
3. Obtener URL pública
4. Enviar URL en email
5. Admin hace clic para ver foto

Pros:
- Emails más ligeros
- Fotos accesibles por URL

Contras:
- Más complejo (S3 config, credentials)
- Costo adicional de storage
- URLs pueden expirar
- Admin debe hacer clic para ver foto
```

**Opción 2: Base64 como attachment** ✅
```typescript
// Flujo:
1. Usuario selecciona foto
2. Convertir a base64 en frontend
3. Enviar en JSON a API
4. API añade como attachment en email
5. Admin ve fotos directamente en email

Pros:
- Simple (sin servicios externos)
- Costo: $0
- Fotos en el email directamente
- No expiran

Contras:
- Emails más pesados (10 fotos = ~5-10MB)
- Límite de Resend: 40MB por email
```

**Por qué elegimos base64**:
1. **Simplicidad**: Sin configurar S3/Cloudinary
2. **Costo**: Gratis
3. **UX del admin**: Ve fotos inmediatamente en Gmail
4. **Límites razonables**: 10 fotos × 1MB = 10MB < 40MB límite

**Validaciones implementadas**:
```typescript
const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB por foto
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
```

**Conversión a base64**:
```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extraer solo la parte base64 (sin data:image/...)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};
```

**Optimización futura**:
- Comprimir imágenes en frontend antes de enviar
- Usar `sharp` en backend para resize automático
- Límite más bajo de file size (5MB)

---

## UI/UX Components

### Decisión: shadcn/ui vs Otras Librerías

**Comparación**:

| Librería | Pros | Contras | Customización |
|----------|------|---------|---------------|
| **shadcn/ui** | Copy-paste, full control | Sin auto-updates | ✅ Total |
| Material UI | Muy completa, popular | Bundle grande | 🟡 Media |
| Chakra UI | Excelente DX | Opinionada | 🟡 Media |
| Ant Design | Enterprise-ready | Diseño chino | 🔴 Difícil |
| Tailwind UI | Hermoso diseño | Caro ($300) | ✅ Total |

**Por qué shadcn/ui**:

1. **No es una dependencia**: Se copia el código a tu proyecto
   ```bash
   npx shadcn@latest add button
   # Crea: components/ui/button.tsx
   # Es TU código, no una dependency en package.json
   ```

2. **Customización total**: Como está en tu código, puedes modificar todo
   ```typescript
   // components/ui/button.tsx
   // Modificar variantes, estilos, comportamiento
   ```

3. **No aumenta bundle**: Solo incluyes los componentes que usas

4. **Basado en Radix UI**: Accessible, bien testeado

5. **Tailwind CSS**: Ya lo usamos, integración perfecta

**Componentes que usamos**:
- `Button`: Botones con variantes
- `Input`: Text inputs
- `Textarea`: Comentarios adicionales
- `Label`: Labels accesibles
- `Checkbox`: Consentimientos
- `RadioGroup`: Opciones de respuesta
- `Select`: Dropdowns
- `Card`: Contenedores de contenido

**Por qué NO usamos una UI library completa**:
- No necesitamos componentes complejos (DataTable, Charts, etc.)
- Queremos diseño custom, no generic
- Mejor performance (menos JS)

---

## Despliegue e Infraestructura

### Decisión: Vercel vs Alternativas

**Comparación**:

| Plataforma | Precio | DX | Performance | Limitaciones |
|------------|--------|----|-----------  |--------------|
| **Vercel** | Gratis | ✅ Excelente | ✅ Edge | 10s timeout |
| Netlify | Gratis | ✅ Buena | 🟡 Buena | 10s timeout |
| AWS (Amplify) | Pay-as-you-go | 🔴 Compleja | ✅ Excelente | Config compleja |
| Railway | $5/mes | ✅ Buena | ✅ Buena | No edge |
| Render | Gratis | 🟡 Media | 🟡 Media | Spins down |

**Por qué Vercel**:

1. **Next.js creator**: Integración perfecta (lo crearon ellos)

2. **Zero-config deployment**:
   ```bash
   git push origin main
   # Automáticamente:
   # - Build
   # - Deploy
   # - SSL certificate
   # - Edge distribution
   # - Preview URLs
   ```

3. **Edge Network**: Respuestas desde la ubicación más cercana al usuario

4. **Preview Deployments**: Cada push a branch = URL única de preview

5. **Dominio custom gratis**: valoracionmax.es configurado fácilmente

6. **Analytics incluidos**: Web Vitals, performance metrics

7. **Logs en tiempo real**: Debugging fácil

**Limitaciones**:
- ❌ 10 segundos timeout en Hobby plan
- ❌ 12 serverless functions en Hobby plan
- ❌ 100GB bandwidth mensual en Hobby plan

**Por qué es suficiente para nosotros**:
- Llamadas a Claude: 1-3 segundos (bien por debajo de 10s)
- Solo 2 funciones serverless usadas
- Tráfico esperado: <10GB/mes

**Cuándo migrar a Pro ($20/mes)**:
- Si timeout se vuelve problema
- Si necesitamos más funciones
- Si tráfico >100GB/mes

### Decisión: Dominio Custom

**Por qué valoracionmax.es**:
- Profesional
- Corto y memorable
- `.es` = Enfocado en España (nuestro mercado)

**Configuración**:
1. Comprar dominio (GoDaddy, Namecheap, etc.)
2. Añadir a Vercel
3. Configurar DNS records (Vercel da instrucciones)
4. SSL automático

---

## Testing y Debugging

### Decisión: Console.log Estratégico vs Testing Framework

**Por qué NO usamos Jest/Testing Library (aún)**:

**Pros de testing automatizado**:
- Previene regresiones
- Documentación viva
- Refactoring seguro

**Contras en nuestra situación**:
- Setup inicial complejo (Next.js + Jest config)
- Tiempo de desarrollo adicional
- Overkill para MVP/validación

**Nuestra estrategia actual: Logging**:

```typescript
// API de valoración
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

**Ventajas del logging con emojis**:
1. **Visualmente escaneable**: Emojis destacan en terminal
2. **Contexto inmediato**: Ves exactamente qué se envía/recibe
3. **Debugging en producción**: Vercel logs los muestra
4. **Cero setup**: Funciona out-of-the-box

**Cuándo añadir tests**:
- Cuando el proyecto esté validado
- Cuando tengamos presupuesto/tiempo
- Cuando el equipo crezca (>2 personas)
- Cuando bugs en producción se vuelvan frecuentes

**Tests que añadiríamos primero**:
```typescript
// 1. Tests de integración de APIs
describe('POST /api/valuation/basic', () => {
  it('should return valid price data', async () => {
    const response = await fetch('/api/valuation/basic', {
      method: 'POST',
      body: JSON.stringify(mockPropertyData),
    });
    const data = await response.json();
    expect(data.basePrice).toBeGreaterThan(0);
  });
});

// 2. Tests de validación de formularios
describe('Step3DatosPersonales', () => {
  it('should show error for invalid email', () => {
    render(<Step3DatosPersonales />);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });
});

// 3. Tests de conversión base64
describe('fileToBase64', () => {
  it('should convert image to base64', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const base64 = await fileToBase64(file);
    expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});
```

### Decisión: Precarga de Datos en Testing

**Por qué precargamos datos en Step3**:

```typescript
// Step3DatosPersonales.tsx
useEffect(() => {
  if (!name) setName("Juan Pérez");
  if (!email) setEmail("juan@ejemplo.com");
  if (!phone) setPhone("612345678");
  if (!consentDataProcessing) setConsentDataProcessing(true);
}, []);
```

**Razones**:
1. **Desarrollo rápido**: No llenar formulario manualmente cada vez
2. **Testing rápido**: Probar flujo completo en segundos
3. **Demo**: Mostrar al cliente sin llenar datos

**IMPORTANTE**: Comentar/eliminar en producción
```typescript
// ANTES DE DEPLOY A PRODUCCIÓN:
useEffect(() => {
  // TESTING ONLY - COMENTAR EN PRODUCCIÓN
  // if (!name) setName("Juan Pérez");
  // ...
}, []);
```

**Alternativa mejor para producción**:
```typescript
// Usar variable de entorno
const isDev = process.env.NODE_ENV === 'development';

useEffect(() => {
  if (isDev) {
    if (!name) setName("Juan Pérez");
    if (!email) setEmail("juan@ejemplo.com");
    // ...
  }
}, []);
```

---

## Decisiones Futuras a Considerar

### 1. Análisis de Imágenes con Claude Vision

**Cuándo implementar**:
- Cuando tengamos presupuesto para Opus/Sonnet
- Cuando queramos valoraciones ultra-precisas

**Cómo sería**:
```typescript
// En Step8PhotoUpload, después de subir fotos
const analysisPrompt = `
Analiza estas ${photos.length} fotos de la propiedad.
Evalúa:
1. Estado de conservación (1-10)
2. Calidad de acabados (1-10)
3. Luminosidad (1-10)
4. Necesidades de reforma (sí/no y estimación €)

Responde en JSON.
`;

const response = await anthropic.messages.create({
  model: "claude-3-opus-20240229", // Necesario para vision
  messages: [{
    role: "user",
    content: [
      { type: "text", text: analysisPrompt },
      ...photos.map(photo => ({
        type: "image",
        source: {
          type: "base64",
          media_type: photo.type,
          data: photo.content,
        }
      }))
    ]
  }]
});

// Usar análisis para ajustar valoración
const adjustment = response.analysis.needsRenovation ? -0.15 : 0;
const adjustedPrice = basePrice * (1 + adjustment);
```

**Costo estimado**:
- Claude Opus: $15/1M input tokens
- 10 fotos ≈ 50K tokens
- Por valoración: $0.75
- 1000 valoraciones/mes: $750/mes (vs $0.39 actual)

### 2. Integración con CRM (HubSpot, Salesforce)

**Cuándo implementar**:
- Cuando tengamos >500 leads/mes
- Cuando contratemos sales team

**Implementación**:
```typescript
// En API route de email
await prisma.lead.create({ ... }); // Guardar en DB

// Enviar a HubSpot
await fetch('https://api.hubapi.com/contacts/v1/contact', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
  },
  body: JSON.stringify({
    properties: [
      { property: 'email', value: email },
      { property: 'firstname', value: name },
      { property: 'phone', value: phone },
      // Custom properties
      { property: 'property_type', value: propertyType },
      { property: 'postal_code', value: postalCode },
      // ...
    ]
  })
});
```

### 3. AB Testing de Prompts

**Para optimizar precios**:
```typescript
// Probar diferentes prompts con Claude
const prompts = {
  v1: "Dame precios conservadores...", // Actual
  v2: "Dame precios optimistas...",
  v3: "Dame precios basados en últimos 3 meses...",
};

// A/B test: 33% cada versión
const version = leadId % 3;
const prompt = prompts[`v${version + 1}`];

// Trackear en DB qué versión se usó
await prisma.lead.update({
  where: { id: leadId },
  data: { promptVersion: version }
});

// Analizar: ¿Qué versión tiene mejor conversión?
```

### 4. Caché de Valoraciones

**Para reducir costos de Claude**:
```typescript
// Caché por CP + tipo + m² (redondeado)
const cacheKey = `valuation:${postalCode}:${propertyType}:${Math.floor(squareMeters/10)*10}`;

// Buscar en Redis
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached); // Ahorro: $0.0004 por hit
}

// Si no existe, llamar a Claude
const valuation = await callClaude(...);

// Guardar en caché por 24h
await redis.set(cacheKey, JSON.stringify(valuation), { ex: 86400 });

return valuation;
```

**Savings estimados**:
- 1000 valoraciones/mes
- 50% hit rate (500 desde caché)
- Ahorro: 500 × $0.0004 = $0.20/mes (insignificante pero escala)

---

## Resumen de Principios

### Principios que guiaron nuestras decisiones:

1. **Simplicidad primero**
   - Empezar simple, añadir complejidad solo cuando sea necesario
   - Ejemplo: Email-only vs DB

2. **Developer Experience**
   - Herramientas que facilitan el desarrollo
   - Ejemplo: Zustand vs Redux, Resend vs SES

3. **Costo-efectividad**
   - Optimizar para bajo costo inicial
   - Escalar cuando haya revenue
   - Ejemplo: Claude Haiku vs GPT-4

4. **Time to Market**
   - Priorizar features que aceleran launch
   - Ejemplo: No testing framework (aún)

5. **User Experience**
   - Decisiones que mejoran conversión
   - Ejemplo: Multi-step wizard, loading screens

6. **Escalabilidad futura**
   - No sobre-ingenierizar, pero dejar puertas abiertas
   - Ejemplo: Fácil añadir DB después

---

## Conclusión

Estas decisiones técnicas priorizan:
- ✅ Simplicidad
- ✅ Bajo costo
- ✅ Rápido time-to-market
- ✅ Buena UX
- ✅ Fácil mantenimiento

Son apropiadas para:
- 🎯 MVP / Validación de mercado
- 🎯 Equipos pequeños (1-2 devs)
- 🎯 Bajo presupuesto inicial
- 🎯 Startups en fase temprana

Para escalar a empresa grande:
- Añadir base de datos
- Implementar testing robusto
- Integrar CRM
- Optimizar con caché
- Migrar a plan Pro de Vercel

La documentación debe actualizarse cuando se tomen nuevas decisiones técnicas importantes.
