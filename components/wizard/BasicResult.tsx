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

      {/* Botón Finalizar */}
      <Button
        onClick={onClose}
        className="w-full h-auto py-4 text-lg font-bold shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        size="lg"
      >
        Finalizar
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Hemos enviado el informe completo a tu email
      </p>
    </div>
  );
};
