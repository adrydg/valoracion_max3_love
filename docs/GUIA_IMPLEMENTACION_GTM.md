# 📊 Guía de Implementación de Google Tag Manager en Next.js

## 📋 Resumen

Esta guía explica cómo implementar Google Tag Manager (GTM) correctamente en proyectos Next.js con App Router, siguiendo las buenas prácticas y evitando los errores más comunes.

---

## ✅ Checklist de Implementación

- [ ] Crear componente `GoogleTagManager.tsx`
- [ ] Configurar variable de entorno local `.env.local`
- [ ] Actualizar `app/layout.tsx`
- [ ] Configurar variable de entorno en Vercel
- [ ] Hacer build y verificar localmente
- [ ] Deploy a producción
- [ ] Verificar GTM en producción

---

## 🚀 Implementación Paso a Paso

### Paso 1: Crear el Componente GTM

Crear el archivo `components/GoogleTagManager.tsx`:

```tsx
/**
 * Google Tag Manager
 *
 * Este componente carga GTM de manera optimizada según las instrucciones oficiales de Google.
 * Los tags (GA4, Google Ads, conversiones, etc.) se configuran en la interfaz de GTM.
 *
 * Container ID: Se configura mediante variable de entorno NEXT_PUBLIC_GTM_ID
 */

const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID || '').trim();

export function GoogleTagManager() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <script
      id="gtm-script"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

export function GoogleTagManagerNoScript() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
```

---

### Paso 2: Configurar Variable de Entorno Local

Agregar al archivo `.env.local` (en la raíz del proyecto):

```bash
# Google Tag Manager
# Container ID: GTM-XXXXXXX (reemplazar con tu ID real)
# Gestiona todos los tags (GA4, Google Ads, conversiones, etc.) desde el panel de GTM
# Obtén tu contenedor en: https://tagmanager.google.com/
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

**⚠️ IMPORTANTE:** Reemplaza `GTM-XXXXXXX` con tu ID real de GTM.

---

### Paso 3: Actualizar Layout Principal

Modificar `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
// ... otros imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager - Gestiona todos los tags (GA4, Google Ads, etc.) */}
        <GoogleTagManager />
      </head>
      <body>
        {/* Google Tag Manager (noscript) - Fallback para usuarios sin JavaScript */}
        <GoogleTagManagerNoScript />

        {children}
      </body>
    </html>
  );
}
```

---

### Paso 4: Verificar Implementación Local

```bash
# 1. Build del proyecto
npm run build

# 2. Verificar que GTM está en el HTML generado
cat .next/server/app/index.html | grep "GTM-"

# Deberías ver algo como:
# GTM-XXXXXXX (tu ID)
# gtm-script
# googletagmanager
```

Si ves tu GTM ID, ¡la implementación local es correcta! ✅

---

### Paso 5: Configurar Variable de Entorno en Vercel

**⚠️ PASO CRÍTICO:** Las variables de `.env.local` NO se suben a Vercel.

#### Opción A: Desde la CLI de Vercel

```bash
# En la raíz del proyecto
echo "GTM-XXXXXXX" | vercel env add NEXT_PUBLIC_GTM_ID production

# También puedes agregarla para preview y development
echo "GTM-XXXXXXX" | vercel env add NEXT_PUBLIC_GTM_ID preview
echo "GTM-XXXXXXX" | vercel env add NEXT_PUBLIC_GTM_ID development
```

#### Opción B: Desde el Panel Web de Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agregar nueva variable:
   - **Name:** `NEXT_PUBLIC_GTM_ID`
   - **Value:** `GTM-XXXXXXX` (tu ID real)
   - **Environment:** Marca Production, Preview, Development
4. Guardar

---

### Paso 6: Deploy a Producción

```bash
# Desde la raíz del proyecto
vercel --prod --yes
```

**Importante:** Si la variable de entorno ya existía pero la cambiaste, haz un nuevo deployment:
```bash
vercel --force --prod --yes
```

---

### Paso 7: Verificar en Producción

#### Método 1: Verificación con curl (Más confiable)

```bash
# Verifica en el deployment directo de Vercel
curl -sL "https://tu-proyecto-abc123.vercel.app" | grep "GTM-" | head -5

# Deberías ver:
# gtm-script
# googletagmanager
# GTM-XXXXXXX
```

#### Método 2: Herramientas de Desarrollador

1. Abre tu sitio en producción
2. Abre DevTools (F12)
3. Ve a la pestaña "Network"
4. Busca una petición a `googletagmanager.com/gtm.js?id=GTM-XXXXXXX`

#### Método 3: Google Tag Assistant

1. Instala la extensión "Tag Assistant Legacy" en Chrome
2. Abre tu sitio
3. Haz clic en la extensión
4. Deberías ver tu contenedor GTM detectado

---

## ❌ Problemas Comunes y Soluciones

### Problema 1: GTM no aparece en producción pero sí localmente

**Causa:** Variable de entorno no configurada en Vercel

**Solución:**
```bash
# Verificar variables en Vercel
vercel env ls

