/**
 * Reglas de ajuste porcentual según Tinsa + Idealista
 * Todos los porcentajes están basados en datos de mercado reales
 */

import {
  PropertyCondition,
  FloorLevel,
  Orientation,
  TerraceSize,
  BuildingAge,
  Adjustment,
  PropertyType,
  PhotoAnalysis,
  DetailedPropertyData
} from "../types";

// ============================================
// AJUSTE POR SUPERFICIE
// ============================================

export function getSizeAdjustment(squareMeters: number): Adjustment | null {
  if (squareMeters < 50) {
    return {
      factor: "Superficie pequeña",
      value: "+10%",
      percentage: 10,
      description: "Pisos pequeños tienen mayor demanda por m²"
    };
  }

  if (squareMeters > 150) {
    return {
      factor: "Superficie grande",
      value: "-5%",
      percentage: -5,
      description: "Inmuebles grandes tienen menor demanda relativa"
    };
  }

  return null; // Rango normal 50-150m²
}

// ============================================
// AJUSTE POR ESTADO DE CONSERVACIÓN
// ============================================

export function getConditionAdjustment(condition: PropertyCondition): Adjustment {
  const adjustments: Record<PropertyCondition, Adjustment> = {
    "perfecto": {
      factor: "Estado perfecto/reformado",
      value: "+5%",
      percentage: 5,
      description: "Completamente reformado o en perfecto estado"
    },
    "muy-bueno": {
      factor: "Estado muy bueno",
      value: "+2%",
      percentage: 2,
      description: "Muy bien conservado"
    },
    "bueno": {
      factor: "Estado bueno",
      value: "0%",
      percentage: 0,
      description: "Buen estado de conservación"
    },
    "aceptable": {
      factor: "Estado aceptable",
      value: "-8%",
      percentage: -8,
      description: "Necesita pequeñas mejoras"
    },
    "reformar": {
      factor: "A reformar",
      value: "-15%",
      percentage: -15,
      description: "Requiere reforma integral"
    }
  };

  return adjustments[condition];
}

// ============================================
// AJUSTE POR PLANTA
// ============================================

export function getFloorAdjustment(
  floor: FloorLevel,
  hasElevator: boolean
): Adjustment {
  if (hasElevator) {
    const adjustments: Record<FloorLevel, Adjustment> = {
      "bajo": {
        factor: "Planta baja (con ascensor)",
        value: "-10%",
        percentage: -10,
        description: "Menos privacidad y luz"
      },
      "entresuelo": {
        factor: "Entresuelo (con ascensor)",
        value: "-5%",
        percentage: -5,
        description: "Altura limitada"
      },
      "1-2": {
        factor: "Planta 1ª-2ª (con ascensor)",
        value: "0%",
        percentage: 0,
        description: "Altura estándar"
      },
      "3-5": {
        factor: "Planta 3ª-5ª (con ascensor)",
        value: "+3%",
        percentage: 3,
        description: "Buenas vistas y luz"
      },
      "6+": {
        factor: "Planta 6ª+ (con ascensor)",
        value: "+5%",
        percentage: 5,
        description: "Excelentes vistas"
      },
      "atico": {
        factor: "Ático (con ascensor)",
        value: "+8%",
        percentage: 8,
        description: "Premium: vistas y privacidad"
      }
    };
    return adjustments[floor];
  } else {
    // SIN ascensor
    const adjustments: Record<FloorLevel, Adjustment> = {
      "bajo": {
        factor: "Planta baja (sin ascensor)",
        value: "-10%",
        percentage: -10,
        description: "Sin ascensor pero acceso directo"
      },
      "entresuelo": {
        factor: "Entresuelo (sin ascensor)",
        value: "-10%",
        percentage: -10,
        description: "Sin ascensor, altura limitada"
      },
      "1-2": {
        factor: "Planta 1ª-2ª (sin ascensor)",
        value: "-5%",
        percentage: -5,
        description: "Escaleras manejables"
      },
      "3-5": {
        factor: "Planta 3ª-5ª (sin ascensor)",
        value: "-25%",
        percentage: -25,
        description: "Muchas escaleras diarias"
      },
      "6+": {
        factor: "Planta 6ª+ (sin ascensor)",
        value: "-30%",
        percentage: -30,
        description: "Inaccesible para muchos compradores"
      },
      "atico": {
        factor: "Ático (sin ascensor)",
        value: "-20%",
        percentage: -20,
        description: "Vistas pero muy poco accesible"
      }
    };
    return adjustments[floor];
  }
}

