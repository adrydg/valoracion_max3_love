Ejecuta un análisis completo de calidad del proyecto en `/Users/adriandurandez/voloracion_max3`.

## Análisis a Realizar

### 1. SEO
- Verifica metadata en todas las páginas
- Busca existencia de sitemap.ts/xml
- Revisa uso de next/image vs img tags
- Valida estructura de headings (h1, h2, h3)
- Chequea alt text en imágenes
- Verifica robots.txt

### 2. Performance
- Identifica componentes que deberían ser Server Components
- Busca uso innecesario de "use client"
- Encuentra componentes UI sin usar en `/components/ui/`
- Verifica uso de dynamic imports
- Busca memory leaks (ObjectURL, listeners, etc)

### 3. Code Quality
- Busca keys usando índice en lugar de ID único
- Identifica falta de useCallback/useMemo en handlers
- Encuentra duplicación de código
- Verifica tipado TypeScript (busca `any`)
- Revisa constantes hardcodeadas que deberían estar en `/lib/constants.ts`

### 4. Security
- Verifica generación de referencias/IDs
- Busca exposición de datos sensibles
- Chequea validación de inputs
- Verifica CSP headers en next.config.ts
- Busca validación de archivos upload

### 5. UX/UI
- Busca estados de loading faltantes
- Verifica manejo de errores (try/catch, error boundaries)
- Chequea validación de formularios (Zod schemas)
- Verifica accesibilidad (aria-labels, roles, semantic HTML)
- Busca feedback visual (toast notifications)

## Output Esperado

Genera una tabla con:

| Categoría | Score (0-10) | Problemas Críticos | Prioridad |
|-----------|--------------|-------------------|-----------|
| SEO | X/10 | Lista de issues | Alta/Media/Baja |
| Performance | X/10 | Lista de issues | Alta/Media/Baja |
| Code Quality | X/10 | Lista de issues | Alta/Media/Baja |
| Security | X/10 | Lista de issues | Alta/Media/Baja |
| UX/UI | X/10 | Lista de issues | Alta/Media/Baja |

Luego lista los **Top 5 problemas críticos** con:
- Archivo:línea exacta
- Descripción del problema
- Solución sugerida con código
- Impacto estimado (Alto/Medio/Bajo)

Finalmente, referencia el archivo `.claude/docs/analysis.md` para contexto adicional.
