/**
 * Motor de cálculo de valoraciones
 * Implementa la lógica de valoración básica y detallada
 */

import {
  Valuation,
  BasicCalculationParams,
  DetailedCalculationParams,
  MarketData,
  PropertyScore,
  ROIAnalysis,
  DetailedPropertyData,
  Adjustment
} from "../types";
import {
  calculateAllAdjustments,
  getTotalAdjustmentPercentage,
  getSizeAdjustment,
  getFloorAdjustment,
  getBuildingAgeAdjustment
} from "./adjustments";

export class ValuationCalculator {
  /**
   * VALORACIÓN BÁSICA
   * Solo con datos mínimos: CP, m², habitaciones, tipo
   * Incertidumbre: ±20%
   */
  calculateBasic(params: BasicCalculationParams): Valuation {
    const { marketData, squareMeters, bedrooms, propertyType } = params;

    // PASO 1: Precio base
    const basePrice = marketData.precio_medio_m2 * squareMeters;

    // PASO 2: Ajustes básicos disponibles
    const adjustments: Adjustment[] = [];

    // Superficie
    const sizeAdj = getSizeAdjustment(squareMeters);
    if (sizeAdj) adjustments.push(sizeAdj);

    // Planta (si está disponible)
    if (params.floor && params.hasElevator !== undefined) {
      adjustments.push(getFloorAdjustment(params.floor, params.hasElevator));
    }

    // Antigüedad (si está disponible)
    if (params.buildingAge) {
      adjustments.push(getBuildingAgeAdjustment(params.buildingAge));
    }

    // PASO 3: Calcular factor total (multiplicativo)
    const totalPercentage = getTotalAdjustmentPercentage(adjustments);
    const adjustedPrice = basePrice * (1 + totalPercentage / 100);

    // PASO 4: Rango con incertidumbre ±20%
    const uncertainty = 0.20;
    const min = Math.round(adjustedPrice * (1 - uncertainty));
    const max = Math.round(adjustedPrice * (1 + uncertainty));
    const avg = Math.round(adjustedPrice);

    // PASO 5: Calcular precio por m²
    const pricePerM2 = Math.round(avg / squareMeters);

    return {
      avg,
      min,
      max,
      uncertainty: "±20%",
      pricePerM2,
      adjustments,
      marketData,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * VALORACIÓN DETALLADA
   * Con todos los datos: estado, orientación, terraza, extras, fotos
   * Incertidumbre: ±8% (con fotos) o ±12% (sin fotos)
   */
  calculateDetailed(params: DetailedCalculationParams): Valuation {
    const { marketData, property, photosAnalysis } = params;

    // PASO 1: Precio base
    let basePrice = marketData.precio_medio_m2 * property.squareMeters;

    // PASO 2: Calcular TODOS los ajustes porcentuales
    const adjustments = calculateAllAdjustments(property, photosAnalysis);

    // PASO 3: Aplicar ajustes multiplicativamente
    const totalPercentage = getTotalAdjustmentPercentage(adjustments);
    let adjustedPrice = basePrice * (1 + totalPercentage / 100);

    // PASO 4: Sumar valores absolutos (garaje + trastero)
    const absoluteValues = this.calculateAbsoluteValues(property, marketData);
    adjustedPrice += absoluteValues.total;

    // PASO 5: Aplicar límites realistas
    const limits = this.calculateRealisticLimits(marketData, property.squareMeters);
    const { cappedPrice, applied, reason } = this.applyLimits(adjustedPrice, limits);

    // PASO 6: Calcular rango con incertidumbre
    const uncertainty = photosAnalysis ? 0.08 : 0.12;
    const uncertaintyLabel = photosAnalysis ? "±8%" : "±12%";

    const min = Math.round(cappedPrice * (1 - uncertainty));
    const max = Math.round(cappedPrice * (1 + uncertainty));
    const avg = Math.round(cappedPrice);

    // PASO 7: Calcular precio por m²
    const pricePerM2 = Math.round(avg / property.squareMeters);

    // PASO 8: Calcular score del inmueble
    const score = this.calculatePropertyScore(property, marketData, adjustedPrice);

    // PASO 9: Calcular ROI
    const roi = this.calculateROI(avg, marketData);

    // Añadir valores absolutos a adjustments para mostrar
    if (absoluteValues.garage > 0) {
      adjustments.push({
        factor: "Plaza de garaje",
        value: `+${absoluteValues.garage.toLocaleString()}€`,
        percentage: 0,
        description: "Valor absoluto añadido"
      });
    }

    if (absoluteValues.storage > 0) {
      adjustments.push({
        factor: "Trastero",
        value: `+${absoluteValues.storage.toLocaleString()}€`,
        percentage: 0,
        description: "Valor absoluto añadido"
      });
    }

    return {
      avg,
      min,
      max,
      uncertainty: uncertaintyLabel,
      pricePerM2,
      adjustments,
      score,
      roi,
      marketData,
      calculatedAt: new Date().toISOString(),
      limits: applied
        ? {
            applied: true,
            originalPrice: Math.round(adjustedPrice),
            cappedPrice: Math.round(cappedPrice),
            reason
          }
        : undefined
    };
  }

  /**
   * Calcular valores absolutos por zona
   */
  private calculateAbsoluteValues(
    property: DetailedPropertyData,
    marketData: MarketData
  ): { garage: number; storage: number; total: number } {
    let garage = 0;
    let storage = 0;

    const postalCode = marketData.postalCode;
    const cpNumber = parseInt(postalCode);

    // GARAJE: valor según zona
    if (property.hasGarage) {
      if (cpNumber <= 28015) {
        // Madrid Centro
        garage = 35000;
      } else if (cpNumber <= 28030) {
        // Madrid Ensanche
        garage = 25000;
      } else if (cpNumber < 29000) {
        // Madrid Periferia
        garage = 15000;
      } else if (cpNumber >= 8000 && cpNumber <= 8020) {
        // Barcelona Centro
        garage = 40000;
      } else if (cpNumber >= 46000 && cpNumber < 47000) {
        // Valencia
        garage = 20000;
      } else {
        // Otras provincias
        garage = 15000;
      }
    }

    // TRASTERO: valor fijo
    if (property.hasStorage) {
      storage = 5000;
    }

    return {
      garage,
      storage,
      total: garage + storage
    };
  }

  /**
   * Calcular límites realistas
   */
  private calculateRealisticLimits(
    marketData: MarketData,
    squareMeters: number
  ): { max: number; min: number } {
    return {
      max: marketData.precio_max_m2 * squareMeters * 1.2,
      min: marketData.precio_min_m2 * squareMeters * 0.8
    };
  }

  /**
   * Aplicar límites cap/floor
   */
  private applyLimits(
    price: number,
    limits: { max: number; min: number }
  ): {
    cappedPrice: number;
    applied: boolean;
    reason: "exceeded_zone_max" | "below_zone_min" | "within_range";
  } {
    if (price > limits.max) {
      return {
        cappedPrice: limits.max,
        applied: true,
        reason: "exceeded_zone_max"
      };
    }

    if (price < limits.min) {
      return {
        cappedPrice: limits.min,
        applied: true,
        reason: "below_zone_min"
      };
    }

    return {
      cappedPrice: price,
      applied: false,
      reason: "within_range"
    };
  }

  /**
   * Calcular score del inmueble (0-100)
   */
  private calculatePropertyScore(
    property: DetailedPropertyData,
    marketData: MarketData,
    adjustedPrice: number
  ): PropertyScore {
    // UBICACIÓN (30%): basado en precio/m² de la zona
    const locationScore = Math.min(100, (marketData.precio_medio_m2 / 5000) * 100);

    // ESTADO (25%): basado en condición
    const conditionScores: Record<string, number> = {
      perfecto: 100,
      "muy-bueno": 85,
      bueno: 70,
      aceptable: 50,
      reformar: 30
    };
    const conditionScore = conditionScores[property.condition] || 70;

    // CARACTERÍSTICAS (25%): terraza, orientación, extras
    let featuresScore = 50; // Base
    if (property.terraceSize !== "sin-terraza") featuresScore += 15;
    if (property.orientation === "sur") featuresScore += 10;
    if (property.hasGarage) featuresScore += 10;
    if (property.hasStorage) featuresScore += 5;
    if (property.hasPool) featuresScore += 10;
    featuresScore = Math.min(100, featuresScore);

    // VALOR DE MERCADO (20%): relación con rango de zona
    const marketValueRatio =
      (adjustedPrice / property.squareMeters - marketData.precio_min_m2) /
      (marketData.precio_max_m2 - marketData.precio_min_m2);
    const marketValueScore = Math.min(100, Math.max(0, marketValueRatio * 100));

    // Score global
    const overall = Math.round(
      locationScore * 0.3 +
        conditionScore * 0.25 +
        featuresScore * 0.25 +
        marketValueScore * 0.2
    );

    return {
      overall,
      location: Math.round(locationScore),
      condition: Math.round(conditionScore),
      features: Math.round(featuresScore),
      marketValue: Math.round(marketValueScore)
    };
  }

  /**
   * Calcular ROI y rentabilidad
   */
  private calculateROI(price: number, marketData: MarketData): ROIAnalysis {
    // Alquiler potencial: ~0.5% del precio mensual
    const potentialRent = Math.round(price * 0.005);

    // Rentabilidad anual: (alquiler_anual / precio) * 100
    const rentabilidad = Math.round((potentialRent * 12 * 100) / price * 10) / 10;

    // Demanda según tendencia
    let demand: "alta" | "media" | "baja" = "media";
    if (marketData.tendencia === "subiendo") demand = "alta";
    if (marketData.tendencia === "bajando") demand = "baja";

    // Tiempo de venta estimado
    let timeToSell = "2-4 meses";
    if (demand === "alta") timeToSell = "1-2 meses";
    if (demand === "baja") timeToSell = "6+ meses";

    // Recomendación de inversión
    let investmentRecommendation = "";
    if (rentabilidad >= 6) {
      investmentRecommendation =
        "Excelente inversión para alquiler. Rentabilidad superior a la media.";
    } else if (rentabilidad >= 4) {
      investmentRecommendation =
        "Buena inversión. Rentabilidad en línea con el mercado.";
    } else {
      investmentRecommendation =
        "Mejor para vivienda habitual. Rentabilidad limitada para inversión.";
    }

    return {
      potentialRent,
      rentabilidad,
      timeToSell,
      demand,
      investmentRecommendation
    };
  }
}

// Export singleton
export const valuationCalculator = new ValuationCalculator();
