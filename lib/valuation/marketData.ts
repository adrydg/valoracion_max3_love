/**
 * Gestión inteligente de datos de mercado
 *
 * Prioriza el JSON de Registradores. Solo llama a Claude si no hay precio.
 */

import { getMarketDataFromClaude } from './claudeIntegration';
import type { PropertyData, MarketData } from './types';

/**
 * Construye MarketData usando SOLO el precio de Registradores
 * (sin llamar a Claude - ahorro de tokens)
 */
export function buildMarketDataFromRegistradores(
  property: PropertyData,
  precioRegistradores: number
): MarketData {
  console.log(`✅ Usando precio de Registradores: ${precioRegistradores}€/m² (SIN llamar a Claude)`);

  // Calcular rango ±10% basado en el precio de Registradores
  const precioMin = Math.round(precioRegistradores * 0.90);
  const precioMax = Math.round(precioRegistradores * 1.10);

  return {
    postalCode: property.postalCode,
    municipality: property.municipality || 'No especificado',
    neighborhood: undefined, // No tenemos esta info sin Claude
    province: 'España', // Podría mejorarse con un mapa de CP a provincia
    precio_medio_m2: precioRegistradores,
    precio_min_m2: precioMin,
    precio_max_m2: precioMax,
    demanda_zona: 'media', // Dato conservador sin Claude
    tendencia: 'estable', // Dato conservador sin Claude
    descripcion_zona: `Datos oficiales del Colegio de Registradores de España para el código postal ${property.postalCode}`,
    fuente: 'Registradores 2024',
    fecha_actualizacion: new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10),
  };
}

/**
 * Obtiene datos de mercado con estrategia inteligente:
 * 1. Si hay precio de Registradores → Usar ese precio (SIN llamar a Claude)
 * 2. Si NO hay precio → Llamar a Claude
 *
 * Ahorra tokens cuando ya tenemos datos oficiales.
 * Ahora también retorna el prompt si se llamó a Claude (para historial).
 */
export async function getMarketDataSmart(
  property: PropertyData,
  precioRegistradores: number | null
): Promise<{ marketData: MarketData; prompt?: string }> {
  // CASO 1: HAY PRECIO EN JSON → NO llamar a Claude
  if (precioRegistradores) {
    console.log(`💰 Precio en JSON encontrado: ${precioRegistradores}€/m²`);
    console.log(`⏭️  SALTANDO llamada a Claude (ahorro de tokens)`);

    return {
      marketData: buildMarketDataFromRegistradores(property, precioRegistradores),
      prompt: undefined,
    };
  }

  // CASO 2: NO HAY PRECIO → SÍ llamar a Claude
  console.log(`⚠️  No hay precio en JSON para CP ${property.postalCode}`);
  console.log(`🤖 Consultando a Claude...`);

  try {
    const result = await getMarketDataFromClaude(property, null);
    return result;
  } catch (error) {
    console.error('❌ Error llamando a Claude:', error);

    // Fallback: construir datos genéricos
    console.warn('⚠️  Usando datos de mercado genéricos como fallback');
    return {
      marketData: {
        postalCode: property.postalCode,
        municipality: property.municipality || 'No especificado',
        neighborhood: undefined,
        province: 'España',
        precio_medio_m2: 3000, // Precio genérico conservador
        precio_min_m2: 2700,
        precio_max_m2: 3300,
        demanda_zona: 'media',
        tendencia: 'estable',
        descripcion_zona: 'Estimación genérica (sin datos específicos disponibles)',
        fuente: 'Estimación genérica',
        fecha_actualizacion: new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10),
      },
      prompt: undefined,
    };
  }
}

/**
 * Verifica si debe llamar a Claude
 * (útil para logs y debugging)
 */
export function shouldCallClaude(precioRegistradores: number | null): boolean {
  return precioRegistradores === null;
}

/**
 * Estadísticas de uso de Claude
 */
export interface ClaudeUsageStats {
  totalCalls: number;
  callsWithRegistradores: number;
  callsWithoutRegistradores: number;
  tokensSaved: number; // Estimación basada en llamadas evitadas
}

let usageStats: ClaudeUsageStats = {
  totalCalls: 0,
  callsWithRegistradores: 0,
  callsWithoutRegistradores: 0,
  tokensSaved: 0,
};

export function trackClaudeUsage(
  calledClaude: boolean,
  hadRegistradores: boolean
): void {
  if (calledClaude) {
    usageStats.totalCalls++;
    if (hadRegistradores) {
      usageStats.callsWithRegistradores++;
    } else {
      usageStats.callsWithoutRegistradores++;
    }
  } else if (hadRegistradores) {
    // No llamamos a Claude porque teníamos precio de Registradores
    usageStats.tokensSaved += 500; // Estimación de tokens ahorrados
  }
}

export function getClaudeUsageStats(): ClaudeUsageStats {
  return { ...usageStats };
}

export function resetClaudeUsageStats(): void {
  usageStats = {
    totalCalls: 0,
    callsWithRegistradores: 0,
    callsWithoutRegistradores: 0,
    tokensSaved: 0,
  };
}
