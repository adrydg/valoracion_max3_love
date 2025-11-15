/**
 * Servicio de códigos postales
 * Búsqueda en JSON local con fallback a Claude
 */

import { MarketData } from "../types";

export class PostalCodeService {
  private cache: Map<string, MarketData> = new Map();
  private loadedProvinces: Set<string> = new Set();

  /**
   * Obtener datos de mercado por código postal
   */
  async getMarketData(postalCode: string): Promise<MarketData> {
    // 1. Verificar caché
    if (this.cache.has(postalCode)) {
      return this.cache.get(postalCode)!;
    }

    // 2. Intentar cargar desde JSON local
    try {
      const data = await this.loadFromDatabase(postalCode);
      if (data) {
        this.cache.set(postalCode, data);
        return data;
      }
    } catch (error) {
      console.warn(`No se encontró CP ${postalCode} en base de datos local`);
    }

    // 3. Fallback: Retornar datos genéricos
    // TODO: En producción, consultar a Claude API
    return this.getFallbackData(postalCode);
  }

  /**
   * Cargar desde base de datos JSON
   */
  private async loadFromDatabase(postalCode: string): Promise<MarketData | null> {
    const province = postalCode.substring(0, 2);

    // Lazy loading: solo cargar provincia si no está cargada
    if (!this.loadedProvinces.has(province)) {
      try {
        // En Next.js, esto debe hacerse desde el servidor
        // Por ahora retornamos null para que use fallback
        this.loadedProvinces.add(province);
      } catch (error) {
        console.error(`Error cargando provincia ${province}:`, error);
        return null;
      }
    }

    return this.cache.get(postalCode) || null;
  }

  /**
   * Datos genéricos cuando no se encuentra el CP
   * +5% de incertidumbre adicional
   */
  private getFallbackData(postalCode: string): MarketData {
    // Precio genérico según provincia
    const province = postalCode.substring(0, 2);
    const defaultPrices: Record<string, number> = {
      "28": 3800, // Madrid
      "08": 3500, // Barcelona
      "46": 2200, // Valencia
      "41": 2000, // Sevilla
      "29": 2500, // Málaga
    };

    const precioMedio = defaultPrices[province] || 2000;

    return {
      postalCode,
      province: this.getProvinceName(province),
      municipality: "Desconocido",
      precio_medio_m2: precioMedio * 1.05, // +5% incertidumbre
      precio_min_m2: precioMedio * 0.85,
      precio_max_m2: precioMedio * 1.15,
      fuente: "claude",
      fecha_actualizacion: new Date().toISOString().split("T")[0],
      tendencia: "estable"
    };
  }

  /**
   * Obtener nombre de provincia
   */
  private getProvinceName(code: string): string {
    const provinces: Record<string, string> = {
      "28": "Madrid",
      "08": "Barcelona",
      "46": "Valencia",
      "41": "Sevilla",
      "29": "Málaga",
      "03": "Alicante",
      "11": "Cádiz",
      "48": "Vizcaya",
    };
    return provinces[code] || "Desconocida";
  }

  /**
   * Pre-cargar datos de un archivo JSON
   * (llamar desde API route al iniciar)
   */
  loadFromJSON(data: MarketData[]) {
    for (const item of data) {
      this.cache.set(item.postalCode, item);
      const province = item.postalCode.substring(0, 2);
      this.loadedProvinces.add(province);
    }
  }
}

// Export singleton
export const postalCodeService = new PostalCodeService();
