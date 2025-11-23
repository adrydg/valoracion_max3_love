/**
 * Sistema de auditoría para valoraciones
 *
 * Genera informes detallados de cada cálculo para verificación
 */

import { VALUATION_CONFIG } from './config';
import type { PropertyData, MarketData, ValuationResult } from './types';

export interface AuditStep {
  step: number;
  name: string;
  description: string;
  input: any;
  output: any;
  formula?: string;
}

export interface AuditReport {
  timestamp: string;
  property: PropertyData;
  marketData: MarketData;
  steps: AuditStep[];
  finalResult: ValuationResult;
  summary: {
    totalAdjustments: number;
    totalFactorApplied: number;
    priceIncrease: number;
    priceIncreasePercentage: number;
  };
}

/**
 * Genera un informe de auditoría completo de una valoración
 */
export function generateAuditReport(
  property: PropertyData,
  marketData: MarketData,
  valuation: ValuationResult
): AuditReport {
  const steps: AuditStep[] = [];

  // PASO 1: Precio base
  const basePrice = marketData.precio_medio_m2 * property.squareMeters;
  steps.push({
    step: 1,
    name: "Cálculo de precio base",
    description: "Precio medio por m² multiplicado por superficie",
    input: {
      precio_m2: marketData.precio_medio_m2,
      superficie: property.squareMeters,
    },
    output: {
      precio_base: basePrice,
    },
    formula: `${marketData.precio_medio_m2} €/m² × ${property.squareMeters} m² = ${basePrice.toLocaleString('es-ES')} €`
  });

  // PASO 2: Ajustes aplicados
  let currentPrice = basePrice;
  let totalFactor = 1.0;

  valuation.adjustments.forEach((adj, index) => {
    const factor = 1 + (adj.percentage / 100);
    const prevPrice = currentPrice;
    currentPrice = currentPrice * factor;
    totalFactor *= factor;

    steps.push({
      step: 2 + index,
      name: `Ajuste: ${adj.factor}`,
      description: `Aplicar ${adj.value}`,
      input: {
        precio_antes: Math.round(prevPrice),
        factor_ajuste: factor,
        porcentaje: adj.percentage,
      },
      output: {
        precio_despues: Math.round(currentPrice),
        diferencia: Math.round(currentPrice - prevPrice),
      },
      formula: `${Math.round(prevPrice).toLocaleString('es-ES')} € × ${factor} = ${Math.round(currentPrice).toLocaleString('es-ES')} €`
    });
  });

  const priceBeforeOptimism = currentPrice;

  // PASO N: Optimismo
  const optimismStep = steps.length + 1;
  const priceAfterOptimism = priceBeforeOptimism * VALUATION_CONFIG.OPTIMISM_FACTOR;

  steps.push({
    step: optimismStep,
    name: "Factor de optimismo",
    description: `Aplicar ${((VALUATION_CONFIG.OPTIMISM_FACTOR - 1) * 100).toFixed(0)}% de optimismo`,
    input: {
      precio_ajustado: Math.round(priceBeforeOptimism),
      factor_optimismo: VALUATION_CONFIG.OPTIMISM_FACTOR,
    },
    output: {
      precio_optimista: Math.round(priceAfterOptimism),
      aumento: Math.round(priceAfterOptimism - priceBeforeOptimism),
    },
    formula: `${Math.round(priceBeforeOptimism).toLocaleString('es-ES')} € × ${VALUATION_CONFIG.OPTIMISM_FACTOR} = ${Math.round(priceAfterOptimism).toLocaleString('es-ES')} €`
  });

  // PASO FINAL: Rango de incertidumbre
  steps.push({
    step: optimismStep + 1,
    name: "Rango de incertidumbre",
    description: `Calcular rango ±${(VALUATION_CONFIG.UNCERTAINTY * 100).toFixed(0)}%`,
    input: {
      precio_medio: valuation.avg,
      margen_incertidumbre: VALUATION_CONFIG.UNCERTAINTY,
    },
    output: {
      precio_minimo: valuation.min,
      precio_medio: valuation.avg,
      precio_maximo: valuation.max,
    },
    formula: `${valuation.avg.toLocaleString('es-ES')} € ± ${(VALUATION_CONFIG.UNCERTAINTY * 100).toFixed(0)}% = [${valuation.min.toLocaleString('es-ES')} - ${valuation.max.toLocaleString('es-ES')}] €`
  });

  // Resumen
  const summary = {
    totalAdjustments: valuation.adjustments.length,
    totalFactorApplied: totalFactor,
    priceIncrease: valuation.avg - basePrice,
    priceIncreasePercentage: ((valuation.avg - basePrice) / basePrice) * 100,
  };

  return {
    timestamp: new Date().toISOString(),
    property,
    marketData,
    steps,
    finalResult: valuation,
    summary,
  };
}

