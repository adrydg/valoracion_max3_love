/**
 * Configuración centralizada del sistema de valoración con OpenAI
 */

export const OPENAI_CONFIG = {
  // Modelos a utilizar
  MODELS: {
    FASE_1_TEXTO: "gpt-4o-mini", // Fase 1: solo texto
    FASE_2_VISION: "gpt-4o", // Fase 2: análisis de fotos con visión
  },

  // Parámetros de generación
  GENERATION: {
    temperature: 0.3, // Baja temperatura para valoraciones más consistentes
    max_tokens: 2000,
  },

  // Timeouts (ms)
  TIMEOUTS: {
    web_search: 15000, // 15s para búsqueda web
    openai_call: 30000, // 30s para llamada a OpenAI
  },
} as const;

// Factores de ajuste por tipo de zona
export const FACTORES_ZONA = {
  prime: {
    factor_subida: 1.28, // +28% sobre Registradores (zonas VIP Madrid)
    descripcion: "Zona prime (Salamanca, Recoletos, Chamberí, Goya, Justicia)",
  },
  buena: {
    factor_subida: 1.20, // +20%
    descripcion: "Zona buena con alta demanda",
  },
  media: {
    factor_subida: 1.15, // +15%
    descripcion: "Zona media, demanda normal",
  },
  periferia: {
    factor_subida: 1.10, // +10%
    descripcion: "Zona periférica",
  },
} as const;

// Códigos postales de zonas PRIME en Madrid
export const CP_PRIME_MADRID = [
  "28001", "28002", "28003", "28004", "28006", "28009", "28010", "28014",
  "28036", "28045", // Salamanca, Retiro, Chamberí, Centro
];

// User-Agent para web scraping (simular navegador real)
export const WEB_SCRAPING_CONFIG = {
  USER_AGENT:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  HEADERS: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
  },
  // Portales a consultar (en orden de prioridad)
  PORTALES: [
    "idealista.com",
    "fotocasa.es",
    "pisos.com",
    "habitaclia.com",
    "tucasa.com",
  ],
} as const;

/**
 * Determina si un código postal corresponde a zona prime
 */
export function esZonaPrime(cp: string | undefined): boolean {
  if (!cp) return false;
  return CP_PRIME_MADRID.includes(cp);
}

/**
 * Obtiene el factor de subida sugerido para una zona
 */
export function getFactorZona(tipoZona: "prime" | "buena" | "media" | "periferia"): number {
  return FACTORES_ZONA[tipoZona].factor_subida;
}
