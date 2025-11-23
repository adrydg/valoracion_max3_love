/**
 * Módulo de integración con Claude
 *
 * IMPORTANTE: Aquí está toda la lógica de Claude separada.
 * Puedes modificar prompts, modelos y parseo sin tocar el cálculo.
 */

import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_CONFIG, VALUATION_CONFIG, FALLBACK_MARKET_DATA } from './config';
import type { PropertyData, MarketData, ClaudeMarketResponse } from './types';

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Construye el prompt para obtener datos de mercado de Claude
 */
export function buildMarketDataPrompt(
  property: PropertyData,
  precioRegistradores: number | null
): string {
  const floorLabel = property.floor ? VALUATION_CONFIG.LABELS.FLOOR[property.floor] : 'No especificado';
  const ageLabel = property.buildingAge ? VALUATION_CONFIG.LABELS.BUILDING_AGE[property.buildingAge] : 'No especificado';

  // Sección de precio de Registradores (solo si existe)
  const precioRegistradoresSection = precioRegistradores
    ? `📊 PRECIO DE REFERENCIA (Registradores 2024):
- Precio medio zona según datos oficiales: ${precioRegistradores} €/m²
- Fuente: Colegio de Registradores de España

`
    : '';

  // Sección de terreno (solo para casas con terreno)
  const landSection = property.landSize
    ? `\n- Tamaño del terreno: ${property.landSize} m² (IMPORTANTE: Si es una casa con terreno, el tamaño del terreno es un factor CLAVE que aumenta significativamente el valor)`
    : '';

  // Instrucciones específicas según si hay precio de Registradores
  const instructionsPrecio = precioRegistradores
    ? `Usa el precio de Registradores (${precioRegistradores} €/m²) como BASE PRINCIPAL y ajústalo según las características específicas de la propiedad`
    : `Analizar el mercado en ${property.municipality || 'la zona del código postal ' + property.postalCode} para determinar el precio base`;

  // Instrucciones sobre terreno
  const instructionsTerreno = property.landSize
    ? '\n4. Si es una casa con terreno, VALORAR MUY POSITIVAMENTE el tamaño del terreno como un activo importante'
    : '\n4. Proporcionar precios realistas de mercado';

  return `Eres un tasador inmobiliario experimentado y optimista. Basándote en tu conocimiento actualizado del mercado inmobiliario español, analiza y proporciona datos de precios para esta propiedad:

📍 UBICACIÓN:
- Población/Municipio: ${property.municipality || 'No especificado'}
- Código Postal: ${property.postalCode}
- Dirección: ${property.street || 'No especificada'}

${precioRegistradoresSection}🏠 CARACTERÍSTICAS DE LA PROPIEDAD:
- Tipo: ${property.propertyType || 'piso'}
- Superficie vivienda: ${property.squareMeters} m²${landSection}
- Habitaciones: ${property.bedrooms}
- Baños: ${property.bathrooms || 'No especificado'}
- Planta: ${floorLabel}
- Ascensor: ${property.hasElevator === true ? 'Sí' : property.hasElevator === false ? 'No' : 'No especificado'}
- Antigüedad: ${ageLabel}

IMPORTANTE: Actúa como un tasador inmobiliario experimentado y optimista. Usa tu conocimiento actualizado del mercado inmobiliario 2025 para:
1. ${instructionsPrecio}
2. Identificar el barrio o zona dentro del municipio si es posible
3. Analizar TODAS las características de la propiedad (tamaño, habitaciones, planta, ascensor, antigüedad)${instructionsTerreno}
5. Ser optimista en la valoración, destacando los aspectos positivos de la propiedad

Proporciona ÚNICAMENTE un JSON con este formato exacto (sin texto adicional):
{
  "precio_min_m2": número (precio mínimo €/m² para esta propiedad en esta zona),
  "precio_medio_m2": número (precio medio €/m² considerando todas las características),
  "precio_max_m2": número (precio máximo €/m² para esta propiedad en esta zona),
  "municipality": "nombre del municipio",
  "neighborhood": "nombre del barrio si se puede identificar",
  "province": "nombre de la provincia",
  "demanda_zona": "alta" | "media" | "baja",
  "tendencia": "subiendo" | "estable" | "bajando",
  "descripcion_zona": "breve descripción de 1-2 líneas sobre características de la zona que afectan al precio"
}`;
}

