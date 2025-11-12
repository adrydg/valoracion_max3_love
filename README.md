# Valoración Max3 - Plataforma de Captación de Vendedores Inmobiliarios

## Descripción del Proyecto

Plataforma de marketing digital enfocada en la captación y conversión de vendedores de pisos mediante estrategias de generación y compra de leads cualificados. Optimizada para SEO y conversión, maximizando la visibilidad orgánica y el retorno de inversión en campañas digitales.

## Modelo de Negocio

### Estrategia de Captación
- **Lead Generation**: Formularios optimizados para captar vendedores interesados
- **SEO Local**: Posicionamiento en búsquedas de "vender piso", "tasación vivienda", "valoración inmueble"
- **Lead Purchase**: Integración con plataformas de compra de leads inmobiliarios
- **Conversion Funnel**: Embudo optimizado desde landing hasta contacto cualificado

### Objetivos Principales
1. Captar vendedores de pisos mediante tráfico orgánico (SEO)
2. Generar leads cualificados con alta intención de venta
3. Optimizar el coste por adquisición (CPA) de leads
4. Integrar sistemas de compra de leads externos
5. Maximizar la tasa de conversión de landing pages

## Stack Tecnológico

### Frontend
- **Next.js 15** (App Router) - Framework React con SSR/SSG para SEO óptimo
- **TypeScript** - Tipado estático para código mantenible
- **Tailwind CSS** - Diseño responsive y optimizado
- **React Hook Form** - Gestión eficiente de formularios
- **Zod** - Validación de schemas

### Backend & Database
- **Supabase** (planificado)
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Edge Functions
  - Storage para documentación

### SEO & Analytics
- **Next.js Metadata API** - Meta tags dinámicos
- **JSON-LD Schema Markup** - Datos estructurados para buscadores
- **Sitemap.xml automático** - Indexación optimizada
- **Google Analytics 4** - Tracking de conversiones
- **Google Tag Manager** - Gestión de tags y eventos
- **Hotjar/Microsoft Clarity** - Análisis de comportamiento

### Marketing & Leads
- **Webhooks** - Integración con CRMs (HubSpot, Salesforce)
- **Email Marketing** - Automatizaciones de seguimiento
- **Lead Scoring** - Cualificación automática de leads
- **A/B Testing** - Optimización continua de conversión

## Mejores Prácticas SEO Implementadas

### Technical SEO
- ✅ Server-Side Rendering (SSR) para contenido indexable
- ✅ Static Site Generation (SSG) para páginas estáticas
- ✅ Meta tags optimizados (title, description, OG tags)
- ✅ Canonical URLs
- ✅ Sitemap XML automático
- ✅ Robots.txt configurado
- ✅ Estructura de URLs semánticas
- ✅ Breadcrumbs con schema markup
- ✅ Core Web Vitals optimizados (LCP, FID, CLS)
- ✅ Lazy loading de imágenes
- ✅ Compresión de assets

### On-Page SEO
- ✅ Títulos H1-H6 jerárquicos
- ✅ Alt text descriptivo en imágenes
- ✅ Internal linking estratégico
- ✅ Contenido optimizado para palabras clave long-tail
- ✅ Schema.org markup (LocalBusiness, RealEstateAgent, FAQPage)

### Local SEO
- ✅ Google Business Profile optimization
- ✅ Geolocalización de contenido
- ✅ Reviews y testimonios con schema markup
- ✅ Páginas específicas por ciudad/zona

### Palabras Clave Objetivo
```
- "vender piso rápido [ciudad]"
- "valoración vivienda gratis [ciudad]"
- "tasación piso online [ciudad]"
- "cuánto vale mi piso [ciudad]"
- "vender casa urgente [ciudad]"
- "compramos tu piso [ciudad]"
```

## Arquitectura del Proyecto

