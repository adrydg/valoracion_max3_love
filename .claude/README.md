# 📁 Directorio `.claude/` - Valoración Max3

> Configuración de Claude Code para el proyecto

---

## 📂 Estructura

```
.claude/
├── README.md              ← Estás aquí
├── .claudeignore          ← Archivos que Claude ignora (velocidad 3x)
├── commands/              ← Comandos rápidos (/comando)
│   ├── analyze.md         → /analyze - Análisis completo calidad
│   ├── quick-wins.md      → /quick-wins - Implementar Fase 1
│   └── seo-check.md       → /seo-check - Auditoría SEO
└── docs/                  ← Documentación del proyecto
    ├── analysis.md        → Análisis completo (Score 6.4/10)
    └── decisions.md       → Decisiones arquitectónicas
```

---

## 🚀 Comandos Disponibles

### `/analyze`
Ejecuta análisis completo de calidad del código

**Qué hace:**
- Audita SEO, Performance, Security, UX/UI
- Identifica problemas críticos
- Genera tabla con scores y prioridades
- Lista Top 5 problemas con soluciones

**Uso:**
```
/analyze
```

**Tiempo:** ~30 segundos

---

### `/quick-wins`
Implementa mejoras Fase 1 (máximo impacto, 30 min)

**Qué hace:**
- Crea sitemap.ts
- Arregla generador referencias (crypto)
- Agrega CSP headers
- Limpia memory leak ObjectURL
- Agrega og-image placeholder

**Uso:**
```
/quick-wins
```

**Impacto:** Score 6.4 → 7.8 (+1.4)

---

### `/seo-check`
Auditoría completa de SEO

**Qué hace:**
- Verifica metadata y meta tags
- Chequea sitemap y robots.txt
- Audita imágenes y alt text
- Valida estructura HTML semántica
- Verifica structured data (JSON-LD)
- Analiza performance SEO

**Uso:**
```
/seo-check
```

**Output:** Score SEO + Top 5 mejoras

---

## 📚 Documentación

### `docs/analysis.md`
Análisis completo del proyecto realizado el 12 Nov 2024

**Contiene:**
- Score por categoría (SEO, Performance, etc)
- Top 10 problemas críticos con ubicación
- Plan de mejora en 4 fases
- Estimación de tiempos e impacto
- Métricas objetivo (Lighthouse, etc)

**Cuándo leer:**
- Antes de empezar mejoras
- Para entender estado actual
- Como referencia de decisiones

---

### `docs/decisions.md`
Decisiones arquitectónicas importantes

**Contiene:**
- Tailwind v3 (por qué no v4)
- Server vs Client Components
- Keys con ID único (nunca índice)
- Referencias con crypto (seguridad)
- Validación Zod (pendiente)
- Memory management ObjectURL

**Cuándo leer:**
- Antes de agregar nuevo código
- Cuando tengas dudas de "¿por qué se hizo así?"
- Para mantener consistencia

---

## 🎯 Flujo de Trabajo Recomendado

### 1. **Análisis Inicial**
```bash
/analyze
```
Revisa el estado actual y problemas

### 2. **Implementar Quick Wins**
```bash
/quick-wins
```
Sigue las instrucciones paso a paso

### 3. **Verificar Mejoras**
```bash
npm run build
/analyze
```
Confirma que el score mejoró

### 4. **Auditoría SEO**
```bash
/seo-check
```
Antes de desplegar a producción

### 5. **Commit cambios**
```bash
git add .
git commit -m "Implementa mejoras Fase 1"
git push
```

---

## ⚡ `.claudeignore` - Qué Hace

Excluye archivos innecesarios para optimizar velocidad:

**Ignora:**
- `node_modules/` (200MB+)
- `.next/` (build artifacts)
- Lockfiles (package-lock, yarn.lock)
- Imágenes binarias (jpg, png, etc)
- Logs y cache

**Resultado:**
- ✅ Claude solo lee TU código (~2MB)
- ✅ Respuestas 3x más rápidas
- ✅ Menos tokens consumidos
- ✅ Contexto más relevante

---

## 📈 Progreso de Mejoras

| Fase | Status | Score | Tiempo |
|------|--------|-------|--------|
| Fase 0: Inicial | ✅ | 6.4/10 | - |
| Fase 1: Quick Wins | ⏳ | 7.8/10 | 30 min |
| Fase 2: Optimizaciones | 📋 | 8.5/10 | 2-3 hrs |
| Fase 3: UX Improvements | 📋 | 9.0/10 | 2 hrs |
| Fase 4: SEO Advanced | 📋 | 9.5/10 | 1.5 hrs |

---

## 🔄 Mantenimiento

### Actualizar análisis
Después de cambios importantes:
```bash
/analyze
# Actualiza docs/analysis.md con nuevos resultados
```

### Documentar decisiones
Cuando tomes decisión arquitectónica importante:
```markdown
// En docs/decisions.md
## X. Nombre de la Decisión

**Decisión:** Qué decidiste

**Razón:** Por qué

**Implementación:** Código ejemplo
```

---

## 💡 Tips

- **Usa comandos frecuentemente:** Son consistentes y rápidos
- **Lee `decisions.md` antes de refactorizar:** Evita revertir decisiones
- **Actualiza análisis después de cada fase:** Mide el progreso
- **Documenta nuevas decisiones:** El futuro tú te lo agradecerá

---

## 🆘 Ayuda

Si tienes dudas:
1. Lee `docs/analysis.md` para contexto
2. Ejecuta `/analyze` para estado actual
3. Revisa `docs/decisions.md` para "¿por qué?"

---

**Creado:** 12 Nov 2024
**Última actualización:** 12 Nov 2024
**Versión:** Mínima (15 min)
