"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Mail, TrendingUp, Home } from "lucide-react";
// Temporarily inline precision calculation until we properly export the engine
// import { calculatePrecisionIndex, getPrecisionMessage } from "@/packages/valuation-engine/src/core/precision-index";

interface BasicResultProps {
  onClose: () => void;
}

export const BasicResult = ({ onClose }: BasicResultProps) => {
  const { valuation, postalCode, squareMeters, bedrooms, bathrooms, floor, hasElevator, buildingAge, nextStep } = useWizardStore();

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

  return (
    <div className="space-y-4 p-4">
      {/* Header compacto con icono a la izquierda */}
      <div className="text-center">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          Primera estimación lista
        </h2>
      </div>

      {/* CTA PRINCIPAL ARRIBA - ÚNICO Y DESTACADO */}
      <Button
        onClick={nextStep}
        className="w-full h-auto py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
        size="lg"
      >
        <div className="flex flex-col items-center gap-1">
          <span>Continuar con estimación más precisa</span>
          <span className="text-sm font-normal opacity-90">(1 minuto)</span>
        </div>
      </Button>

      {/* Valoración principal - COMPACTA */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Valor estimado
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(valuation.avg)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatPrice(valuation.min)} - {formatPrice(valuation.max)}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-lg">{precisionMessage.icon}</span>
            <span className="text-xs text-muted-foreground">Margen: ±20%</span>
          </div>
        </div>
      </div>

      {/* Detalles de la propiedad - COMPACTO */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs font-medium mb-2">
          <Home className="w-3 h-3" />
          <span>Tu propiedad</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Superficie</p>
            <p className="font-semibold">{squareMeters} m²</p>
          </div>
          <div>
            <p className="text-muted-foreground">Habitaciones</p>
            <p className="font-semibold">{bedrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Precio/m²</p>
            <p className="font-semibold">{formatPrice(valuation.pricePerM2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">CP</p>
            <p className="font-semibold">{postalCode}</p>
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

      {/* Botón cerrar - Discreto */}
      <Button
        variant="ghost"
        onClick={onClose}
        className="w-full"
        size="sm"
      >
        Cerrar
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Valoración orientativa. Para tasación oficial, contacta con expertos.
      </p>
    </div>
  );
};
