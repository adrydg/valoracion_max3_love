/**
 * Tipos compartidos para el sistema de valoración
 */

export interface PropertyData {
  postalCode: string;
  municipality?: string;
  street?: string;
  squareMeters: number;
  landSize?: number;
  bedrooms: number;
  bathrooms?: number;
  floor?: 'bajo' | 'entresuelo' | '1-2' | '3-5' | '6+' | 'atico';
  hasElevator?: boolean;
  buildingAge?: 'nueva' | 'reciente' | 'moderna' | 'antigua' | 'muy-antigua';
  propertyType?: string;
}

export interface MarketData {
  postalCode: string;
  municipality: string;
  neighborhood?: string;
  province: string;
  precio_medio_m2: number;
  precio_min_m2: number;
  precio_max_m2: number;
  demanda_zona: 'alta' | 'media' | 'baja';
  tendencia: 'subiendo' | 'estable' | 'bajando';
  descripcion_zona?: string;
  fuente: string;
  fecha_actualizacion: string;
}

export interface Adjustment {
  factor: string;
  value: string;
  percentage: number;
}

export interface ValuationResult {
  avg: number;
  min: number;
  max: number;
  uncertainty: string;
  pricePerM2: number;
  precioZona: number | null;
  adjustments: Adjustment[];
  marketData: MarketData;
  calculatedAt: string;
  disclaimer: string;
}

export interface ClaudePromptConfig {
  model: string;
  maxTokens: number;
  temperature?: number;
}

export interface ClaudeMarketRequest {
  property: PropertyData;
  precioRegistradores: number | null;
}

export interface ClaudeMarketResponse {
  precio_min_m2: number;
  precio_medio_m2: number;
  precio_max_m2: number;
  municipality: string;
  neighborhood?: string;
  province: string;
  demanda_zona: 'alta' | 'media' | 'baja';
  tendencia: 'subiendo' | 'estable' | 'bajando';
  descripcion_zona?: string;
}
