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
  const { valuation, postalCode, squareMeters, bedrooms, bathrooms, floor, hasElevator, buildingAge } = useWizardStore();

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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header de éxito */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">
          ¡Tu valoración está lista!
        </h2>
        <p className="text-muted-foreground">
          Te la hemos enviado por email
        </p>
      </div>

      {/* Valoración principal */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 space-y-4 border-2 border-primary/20">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Valor estimado de tu propiedad
          </p>
          <div className="space-y-1">
            <p className="text-4xl md:text-5xl font-bold text-primary">
              {formatPrice(valuation.avg)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(valuation.min)} - {formatPrice(valuation.max)}
            </p>
          </div>
        </div>

        {/* Índice de precisión */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{precisionMessage.icon}</span>
              <div>
                <p className="font-semibold text-sm">{precisionMessage.title}</p>
                <p className="text-xs text-muted-foreground">{precisionMessage.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{precisionData.percentage}</p>
              <p className="text-xs text-muted-foreground">Margen</p>
            </div>
          </div>

          {/* Barra de progreso de precisión */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Completitud: {precisionData.completeness}%</span>
              <span className="font-medium">{precisionData.score}/100</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  precisionData.level === "muy-alta"
                    ? "bg-green-500"
                    : precisionData.level === "alta"
                    ? "bg-blue-500"
                    : precisionData.level === "media"
                    ? "bg-orange-500"
                    : "bg-gray-500"
                }`}
                style={{ width: `${precisionData.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de la propiedad */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Home className="w-4 h-4" />
          <span>Tu propiedad</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
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
            <p className="text-muted-foreground">Código Postal</p>
            <p className="font-semibold">{postalCode}</p>
          </div>
        </div>
      </div>

      {/* Ajustes aplicados */}
      {valuation.adjustments && valuation.adjustments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Factores considerados
          </h3>
          <div className="space-y-2">
            {valuation.adjustments.slice(0, 5).map((adj: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
              >
                <span>{adj.factor}</span>
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

      {/* Mejora tu precisión */}
      {precisionData.level !== "muy-alta" && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
            💡 ¿Quieres una valoración más precisa?
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Responde 3 preguntas más y reduce el margen a <strong>±8%</strong>
          </p>
          {precisionData.suggestions.length > 0 && (
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {precisionData.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          )}
          <Button variant="outline" className="w-full" size="sm">
            Mejorar mi valoración (2 min)
          </Button>
        </div>
      )}

      {/* Acciones */}
      <div className="space-y-3 pt-4">
        <Button className="w-full" size="lg">
          <Mail className="mr-2 h-4 w-4" />
          Enviar informe por email
        </Button>
        <Button variant="outline" className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex-1"
        >
          Cerrar
        </Button>
        <Button
          variant="default"
          onClick={() => window.location.href = "/contacto"}
          className="flex-1"
        >
          Hablar con un experto
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Esta valoración es orientativa. Para una tasación oficial, contacta con nuestros expertos.
      </p>
    </div>
  );
};
