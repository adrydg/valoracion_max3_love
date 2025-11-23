/**
 * Sistema de Valoración con OpenAI
 * Exporta todas las funciones y tipos de forma organizada
 */

// Tipos
export type {
  UbicacionInput,
  InmuebleInput,
  DatosBasicosInput,
  DatosRegistradores,
  ResultadoBusquedaWeb,
  TipoZona,
  NivelConfianza,
  AjustesPorcentuales,
  ValoracionBasica,
  EstadoReal,
  CalidadAcabados,
  Luminosidad,
  CaracteristicasVisual,
  AjustesAdicionalesPorcentuales,
  ValoracionDetallada,
  Fase1Input,
  Fase2Input,
} from "./types";

// Configuración
export { OPENAI_CONFIG, esZonaPrime, getFactorZona } from "./config";

// Servicios Fase 1
export { valorarConOpenAIFase1 } from "./fase1Service";

// Servicios Fase 2
export {
  valorarConOpenAIFase2,
  analizarFotosConVision,
  ajustarValoracionConFotos,
} from "./fase2Service";

// Tools (pueden usarse individualmente si se desea)
export { getRegistroCP, calcularPrecioActualizado } from "./registradores";
export { buscarEnWeb, calcularPrecioMedio } from "./webSearch";
