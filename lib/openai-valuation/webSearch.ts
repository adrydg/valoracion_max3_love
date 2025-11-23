/**
 * Servicio de búsqueda web para obtener precios de mercado actualizados
 * Busca en Google y múltiples portales inmobiliarios
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { WEB_SCRAPING_CONFIG } from "./config";
import type { ResultadoBusquedaWeb } from "./types";

/**
 * Extrae precios en formato "X.XXX €/m²" o "X.XXX euros/m2" del HTML
 */
function extractPrices(html: string): string[] {
  const prices: string[] = [];

  // Regex para detectar patrones de precio por m²
  // Ejemplos: "6.500 €/m²", "6500 €/m2", "6.500 euros/m²"
  const patterns = [
    /(\d{1,2}\.\d{3})\s*€\/m[²2]/gi,
    /(\d{1,2},\d{3})\s*€\/m[²2]/gi,
    /(\d{4,5})\s*€\/m[²2]/gi,
    /(\d{1,2}\.\d{3})\s*euros?\/m[²2]/gi,
    /precio.*?(\d{1,2}\.\d{3})\s*€/gi,
  ];

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const cleanPrice = match[1].replace(/\./g, "").replace(",", ".");
        const numPrice = parseInt(cleanPrice);
        // Filtrar precios razonables (1.000 - 20.000 €/m²)
        if (numPrice >= 1000 && numPrice <= 20000) {
          prices.push(`${match[1]} €/m²`);
        }
      }
    }
  }

  // Deduplicar
  return [...new Set(prices)];
}

/**
 * Realiza búsqueda en Google
 */
async function searchGoogle(query: string): Promise<ResultadoBusquedaWeb> {
  console.log(`🔍 Buscando en Google: "${query}"`);

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=es&gl=es`;

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": WEB_SCRAPING_CONFIG.USER_AGENT,
        ...WEB_SCRAPING_CONFIG.HEADERS,
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extraer snippets de resultados
    const snippets: string[] = [];
    const urls: string[] = [];

    $(".g").each((_, elem) => {
      const snippet = $(elem).find(".VwiC3b").text();
      const url = $(elem).find("a").attr("href");

      if (snippet) snippets.push(snippet);
      if (url) urls.push(url);
    });

    const allText = snippets.join(" ");
    const precios = extractPrices(allText);

    console.log(`✅ Google: encontrados ${precios.length} precios`);

    return {
      query,
      raw_html_excerpt: allText.substring(0, 500),
      precios_detectados: precios,
      urls_referencia: urls.slice(0, 5),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error en búsqueda Google:", error);
    return {
      query,
      raw_html_excerpt: "",
      precios_detectados: [],
      urls_referencia: [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Intenta scraping directo de portales (más arriesgado, puede fallar)
 */
async function searchPortal(portal: string, location: string): Promise<string[]> {
  console.log(`🏠 Intentando scraping directo: ${portal} - ${location}`);

  // NOTA: Los portales tienen anti-bot, esto puede fallar fácilmente
  // Por seguridad, solo hacemos búsquedas de Google con el nombre del portal

  const query = `site:${portal} precio medio m2 ${location} 2025`;
  const result = await searchGoogle(query);

  return result.precios_detectados;
}

/**
 * TOOL: buscar_en_web
 * Función principal que OpenAI puede llamar como tool
 */
export async function buscarEnWeb(query: string): Promise<ResultadoBusquedaWeb> {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🌐 BÚSQUEDA WEB INICIADA`);
  console.log(`Query: "${query}"`);
  console.log(`${"=".repeat(80)}\n`);

  const results: ResultadoBusquedaWeb[] = [];

  // 1. Búsqueda principal en Google
  const googleResult = await searchGoogle(query);
  results.push(googleResult);

  // 2. Búsquedas específicas en portales (via Google para evitar bloqueos)
  const locationMatch = query.match(/(\d{5})|([A-Z][a-zá-ú]+(?:\s+[A-Z][a-zá-ú]+)*)/);
  const location = locationMatch ? locationMatch[0] : "";

  if (location) {
    for (const portal of WEB_SCRAPING_CONFIG.PORTALES.slice(0, 3)) {
      try {
        const portalPrices = await searchPortal(portal, location);
        if (portalPrices.length > 0) {
          results.push({
            query: `${portal} - ${location}`,
            raw_html_excerpt: `Búsqueda en ${portal}`,
            precios_detectados: portalPrices,
            urls_referencia: [`https://www.${portal}`],
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.log(`⚠️ ${portal} falló (esperado, tiene anti-bot)`);
      }

      // Delay para no saturar
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // 3. Combinar todos los resultados
  const allPrices = results.flatMap((r) => r.precios_detectados);
  const allUrls = results.flatMap((r) => r.urls_referencia);
  const excerpts = results.map((r) => r.raw_html_excerpt).join("\n");

  const finalResult: ResultadoBusquedaWeb = {
    query,
    raw_html_excerpt: excerpts.substring(0, 1000),
    precios_detectados: [...new Set(allPrices)], // Deduplicar
    urls_referencia: [...new Set(allUrls)].slice(0, 10),
    timestamp: new Date().toISOString(),
  };

  console.log(`\n✅ BÚSQUEDA COMPLETADA`);
  console.log(`Total precios encontrados: ${finalResult.precios_detectados.length}`);
  console.log(`Precios: ${finalResult.precios_detectados.join(", ")}`);
  console.log(`${"=".repeat(80)}\n`);

  return finalResult;
}

/**
 * Calcula el precio medio de un array de strings de precios
 */
export function calcularPrecioMedio(preciosStrings: string[]): number | null {
  if (preciosStrings.length === 0) return null;

  const numeros = preciosStrings
    .map((p) => {
      // Extraer solo números
      const match = p.match(/(\d{1,2})\.?(\d{3})/);
      if (match) {
        const [, miles, unidades] = match;
        if (miles && unidades) {
          return parseInt(miles + unidades);
        }
      }
      return null;
    })
    .filter((n): n is number => n !== null);

  if (numeros.length === 0) return null;

  const suma = numeros.reduce((acc, n) => acc + n, 0);
  return Math.round(suma / numeros.length);
}
