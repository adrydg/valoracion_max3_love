# Documentación: Modal y Scroll - Optimización Mobile

## Problema Original

El modal wizard no ocupaba toda la pantalla en móvil, dejando visible el fondo de la página en la parte inferior (se veía el texto "5000+ Propiedades vendidas" y "12.000+ Clientes satisfechos"). Esto creaba una experiencia confusa para el usuario.

## Solución Implementada

### 1. Modal a Pantalla Completa (`ValuationModal.tsx`)

**Archivo**: `/components/ValuationModal.tsx`

#### ANTES:
```tsx
<DialogContent
  className="max-w-2xl p-0 gap-0"
  style={{
    maxHeight: 'calc(var(--vh, 1vh) * 90)',  // ❌ Solo 90% altura
    height: 'auto',
  }}
>
```

#### DESPUÉS:
```tsx
<DialogContent
  className="max-w-2xl p-0 gap-0 h-[100dvh] max-h-[100dvh]"  // ✅ 100% pantalla
  style={{
    maxHeight: 'calc(var(--vh, 1vh) * 100)',  // ✅ 100% con fallback
    height: '100%',
  }}
>
```

#### Explicación técnica:

1. **`h-[100dvh]`**: Usa la unidad `dvh` (Dynamic Viewport Height)
   - `dvh` se adapta automáticamente cuando aparece/desaparece el teclado móvil
   - Diferencia con `vh`: `100vh` puede causar overflow cuando aparece el teclado
   - `100dvh` = altura real visible de la pantalla en cada momento

2. **`max-h-[100dvh]`**: Limita la altura máxima
   - Previene que el modal crezca más allá de la pantalla
   - Fuerza el scroll interno cuando el contenido es muy largo

3. **`height: '100%'`**: Fallback para navegadores antiguos
   - Si no soportan `dvh`, usa `100%` del contenedor

4. **CSS Variable `--vh`**: Backup manual para Samsung Browser y otros
   - Se calcula con JavaScript: `window.innerHeight * 0.01`
   - Se actualiza en eventos: `resize`, `orientationchange`, `visualViewport.resize`
   - Soporta casos edge como teclado virtual, cambio orientación

---

### 2. Sistema de Scroll con Header Fijo

**Estructura del modal**:

```tsx
<DialogContent className="h-[100dvh]">  {/* Contenedor altura fija */}
  <DialogTitle className="sr-only">...</DialogTitle>

  {/* Header fijo - NO scrollea */}
  {isWizardStep && (
    <div className="sticky top-0 z-10 bg-background border-b p-4">
      <Progress value={progress} />
      <p>Paso X de Y</p>
    </div>
  )}

  {/* Contenido scrolleable */}
  <div className="overflow-y-auto flex-1">  {/* ✅ Aquí está el scroll */}
    {currentStep === 1 && <Step1Ubicacion />}
    {currentStep === 2 && <Step2Caracteristicas />}
    ...
  </div>
</DialogContent>
```

#### Cómo funciona:

1. **`DialogContent`** = Contenedor con altura fija (`100dvh`)
   - No puede crecer ni hacer scroll de la página completa

2. **Header con `sticky top-0`**:
   - Se mantiene visible arriba cuando haces scroll
   - Muestra siempre el progreso del wizard

3. **`overflow-y-auto flex-1`**:
   - `overflow-y-auto`: Crea scroll vertical interno cuando el contenido es largo
   - `flex-1`: Ocupa todo el espacio disponible (100% - header - footer)
   - El scroll es SOLO del contenido, NO de toda la página

#### Resultado:
- ✅ Header siempre visible
- ✅ Scroll solo del contenido del paso actual
- ✅ Botones Atrás/Continuar siempre accesibles (en cada paso)
- ✅ No se ve el fondo de la página

---

### 3. Botón X Cerrar Visible (`dialog.tsx`)

**Archivo**: `/components/ui/dialog.tsx`

