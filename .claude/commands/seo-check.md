Ejecuta una auditoría completa de SEO del proyecto.

## Checklist de Verificación

### 1. Metadata y Meta Tags

**Verificar en `app/layout.tsx`:**
- ✅ title (default + template)
- ✅ description (>150 caracteres, <160)
- ✅ keywords array con términos relevantes
- ✅ metadataBase con URL producción
- ✅ canonical tags
- ✅ Open Graph (og:title, og:description, og:image, og:url)
- ✅ Twitter Cards (twitter:card, twitter:title, etc)
- ✅ robots configuration

**Verificar en páginas individuales:**
- `app/page.tsx` - ¿exporta metadata?
- `app/confirmacion/page.tsx` - ¿exporta metadata?
- `app/not-found.tsx` - ¿exporta metadata?

---

### 2. Sitemap y Robots

**Verificar:**
- [ ] Existe `app/sitemap.ts` o `app/sitemap.xml`
- [ ] Sitemap incluye todas las URLs públicas
- [ ] lastModified actualizado
- [ ] priority y changeFrequency apropiados
- [ ] Existe `public/robots.txt`
- [ ] robots.txt referencia sitemap

**Comando para probar:**
```bash
# En desarrollo
curl http://localhost:3000/sitemap.xml

# Verificar robots.txt
cat public/robots.txt
```

---

### 3. Imágenes y Assets

**Buscar en todos los componentes:**

```bash
# Buscar tags <img> que deberían ser <Image>
grep -r "<img" app/ components/ --include="*.tsx"

# Buscar imágenes sin alt text
grep -r "<img[^>]*src" app/ components/ --include="*.tsx" | grep -v "alt="
```

**Verificar:**
- [ ] Todas las imágenes usan `next/image`
- [ ] Alt text descriptivo (no genérico)
- [ ] Lazy loading habilitado
- [ ] Sizes apropiados para responsive
- [ ] Formato WebP cuando sea posible

---

### 4. Estructura Semántica HTML

**Verificar en cada página:**

```bash
# Buscar múltiples h1 (debe haber solo 1 por página)
grep -r "<h1" app/ components/ --include="*.tsx"

# Verificar jerarquía (h2 debe seguir h1, etc)
grep -rE "<h[1-6]" app/page.tsx
```

**Checklist:**
- [ ] Un solo `<h1>` por página
- [ ] Jerarquía lógica (h1 → h2 → h3, sin saltos)
- [ ] Semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`)
- [ ] Landmarks ARIA apropiados

---

### 5. Links y URLs

**Verificar:**
```bash
# Buscar links con href="#" (no funcionales)
grep -r 'href="#"' components/ --include="*.tsx"

# Buscar links externos sin rel="noopener"
grep -r 'target="_blank"' components/ --include="*.tsx" | grep -v 'rel="noopener'
```

**Checklist:**
- [ ] Links funcionales (no href="#")
- [ ] Links externos con `rel="noopener noreferrer"`
- [ ] URLs limpias (sin query params innecesarios)
- [ ] Breadcrumbs implementados
- [ ] Internal linking strategy

---

### 6. Structured Data (JSON-LD)

**Verificar si existe:**
- [ ] LocalBusiness schema
- [ ] Organization schema
- [ ] RealEstateAgent schema
- [ ] FAQPage schema (si hay FAQ)
- [ ] BreadcrumbList schema

**Ejemplo esperado en layout.tsx:**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "Valoración Max3",
      url: "https://valoracionmax3.com",
      // ... más datos
    }),
  }}
/>
```

---

### 7. Performance SEO

**Verificar:**
- [ ] Core Web Vitals optimizados
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Lighthouse SEO score > 90
- [ ] Mobile-friendly (responsive)
- [ ] HTTPS enabled (en producción)
- [ ] Canonical tags para evitar duplicados

---

### 8. Content SEO

**Verificar en cada página:**
- [ ] Contenido único (no duplicado)
- [ ] Keywords naturalmente integradas
- [ ] Long-tail keywords en headings
- [ ] Párrafos descriptivos (>50 palabras)
- [ ] CTA claro en cada página

---

## Output Esperado

Genera un reporte con esta estructura:

### Score General SEO: X/100

| Categoría | Status | Problemas |
|-----------|--------|-----------|
| Metadata | ✅/⚠️/❌ | Lista |
| Sitemap | ✅/⚠️/❌ | Lista |
| Imágenes | ✅/⚠️/❌ | Lista |
| HTML Semántico | ✅/⚠️/❌ | Lista |
| Links | ✅/⚠️/❌ | Lista |
| Structured Data | ✅/⚠️/❌ | Lista |
| Performance | ✅/⚠️/❌ | Lista |
| Content | ✅/⚠️/❌ | Lista |

### Top 5 Mejoras SEO Recomendadas

Para cada mejora:
1. Descripción del problema
2. Archivo:línea afectado
3. Solución con código
4. Impacto estimado en ranking

### Palabras Clave Detectadas

Lista de keywords encontradas en el contenido y sugerencias de optimización.

---

## Testing SEO

Después de implementar mejoras:

```bash
# Lighthouse (Chrome DevTools)
# Performance, Accessibility, Best Practices, SEO

# Google Search Console
# Verificar indexación, errores de crawl

# Rich Results Test
https://search.google.com/test/rich-results
```

---

## Recursos

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org RealEstate](https://schema.org/RealEstateAgent)

---

**Consulta `.claude/docs/analysis.md` para contexto adicional**
