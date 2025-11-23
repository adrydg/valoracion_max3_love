/**
 * Servicio para acceder a datos del Registro de la Propiedad
 * TOOL: get_registro_cp
 */

import preciosPorCP from "@/data/precios_por_cp.json";
import type { DatosRegistradores } from "./types";

/**
 * Parsea el precio del formato string del CSV a número
 * Ejemplos: "5.200" → 5200, "5200" → 5200
 */
function parsePrecio(precioStr: string | number): number {
  if (typeof precioStr === "number") return precioStr;

  // Eliminar puntos de miles y comas decimales
  const cleaned = precioStr.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned);
}

/**
 * TOOL: get_registro_cp
 * Obtiene datos oficiales del Colegio de Registradores por código postal
 */
export function getRegistroCP(cp: string): DatosRegistradores | null {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📊 CONSULTANDO DATOS DE REGISTRADORES`);
  console.log(`Código Postal: ${cp}`);
  console.log(`${"=".repeat(80)}\n`);

  // Buscar en el JSON
  const data = (preciosPorCP as any)[cp];

  if (!data || !data.precio) {
    console.log(`❌ No hay datos de Registradores para el CP ${cp}`);
    console.log(`${"=".repeat(80)}\n`);
    return null;
  }

  const precioNumerico = parsePrecio(data.precio);

  const resultado: DatosRegistradores = {
    cp,
    precio_m2_registro_cp: precioNumerico,
    anio_registro_cp: data.año || data.anio || 2024, // Fallback a 2024
    num_operaciones_cp: data.operaciones || data.num_operaciones,
    municipio: data.municipio,
    provincia: data.provincia,
  };

  console.log(`✅ Datos encontrados:`);
  console.log(`   Precio: ${resultado.precio_m2_registro_cp.toLocaleString()} €/m²`);
  console.log(`   Año: ${resultado.anio_registro_cp}`);
  console.log(`   Operaciones: ${resultado.num_operaciones_cp || "N/A"}`);
  console.log(`   Municipio: ${resultado.municipio || "N/A"}`);
  console.log(`${"=".repeat(80)}\n`);

  return resultado;
}

/**
 * Función auxiliar para calcular el precio actualizado
 * aplicando el factor de subida típico por zona
 */
export function calcularPrecioActualizado(
  precioRegistradores: number,
  anio: number,
  tipoZona: "prime" | "buena" | "media" | "periferia"
): {
  precio_actualizado: number;
  factor_aplicado: number;
  explicacion: string;
} {
  // Factores de subida según zona
  const FACTORES = {
    prime: 1.28, // +28%
    buena: 1.20, // +20%
    media: 1.15, // +15%
    periferia: 1.10, // +10%
  };

  const factor = FACTORES[tipoZona];

  // Si el dato es muy antiguo, aplicar factor adicional
  const edadDato = 2025 - anio;
  let factorAntiguedad = 1.0;
  if (edadDato >= 3) factorAntiguedad = 1.05; // +5% por cada 3 años
  if (edadDato >= 5) factorAntiguedad = 1.10; // +10% si es de 2020 o antes

  const factorTotal = factor * factorAntiguedad;
  const precioActualizado = Math.round(precioRegistradores * factorTotal);

  const explicacion = `Dato de Registradores ${anio} (${precioRegistradores.toLocaleString()} €/m²) actualizado con factor ${(factorTotal - 1) * 100}% (zona ${tipoZona})`;

  return {
    precio_actualizado: precioActualizado,
    factor_aplicado: factorTotal,
    explicacion,
  };
}
