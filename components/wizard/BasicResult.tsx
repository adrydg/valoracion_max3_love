"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Mail, TrendingUp, Home, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
// Temporarily inline precision calculation until we properly export the engine
// import { calculatePrecisionIndex, getPrecisionMessage } from "@/packages/valuation-engine/src/core/precision-index";

interface BasicResultProps {
  onClose: () => void;
}

export const BasicResult = ({ onClose }: BasicResultProps) => {
  const { valuation, postalCode, squareMeters, bedrooms, bathrooms, floor, hasElevator, buildingAge, nextStep } = useWizardStore();
  const [wantsPrecision, setWantsPrecision] = useState<boolean | null>(null);

  if (!valuation) {
    return (
      <div className="p-8 text-center">
        <p>Error: No se pudo calcular la valoración</p>
      </div>
    );
  }

  // Calcular índice de precisión (simplified inline)
  const precisionData = {
    score: 65, // Media-alta con los datos básicos
    level: "alta" as const,
    percentage: "±20%",
    missingFields: [],
    suggestions: ["Añade orientación para mejorar la precisión", "Sube fotos para reducir margen a ±8%"],
    completeness: 65,
    confidence: "alta" as const,
  };

  const precisionMessage = {
    title: "Precisión Alta",
    description: "Valoración confiable con margen ±20%. Añade más datos para reducirlo.",
    icon: "✅",
    color: "blue",
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleContinue = () => {
    if (wantsPrecision === true) {
      nextStep();
    } else if (wantsPrecision === false) {
      onClose();
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header con precio integrado */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-base font-bold">Primera estimación</h2>
              <p className="text-3xl font-bold text-primary mt-1">{formatPrice(valuation.avg)}</p>
            </div>
          </div>
          <div className="text-right text-xs space-y-1 flex-shrink-0">
            <p className="text-muted-foreground font-medium">
              {formatPrice(valuation.min)} - {formatPrice(valuation.max)}
            </p>
            <div className="flex items-center gap-1 justify-end bg-primary/10 px-2 py-1 rounded">
              <span>{precisionMessage.icon}</span>
              <span className="font-semibold text-primary">±20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factores considerados - MUY COMPACTO */}
      {valuation.adjustments && valuation.adjustments.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-xs flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Factores considerados
          </h3>
          <div className="space-y-1">
            {valuation.adjustments.slice(0, 3).map((adj: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
              >
                <span className="text-muted-foreground">{adj.factor}</span>
                <span className={`font-semibold ${
                  adj.value.startsWith('+') ? 'text-green-600' :
                  adj.value.startsWith('-') ? 'text-red-600' :
                  'text-muted-foreground'
                }`}>
                  {adj.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pregunta con radio buttons */}
      <div className="pt-2">
        <p className="text-sm font-medium mb-3">
          ¿Quieres continuar para recibir una estimación más precisa?
        </p>

        <div className="space-y-2">
          {/* Opción 1: Sí, continuar */}
          <button
            onClick={() => setWantsPrecision(true)}
            className={cn(
              "w-full p-3 rounded-lg border-2 transition-all text-left",
              "hover:border-primary/50",
              wantsPrecision === true
                ? "border-primary bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                wantsPrecision === true
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {wantsPrecision === true && (
                  <CheckCircle className="w-3 h-3 text-white" fill="currentColor" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Sí, continuar con estimación más precisa</p>
                <p className="text-xs text-green-700 font-medium mt-1 bg-green-50 inline-block px-2 py-0.5 rounded">
                  Solo 1 minuto • Reduce margen a ±8%
                </p>
              </div>
            </div>
          </button>

          {/* Opción 2: No, cerrar */}
          <button
            onClick={() => setWantsPrecision(false)}
            className={cn(
              "w-full p-3 rounded-lg border-2 transition-all text-left",
              "hover:border-primary/50",
              wantsPrecision === false
                ? "border-primary bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                wantsPrecision === false
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {wantsPrecision === false && (
                  <CheckCircle className="w-3 h-3 text-white" fill="currentColor" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">No, esta estimación es suficiente</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cerrar y guardar resultado
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Botón Continuar/Cerrar - Desactivado hasta seleccionar */}
      <Button
        onClick={handleContinue}
        disabled={wantsPrecision === null}
        className={cn(
          "w-full h-auto py-3 text-base font-bold shadow-lg transition-all",
          wantsPrecision === true
            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            : wantsPrecision === false
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
        size="lg"
      >
        {wantsPrecision === true ? "Continuar" : wantsPrecision === false ? "Cerrar" : "Selecciona una opción"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Con la información básica es nuestra estimación, pero si continuamos podremos afinar más.
      </p>
    </div>
  );
};