// ============================================
// AJUSTE POR ORIENTACIÓN
// ============================================

export function getOrientationAdjustment(orientation: Orientation): Adjustment {
  const adjustments: Record<Orientation, Adjustment> = {
    "norte": {
      factor: "Orientación norte",
      value: "-3%",
      percentage: -3,
      description: "Menos luz natural"
    },
    "este": {
      factor: "Orientación este",
      value: "+2%",
      percentage: 2,
      description: "Sol por la mañana"
    },
    "oeste": {
      factor: "Orientación oeste",
      value: "+2%",
      percentage: 2,
      description: "Sol por la tarde"
    },
    "sur": {
      factor: "Orientación sur",
      value: "+5%",
      percentage: 5,
      description: "Máxima luz durante todo el día"
    },
    "multiple": {
      factor: "Orientación múltiple",
      value: "+3%",
      percentage: 3,
      description: "Exterior a varias orientaciones"
    }
  };

  return adjustments[orientation];
}

// ============================================
// AJUSTE POR TERRAZA
// ============================================

export function getTerraceAdjustment(terraceSize: TerraceSize): Adjustment | null {
  const adjustments: Record<TerraceSize, Adjustment | null> = {
    "sin-terraza": null,
    "pequena": {
      factor: "Terraza pequeña",
      value: "+8%",
      percentage: 8,
      description: "Terraza < 10m²"
    },
    "mediana": {
      factor: "Terraza mediana",
      value: "+15%",
      percentage: 15,
      description: "Terraza 10-15m²"
    },
    "grande": {
      factor: "Terraza grande",
      value: "+22%",
      percentage: 22,
      description: "Terraza > 15m²"
    }
  };

  return adjustments[terraceSize];
}

// ============================================
// AJUSTE POR ANTIGÜEDAD
// ============================================

export function getBuildingAgeAdjustment(buildingAge: BuildingAge): Adjustment {
  const adjustments: Record<BuildingAge, Adjustment> = {
    "nueva": {
      factor: "Edificio nuevo",
      value: "+10%",
      percentage: 10,
      description: "Construcción < 5 años"
    },
    "reciente": {
      factor: "Edificio reciente",
      value: "+5%",
      percentage: 5,
      description: "Construcción 5-15 años"
    },
    "moderna": {
      factor: "Edificio moderno",
      value: "0%",
      percentage: 0,
      description: "Construcción 15-30 años"
    },
    "antigua": {
      factor: "Edificio antiguo",
      value: "-5%",
      percentage: -5,
      description: "Construcción 30-50 años"
    },
    "muy-antigua": {
      factor: "Edificio muy antiguo",
      value: "-10%",
      percentage: -10,
      description: "Construcción > 50 años"
    }
  };

  return adjustments[buildingAge];
}

// ============================================
// AJUSTE POR NÚMERO DE BAÑOS
// ============================================

export function getBathroomsAdjustment(
  bathrooms: number,
  bedrooms: number
): Adjustment | null {
  // Más de 1 baño es valorado positivamente
  if (bathrooms >= 2 && bedrooms >= 2) {
    return {
      factor: "Múltiples baños",
      value: "+5%",
      percentage: 5,
      description: `${bathrooms} baños para ${bedrooms} habitaciones`
    };
  }

  return null;
}

// ============================================
// AJUSTE POR GARAJE (PORCENTUAL)
// ============================================

export function getGarageAdjustment(hasGarage: boolean): Adjustment | null {
  if (hasGarage) {
    return {
      factor: "Plaza de garaje incluida",
      value: "+8%",
      percentage: 8,
      description: "Parking privado"
    };
  }
  return null;
}