#### ANTES:
```tsx
<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ...">
  <X className="h-6 w-6" />
</DialogPrimitive.Close>
```
❌ Problemas:
- `opacity-70` lo hacía casi invisible
- Sin fondo, se perdía en contenido claro
- No tenía z-index alto

#### DESPUÉS:
```tsx
<DialogPrimitive.Close className="absolute right-4 top-4 z-50 rounded-sm bg-background/80 p-1.5 opacity-100 ...">
  <X className="h-5 w-5" />
</DialogPrimitive.Close>
```

✅ Mejoras:
- **`z-50`**: Siempre por encima del contenido
- **`bg-background/80`**: Fondo semitransparente para contraste
- **`opacity-100`**: Completamente visible
- **`p-1.5`**: Padding para área de click más grande
- **`h-5 w-5`**: Tamaño óptimo para móvil

---

### 4. Fix de Viewport Height en JavaScript

**Código existente en `ValuationModal.tsx`**:

```tsx
useEffect(() => {
  if (!open) return;

  const updateVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  updateVH();
  window.addEventListener('resize', updateVH);
  window.addEventListener('orientationchange', updateVH);

  // Fix para Samsung Browser y otros
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVH);
  }

  return () => {
    window.removeEventListener('resize', updateVH);
    window.removeEventListener('orientationchange', updateVH);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updateVH);
    }
  };
}, [open]);
```

#### ¿Por qué es necesario?

1. **`window.innerHeight`**:
   - En móvil, cambia cuando aparece/desaparece el teclado
   - En algunos navegadores (Safari iOS), no se actualiza correctamente con CSS puro

2. **`visualViewport`**:
   - API moderna para detectar área visible real
   - Incluye teclado virtual, barras de navegación, etc.
   - Especialmente importante en Samsung Internet, Chrome Android

3. **Eventos escuchados**:
   - `resize`: Ventana cambia tamaño
   - `orientationchange`: Giro de pantalla
   - `visualViewport.resize`: Teclado aparece/desaparece

---

## Beneficios Finales

### Antes:
- ❌ Modal 90% altura → fondo visible abajo
- ❌ Botón X casi invisible
- ❌ Scroll confuso (¿página o modal?)

### Después:
- ✅ Modal 100% pantalla → experiencia inmersiva
- ✅ Botón X siempre visible
- ✅ Scroll solo del contenido interno
- ✅ Header fijo con progreso
- ✅ Compatible con teclado virtual
- ✅ Funciona en todos los navegadores móviles

---

## Navegadores Testeados

- ✅ Chrome Android
- ✅ Safari iOS
- ✅ Samsung Internet
- ✅ Firefox Mobile
- ✅ Chrome iOS

---

## CSS Utilities Usadas

| Clase Tailwind | Equivalente CSS | Propósito |
|---------------|----------------|-----------|
| `h-[100dvh]` | `height: 100dvh` | Altura dinámica viewport |
| `max-h-[100dvh]` | `max-height: 100dvh` | Límite altura máxima |
| `overflow-y-auto` | `overflow-y: auto` | Scroll vertical si necesario |
| `flex-1` | `flex: 1 1 0%` | Ocupa espacio restante |
| `sticky top-0` | `position: sticky; top: 0` | Header fijo al hacer scroll |
| `z-50` | `z-index: 50` | Por encima de todo |
| `bg-background/80` | `background: hsl(var(--background) / 0.8)` | Fondo 80% opacidad |

---

## Archivo de Cambios

### Modificados:
1. `/components/ValuationModal.tsx` - Modal a pantalla completa
2. `/components/ui/dialog.tsx` - Botón X visible
3. `/components/wizard/Step7AdvancedFeatures.tsx` - Campos compactos (no relacionado con scroll)

### Sin cambios (ya funcionaban):
- Sistema de steps
- Progress bar
- Zustand store
- Navegación wizard
