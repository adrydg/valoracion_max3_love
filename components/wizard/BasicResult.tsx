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
    <div className="space-y-4 p-4 pt-8">
      {/* Header con precio integrado - MEJORADO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-xl p-6 border-2 border-primary/20 shadow-lg">
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />

        <div className="relative space-y-4">
          {/* Badge superior */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">Primera estimación</span>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
              <span className="text-sm">{precisionMessage.icon}</span>
              <span className="text-xs font-bold text-primary">±20%</span>
            </div>
          </div>

          {/* Precio principal destacado */}
          <div className="text-center">
            <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
              {formatPrice(valuation.avg)}
            </p>
          </div>

          {/* Rango de precios */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="px-3 py-1.5 bg-background/60 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium">{formatPrice(valuation.min)}</span>
            </div>
            <span className="text-muted-foreground">—</span>
            <div className="px-3 py-1.5 bg-background/60 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium">{formatPrice(valuation.max)}</span>
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
            {valuation.adjustments.map((adj: any, index: number) => (
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
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-700 font-bold bg-green-50 inline-block px-3 py-1 rounded-full border-2 border-green-200">
                    ⚡ Solo 1 minuto • Reduce margen a ±8%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valoración mucho más precisa con fotos y detalles avanzados
                  </p>
                </div>
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
