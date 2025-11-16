/**
 * Módulo de cálculo de valoración
 *
 * IMPORTANTE: Este módulo NO depende de Claude. Es lógica pura de cálculo.
 * Puedes testear, modificar y auditar sin hacer llamadas a la API.
 */

import { VALUATION_CONFIG } from './config';
import type { PropertyData, MarketData, Adjustment, ValuationResult } from './types';

/**
 * Parsea el precio de Registradores del formato "1.866 €/m²" a número
 * y aplica el incremento configurado
 */
export function parsePrecioRegistradores(precioTexto: string): number | null {
  try {
    // "1.866 €/m²" → quitar todo excepto números y coma → "1866" → aplicar incremento
    const numero = precioTexto
      .replace(/[€\/m²\s]/g, '')  // quitar €, /, m², espacios
      .replace(/\./g, '')          // quitar puntos (separadores de miles)
      .replace(',', '.');          // cambiar coma decimal por punto

    const precioBase = parseFloat(numero);
    const precioAjustado = Math.round(precioBase * VALUATION_CONFIG.REGISTRADORES_INCREMENT);

    console.log(`💰 Precio Registradores: ${precioBase}€/m² → ${precioAjustado}€/m² (+${((VALUATION_CONFIG.REGISTRADORES_INCREMENT - 1) * 100).toFixed(0)}%)`);

    return precioAjustado;
  } catch (error) {
    console.error("❌ Error parseando precio de Registradores:", error);
    return null;
  }
}

/**
 * Calcula los ajustes que se aplicarán al precio base
 */
function calculateAdjustments(property: PropertyData): { adjustments: Adjustment[], totalFactor: number } {
  const adjustments: Adjustment[] = [];
  let totalFactor = 1.0;

  // 1. AJUSTE POR SUPERFICIE
  if (property.squareMeters < VALUATION_CONFIG.SURFACE_ADJUSTMENTS.SMALL.threshold) {
    const factor = VALUATION_CONFIG.SURFACE_ADJUSTMENTS.SMALL.factor;
    const percentage = (factor - 1) * 100;
    adjustments.push({
      factor: VALUATION_CONFIG.SURFACE_ADJUSTMENTS.SMALL.label,
      value: `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`,
      percentage: percentage,
    });
    totalFactor *= factor;
  } else if (property.squareMeters > VALUATION_CONFIG.SURFACE_ADJUSTMENTS.LARGE.threshold) {
    const factor = VALUATION_CONFIG.SURFACE_ADJUSTMENTS.LARGE.factor;
    const percentage = (factor - 1) * 100;
    adjustments.push({
      factor: VALUATION_CONFIG.SURFACE_ADJUSTMENTS.LARGE.label,
      value: `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`,
      percentage: percentage,
    });
    totalFactor *= factor;
  }

  // 2. AJUSTE POR PLANTA + ASCENSOR
  if (property.floor && property.hasElevator !== undefined) {
    const floorConfig = property.hasElevator
      ? VALUATION_CONFIG.FLOOR_WITH_ELEVATOR
      : VALUATION_CONFIG.FLOOR_WITHOUT_ELEVATOR;

    const floorAdjustment = floorConfig[property.floor];
    if (floorAdjustment) {
      const factor = floorAdjustment.factor;
      const percentage = (factor - 1) * 100;
      adjustments.push({
        factor: floorAdjustment.label,
        value: `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`,
        percentage: percentage,
      });
      totalFactor *= factor;
    }
  }

  // 3. AJUSTE POR ANTIGÜEDAD
  if (property.buildingAge) {
    const ageConfig = VALUATION_CONFIG.BUILDING_AGE_ADJUSTMENTS[property.buildingAge];
    if (ageConfig) {
      const factor = ageConfig.factor;
      const percentage = (factor - 1) * 100;
      adjustments.push({
        factor: ageConfig.label,
        value: `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`,
        percentage: percentage,
      });
      totalFactor *= factor;
    }
  }

  // 4. AJUSTE POR MÚLTIPLES BAÑOS
  if (
    property.bathrooms &&
    property.bathrooms >= VALUATION_CONFIG.MULTIPLE_BATHROOMS.minBathrooms &&
    property.bedrooms >= VALUATION_CONFIG.MULTIPLE_BATHROOMS.minBedrooms
  ) {
    const factor = VALUATION_CONFIG.MULTIPLE_BATHROOMS.factor;
    const percentage = (factor - 1) * 100;
    adjustments.push({
      factor: VALUATION_CONFIG.MULTIPLE_BATHROOMS.label,
      value: `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`,
      percentage: percentage,
    });
    totalFactor *= factor;
  }

  return { adjustments, totalFactor };
}

