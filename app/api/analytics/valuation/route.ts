import { NextResponse } from "next/server";
import { getClaudeUsageStats, resetClaudeUsageStats, getHistory, clearHistory } from "@/lib/valuation";

/**
 * GET /api/analytics/valuation
 *
 * Obtiene estadísticas de uso del sistema de valoración:
 * - Cuántas valoraciones usaron JSON vs Claude
 * - Tokens ahorrados
 * - Llamadas totales
 * - Historial completo de valoraciones
 */
export async function GET(request: Request) {
  const stats = getClaudeUsageStats();
  const history = getHistory();

  const totalValuations = stats.callsWithRegistradores + stats.callsWithoutRegistradores;
  const percentageWithJSON = totalValuations > 0
    ? ((stats.callsWithRegistradores / totalValuations) * 100).toFixed(1)
    : "0.0";

  const percentageWithoutJSON = totalValuations > 0
    ? ((stats.callsWithoutRegistradores / totalValuations) * 100).toFixed(1)
    : "0.0";

  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      totalValuations,
      percentageWithJSON: `${percentageWithJSON}%`,
      percentageWithoutJSON: `${percentageWithoutJSON}%`,
      estimatedCostSaved: `$${(stats.tokensSaved * 0.000001).toFixed(4)}`, // $1 per 1M tokens
    },
    history, // Incluir historial completo
    timestamp: new Date().toISOString(),
  });
}

/**
 * DELETE /api/analytics/valuation
 *
 * Resetea las estadísticas Y el historial (útil para testing o inicio de mes)
 */
export async function DELETE() {
  resetClaudeUsageStats();
  clearHistory();

  return NextResponse.json({
    success: true,
    message: "Estadísticas e historial reseteados correctamente",
    timestamp: new Date().toISOString(),
  });
}
