# Decisiones Arquitectónicas - Valoración Max3

> Documentación de decisiones técnicas importantes para mantener consistencia

---

## 1. Tailwind CSS v3 (no v4)

**Decisión:** Usar Tailwind CSS v3.4.x en lugar de v4.x

**Contexto:**
- Next.js 16 viene con Tailwind v4 por defecto
- Shadcn/ui requiere Tailwind v3 con sintaxis tradicional
- V4 usa nueva sintaxis `@import "tailwindcss"` incompatible

**Razón:**
- Compatibilidad con shadcn/ui (49 componentes)
- Sintaxis `@layer base` funciona en v3
- Evitar migración completa de componentes

**Implementación:**
```json
// package.json
"tailwindcss": "^3.4.18"

// postcss.config.mjs
{
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

**Impacto:** Estilos funcionan correctamente, sin errores de compilación

---

## 2. Server Components por Defecto

**Decisión:** Todos los componentes son Server Components salvo explícitamente necesario

**Componentes Client necesarios:**
- `Header.tsx` - Usa useState para mobile menu
- `HeroWizard.tsx` - Usa useState para wizard state
- `Stats.tsx` - Usa useEffect para animaciones
- `ValuationModal.tsx` - Usa useState para formulario

**Componentes Server (debería ser):**
- `Benefits.tsx` ❌ Actualmente Client, puede ser Server
- `Process.tsx` ❌ Actualmente Client, puede ser Server
- `FAQ.tsx` ❌ Actualmente Client, puede ser Server
- `Testimonials.tsx` ❌ Actualmente Client, puede ser Server
- `CTASection.tsx` ✅ Ya es Server
- `Footer.tsx` ✅ Ya es Server

**Razón:**
- Reducir JavaScript en cliente (~30% menos)
- Mejor performance (SSR)
- SEO optimizado (contenido renderizado en servidor)

**Regla:** Solo agregar `"use client"` cuando uses hooks o event handlers

---

## 3. Keys con ID Único (NUNCA índice)

**Decisión:** Arrays deben tener keys con ID único, nunca usar índice

**❌ MAL:**
```tsx
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}
```

**✅ BIEN:**
```tsx
const items = [
  { id: 'unique-1', name: 'Item 1' },
  { id: 'unique-2', name: 'Item 2' }
];

{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

**Razón:**
- Evita re-renders innecesarios
- React optimiza correctamente reconciliation
- Previene bugs cuando se reordena la lista

**Archivos a corregir:**
- `Testimonials.tsx:41`
- `Stats.tsx:92`
- `FAQ.tsx:49`
- `Benefits.tsx:51`
- `Process.tsx:40`
- `ValuationModal.tsx:225`

---

## 4. Referencias Seguras con Crypto

**Decisión:** Generar referencias con `crypto.getRandomValues()` no `Date.now()`

**❌ MAL (actual):**
```tsx
const ref = `VAL-${Date.now().toString().slice(-6)}`;
// Resultado: VAL-123456 (solo 1M combinaciones)
```

**✅ BIEN (implementar):**
```tsx
const generateReference = () => {
  const random = crypto.getRandomValues(new Uint8Array(3));
  const hex = Array.from(random)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `VAL-${hex.toUpperCase()}`;
};
// Resultado: VAL-A3F2E1 (16M+ combinaciones)
```

**Razón:**
- Seguridad: imposible predecir referencias
- Único: probabilidad colisión casi cero
- Estándar: crypto API es segura

**Archivo:** `app/confirmacion/page.tsx:94`

---

## 5. Validación con Zod (TODO)

**Decisión:** Usar Zod para validación de formularios

**Implementación pendiente:**
```typescript
// lib/schemas.ts
import { z } from 'zod';

export const ValuationFormSchema = z.object({
  address: z.string().min(5, "Dirección requerida"),
  size: z.enum(["small", "medium", "large", "xlarge"]),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\+?[0-9]{9,}$/, "Teléfono inválido"),
  photos: z.array(z.instanceof(File)).min(1, "Mínimo 1 foto")
});
```

**Razón:**
- Type-safe: tipos automáticos desde schema
- Consistente: misma validación cliente/servidor
- Mensajes: error messages claros para usuario

**Archivo:** `components/ValuationModal.tsx` (pendiente implementar)

---

## 6. Constantes Centralizadas (TODO)

**Decisión:** Mover arrays de configuración a `/lib/constants.ts`

**Actual (disperso):**
```tsx
// En HeroWizard.tsx
const propertyTypes = [...];

// En ValuationModal.tsx
const propertyTypes = [...]; // Duplicado!
```

**Objetivo:**
```typescript
// lib/constants.ts
export const PROPERTY_TYPES = [...];
export const URGENCY_LEVELS = [...];
export const VALUATION_MESSAGES = [...];

// Usar en componentes
import { PROPERTY_TYPES } from '@/lib/constants';
```

**Razón:**
- DRY: sin duplicación
- Mantenible: cambios en un solo lugar
- Consistente: mismos valores en toda la app

---

## 7. Memory Management ObjectURL

**Decisión:** Limpiar ObjectURLs creados con `createObjectURL`

**Problema actual:**
```tsx
// ValuationModal.tsx:62
const url = URL.createObjectURL(file);
setPhotos([...photos, url]);
// ❌ URL nunca se limpia = memory leak
```

**Solución:**
```tsx
useEffect(() => {
  return () => {
    photos.forEach(photo => {
      if (photo.startsWith('blob:')) {
        URL.revokeObjectURL(photo);
      }
    });
  };
}, [photos]);
```

**Razón:**
- Performance: libera memoria
- Estándar: buenas prácticas Web API
- Previene: acumulación 2-5MB por sesión

---

## 8. Content Security Policy

**Decisión:** Agregar headers de seguridad en `next.config.ts`

**Implementar:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff"
        },
        {
          key: "X-Frame-Options",
          value: "DENY"
        }
      ]
    }
  ]
};
```

**Razón:**
- Seguridad: previene XSS
- Estándar: OWASP recomendaciones
- Protección: clickjacking, MIME sniffing

---

## Changelog

| Fecha | Decisión | Implementado |
|-------|----------|--------------|
| 12 Nov 2024 | Tailwind v3 | ✅ Sí |
| 12 Nov 2024 | Server Components | ⚠️ Parcial |
| 12 Nov 2024 | Keys únicas | ❌ Pendiente |
| 12 Nov 2024 | Referencias crypto | ❌ Pendiente |
| 12 Nov 2024 | Validación Zod | ❌ Pendiente |
| 12 Nov 2024 | Constants centralizadas | ❌ Pendiente |
| 12 Nov 2024 | ObjectURL cleanup | ❌ Pendiente |
| 12 Nov 2024 | CSP headers | ❌ Pendiente |

---

**Última actualización:** 12 Nov 2024