```
voloracion_max3/
├── app/
│   ├── (marketing)/          # Grupo de rutas de marketing
│   │   ├── page.tsx          # Landing principal
│   │   ├── vender-piso/      # Páginas SEO
│   │   ├── valoracion/       # Formulario valoración
│   │   └── gracias/          # Thank you page
│   ├── api/
│   │   ├── leads/            # API endpoints para leads
│   │   ├── webhooks/         # Webhooks externos
│   │   └── analytics/        # Tracking personalizado
│   ├── layout.tsx            # Layout root con SEO base
│   └── sitemap.ts            # Generación dinámica de sitemap
├── components/
│   ├── forms/                # Formularios de captación
│   ├── seo/                  # Componentes SEO (Schema, etc)
│   ├── landing/              # Secciones de landing pages
│   └── ui/                   # Componentes UI reutilizables
├── lib/
│   ├── supabase/             # Cliente Supabase
│   ├── analytics/            # Helpers de analytics
│   ├── seo/                  # Utilidades SEO
│   └── validations/          # Schemas de validación
├── public/
│   ├── images/               # Imágenes optimizadas
│   └── robots.txt            # Configuración crawlers
└── styles/
    └── globals.css           # Estilos globales + Tailwind
```

## Getting Started

### Requisitos Previos
- Node.js 18+
- npm/yarn/pnpm
- Cuenta Supabase (próximamente)

### Instalación

```bash
# Clonar el repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

```bash
# Supabase (próximamente)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Integraciones
HUBSPOT_API_KEY=your_hubspot_key
WEBHOOK_SECRET=your_webhook_secret

# Email
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@yourdomain.com
```

## Scripts Disponibles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificar tipos TypeScript
```

## Roadmap de Desarrollo

### Fase 1: MVP (Semanas 1-2)
- [ ] Landing page optimizada para SEO
- [ ] Formulario de valoración con validación
- [ ] Thank you page con tracking
- [ ] Integración básica con email
- [ ] Google Analytics 4 setup

### Fase 2: Backend & Database (Semanas 3-4)
- [ ] Configuración Supabase
- [ ] Tablas: leads, properties, users
- [ ] Auth system (admin panel)
- [ ] API endpoints para leads
- [ ] Dashboard admin básico

### Fase 3: SEO & Content (Semanas 5-6)
- [ ] Páginas SEO por ciudad
- [ ] Blog de contenido inmobiliario
- [ ] Schema markup completo
- [ ] Optimización Core Web Vitals
- [ ] Link building interno

### Fase 4: Marketing & Conversión (Semanas 7-8)
- [ ] A/B testing de landing pages
- [ ] Lead scoring automático
- [ ] Integración CRM (HubSpot)
- [ ] Email automation
- [ ] Remarketing pixels

### Fase 5: Escalado (Semanas 9-12)
- [ ] Multi-ciudad/región
- [ ] Calculadora de valoración avanzada
- [ ] Chat en vivo
- [ ] Área de cliente
- [ ] Integración con plataformas de compra de leads

## Métricas Clave (KPIs)

### SEO
- Posiciones en Google (top 10 palabras clave)
- Tráfico orgánico mensual
- Domain Authority (DA)
- Backlinks de calidad

### Conversión
- Tasa de conversión landing → lead (objetivo: 3-5%)
- Coste por lead (CPL)
- Calidad de leads (scoring)
- Leads cualificados al mes

### Performance
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Lighthouse Score > 90
- Time to First Byte (TTFB) < 600ms

## Deployment

### Vercel (Recomendado)
```bash
vercel --prod
```

### Variables de entorno en producción
Configurar todas las variables de entorno en Vercel Dashboard

### Dominios y SSL
- Dominio principal: [tu-dominio.com]
- SSL automático con Vercel
- Redirección www → non-www (o viceversa)

## Recursos Adicionales

### Documentación Técnica
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### SEO & Marketing
- [Google Search Central](https://developers.google.com/search)
- [Schema.org RealEstate](https://schema.org/RealEstateAgent)
- [Core Web Vitals](https://web.dev/vitals/)

## Licencia

[MIT / Propietaria - Por definir]

---

**Desarrollado con enfoque en SEO, conversión y escalabilidad**
