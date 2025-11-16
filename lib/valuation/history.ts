/**
 * Sistema de historial de valoraciones
 * Guarda cada valoración con todos los detalles para análisis
 */

import type { PropertyData, MarketData, ValuationResult } from './types';

export interface ValuationHistoryEntry {
  id: string;
  timestamp: string;
  property: PropertyData;
  marketData: MarketData;
  valuation: ValuationResult;
  usedJSON: boolean;
  calledClaude: boolean;
  precioRegistradores: number | null;
  tokensUsed: number;
  prompt?: string; // Solo si llamó a Claude
  duration: number; // Duración en ms
}

// Almacenamiento en memoria (se pierde al reiniciar el servidor)
// Para producción, podrías usar una base de datos
let history: ValuationHistoryEntry[] = [];

/**
 * Añade una valoración al historial
 */
export function addToHistory(entry: ValuationHistoryEntry): void {
  history.unshift(entry); // Añadir al principio (más recientes primero)

  // Mantener solo las últimas 100 valoraciones
  if (history.length > 100) {
    history = history.slice(0, 100);
  }

  console.log(`📝 Guardado en historial: ${entry.id} (${entry.usedJSON ? 'JSON' : 'Claude'})`);
}

/**
 * Obtiene todo el historial
 */
export function getHistory(): ValuationHistoryEntry[] {
  return [...history]; // Retornar copia para evitar mutaciones
}

/**
 * Obtiene una valoración específica por ID
 */
export function getHistoryEntry(id: string): ValuationHistoryEntry | null {
  return history.find(entry => entry.id === id) || null;
}

/**
 * Limpia todo el historial
 */
export function clearHistory(): void {
  history = [];
  console.log('🗑️  Historial limpiado');
}

/**
 * Obtiene estadísticas del historial
 */
export function getHistoryStats() {
  const total = history.length;
  const withJSON = history.filter(e => e.usedJSON).length;
  const withClaude = history.filter(e => e.calledClaude).length;
  const totalTokens = history.reduce((sum, e) => sum + e.tokensUsed, 0);

  return {
    total,
    withJSON,
    withClaude,
    totalTokens,
    averageDuration: total > 0 ? Math.round(history.reduce((sum, e) => sum + e.duration, 0) / total) : 0,
  };
}
