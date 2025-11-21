import { NextRequest, NextResponse } from "next/server";
import { analyzePhotosWithClaude, type PhotoAnalysisResult } from "@/lib/valuation/photoAnalysis";

interface Base64Photo {
  data: string; // base64 sin prefijo
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { photos, propertyContext } = body;

    // Validaciones
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron fotos para analizar" },
        { status: 400 }
      );
    }

    if (photos.length > 10) {
      return NextResponse.json(
        { error: "Máximo 10 fotos permitidas" },
        { status: 400 }
      );
    }

    console.log(`\n${'═'.repeat(80)}`);
    console.log(`🖼️  ANÁLISIS DE FOTOS CON CLAUDE VISION - ${new Date().toLocaleString('es-ES')}`);
    console.log(`${'═'.repeat(80)}`);
    console.log(`📸 Fotos recibidas: ${photos.length}`);
    if (propertyContext) {
      console.log(`📋 Contexto:`, {
        tipo: propertyContext.propertyType,
        m2: propertyContext.squareMeters,
        habitaciones: propertyContext.bedrooms,
        baños: propertyContext.bathrooms,
      });
    }

    // Analizar con Claude Vision
    const startTime = Date.now();
    const analysis: PhotoAnalysisResult = await analyzePhotosWithClaude(
      photos as Base64Photo[],
      propertyContext
    );
    const duration = Date.now() - startTime;

    console.log(`\n✅ ANÁLISIS COMPLETADO en ${(duration / 1000).toFixed(2)}s`);
    console.log(`📊 Resultados:`);
    console.log(`   - Calidad: ${analysis.photoQuality}`);
    console.log(`   - Luminosidad: ${analysis.luminosityLevel}`);
    console.log(`   - Estado: ${analysis.conservationState}`);
    console.log(`   - Puntuación: ${analysis.overallScore}/100`);
    console.log(`   - Características detectadas: ${analysis.detectedFeatures.length}`);
    console.log(`${'═'.repeat(80)}\n`);

    return NextResponse.json({
      success: true,
      analysis,
      duration,
    });
  } catch (error) {
    console.error("❌ Error en análisis de fotos:", error);

    return NextResponse.json(
      {
        error: "Error al analizar las fotos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
