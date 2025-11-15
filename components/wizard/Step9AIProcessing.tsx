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

      // MODO TESTING: Generar valoración detallada fake
      await new Promise((resolve) => setTimeout(resolve, 500));

      const basePrice = valuation?.avg || 320000;
      const detailedValuation = {
        ...valuation,
        avg: Math.round(basePrice * 1.05), // Ligera mejora con datos avanzados
        min: Math.round(basePrice * 0.92), // Margen más estrecho
        max: Math.round(basePrice * 1.08),
        uncertainty: "±8%",
        precisionScore: 92,
        confidenceLevel: "muy-alta" as const,
        aiAnalysis: {
          photoQuality: "buena",
          photoCount: photos.length,
          detectedFeatures: [
            "Luminosidad natural excelente",
            "Estado de conservación bueno",
            "Distribución optimizada",
          ],
        },
        advancedAdjustments: [
          { factor: `Orientación ${orientation}`, value: orientation === "sur" ? "+2%" : "0%", percentage: orientation === "sur" ? 2 : 0 },
          { factor: `Estado: ${propertyCondition}`, value: propertyCondition === "muy-buen-estado" ? "+3%" : "+1%", percentage: 2 },
          { factor: hasTerrace ? `Terraza ${terraceSize}m²` : "Sin terraza", value: hasTerrace ? "+4%" : "-2%", percentage: hasTerrace ? 4 : -2 },
          { factor: hasGarage ? "Plaza de garaje" : "Sin garaje", value: hasGarage ? "+5%" : "-3%", percentage: hasGarage ? 5 : -3 },
          { factor: hasStorage ? "Trastero incluido" : "Sin trastero", value: hasStorage ? "+2%" : "0%", percentage: hasStorage ? 2 : 0 },
          { factor: `Calidad ${quality}`, value: quality === "alta" ? "+3%" : quality === "media" ? "+1%" : "0%", percentage: quality === "alta" ? 3 : quality === "media" ? 1 : 0 },
        ],
        marketComparison: {
          similarProperties: 47,
          avgPricePerM2: 3920,
          pricePosition: "por encima de la media",
        },
        calculatedAt: new Date().toISOString(),
      };

      console.log("💎 Valoración detallada (testing):", detailedValuation);
      setDetailedValuation(detailedValuation);

      // Ir al resultado final
      setTimeout(() => {
        nextStep();
      }, 500);
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
