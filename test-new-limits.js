/**
 * Test rápido para verificar que los nuevos límites funcionan
 */

import { calculateValuation } from "./lib/valuation/calculator.js";

console.log(`\n${'═'.repeat(80)}`);
console.log(`🧪 TEST DE NUEVOS LÍMITES DE VALORACIÓN`);
console.log(`${'═'.repeat(80)}\n`);

// Mock de marketData
const marketData = {
  postalCode: "28440",
  province: "Madrid",
  municipality: "Guadarrama",
  neighborhood: "Centro",
  precio_medio_m2: 2317, // Ya con el +15%
  precio_min_m2: 2100,
  precio_max_m2: 2500,
  demanda_zona: "media",
  tendencia: "estable",
  fuente: "Registradores + 15%",
  fecha_actualizacion: new Date().toISOString(),
};

console.log(`📍 Ubicación de prueba: Guadarrama (Madrid)`);
console.log(`💰 Precio base: 2.317 €/m² (Registradores 2.015 €/m² + 15%)\n`);

// CASO 1: Propiedad muy mala (debería activar límite mínimo)
console.log(`${'─'.repeat(80)}`);
console.log(`🔴 CASO 1: Propiedad muy penalizada (debería activar límite mínimo 0.90)`);
console.log(`${'─'.repeat(80)}\n`);

const propertyMala = {
  postalCode: "28440",
  municipality: "Guadarrama",
  squareMeters: 100,
  bedrooms: 3,
  bathrooms: 1,
  floor: "6+",           // 6ª planta
  hasElevator: false,    // SIN ascensor (-15%)
  buildingAge: "muy-antigua", // >50 años (-5%)
  propertyType: "piso",
};

console.log(`📋 Características:`);
console.log(`   - 100m², 3 hab, 1 baño`);
console.log(`   - 6ª+ planta SIN ascensor (-15%)`);
console.log(`   - Muy antiguo >50 años (-5%)`);
console.log(`   - SIN ajustes: 0.85 × 0.95 = 0.8075 (-19.25%)`);
console.log(`   - CON límite: debería quedar en 0.90 (-10% máx)\n`);

const valuationMala = calculateValuation(propertyMala, marketData, 2015);

console.log(`\n✅ Resultado: ${valuationMala.avg.toLocaleString()}€`);
console.log(`   Rango: ${valuationMala.min.toLocaleString()}€ - ${valuationMala.max.toLocaleString()}€\n`);

// CASO 2: Propiedad premium (debería funcionar normalmente)
console.log(`${'─'.repeat(80)}`);
console.log(`🟢 CASO 2: Propiedad buena (NO debería activar límites)`);
console.log(`${'─'.repeat(80)}\n`);

const propertyBuena = {
  postalCode: "28440",
  municipality: "Guadarrama",
  squareMeters: 100,
  bedrooms: 4,
  bathrooms: 2,
  floor: "3-5",          // 3ª-5ª planta
  hasElevator: true,     // CON ascensor (+3%)
  buildingAge: "nueva",  // <5 años (+10%)
  propertyType: "piso",
};

console.log(`📋 Características:`);
console.log(`   - 100m², 4 hab, 2 baños`);
console.log(`   - 3ª-5ª planta CON ascensor (+3%)`);
console.log(`   - Nuevo <5 años (+10%)`);
console.log(`   - Múltiples baños (+5%)`);
console.log(`   - Ajustes: 1.03 × 1.10 × 1.05 = 1.189 (+18.9%)`);
console.log(`   - NO debería activar límites\n`);

const valuationBuena = calculateValuation(propertyBuena, marketData, 2015);

console.log(`\n✅ Resultado: ${valuationBuena.avg.toLocaleString()}€`);
console.log(`   Rango: ${valuationBuena.min.toLocaleString()}€ - ${valuationBuena.max.toLocaleString()}€\n`);

// CASO 3: Propiedad súper premium (podría activar límite máximo si se implementan más ajustes)
console.log(`${'─'.repeat(80)}`);
console.log(`🟡 CASO 3: Propiedad súper premium`);
console.log(`${'─'.repeat(80)}\n`);

const propertySuperPremium = {
  postalCode: "28440",
  municipality: "Guadarrama",
  squareMeters: 45,      // Pequeña (+10%)
  bedrooms: 2,
  bathrooms: 2,
  floor: "atico",        // Ático
  hasElevator: true,     // CON ascensor (+8%)
  buildingAge: "nueva",  // <5 años (+10%)
  propertyType: "piso",
};

console.log(`📋 Características:`);
console.log(`   - 45m² (pequeño +10%), 2 hab, 2 baños`);
console.log(`   - Ático CON ascensor (+8%)`);
console.log(`   - Nuevo <5 años (+10%)`);
console.log(`   - Múltiples baños (+5%)`);
console.log(`   - Ajustes: 1.10 × 1.08 × 1.10 × 1.05 = 1.367 (+36.7%)`);
console.log(`   - Debería activar límite máximo 1.25 (+25%)\n`);

const valuationSuper = calculateValuation(propertySuperPremium, marketData, 2015);

console.log(`\n✅ Resultado: ${valuationSuper.avg.toLocaleString()}€`);
console.log(`   Rango: ${valuationSuper.min.toLocaleString()}€ - ${valuationSuper.max.toLocaleString()}€\n`);

console.log(`${'═'.repeat(80)}`);
console.log(`📊 RESUMEN DE CAMBIOS IMPLEMENTADOS`);
console.log(`${'═'.repeat(80)}\n`);

console.log(`✅ Límites de ajustes acumulados:`);
console.log(`   - Mínimo: 0.90 (-10% máximo)`);
console.log(`   - Máximo: 1.25 (+25% máximo)`);
console.log(`   - Con optimismo +10%: rango final 0.99 a 1.375\n`);

console.log(`✅ Ajustes suavizados:`);
console.log(`   - Planta baja con ascensor: -10% → -5%`);
console.log(`   - Planta 3ª-5ª sin ascensor: -25% → -12%`);
console.log(`   - Planta 6ª+ sin ascensor: -30% → -15%`);
console.log(`   - Ático sin ascensor: -20% → -10%`);
console.log(`   - Antiguo (30-50 años): -5% → -3%`);
console.log(`   - Muy antiguo (>50 años): -10% → -5%\n`);

console.log(`✅ Test completado\n`);