// ============================================
// AJUSTE POR TRASTERO (PORCENTUAL)
// ============================================

export function getStorageAdjustment(hasStorage: boolean): Adjustment | null {
  if (hasStorage) {
    return {
      factor: "Trastero incluido",
      value: "+3%",
      percentage: 3,
      description: "Espacio de almacenamiento extra"
    };
  }
  return null;
}

// ============================================
// AJUSTE POR PISCINA
// ============================================

export function getPoolAdjustment(hasPool: boolean): Adjustment | null {
  if (hasPool) {
    return {
      factor: "Piscina comunitaria",
      value: "+10%",
      percentage: 10,
      description: "Instalación deportiva y recreativa"
    };
  }
  return null;
}

// ============================================
// AJUSTE POR ANÁLISIS DE FOTOS
// ============================================

export function getPhotoAnalysisAdjustment(
  photosAnalysis?: PhotoAnalysis
): Adjustment | null {
  if (!photosAnalysis) return null;

  const suggestion = photosAnalysis.adjustmentSuggestion;

  if (suggestion === 0) return null;

  return {
    factor: "Análisis visual con IA",
    value: `${suggestion > 0 ? '+' : ''}${suggestion}%`,
    percentage: suggestion,
    description: `Basado en calidad visual: ${photosAnalysis.observations.join(", ")}`
  };
}

// ============================================
// CALCULAR TODOS LOS AJUSTES
// ============================================

export function calculateAllAdjustments(
  property: Partial<DetailedPropertyData>,
  photosAnalysis?: PhotoAnalysis
): Adjustment[] {
  const adjustments: Adjustment[] = [];

  // Superficie
  if (property.squareMeters) {
    const sizeAdj = getSizeAdjustment(property.squareMeters);
    if (sizeAdj) adjustments.push(sizeAdj);
  }

  // Estado
  if (property.condition) {
    adjustments.push(getConditionAdjustment(property.condition));
  }

  // Planta
  if (property.floor && property.hasElevator !== undefined) {
    adjustments.push(getFloorAdjustment(property.floor, property.hasElevator));
  }

  // Orientación
  if (property.orientation) {
    adjustments.push(getOrientationAdjustment(property.orientation));
  }

  // Terraza
  if (property.terraceSize) {
    const terraceAdj = getTerraceAdjustment(property.terraceSize);
    if (terraceAdj) adjustments.push(terraceAdj);
  }

  // Antigüedad
  if (property.buildingAge) {
    adjustments.push(getBuildingAgeAdjustment(property.buildingAge));
  }

  // Baños
  if (property.bathrooms && property.bedrooms) {
    const bathroomsAdj = getBathroomsAdjustment(property.bathrooms, property.bedrooms);
    if (bathroomsAdj) adjustments.push(bathroomsAdj);
  }

  // Garaje (porcentual)
  if (property.hasGarage) {
    const garageAdj = getGarageAdjustment(property.hasGarage);
    if (garageAdj) adjustments.push(garageAdj);
  }

  // Trastero (porcentual)
  if (property.hasStorage) {
    const storageAdj = getStorageAdjustment(property.hasStorage);
    if (storageAdj) adjustments.push(storageAdj);
  }

  // Piscina
  if (property.hasPool) {
    const poolAdj = getPoolAdjustment(property.hasPool);
    if (poolAdj) adjustments.push(poolAdj);
  }

  // Fotos IA
  if (photosAnalysis) {
    const photoAdj = getPhotoAnalysisAdjustment(photosAnalysis);
    if (photoAdj) adjustments.push(photoAdj);
  }

  return adjustments;
}

// ============================================
// OBTENER PORCENTAJE TOTAL (MULTIPLICATIVO)
// ============================================

export function getTotalAdjustmentPercentage(adjustments: Adjustment[]): number {
  // Multiplicar todos los factores (no sumar)
  let factor = 1.0;

  for (const adj of adjustments) {
    factor *= (1 + adj.percentage / 100);
  }

  // Convertir de vuelta a porcentaje
  return (factor - 1) * 100;
}
