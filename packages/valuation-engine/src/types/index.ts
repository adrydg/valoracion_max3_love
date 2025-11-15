/**
 * Tipos del motor de valoración
 * Basados en los requerimientos del documento de especificaciones
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

export type PropertyType = "piso" | "casa" | "local" | "otros";

export type PropertyCondition =
  | "perfecto"        // +5%
  | "muy-bueno"       // +2%
  | "bueno"           // 0%
  | "aceptable"       // -8%
  | "reformar";       // -15%

export type PropertySituation =
  | "libre"
  | "herencia"
  | "okupado"
  | "inquilino"
  | "otro";

export type FloorLevel =
  | "bajo"            // -10%
  | "entresuelo"      // -5%
  | "1-2"             // 0%
  | "3-5"             // +3%
  | "6+"              // +5%
  | "atico";          // +8%

export type Orientation =
  | "norte"           // -3%
  | "sur"             // +5%
  | "este"            // +2%
  | "oeste"           // +2%
  | "multiple";       // +3%

export type TerraceSize =
  | "sin-terraza"     // 0%
  | "pequena"         // +8% (5-15m²)
  | "mediana"         // +15% (15-30m²)
  | "grande";         // +22% (>30m²)

export type BuildingAge =
  | "nueva"           // +10% (<5 años)
  | "reciente"        // +5% (5-15 años)
  | "moderna"         // 0% (15-30 años)
  | "antigua"         // -5% (30-50 años)
  | "muy-antigua";    // -10% (>50 años)

// ============================================
// DATOS DE MERCADO
// ============================================

export interface MarketData {
  postalCode: string;
  province: string;
  municipality: string;
  neighborhood?: string;
  precio_medio_m2: number;
  precio_min_m2: number;
  precio_max_m2: number;
  transacciones_ultimo_ano?: number;
  tendencia?: "subiendo" | "estable" | "bajando";
  fuente: "idealista" | "fotocasa" | "claude" | "tinsa";
  fecha_actualizacion: string;
}

// ============================================
// DATOS DE PROPIEDAD
// ============================================

export interface BasicPropertyData {
  propertyType: PropertyType;
  squareMeters: number;
  bedrooms: number;
  postalCode: string;
  street?: string;
  city?: string;
  apartment?: string;
}

export interface DetailedPropertyData extends BasicPropertyData {
  // Características adicionales
  bathrooms: number;
  floor: FloorLevel;
  buildingAge: BuildingAge;
  condition: PropertyCondition;
  orientation: Orientation;

  // Extras (Paso 1)
  hasElevator: boolean;
  hasGarage: boolean;
  hasStorage: boolean;

  // Terraza
  terraceSize: TerraceSize;
  terraceSquareMeters?: number;

  // Solo para casas/chalets
  plotSquareMeters?: number;

  // Situación (no afecta valoración, solo para lead)
  situation?: PropertySituation;

  // Análisis de fotos (opcional)
  photosAnalysis?: PhotoAnalysis;

  // Exterior/Interior
  isExterior?: boolean;

  // Piscina
  hasPool?: boolean;
}

// ============================================
// ANÁLISIS DE FOTOS
// ============================================

export interface PhotoAnalysis {
  overallQuality: number; // 0-10
  aestheticScore: number; // 0-10
  naturalLight: "excelente" | "buena" | "regular" | "poca";
  maintenance: "impecable" | "bueno" | "aceptable" | "necesita-mejoras";
  modernization: "muy-moderna" | "moderna" | "actual" | "anticuada";
  observations: string[];
  adjustmentSuggestion: number; // Porcentaje adicional: -5% a +5%
}

// ============================================
// RESULTADO DE VALORACIÓN
// ============================================

export interface Valuation {
  avg: number;           // Precio promedio
  min: number;           // Precio mínimo
  max: number;           // Precio máximo
  uncertainty: string;   // "±20%", "±12%", "±8%"
  pricePerM2: number;    // Precio por metro cuadrado
  adjustments: Adjustment[];
  roi?: ROIAnalysis;
  score?: PropertyScore;
  marketData: MarketData;
  calculatedAt: string;
  precision?: PrecisionScore;
  limits?: {
    // Límites aplicados (solo en valoración detallada)
    applied: boolean;        // Si se aplicó cap/floor
    originalPrice: number;   // Precio antes de aplicar límites
    cappedPrice: number;     // Precio después de límites
    reason: "exceeded_zone_max" | "below_zone_min" | "within_range";
  };
}

export interface Adjustment {
  factor: string;
  value: string;         // "+5%", "-10%", etc.
  percentage: number;    // Valor numérico del porcentaje
  description?: string;
}

export interface ROIAnalysis {
  potentialRent: number;
  rentabilidad: number;  // Porcentaje anual
  timeToSell: string;    // "2-4 meses", "6+ meses", etc.
  demand: "alta" | "media" | "baja";
  investmentRecommendation: string;
}

export interface PropertyScore {
  overall: number;       // 0-100
  location: number;      // 0-100
  condition: number;     // 0-100
  features: number;      // 0-100
  marketValue: number;   // 0-100
}

// ============================================
// ÍNDICE DE PRECISIÓN
// ============================================

export interface PrecisionScore {
  score: number; // 0-100
  level: "baja" | "media" | "alta" | "muy-alta";
  percentage: string; // "±20%", "±12%", "±8%"
  missingFields: string[];
  suggestions: string[];
  completeness: number; // 0-100 (% de datos proporcionados)
  confidence: "baja" | "media" | "alta";
}

// ============================================
// DATOS DEL CLIENTE (LEAD)
// ============================================

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  consentMarketing: boolean;
  consentDataProcessing: boolean;
  source?: string;       // Para tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// ============================================
// OFERTA DIRECTA
// ============================================

export type DirectOfferInterest =
  | "not-interested"           // No me interesa
  | "open-to-offers";          // Sí, siempre está bien escuchar propuestas

export interface DirectOfferData {
  interest: DirectOfferInterest;
  notes?: string;
}

export interface LeadData {
  id?: string;
  clientData?: ClientData;
  basicPropertyData?: BasicPropertyData;
  detailedPropertyData?: Partial<DetailedPropertyData>;
  valuationType?: "basica" | "detallada";
  valuation?: Valuation;
  directOffer?: DirectOfferData;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  status: "in-progress" | "completed" | "abandoned";
}

// ============================================
// PARÁMETROS DE CÁLCULO
// ============================================

export interface BasicCalculationParams {
  marketData: MarketData;
  squareMeters: number;
  bedrooms: number;
  propertyType: PropertyType;
  bathrooms?: number;
  floor?: FloorLevel;
  hasElevator?: boolean;
  buildingAge?: BuildingAge;
}

export interface DetailedCalculationParams {
  marketData: MarketData;
  property: DetailedPropertyData;
  photosAnalysis?: PhotoAnalysis;
}