/**
 * Imprime un informe de auditoría legible en consola
 */
export function printAuditReport(report: AuditReport): void {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📋 INFORME DE AUDITORÍA DE VALORACIÓN');
  console.log('═'.repeat(80));
  console.log(`⏰ Timestamp: ${report.timestamp}`);
  console.log(`📍 Propiedad: ${report.property.street || 'N/A'}, ${report.property.postalCode}`);
  console.log(`📏 Superficie: ${report.property.squareMeters} m²`);
  console.log('─'.repeat(80));

  report.steps.forEach((step) => {
    console.log(`\n${step.step}. ${step.name}`);
    console.log(`   ${step.description}`);
    if (step.formula) {
      console.log(`   📐 Fórmula: ${step.formula}`);
    }
    console.log(`   📥 Input:`, step.input);
    console.log(`   📤 Output:`, step.output);
  });

  console.log('\n' + '─'.repeat(80));
  console.log('📊 RESUMEN FINAL');
  console.log('─'.repeat(80));
  console.log(`Total de ajustes aplicados: ${report.summary.totalAdjustments}`);
  console.log(`Factor total aplicado: ${report.summary.totalFactorApplied.toFixed(3)} (${((report.summary.totalFactorApplied - 1) * 100).toFixed(1)}%)`);
  console.log(`Incremento total: ${report.summary.priceIncrease.toLocaleString('es-ES')} € (+${report.summary.priceIncreasePercentage.toFixed(1)}%)`);
  console.log('\n💰 VALORACIÓN FINAL:');
  console.log(`   Mínimo:  ${report.finalResult.min.toLocaleString('es-ES')} €`);
  console.log(`   Medio:   ${report.finalResult.avg.toLocaleString('es-ES')} €`);
  console.log(`   Máximo:  ${report.finalResult.max.toLocaleString('es-ES')} €`);
  console.log(`   €/m²:    ${report.finalResult.pricePerM2.toLocaleString('es-ES')} €`);
  console.log('═'.repeat(80));
  console.log('\n');
}

/**
 * Exporta un informe de auditoría a JSON
 */
export function exportAuditReportJSON(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Exporta un informe de auditoría a formato de tabla para CSV/Excel
 */
export function exportAuditReportCSV(report: AuditReport): string {
  const rows: string[] = [];

  // Header
  rows.push('Paso,Nombre,Descripción,Fórmula,Input,Output');

  // Steps
  report.steps.forEach((step) => {
    const inputStr = JSON.stringify(step.input).replace(/"/g, '""');
    const outputStr = JSON.stringify(step.output).replace(/"/g, '""');
    const formula = (step.formula || '').replace(/"/g, '""');

    rows.push(`${step.step},"${step.name}","${step.description}","${formula}","${inputStr}","${outputStr}"`);
  });

  // Summary
  rows.push('');
  rows.push('RESUMEN');
  rows.push(`Total ajustes,${report.summary.totalAdjustments}`);
  rows.push(`Factor total,${report.summary.totalFactorApplied.toFixed(3)}`);
  rows.push(`Incremento,${report.summary.priceIncrease}`);
  rows.push(`Incremento %,${report.summary.priceIncreasePercentage.toFixed(2)}%`);
  rows.push('');
  rows.push('RESULTADO FINAL');
  rows.push(`Mínimo,${report.finalResult.min}`);
  rows.push(`Medio,${report.finalResult.avg}`);
  rows.push(`Máximo,${report.finalResult.max}`);
  rows.push(`€/m²,${report.finalResult.pricePerM2}`);

  return rows.join('\n');
}

/**
 * Verifica que todos los pasos se hayan aplicado correctamente
 */
export function validateAuditReport(report: AuditReport): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verificar que hay pasos
  if (report.steps.length === 0) {
    errors.push('No hay pasos de cálculo registrados');
  }

  // Verificar que el precio final coincide con el último paso
  const lastStep = report.steps[report.steps.length - 1];
  if (lastStep && lastStep.output.precio_medio !== report.finalResult.avg) {
    errors.push(`Precio final no coincide: ${lastStep.output.precio_medio} vs ${report.finalResult.avg}`);
  }

  // Verificar que todos los ajustes están registrados
  if (report.summary.totalAdjustments !== report.finalResult.adjustments.length) {
    errors.push(`Número de ajustes no coincide: ${report.summary.totalAdjustments} vs ${report.finalResult.adjustments.length}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
