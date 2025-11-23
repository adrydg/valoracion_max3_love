/**
 * Tipos TypeScript para el sistema de valoración con OpenAI
 */

// ============================================
// TIPOS DE ENTRADA (desde el formulario)
// ============================================

export interface UbicacionInput {
  cp?: string; // Opcional
  municipio: string;
  provincia: string;
  barrio_usuario?: string;
}

export interface InmuebleInput {
  tipo_inmueble: "piso" | "casa" | "local" | "otros";
  superficie_m2: number;
  habitaciones: number;
  banos: number;
  planta: number;
  total_plantas_edificio?: number;
  ascensor: boolean;
  antiguedad_rango: string; // "nueva", "reciente", "segunda_mano", etc.
  estado_declarado_usuario: string; // "a_reformar", "normal", "reformado", "lujo"
}

export interface DatosBasicosInput {
  ubicacion: UbicacionInput;
  inmueble: InmuebleInput;
}

// ============================================
// DATOS DE REGISTRADORES (CSV)
// ============================================

export interface DatosRegistradores {
  cp: string;
  precio_m2_registro_cp: number;
  anio_registro_cp: number;
  num_operaciones_cp?: number;
  municipio?: string;
  provincia?: string;
}

// ============================================
// BÚSQUEDA WEB (Scraping)
// ============================================

export interface ResultadoBusquedaWeb {
  query: string;
  raw_html_excerpt: string;
  precios_detectados: string[]; // Ej: ["6.500 €/m²", "7.200 €/m²"]
  urls_referencia: string[];
  timestamp: string;
}

// ============================================
// RESPUESTA DE OPENAI - FASE 1 (Básica)
// ============================================

export type TipoZona = "prime" | "buena" | "media" | "periferia";
export type NivelConfianza = "alta" | "media" | "baja";

export interface AjustesPorcentuales {
  planta: number; // Ej: +5% = 5, -10% = -10
  ascensor: number;
  antiguedad: number;
  estado: number;
  banos: number;
}

export interface ValoracionBasica {
  tipo_zona: TipoZona;
  precio_m2_base_actualizado: number;
  ajustes_porcentuales: AjustesPorcentuales;
  factor_mercado_local: number; // Ej: 1.15 = +15%
  confianza: NivelConfianza;
  explicacion_breve: string;
  // Opcional: valoraciones calculadas por el modelo
  valoracion_minima?: number;
  valoracion_media?: number;
  valoracion_maxima?: number;
}

// ============================================
// RESPUESTA DE OPENAI - FASE 2 (Visión)
// ============================================

export type EstadoReal = "a_reformar" | "normal" | "reformado" | "lujo";
export type CalidadAcabados = "baja" | "media" | "alta";
export type Luminosidad = "baja" | "media" | "alta";

export interface CaracteristicasVisual {
  estado_real: EstadoReal;
  calidad_acabados: CalidadAcabados;
  luminosidad: Luminosidad;
  cocina_reformada: boolean;
  banos_reformados: boolean;
  tiene_terraza_o_balcon: boolean;
  tiene_aire_acondicionado_visible: boolean;
  carpinteria_ventanas: string;
  observaciones_tecnicas: string;
}

export interface AjustesAdicionalesPorcentuales {
  estado_real_vs_declarado: number;
  calidad_acabados: number;
  luminosidad: number;
  extras: number;
}

export interface ValoracionDetallada {
  ajustes_adicionales_porcentuales: AjustesAdicionalesPorcentuales;
  nueva_valoracion_minima?: number;
  nueva_valoracion_media?: number;
  nueva_valoracion_maxima?: number;
  mensaje_para_cliente: string;
}

// ============================================
// INPUTS COMPLETOS PARA ENDPOINTS
// ============================================

export interface Fase1Input {
  ubicacion: UbicacionInput;
  inmueble: InmuebleInput;
}

export interface Fase2Input {
  id_inmueble: string;
  datos_fase_1: DatosBasicosInput;
  valoracion_fase_1: {
    valoracion_minima: number;
    valoracion_media: number;
    valoracion_maxima: number;
  };
  descripcion_libre_usuario?: string;
  fotos: {
    [key: string]: string; // URL o base64
  };
}