# Si no está, agregarla
echo "GTM-XXXXXXX" | vercel env add NEXT_PUBLIC_GTM_ID production

# Redeploy
vercel --prod --yes
```

---

### Problema 2: El componente retorna null

**Causa:** La variable `NEXT_PUBLIC_GTM_ID` está vacía o tiene espacios

**Solución:**
```bash
# Verificar el valor de la variable
vercel env pull
cat .env.local | grep GTM

# Asegurarse de que no hay espacios extras
# ❌ NEXT_PUBLIC_GTM_ID= GTM-XXXXXXX
# ✅ NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

---

### Problema 3: GTM se carga tarde (después de la hidratación)

**Causa:** Usar `Script` component con `strategy="afterInteractive"`

**Solución:** Usar el componente que creamos, que usa `dangerouslySetInnerHTML` y se renderiza en el HTML estático.

---

### Problema 4: Conflicto con CSP (Content Security Policy)

**Causa:** Headers de seguridad bloquean scripts de dominios externos

**Solución:** Agregar a `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
              "frame-src https://www.googletagmanager.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 📝 Buenas Prácticas

### ✅ DO (Hacer)

1. ✅ **Usar variable de entorno** para el GTM ID
2. ✅ **Configurar la variable en Vercel** antes de deploy
3. ✅ **Usar script inline** con `dangerouslySetInnerHTML` para SSG
4. ✅ **Incluir el noscript fallback** para usuarios sin JS
5. ✅ **Verificar localmente** antes de deploy
6. ✅ **Gestionar tags desde GTM**, no desde código

### ❌ DON'T (No hacer)

1. ❌ **NO hardcodear** el GTM ID en el código
2. ❌ **NO usar** `next/script` con `afterInteractive` en páginas estáticas
3. ❌ **NO olvidar** configurar la variable en Vercel
4. ❌ **NO subir** `.env.local` a git (debe estar en `.gitignore`)
5. ❌ **NO usar** `@next/third-parties` para proyectos con SSG

---

## 🎯 Ventajas de Esta Implementación

| Característica | Beneficio |
|----------------|-----------|
| 🚀 **HTML Estático** | GTM carga antes de la hidratación |
| 🔒 **Seguro** | ID en variable de entorno, no en código |
| 📦 **Sin dependencias** | No requiere librerías externas |
| ⚡ **Compatible SSG** | Funciona con páginas estáticas |
| 🎨 **Flexible** | Tags actualizables desde panel GTM |
| 🔄 **Reutilizable** | Mismo componente para todos los proyectos |

---

## 🔧 Comandos de Referencia Rápida

```bash
# Verificar implementación local
npm run build
cat .next/server/app/index.html | grep "GTM-"

# Configurar variable en Vercel
echo "GTM-XXXXXXX" | vercel env add NEXT_PUBLIC_GTM_ID production

# Deploy a producción
vercel --prod --yes

# Verificar en producción
curl -sL "https://tu-dominio.com" | grep "GTM-" | head -5

# Ver variables configuradas en Vercel
vercel env ls

# Descargar variables de Vercel
vercel env pull
```

---

## 📚 Referencias

- [Google Tag Manager - Guía Oficial](https://developers.google.com/tag-manager)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🆘 Troubleshooting

Si después de seguir todos los pasos GTM sigue sin funcionar:

1. **Verificar proyecto correcto:** Asegúrate de estar en el proyecto que apunta a tu dominio
   ```bash
   vercel project ls | grep "tu-dominio.com"
   ```

2. **Limpiar caché de Vercel:**
   ```bash
   vercel --force --prod --yes
   ```

3. **Verificar que el deployment es reciente:**
   ```bash
   vercel ls | head -5
   ```

4. **Revisar logs del build:**
   ```bash
   vercel logs tu-deployment-url
   ```

---

## ✅ Checklist Final

Antes de considerar la implementación completa, verifica:

- [ ] El componente `GoogleTagManager.tsx` está creado
- [ ] Variable `NEXT_PUBLIC_GTM_ID` en `.env.local`
- [ ] Layout actualizado con los componentes GTM
- [ ] Build local exitoso y GTM visible en HTML
- [ ] Variable configurada en Vercel (production)
- [ ] Deployment a producción exitoso
- [ ] GTM ID visible al hacer curl al dominio de producción
- [ ] Google Tag Assistant detecta el contenedor
- [ ] Panel de GTM muestra tráfico en tiempo real

---

**Última actualización:** 2025-11-20
**Versión:** 1.0
**Compatibilidad:** Next.js 14+, Next.js 15+, Next.js 16+
