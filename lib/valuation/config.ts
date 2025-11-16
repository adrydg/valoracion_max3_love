/**
 * Configuración centralizada del sistema de valoración
 *
 * IMPORTANTE: Todos los ajustes y factores se controlan desde aquí.
 * Cambia estos valores para modificar el comportamiento de las valoraciones.
 */

export const VALUATION_CONFIG = {
  /**
   * Factor de optimismo aplicado al final del cálculo
   * 1.10 = +10% de optimismo
   */
  OPTIMISM_FACTOR: 1.10,

  /**
   * Margen de incertidumbre para el rango (min/max)
   * 0.02 = ±2%
   */
  UNCERTAINTY: 0.02,

  /**
   * Factor de incremento sobre precios de Registradores
   * 1.15 = +15% sobre el precio del Excel
   */
  REGISTRADORES_INCREMENT: 1.15,

  /**
   * Ajustes por superficie
   */
  SURFACE_ADJUSTMENTS: {
    SMALL: {
      threshold: 50,        // m² mínimos para considerar "pequeño"
      factor: 1.10,         // +10%
      label: "Superficie pequeña"
    },
    LARGE: {
      threshold: 150,       // m² mínimos para considerar "grande"
      factor: 0.95,         // -5%
      label: "Superficie grande"
    }
  },

  /**
   * Ajustes por planta CON ascensor
   */
  FLOOR_WITH_ELEVATOR: {
    'bajo': { factor: 0.90, label: "Planta baja (con ascensor)" },         // -10%
    'entresuelo': { factor: 0.95, label: "Entresuelo (con ascensor)" },    // -5%
    '1-2': { factor: 1.00, label: "Planta 1ª-2ª (con ascensor)" },         // 0%
    '3-5': { factor: 1.03, label: "Planta 3ª-5ª (con ascensor)" },         // +3%
    '6+': { factor: 1.05, label: "Planta 6ª+ (con ascensor)" },            // +5%
    'atico': { factor: 1.08, label: "Ático (con ascensor)" }               // +8%
  },

  /**
   * Ajustes por planta SIN ascensor
   */
  FLOOR_WITHOUT_ELEVATOR: {
    'bajo': { factor: 0.90, label: "Planta baja (sin ascensor)" },         // -10%
    'entresuelo': { factor: 0.92, label: "Entresuelo (sin ascensor)" },    // -8%
    '1-2': { factor: 0.95, label: "Planta 1ª-2ª (sin ascensor)" },         // -5%
    '3-5': { factor: 0.75, label: "Planta 3ª-5ª (sin ascensor)" },         // -25%
    '6+': { factor: 0.70, label: "Planta 6ª+ (sin ascensor)" },            // -30%
    'atico': { factor: 0.80, label: "Ático (sin ascensor)" }               // -20%
  },

  /**
   * Ajustes por antigüedad del edificio
   */
  BUILDING_AGE_ADJUSTMENTS: {
    'nueva': { factor: 1.10, label: "Edificio nuevo (<5 años)" },          // +10%
    'reciente': { factor: 1.05, label: "Edificio reciente (5-15 años)" },  // +5%
    'moderna': { factor: 1.00, label: "Edificio moderno (15-30 años)" },   // 0%
    'antigua': { factor: 0.95, label: "Edificio antiguo (30-50 años)" },   // -5%
    'muy-antigua': { factor: 0.90, label: "Edificio muy antiguo (>50 años)" } // -10%
  },

  /**
   * Ajuste por múltiples baños
   */
  MULTIPLE_BATHROOMS: {
    minBathrooms: 2,      // Mínimo de baños para aplicar el ajuste
    minBedrooms: 2,       // Mínimo de habitaciones para aplicar el ajuste
    factor: 1.05,         // +5%
    label: "Múltiples baños"
  },

  /**
   * Mapeo de valores legibles para UI/emails
   */
  LABELS: {
    FLOOR: {
      'bajo': 'Planta baja',
      'entresuelo': 'Entresuelo',
      '1-2': 'Planta 1ª-2ª',
      '3-5': 'Planta 3ª-5ª',
      '6+': 'Planta 6ª o superior',
      'atico': 'Ático'
    },
    BUILDING_AGE: {
      'nueva': 'Menos de 5 años',
      'reciente': 'Entre 5-15 años',
      'moderna': 'Entre 15-30 años',
      'antigua': 'Entre 30-50 años',
      'muy-antigua': 'Más de 50 años'
    }
  }
};

/**
 * Configuración de Claude (modelo, tokens, temperatura)
 */
export const CLAUDE_CONFIG = {
  /**
   * Configuración para obtención de datos de mercado
   */
  MARKET_DATA: {
    model: "claude-3-haiku-20240307",
    maxTokens: 500,
    temperature: 0.7,  // Un poco de creatividad para ser optimista pero realista
  },

  /**
   * Configuración para análisis de fotos (si se implementa)
   */
  PHOTO_ANALYSIS: {
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 1000,
    temperature: 0.5,
  }
};

/**
 * Fallback de datos de mercado si Claude falla
 */
export const FALLBACK_MARKET_DATA = {
  postalCode: "",
  province: "Madrid",
  municipality: "Madrid",
  neighborhood: "Centro",
  precio_medio_m2: 3800,
  precio_min_m2: 3400,
  precio_max_m2: 4200,
  demanda_zona: "media" as const,
  tendencia: "estable" as const,
  fuente: "estimación genérica",
  fecha_actualizacion: "",
};
