import { NextResponse } from "next/server";
import postalCodesData from "@/data/postal-codes/28.json";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      leadId,
      postalCode,
      squareMeters,
      bedrooms,
      bathrooms,
      floor,
      hasElevator,
      buildingAge,
      propertyType,
    } = body;

    // Validaciones
    if (!postalCode || !squareMeters || !bedrooms) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para la valoración" },
        { status: 400 }
      );
    }

    // 1. Buscar datos de mercado por código postal
    let marketData = postalCodesData.find((cp: any) => cp.postalCode === postalCode);

    // Si no existe, usar datos genéricos con +5% incertidumbre
    if (!marketData) {
      console.log(`CP ${postalCode} no encontrado, usando datos genéricos`);
      marketData = {
        postalCode,
        province: "Madrid",
        municipality: "Desconocido",
        precio_medio_m2: 3800 * 1.05, // +5% incertidumbre
        precio_min_m2: 3400,
        precio_max_m2: 4200,
        fuente: "claude",
        fecha_actualizacion: new Date().toISOString().split("T")[0],
        tendencia: "estable",
      };
    }

    // 2. Calcular precio base
    let basePrice = marketData.precio_medio_m2 * squareMeters;

    // 3. Aplicar ajustes
    const adjustments: any[] = [];
    let totalFactor = 1.0;

    // Ajuste por superficie
    if (squareMeters < 50) {
      adjustments.push({
        factor: "Superficie pequeña",
        value: "+10%",
        percentage: 10,
      });
      totalFactor *= 1.10;
    } else if (squareMeters > 150) {
      adjustments.push({
        factor: "Superficie grande",
        value: "-5%",
        percentage: -5,
      });
      totalFactor *= 0.95;
    }

    // Ajuste por planta + ascensor
    if (floor && hasElevator !== null) {
      let floorAdjustment = 0;
      let floorLabel = "";

      if (hasElevator) {
        switch (floor) {
          case "bajo":
            floorAdjustment = -10;
            floorLabel = "Planta baja (con ascensor)";
            break;
          case "entresuelo":
            floorAdjustment = -5;
            floorLabel = "Entresuelo (con ascensor)";
            break;
          case "1-2":
            floorAdjustment = 0;
            floorLabel = "Planta 1ª-2ª (con ascensor)";
            break;
          case "3-5":
            floorAdjustment = 3;
            floorLabel = "Planta 3ª-5ª (con ascensor)";
            break;
          case "6+":
            floorAdjustment = 5;
            floorLabel = "Planta 6ª+ (con ascensor)";
            break;
          case "atico":
            floorAdjustment = 8;
            floorLabel = "Ático (con ascensor)";
            break;
        }
      } else {
        switch (floor) {
          case "bajo":
            floorAdjustment = -10;
            floorLabel = "Planta baja (sin ascensor)";
            break;
          case "1-2":
            floorAdjustment = -5;
            floorLabel = "Planta 1ª-2ª (sin ascensor)";
            break;
          case "3-5":
            floorAdjustment = -25;
            floorLabel = "Planta 3ª-5ª (sin ascensor)";
            break;
          case "6+":
            floorAdjustment = -30;
            floorLabel = "Planta 6ª+ (sin ascensor)";
            break;
          case "atico":
            floorAdjustment = -20;
            floorLabel = "Ático (sin ascensor)";
            break;
        }
      }

      if (floorAdjustment !== 0) {
        adjustments.push({
          factor: floorLabel,
          value: `${floorAdjustment > 0 ? "+" : ""}${floorAdjustment}%`,
          percentage: floorAdjustment,
        });
        totalFactor *= 1 + floorAdjustment / 100;
      }
    }

    // Ajuste por antigüedad
    if (buildingAge) {
      let ageAdjustment = 0;
      let ageLabel = "";

      switch (buildingAge) {
        case "nueva":
          ageAdjustment = 10;
          ageLabel = "Edificio nuevo (<5 años)";
          break;
        case "reciente":
          ageAdjustment = 5;
          ageLabel = "Edificio reciente (5-15 años)";
          break;
        case "moderna":
          ageAdjustment = 0;
          ageLabel = "Edificio moderno (15-30 años)";
          break;
        case "antigua":
          ageAdjustment = -5;
          ageLabel = "Edificio antiguo (30-50 años)";
          break;
        case "muy-antigua":
          ageAdjustment = -10;
          ageLabel = "Edificio muy antiguo (>50 años)";
          break;
      }

      if (ageAdjustment !== 0) {
        adjustments.push({
          factor: ageLabel,
          value: `${ageAdjustment > 0 ? "+" : ""}${ageAdjustment}%`,
          percentage: ageAdjustment,
        });
        totalFactor *= 1 + ageAdjustment / 100;
      }
    }

    // Ajuste por baños múltiples
    if (bathrooms && bathrooms >= 2 && bedrooms && bedrooms >= 2) {
      adjustments.push({
        factor: "Múltiples baños",
        value: "+5%",
        percentage: 5,
      });
      totalFactor *= 1.05;
    }

    // 4. Aplicar factor total
    const adjustedPrice = basePrice * totalFactor;

    // 5. Calcular rango con incertidumbre ±20%
    const uncertainty = 0.20;
    const min = Math.round(adjustedPrice * (1 - uncertainty));
    const max = Math.round(adjustedPrice * (1 + uncertainty));
    const avg = Math.round(adjustedPrice);

    // 6. Calcular precio por m²
    const pricePerM2 = Math.round(avg / squareMeters);

    const valuation = {
      avg,
      min,
      max,
      uncertainty: "±20%",
      pricePerM2,
      adjustments,
      marketData,
      calculatedAt: new Date().toISOString(),
    };

    console.log(`Valoración calculada para lead ${leadId}:`, valuation);

    // TODO: Actualizar lead en base de datos con la valoración

    return NextResponse.json({
      success: true,
      valuation,
    });
  } catch (error) {
    console.error("Error calculando valoración:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
