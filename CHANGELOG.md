# Changelog

Todos los cambios notables en el proyecto ValoracionMax se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [16 Nov 2024] - Mejoras en Recopilación de Datos y Análisis con Claude

### Añadido

#### Nuevos Campos de Datos
- **Campo "Comentarios adicionales"** en Step3DatosPersonales
  - Permite a los usuarios añadir información adicional sobre su propiedad
  - Se incluye en ambos emails (formulario corto y largo)
  - Aparece destacado en amarillo en los emails HTML

- **Integración de datos de oferta directa** en emails
  - Campo `directOfferInterest`: ¿Quiere escuchar ofertas?
  - Campo `agencyStatus`: ¿Publicado en agencias?
  - Funciones helper para traducir valores a texto legible en español
  - Sección dedicada "🎁 Interés en Ofertas" en plantillas de email

#### Mejoras en la Integración con Claude API
- **Prompt mejorado** con todas las características de la propiedad:
  - Tipo de propiedad
  - Superficie en m²
  - Número de habitaciones
  - Número de baños
  - Planta (traducido: Planta baja, 1ª-2ª, 3ª-5ª, etc.)
  - Ascensor (Sí/No)
  - Antigüedad del edificio (traducido: Menos de 5 años, Entre 5-15 años, etc.)

- **Logging de debugging completo**:
  - Log del prompt completo enviado a Claude (📤 ENVIANDO A CLAUDE)
  - Log de la respuesta JSON recibida (📥 RESPUESTA DE CLAUDE)
  - Separadores visuales (═══) para fácil identificación
  - Emojis para escaneo rápido en logs

#### Funciones Helper
- `floorMap`: Traduce códigos de planta a texto español legible
- `buildingAgeMap`: Traduce códigos de antigüedad a rangos de años
- `getOfferInterestText()`: Traduce interés en ofertas a texto descriptivo
- `getAgencyStatusText()`: Traduce estado de agencias a texto descriptivo

### Modificado

#### Step1Ubicacion.tsx
- **Cambio de etiqueta**: "Calle (opcional)" → "Calle y número"
  - Archivo: `/components/wizard/Step1Ubicacion.tsx`
  - Línea: 117

#### Step3DatosPersonales.tsx
- Importado componente `Textarea` de shadcn/ui
- Añadido campo de texto multilínea para comentarios adicionales
- Incluidos `directOfferInterest` y `agencyStatus` en payload de email
- Se mantiene la precarga de datos para testing (name, email, phone)

#### Step8PhotoUpload.tsx
- Añadidos nuevos campos al destructuring del store de Zustand
- Incluidos `additionalComments`, `directOfferInterest`, `agencyStatus` en payload de email formulario largo

#### store/useWizardStore.ts
- Añadido campo `additionalComments: string` al estado
- Añadido setter `setAdditionalComments`
- Incluido en la configuración de persistencia con localStorage

