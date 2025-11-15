/**
 * Sistema de Índice de Precisión
 * Calcula cuánta precisión tiene la valoración según datos proporcionados
 */

import { PrecisionScore } from "../types";

/**
 * Calcula el índice de precisión basado en los datos proporcionados
 */
export function calculatePrecisionIndex(data: {
  // Datos básicos (siempre requeridos)
  hasPostalCode: boolean;
  hasSquareMeters: boolean;
  hasBedrooms: boolean;
  hasPropertyType: boolean;

  // Datos nivel 1
  hasBathrooms?: boolean;
  hasFloor?: boolean;
  hasElevator?: boolean;
  hasBuildingAge?: boolean;

  // Datos nivel 2
  hasCondition?: boolean;
  hasOrientation?: boolean;
  hasTerraceInfo?: boolean;
  hasGarageInfo?: boolean;
  hasStorageInfo?: boolean;

  // Fotos
  photosCount?: number;
}): PrecisionScore {
  let score = 0;
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  // DATOS BÁSICOS (40 puntos)
  const basicFields = [
    { key: "hasPostalCode", points: 10, label: "Código postal" },
    { key: "hasSquareMeters", points: 10, label: "Metros cuadrados" },
    { key: "hasBedrooms", points: 10, label: "Habitaciones" },
    { key: "hasPropertyType", points: 10, label: "Tipo de propiedad" },
  ];

  basicFields.forEach((field) => {
    if (data[field.key as keyof typeof data]) {
      score += field.points;
    } else {
      missingFields.push(field.label);
    }
  });

  // DATOS NIVEL 1 (30 puntos)
  const level1Fields = [
    { key: "hasBathrooms", points: 8, label: "Número de baños" },
    { key: "hasFloor", points: 8, label: "Planta del inmueble" },
    { key: "hasElevator", points: 7, label: "Ascensor" },
    { key: "hasBuildingAge", points: 7, label: "Antigüedad del edificio" },
  ];

  level1Fields.forEach((field) => {
    if (data[field.key as keyof typeof data]) {
      score += field.points;
    } else {
      suggestions.push(`Añade ${field.label.toLowerCase()} para mejorar la precisión`);
    }
  });

  // DATOS NIVEL 2 (20 puntos)
  const level2Fields = [
    { key: "hasCondition", points: 5, label: "Estado de conservación" },
    { key: "hasOrientation", points: 4, label: "Orientación" },
    { key: "hasTerraceInfo", points: 4, label: "Información de terraza" },
    { key: "hasGarageInfo", points: 4, label: "Plaza de garaje" },
    { key: "hasStorageInfo", points: 3, label: "Trastero" },
  ];

  level2Fields.forEach((field) => {
    if (data[field.key as keyof typeof data]) {
      score += field.points;
    }
  });

  // FOTOS (10 puntos)
  const photosCount = data.photosCount || 0;
  if (photosCount >= 5) {
    score += 10;
  } else if (photosCount >= 3) {
    score += 7;
    suggestions.push("Sube 2 fotos más para máxima precisión");
  } else if (photosCount >= 1) {
    score += 4;
    suggestions.push("Sube más fotos para reducir incertidumbre a ±8%");
  } else {
    suggestions.push("Sube fotos del inmueble para reducir margen a ±8%");
  }

  // Calcular nivel y porcentaje
  let level: PrecisionScore["level"];
  let percentage: string;
  let confidence: PrecisionScore["confidence"];

  if (score >= 85) {
    level = "muy-alta";
    percentage = "±8%";
    confidence = "alta";
  } else if (score >= 65) {
    level = "alta";
    percentage = "±12%";
    confidence = "alta";
  } else if (score >= 45) {
    level = "media";
    percentage = "±15%";
    confidence = "media";
  } else {
    level = "baja";
    percentage = "±20%";
    confidence = "baja";
  }

  // Calcular completeness
  const totalFieldsProvided =
    basicFields.filter((f) => data[f.key as keyof typeof data]).length +
    level1Fields.filter((f) => data[f.key as keyof typeof data]).length +
    level2Fields.filter((f) => data[f.key as keyof typeof data]).length +
    (photosCount > 0 ? 1 : 0);

  const totalFieldsPossible =
    basicFields.length + level1Fields.length + level2Fields.length + 1;

  const completeness = Math.round((totalFieldsProvided / totalFieldsPossible) * 100);

  return {
    score: Math.round(score),
    level,
    percentage,
    missingFields: missingFields.slice(0, 3),
    suggestions: suggestions.slice(0, 2),
    completeness,
    confidence,
  };
}

/**
 * Genera mensaje descriptivo del índice de precisión
 */
export function getPrecisionMessage(precision: PrecisionScore): {
  title: string;
  description: string;
  icon: string;
  color: string;
} {
  switch (precision.level) {
    case "muy-alta":
      return {
        title: "Precisión Muy Alta",
        description: `Valoración con margen de error de solo ${precision.percentage}. Incluye análisis detallado con IA.`,
        icon: "🎯",
        color: "green",
      };
    case "alta":
      return {
        title: "Precisión Alta",
        description: `Valoración confiable con margen ${precision.percentage}. Añade fotos para reducirlo a ±8%.`,
        icon: "✅",
        color: "blue",
      };
    case "media":
      return {
        title: "Precisión Media",
        description: `Estimación orientativa con margen ${precision.percentage}. Completa más datos para mayor precisión.`,
        icon: "📊",
        color: "orange",
      };
    case "baja":
      return {
        title: "Precisión Básica",
        description: `Rango amplio de ${precision.percentage}. Responde más preguntas para afinar el valor.`,
        icon: "📍",
        color: "gray",
      };
  }
}
