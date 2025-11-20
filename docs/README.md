# 📚 Documentación del Proyecto ValoracionMax

## 📋 Índice de Documentación

### 🎯 Analytics y Tracking

#### [📊 Implementación GTM y GA4](./IMPLEMENTACION_GTM_GA4.md)
**Documentación completa de la implementación actual**
- Arquitectura y componentes
- Configuración de Google Tag Manager
- Configuración de Google Analytics 4
- Eventos personalizados y conversiones
- Métricas y dashboards recomendados
- Troubleshooting

**Estado:** ✅ Implementado y Verificado
**Tag:** `v2.0.0-gtm`

---

#### [🚀 Guía de Implementación GTM](./GUIA_IMPLEMENTACION_GTM.md)
**Guía paso a paso para replicar en otros proyectos**
- Checklist de implementación
- Código reutilizable
- Comandos de verificación
- Problemas comunes y soluciones
- Buenas prácticas

**Uso:** Template para nuevos proyectos
**Compatibilidad:** Next.js 14+, 15+, 16+

---

## 🏗️ Estructura del Proyecto

```
valoracion_max3/
├── app/
│   ├── layout.tsx          # Layout principal con GTM
│   └── page.tsx            # Página principal
├── components/
│   ├── GoogleTagManager.tsx # Componente GTM ⭐
│   └── ui/                  # Componentes UI
├── docs/                    # 📚 Documentación (estás aquí)
│   ├── README.md
│   ├── IMPLEMENTACION_GTM_GA4.md
│   └── GUIA_IMPLEMENTACION_GTM.md
└── .env.local              # Variables de entorno
```

---

## 🔑 Variables de Entorno

### Requeridas para Analytics:

```bash
# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-****  # ID del contenedor GTM
```

### Otras Variables del Proyecto:

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-***  # Claude API para valoraciones
RESEND_API_KEY=re_***          # Resend para emails

# Emails
ADMIN_EMAIL=admin@ejemplo.com
FROM_EMAIL=noreply@ejemplo.com

# Feature Flags
NEXT_PUBLIC_NEW_WIZARD=true    # Habilitar wizard V2
```

---

## 🚀 Quick Start

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

### Verificar GTM

```bash
# Verificar que GTM está en el HTML generado
npm run build
cat .next/server/app/index.html | grep "GTM-"
```

---

## 📦 Tecnologías Principales

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.0.2 | Framework React |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.x | Estilos |
| Anthropic API | - | Valoraciones IA |
| Resend | - | Email Service |

---

## 🎯 Características Principales

### 1. Sistema de Valoración Inmobiliaria
- Wizard interactivo (2 versiones: 3 pasos / 6 pasos)
- IA con Claude (Anthropic) para análisis
- Datos de múltiples fuentes
- Valoración en 2 minutos

### 2. Analytics y Tracking
- ✅ Google Tag Manager implementado
- 📊 Google Analytics 4 (configurar desde GTM)
- 🎯 Google Ads (preparado)
- 📈 Eventos personalizados

### 3. Generación de Leads
- Formulario de contacto
- Email notifications (Resend)
- Panel de administración

---

## 🔖 Tags de Git

### Tags Recientes:

| Tag | Descripción | Fecha |
|-----|-------------|-------|
| `v2.0.0-gtm` | Implementación GTM y GA4 | 2025-11-20 |
| `v1.9.0` | Última versión pre-GTM | - |

### Ver todos los tags:
```bash
git tag -l
```

### Checkout de un tag específico:
```bash
git checkout v2.0.0-gtm
```

---

## 📊 Monitorización

### Servicios Activos:

- **Google Tag Manager:** https://tagmanager.google.com/
- **Google Analytics 4:** https://analytics.google.com/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Dominio:** https://valoracionmax.es

### Health Checks:

```bash
# Verificar sitio está online
curl -I https://valoracionmax.es

# Verificar GTM está cargando
curl -sL https://valoracionmax.es | grep "GTM-"

# Ver logs de Vercel
vercel logs
```

---

## 🐛 Troubleshooting

### Problema: GTM no carga

Ver documentación detallada en:
- [IMPLEMENTACION_GTM_GA4.md - Troubleshooting](./IMPLEMENTACION_GTM_GA4.md#-troubleshooting)
- [GUIA_IMPLEMENTACION_GTM.md - Problemas Comunes](./GUIA_IMPLEMENTACION_GTM.md#-problemas-comunes-y-soluciones)

### Quick Fix:

```bash
# 1. Verificar variable de entorno en Vercel
vercel env ls | grep GTM

# 2. Si no está, agregarla
echo "GTM-****" | vercel env add NEXT_PUBLIC_GTM_ID production

# 3. Redeploy
vercel --force --prod --yes
```

---

## 🤝 Contribución

### Agregar Nueva Documentación:

1. Crear archivo `.md` en `/docs/`
2. Agregar entrada en este README
3. Commit con mensaje descriptivo
4. Crear tag si es feature mayor

### Formato de Commits:

```bash
git commit -m "Tipo: descripción breve

- Detalle 1
- Detalle 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📞 Soporte

### Para Consultas Técnicas:

1. **Primero:** Revisar documentación en `/docs/`
2. **Segundo:** Buscar en troubleshooting guides
3. **Tercero:** Verificar logs de Vercel
4. **Último recurso:** Contactar al equipo

### Recursos Útiles:

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GTM Developer Guide](https://developers.google.com/tag-manager)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)

---

## 📅 Última Actualización

**Fecha:** 2025-11-20
**Versión:** v2.0.0-gtm
**Estado:** ✅ Producción
**Dominio:** https://valoracionmax.es

---

## ✅ Status del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Sitio Web | ✅ Online | valoracionmax.es |
| GTM | ✅ Activo | Container configurado |
| GA4 | ⚠️ Pendiente | Configurar desde GTM |
| Google Ads | ⏳ Preparado | Configurar cuando necesario |
| Email Service | ✅ Activo | Resend configurado |
| IA Valoración | ✅ Activo | Claude API |

---

**Nota:** Esta documentación se actualiza regularmente. Última revisión: 2025-11-20
