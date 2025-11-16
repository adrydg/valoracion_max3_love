/**
 * Sistema de valoración modular
 *
 * Exporta todos los módulos de forma organizada
 */

// Tipos
export type {
  PropertyData,
  MarketData,
  Adjustment,
  ValuationResult,
  ClaudePromptConfig,
  ClaudeMarketRequest,
  ClaudeMarketResponse,
} from './types';

// Configuración
export { VALUATION_CONFIG, CLAUDE_CONFIG, FALLBACK_MARKET_DATA } from './config';

// Calculador (lógica pura, sin dependencias externas)
export {
  calculateValuation,
  calculateBasePrice,
  applyAdjustmentFactor,
  parsePrecioRegistradores,
} from './calculator';

// Integración con Claude
export {
  getMarketDataFromClaude,
  getMarketDataWithFallback,
  buildMarketDataPrompt,
  analyzeClaudeResponse,
} from './claudeIntegration';

// Gestión inteligente de datos de mercado
export {
  getMarketDataSmart,
  buildMarketDataFromRegistradores,
  shouldCallClaude,
  trackClaudeUsage,
  getClaudeUsageStats,
  resetClaudeUsageStats,
  type ClaudeUsageStats,
} from './marketData';

// Auditoría y verificación
export {
  generateAuditReport,
  printAuditReport,
  exportAuditReportJSON,
  exportAuditReportCSV,
  validateAuditReport,
  type AuditReport,
  type AuditStep,
} from './audit';
