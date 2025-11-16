"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Loader2, MapPin, TrendingUp, Calculator, FileText, CheckCircle2 } from "lucide-react";

const loadingSteps = [
  {
    icon: MapPin,
    title: "Analizando el código postal",
    description: "Identificando zona y precios de referencia",
    duration: 1400,
  },
  {
    icon: TrendingUp,
    title: "Consultando precios de mercado",
    description: "Comparando con propiedades similares",
    duration: 1600,
  },
  {
    icon: Calculator,
    title: "Aplicando ajustes por características",
    description: "Evaluando metros, baños, planta y ascensor",
    duration: 1400,
  },
  {
    icon: FileText,
    title: "Generando tu informe",
    description: "Preparando valoración preliminar",
    duration: 1000,
  },
];

export const LoadingScreen = () => {
  const {
    leadId,
    postalCode,
    municipality,
    street,
    squareMeters,
    bedrooms,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    propertyType,
    name,
    email,
    phone,
    setValuation,
    nextStep,
  } = useWizardStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true; // Flag para evitar updates después de unmount
    const timeouts: NodeJS.Timeout[] = []; // Array para trackear todos los timeouts

    // Simular progreso - duración mínima 5.4 segundos
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1; // 100 iteraciones * 54ms = 5400ms = 5.4 segundos
      });
    }, 54);

    // Cambiar pasos
    const processSteps = async () => {
      for (let i = 0; i < loadingSteps.length; i++) {
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            if (isMounted) {
              setCurrentStepIndex(i);
              setCompletedSteps((prev) => [...prev, i]);
            }
            resolve(true);
          }, loadingSteps[i].duration);
          timeouts.push(timeout);
        });
      }
    };

    processSteps();

    // FASE 1: Llamar API con búsqueda de mercado
    const fetchValuation = async () => {
      try {
        const response = await fetch('/api/valuation/basic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId,
            postalCode,
            municipality,
            street,
            squareMeters,
            bedrooms,
            bathrooms,
            floor,
            hasElevator,
            buildingAge,
            propertyType,
            name,
            email,
            phone,
          }),
        });

        if (!response.ok) {
          throw new Error('Error en la valoración');
        }

        const data = await response.json();
        console.log("💰 Valoración FASE 1 recibida:", data.valuation);
        if (isMounted) {
          setValuation(data.valuation);
        }

        // Esperar a que termine toda la animación de loading (mínimo 5.5 segundos)
        const finalTimeout = setTimeout(() => {
          if (isMounted) {
            console.log("🔄 LoadingScreen: Avanzando a DirectOfferScreen (step 5)");
            nextStep(); // Ir a oferta directa
          }
        }, 5500);
        timeouts.push(finalTimeout);
      } catch (error) {
        console.error("Error en valoración:", error);
        // Fallback a valoración genérica
        const fallbackVal = {
          avg: Math.round(3800 * (squareMeters || 85)),
          min: Math.round(3800 * (squareMeters || 85) * 0.8),
          max: Math.round(3800 * (squareMeters || 85) * 1.2),
          uncertainty: "±20%",
          pricePerM2: 3800,
        };
        if (isMounted) {
          setValuation(fallbackVal);
        }
        const fallbackTimeout = setTimeout(() => {
          if (isMounted) {
            console.log("🔄 LoadingScreen: Avanzando a DirectOfferScreen (step 5) [fallback]");
            nextStep();
          }
        }, 5500);
        timeouts.push(fallbackTimeout);
      }
    };

    fetchValuation();

    // Cleanup: cancelar todos los timers y marcar como unmounted
    return () => {
      console.log("🧹 LoadingScreen: Cleanup - Cancelando", timeouts.length, "timeouts");
      isMounted = false;
      clearInterval(progressInterval);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start p-4 pt-8 space-y-6 min-h-[500px]">
      {/* Spinner animado */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20"></div>
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
      </div>

      {/* Título */}
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold">
          Calculando tu valoración
        </h2>
        <p className="text-sm text-muted-foreground">
          Analizando datos de mercado en tiempo real
        </p>
      </div>

      {/* Pasos de procesamiento */}
      <div className="w-full max-w-md space-y-3">
        {loadingSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStepIndex === index;
          const isCompleted = completedSteps.includes(index);

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
                isActive
                  ? "bg-primary/10 border-2 border-primary scale-105"
                  : isCompleted
                  ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-500/50"
                  : "bg-muted/30 border-2 border-transparent opacity-50"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? "" : ""}`} />
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
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-md space-y-2">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Procesando...</span>
          <span className="font-semibold">{Math.round(Math.min(progress, 100))}%</span>
        </div>
      </div>
    </div>
  );
};