/**
 * Calcula la valoración completa de una propiedad
 *
 * @param property - Datos de la propiedad
 * @param marketData - Datos de mercado (obtenidos de Claude o fallback)
 * @param precioRegistradores - Precio opcional del Excel de Registradores
 * @returns ValuationResult con todos los detalles de la valoración
 */
export function calculateValuation(
  property: PropertyData,
  marketData: MarketData,
  precioRegistradores: number | null = null
): ValuationResult {
  console.log('🧮 INICIANDO CÁLCULO DE VALORACIÓN');
  console.log('================================');

  // 1. PRECIO BASE: precio/m² × superficie
  const basePrice = marketData.precio_medio_m2 * property.squareMeters;
  console.log(`📐 Precio base: ${marketData.precio_medio_m2}€/m² × ${property.squareMeters}m² = ${basePrice.toLocaleString()}€`);

  // 2. CALCULAR AJUSTES
  const { adjustments, totalFactor } = calculateAdjustments(property);
  console.log(`📊 Ajustes aplicados: ${adjustments.length}`);
  adjustments.forEach(adj => {
    console.log(`   - ${adj.factor}: ${adj.value}`);
  });
  console.log(`   Total factor: ${totalFactor.toFixed(3)} (${((totalFactor - 1) * 100).toFixed(1)}%)`);

  // 3. APLICAR AJUSTES
  const adjustedPrice = basePrice * totalFactor;
  console.log(`💵 Precio ajustado: ${basePrice.toLocaleString()}€ × ${totalFactor.toFixed(3)} = ${Math.round(adjustedPrice).toLocaleString()}€`);

  // 4. APLICAR OPTIMISMO
  const optimisticPrice = adjustedPrice * VALUATION_CONFIG.OPTIMISM_FACTOR;
  console.log(`📈 Optimismo (+${((VALUATION_CONFIG.OPTIMISM_FACTOR - 1) * 100).toFixed(0)}%): ${Math.round(adjustedPrice).toLocaleString()}€ → ${Math.round(optimisticPrice).toLocaleString()}€`);

  // 5. CALCULAR RANGO CON INCERTIDUMBRE
  const min = Math.round(optimisticPrice * (1 - VALUATION_CONFIG.UNCERTAINTY));
  const max = Math.round(optimisticPrice * (1 + VALUATION_CONFIG.UNCERTAINTY));
  const avg = Math.round(optimisticPrice);
  const uncertainty = `±${(VALUATION_CONFIG.UNCERTAINTY * 100).toFixed(0)}%`;
  console.log(`📏 Rango (${uncertainty}): ${min.toLocaleString()}€ - ${max.toLocaleString()}€`);

  // 6. PRECIO POR M²
  const pricePerM2 = Math.round(avg / property.squareMeters);
  console.log(`📊 Precio final por m²: ${pricePerM2.toLocaleString()}€/m²`);
  console.log('================================\n');

  return {
    avg,
    min,
    max,
    uncertainty,
    pricePerM2,
    precioZona: precioRegistradores,
    adjustments,
    marketData,
    calculatedAt: new Date().toISOString(),
    disclaimer: "Valoración sin comisiones e impuestos",
  };
}

/**
 * Calcula solo el precio base sin ajustes (útil para testing)
 */
export function calculateBasePrice(
  precioM2: number,
  squareMeters: number
): number {
  return precioM2 * squareMeters;
}

/**
 * Aplica un factor de ajuste a un precio
 */
export function applyAdjustmentFactor(
  price: number,
  factor: number
): number {
  return price * factor;
}
