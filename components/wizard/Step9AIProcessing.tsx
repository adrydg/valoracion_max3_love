"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Sparkles, Brain, Image as ImageIcon, BarChart3, CheckCircle2 } from "lucide-react";

const processingSteps = [
  {
    icon: BarChart3,
    title: "Ajustes aplicados por sistema experto",
    description: "Evaluando orientación, calidad, estado y características",
    duration: 3000,
  },
  {
    icon: Sparkles,
    title: "Calculando precio por metro cuadrado",
    description: "Aplicando modelo de valoración optimizado",
    duration: 3000,
  },
];

export const Step9AIProcessing = () => {
  const {
    orientation,
    propertyCondition,
    hasTerrace,
    terraceSize,
    hasGarage,
    hasStorage,
    quality,
    photos,
    valuation,
    setDetailedValuation,
    nextStep,
    // Contexto completo para el análisis de fotos
    propertyType,
    postalCode,
    municipality,
    street,
    squareMeters,
    landSize,
    bedrooms,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
  } = useWizardStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    // Progreso suave
    const updateProgress = () => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
    };

    progressTimer = setInterval(updateProgress, 30);

    // Cambiar pasos
    const processSteps = async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        await new Promise((resolve) => {
          stepTimer = setTimeout(() => {
            setCurrentStepIndex(i);
            setCompletedSteps((prev) => [...prev, i]);
            resolve(true);
          }, processingSteps[i].duration);
        });
      }

      // ✨ VALORACIÓN COMPLETA CON CLAUDE (nuevo sistema)
      try {
        console.log(`🚀 Iniciando valoración completa con Claude...`);

        // Convertir fotos a base64 si hay
        let photosBase64: Array<{ data: string; mediaType: string }> = [];

      if (photos.length > 0) {
        try {
          console.log(`🖼️ Convirtiendo ${photos.length} fotos a base64...`);
          photosBase64 = await Promise.all(
            photos.map(async (photo) => {
              return new Promise<{ data: string; mediaType: string }>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64String = reader.result as string;
                  const base64Data = base64String.split(',')[1];
                  let mediaType = "image/jpeg";
                  if (photo.type === "image/png") mediaType = "image/png";
                  if (photo.type === "image/webp") mediaType = "image/webp";
                  resolve({ data: base64Data, mediaType });
                };
                reader.readAsDataURL(photo);
              });
            })
          );
          console.log(`✅ ${photosBase64.length} fotos convertidas`);
        } catch (error) {
          console.error("❌ Error convirtiendo fotos:", error);
        }
      } else {
        console.log(`ℹ️ No hay fotos para analizar`);
      }

      // Llamar al endpoint completo que usa Claude para TODO
      const response = await fetch("/api/valuation/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Ubicación
          postalCode,
          municipality,
          street,
          squareMeters,
          landSize,
          bedrooms,
          propertyType,

          // Características
          bathrooms,
          floor,
          hasElevator,
          buildingAge,

          // Características avanzadas
          orientation,
          propertyCondition,
          hasTerrace,
          terraceSize,
          hasGarage,
          hasStorage,
          quality,

          // Fotos
          photos: photosBase64,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error en valoración completa:", errorText);
        throw new Error("Error al calcular la valoración completa");
      }

      const result = await response.json();
      const claudeValuation = result.valuation;

      console.log("✅ Valoración completa recibida de Claude:");
      console.log(`   💰 Rango: ${claudeValuation.valoracion_minima?.toLocaleString()}€ - ${claudeValuation.valoracion_maxima?.toLocaleString()}€`);
      console.log(`   📊 Media: ${claudeValuation.valoracion_media?.toLocaleString()}€`);
      console.log(`   🎯 Score: ${claudeValuation.score_global?.puntuacion_total}/100`);

      // Construir ajustes para mostrar al usuario (extraídos de los datos que Claude usó)
      const advancedAdjustments = [
        { factor: `Orientación ${orientation || 'No especificada'}`, value: "incluido", percentage: 0 },
        { factor: `Estado de conservación`, value: "incluido", percentage: 0 },
        { factor: hasTerrace ? `Terraza ${terraceSize ? terraceSize + 'm²' : ''}` : "Sin terraza", value: "incluido", percentage: 0 },
        { factor: hasGarage ? "Plaza de garaje" : "Sin garaje", value: "incluido", percentage: 0 },
        { factor: hasStorage ? "Trastero incluido" : "Sin trastero", value: "incluido", percentage: 0 },
        { factor: `Calidad ${quality || 'estándar'}`, value: "incluido", percentage: 0 },
      ].filter(adj => adj.factor);

      // Mapear el nivel de confianza
      let confidenceLevel: "muy-alta" | "alta" | "media" | "baja" = "alta";
      if (claudeValuation.confianza === "alta") confidenceLevel = "muy-alta";
      else if (claudeValuation.confianza === "media") confidenceLevel = "alta";
      else if (claudeValuation.confianza === "media-baja") confidenceLevel = "media";
      else confidenceLevel = "baja";

      // Construir respuesta en formato compatible con el resto del wizard
      const detailedValuation = {
        // Precios calculados por Claude
        avg: claudeValuation.valoracion_media,
        min: claudeValuation.valoracion_minima,
        max: claudeValuation.valoracion_maxima,
        precioM2: claudeValuation.precio_m2 || (squareMeters ? Math.round(claudeValuation.valoracion_media / squareMeters) : 0),

        // Información adicional
        uncertainty: `±${Math.round(((claudeValuation.valoracion_maxima - claudeValuation.valoracion_minima) / (2 * claudeValuation.valoracion_media)) * 100)}%`,
        precisionScore: claudeValuation.score_global?.puntuacion_total || 85,
        confidenceLevel,

        // Análisis de fotos (formato adaptado)
        aiAnalysis: {
          photoQuality: photos.length > 0 ? "buena" : "no-disponible",
          photoCount: photos.length,
          detectedFeatures: claudeValuation.analisis?.puntos_fuertes || [],
          propertyConditionEstimate: claudeValuation.analisis?.estado_general || "",
          luminosityLevel: "buena" as const,
          conservationState: claudeValuation.score_global?.puntuacion_total >= 75 ? "excelente" :
                            claudeValuation.score_global?.puntuacion_total >= 60 ? "bueno" : "regular" as const,
          suggestedImprovements: claudeValuation.mejoras_con_roi?.map((m: any) =>
            `💡 ${m.categoria}: ${m.mejora} (Inversión: ${m.inversion_estimada?.toLocaleString()}€, ROI: ${m.roi_porcentaje}%)`
          ) || [],
          overallScore: claudeValuation.score_global?.puntuacion_total || 75,
        },

        // Ajustes (para mostrar en UI, aunque ya están aplicados por Claude)
        advancedAdjustments,

        // Comparación de mercado
        marketComparison: {
          similarProperties: "Datos reales de mercado",
          avgPricePerM2: claudeValuation.precio_m2,
          pricePosition: claudeValuation.analisis?.ubicacion_valoracion || "Valoración basada en datos actualizados",
        },

        // ROI y mejoras
        roiSummary: claudeValuation.resumen_roi,
        suggestedImprovements: claudeValuation.mejoras_con_roi,
        valoracionConMejoras: claudeValuation.valoracion_con_mejoras,

        // Análisis completo de Claude
        claudeAnalysis: claudeValuation.analisis,
        scoreGlobal: claudeValuation.score_global,
        tiempoVentaEstimado: claudeValuation.tiempo_venta_estimado,

        // Metadata
        calculatedAt: new Date().toISOString(),
        calculationMethod: "claude-complete",
      };

        console.log("💎 Valoración detallada con análisis real:", detailedValuation);
        setDetailedValuation(detailedValuation);

        // Ir al resultado final
        setTimeout(() => {
          nextStep();
        }, 500);
      } catch (error) {
        console.error("❌ Error en valoración completa:", error);

        // Crear valoración de fallback para no dejar la UI colgada
        const fallbackValuation = {
          avg: 250000,
          min: 230000,
          max: 270000,
          precioM2: squareMeters ? Math.round(250000 / squareMeters) : 3000,
          uncertainty: "±8%",
          precisionScore: 65,
          confidenceLevel: "media" as const,
          aiAnalysis: {
            photoQuality: "no-disponible" as const,
            photoCount: photos.length,
            detectedFeatures: ["Error al analizar. Por favor, contacta con nosotros para una valoración personalizada."],
            propertyConditionEstimate: "No se pudo completar el análisis automático. Te contactaremos pronto.",
            luminosityLevel: "regular" as const,
            conservationState: "regular" as const,
            suggestedImprovements: ["💡 Recibirás recomendaciones personalizadas por email"],
            overallScore: 65,
          },
          advancedAdjustments: [],
          marketComparison: {
            similarProperties: "Error en análisis",
            avgPricePerM2: null,
            pricePosition: "Valoración estimada genérica",
          },
          calculatedAt: new Date().toISOString(),
          calculationMethod: "fallback",
          error: true,
          errorMessage: error instanceof Error ? error.message : "Error desconocido",
        };

        setDetailedValuation(fallbackValuation);

        // Continuar al siguiente paso aunque haya error
        setTimeout(() => {
          nextStep();
        }, 1000);
      }
    };

    processSteps();

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 min-h-[500px]">
      {/* AI Brain Animation */}
      <div className="relative">
        {/* Anillos de pulso */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-primary/20 animate-ping"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center animation-delay-1000">
          <div className="w-40 h-40 rounded-full bg-primary/10 animate-ping"></div>
        </div>

        {/* Círculo central con gradiente */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
          <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
            <Brain className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
        <div className="absolute -bottom-4 -left-4 w-2 h-2 rounded-full bg-purple-400 animate-bounce animation-delay-500"></div>
        <div className="absolute top-0 -left-6 w-2 h-2 rounded-full bg-pink-400 animate-bounce animation-delay-1000"></div>
      </div>

      {/* Título principal */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Análisis con nuestro sistema experto
        </h2>
        <p className="text-sm text-muted-foreground">
          Analizando {photos.length} foto{photos.length !== 1 ? 's' : ''} y características avanzadas
        </p>
      </div>

      {/* Pasos de procesamiento */}
      <div className="w-full max-w-md space-y-4">
        {processingSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStepIndex === index;
          const isCompleted = completedSteps.includes(index);

          return (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-500 ${
                isActive
                  ? "bg-primary/10 border-2 border-primary scale-105"
                  : isCompleted
                  ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-500/50"
                  : "bg-muted/30 border-2 border-transparent opacity-50"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? "animate-spin" : ""}`} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${isActive ? "text-primary" : ""}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Loading indicator */}
              {isActive && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Barra de progreso global */}
      <div className="w-full max-w-md space-y-2">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Procesando...</span>
          <span className="font-semibold">{Math.round(Math.min(progress, 100))}%</span>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="text-center max-w-md">
        <p className="text-sm text-muted-foreground">
          Estamos analizando cada detalle para ofrecerte la valoración más precisa posible
        </p>
      </div>
    </div>
  );
};