/**
 * Obtiene datos de mercado usando Claude
 * Ahora también retorna el prompt usado (para historial)
 */
export async function getMarketDataFromClaude(
  property: PropertyData,
  precioRegistradores: number | null = null
): Promise<{ marketData: MarketData; prompt: string }> {
  try {
    console.log(`🔍 Consultando a Claude sobre mercado en ${property.municipality || property.postalCode}...`);

    const prompt = buildMarketDataPrompt(property, precioRegistradores);

    console.log("📤 PROMPT ENVIADO A CLAUDE:");
    console.log("═".repeat(80));
    console.log(prompt);
    console.log("═".repeat(80));

    const response = await anthropic.messages.create({
      model: CLAUDE_CONFIG.MARKET_DATA.model,
      max_tokens: CLAUDE_CONFIG.MARKET_DATA.maxTokens,
      temperature: CLAUDE_CONFIG.MARKET_DATA.temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = response.content[0]?.type === "text"
      ? response.content[0].text
      : "";

    console.log("📥 RESPUESTA DE CLAUDE:");
    console.log("═".repeat(80));
    console.log(responseText);
    console.log("═".repeat(80));

    // Parsear JSON de la respuesta
    const claudeData: ClaudeMarketResponse = JSON.parse(responseText);

    // Construir MarketData completo
    const marketData: MarketData = {
      ...claudeData,
      postalCode: property.postalCode,
      fuente: precioRegistradores
        ? "Claude + Registradores 2024"
        : "Claude (análisis de mercado)",
      fecha_actualizacion: new Date().toISOString().split("T")[0] || new Date().toISOString().substring(0, 10),
    };

    console.log(`✅ Datos de mercado obtenidos: ${marketData.precio_medio_m2}€/m² en ${marketData.municipality}`);

    return { marketData, prompt };
  } catch (error) {
    console.error("❌ Error consultando a Claude:", error);
    throw error;
  }
}

/**
 * Obtiene datos de mercado con fallback automático si Claude falla
 */
export async function getMarketDataWithFallback(
  property: PropertyData,
  precioRegistradores: number | null = null
): Promise<{ marketData: MarketData; prompt?: string }> {
  try {
    const result = await getMarketDataFromClaude(property, precioRegistradores);
    return result;
  } catch (error) {
    console.warn("⚠️ Usando datos de mercado fallback debido a error en Claude");

    // Usar precio de Registradores si está disponible, si no usar fallback genérico
    const fallbackPrice = precioRegistradores || FALLBACK_MARKET_DATA.precio_medio_m2;

    return {
      marketData: {
        ...FALLBACK_MARKET_DATA,
        postalCode: property.postalCode,
        municipality: property.municipality || FALLBACK_MARKET_DATA.municipality,
        precio_medio_m2: fallbackPrice,
        precio_min_m2: Math.round(fallbackPrice * 0.9),
        precio_max_m2: Math.round(fallbackPrice * 1.1),
        fuente: precioRegistradores ? "Registradores (fallback)" : "estimación genérica (fallback)",
        fecha_actualizacion: new Date().toISOString().split("T")[0] || new Date().toISOString().substring(0, 10),
      },
      prompt: undefined,
    };
  }
}

/**
 * Analiza la respuesta de Claude para debugging
 */
export function analyzeClaudeResponse(responseText: string): {
  isValidJSON: boolean;
  parsedData: any | null;
  error: string | null;
} {
  try {
    const parsed = JSON.parse(responseText);
    return {
      isValidJSON: true,
      parsedData: parsed,
      error: null,
    };
  } catch (error) {
    return {
      isValidJSON: false,
      parsedData: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