#### app/api/lead/send-progress-email/route.ts
- Creadas funciones helper para traducir valores de enums
- Añadida sección "💬 Comentarios adicionales" en template HTML (formulario corto)
- Añadida sección "💬 Comentarios adicionales" en template HTML (formulario largo)
- Añadida sección "🎁 Interés en Ofertas" en ambos templates
- Comentarios se muestran con fondo amarillo (#fef3c7) para destacar

#### app/api/valuation/basic/route.ts
- **Mejoras significativas en el prompt a Claude**:
  - Estructura organizada con secciones (📍 UBICACIÓN, 🏠 CARACTERÍSTICAS)
  - Inclusión de todas las características de la propiedad
  - Mapeo de valores técnicos a lenguaje natural
  - Instrucciones más claras y específicas

- **Sistema de logging mejorado**:
  - Console.log del prompt completo antes de enviar
  - Console.log de la respuesta completa de Claude
  - Separadores visuales para fácil identificación
  - Información de precios obtenidos

### Componentes UI Actualizados (Despliegues Previos)
- `components/Header.tsx`: Logo actualizado
- `components/Footer.tsx`: Footer actualizado
- `app/layout.tsx`: Layout general actualizado
- `app/page.tsx`: Página principal actualizada
- `components/ScrollToFormButton.tsx`: Botón de scroll actualizado

### Correcciones de Bugs

#### Cache de Servidor Local
- **Problema**: Logs de debugging no aparecían en desarrollo local
- **Causa**: Caché de .next y node_modules/.cache
- **Solución**:
  ```bash
  rm -rf .next node_modules/.cache
  PORT=3001 npm run dev
  ```

#### Despliegue Incompleto
- **Problema**: Logo antiguo seguía apareciendo en producción
- **Causa**: Solo se commitearon archivos del wizard, faltaban componentes UI
- **Solución**: Commit adicional con Header, Footer, layout, page, ScrollToFormButton
- **Resultado**: 3 despliegues exitosos en Vercel

### Verificación y Testing

#### Métodos de Verificación Implementados
1. **Logs de servidor**: Consola con separadores visuales y emojis
2. **Verificación de email**: Envío a a.durandez@gmail.com
3. **DevTools del navegador**: Inspección de llamadas API en Network tab

#### Pruebas Realizadas
- ✅ Formulario completo funcional en local (puerto 3001)
- ✅ Envío de emails verificado (Resend API)
- ✅ Llamadas a Claude API funcionando correctamente
- ✅ Precios de mercado realistas obtenidos
- ✅ Ejemplo de respuesta para CP 28010 (Barrio Salamanca, Madrid):
  - Precio medio: 5,200€/m²
  - Demanda: Alta
  - Tendencia: Subiendo

### Notas Técnicas

#### Modelo de Claude Utilizado
- **Modelo**: `claude-3-haiku-20240307`
- **Max tokens**: 500
- **Uso**: Análisis de precios de mercado inmobiliario español 2025

#### Estructura de Response de Claude
```json
{
  "precio_min_m2": number,
  "precio_medio_m2": number,
  "precio_max_m2": number,
  "municipality": string,
  "neighborhood": string,
  "province": string,
  "demanda_zona": "alta" | "media" | "baja",
  "tendencia": "subiendo" | "estable" | "bajando",
  "descripcion_zona": string
}
```

#### Sistema de Emails
- **Proveedor**: Resend API
- **Remitente**: noreply@valoracionmax.es
- **Destinatario**: a.durandez@gmail.com
- **Tipos de email**:
  1. **Formulario Corto** (después de Step 3): Datos básicos + valoración inicial
  2. **Formulario Largo** (después de Step 8): Datos completos + características avanzadas + fotos

---

## Próximos Pasos Sugeridos

### Mejoras Potenciales
- [ ] Añadir más contexto histórico de precios en la respuesta de Claude
- [ ] Implementar caché de respuestas de Claude para códigos postales frecuentes
- [ ] Añadir análisis de imágenes con Claude Vision para valoraciones más precisas
- [ ] Dashboard de admin para ver todos los leads en una interfaz web
- [ ] Integración con CRM (HubSpot, Salesforce, etc.)
- [ ] A/B testing de diferentes prompts a Claude para optimizar precisión

### Mantenimiento
- [ ] Monitorear costos de API de Claude (actualmente usando Haiku, modelo más económico)
- [ ] Revisar logs de errores en Vercel
- [ ] Backup periódico de leads (actualmente solo por email)
- [ ] Actualizar modelo de Claude cuando salgan nuevas versiones

---

## Deployment History

### Production (valoracionmax.es)
- **16 Nov 2024**: Despliegue de mejoras en Claude API + campos adicionales
- **15 Nov 2024**: Despliegue de componentes UI actualizados
- **13 Nov 2024**: Primera integración con Claude API
- **12 Nov 2024**: Setup inicial del proyecto

### Comandos de Deployment
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel detecta automáticamente el push y despliega en: https://valoracionmax.es
