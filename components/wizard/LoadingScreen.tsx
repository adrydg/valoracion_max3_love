"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Loader2 } from "lucide-react";

const loadingMessages = [
  "Analizando el código postal...",
  "Consultando precios de mercado...",
  "Aplicando ajustes por características...",
  "Calculando valoración precisa...",
  "Generando tu informe...",
];

export const LoadingScreen = () => {
  const {
    leadId,
    postalCode,
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

  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Cambiar mensajes
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(messageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

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
        setValuation(data.valuation);

        // Esperar a que termine la animación
        setTimeout(() => {
          nextStep(); // Ir a oferta directa
        }, 500);
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
        setValuation(fallbackVal);
        setTimeout(() => nextStep(), 500);
      }
    };

    fetchValuation();

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-[400px]">
      {/* Spinner animado */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-primary/20"></div>
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-pulse" />
      </div>

      {/* Mensaje actual */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold animate-pulse">
          {loadingMessages[currentMessage]}
        </h3>
        <p className="text-sm text-muted-foreground">
          Esto solo tomará unos segundos
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-md space-y-2">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {progress}%
        </p>
      </div>

      {/* Indicadores de pasos */}
      <div className="flex gap-2">
        {loadingMessages.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index <= currentMessage
                ? "bg-primary scale-125"
                : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
