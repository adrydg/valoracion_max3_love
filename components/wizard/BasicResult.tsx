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
    <div className="space-y-5 p-4 md:p-6">
      {/* Header compacto */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold">
          Primera estimación lista
        </h2>
      </div>

      {/* Valoración principal con margen destacado */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 space-y-3 border-2 border-primary/20">
        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Valor estimado
          </p>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-bold text-primary">
              {formatPrice(valuation.avg)}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              {formatPrice(valuation.min)} - {formatPrice(valuation.max)}
            </p>
          </div>
        </div>

        {/* Índice de precisión - DESTACADO */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{precisionMessage.icon}</span>
                <p className="font-semibold text-sm">{precisionMessage.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Con la información básica, el margen es amplio
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{precisionData.percentage}</p>
              <p className="text-xs text-muted-foreground font-medium">Margen</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 bg-orange-500"
                style={{ width: `${precisionData.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Datos completados: {precisionData.completeness}%</span>
              <span className="font-medium">{precisionData.score}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA PRINCIPAL - Mejorar precisión - POSICIÓN DESTACADA */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-6 space-y-4 shadow-lg border-2 border-blue-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-2">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            Reduce el margen a ±8%
          </h3>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            Con la información básica solo podemos darte un intervalo amplio.<br />
            <strong className="text-white">Responde 3 preguntas más</strong> y obtén una valoración mucho más precisa.
          </p>
        </div>

        {/* Beneficios visuales */}
        <div className="grid grid-cols-2 gap-3 py-3">
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">±20%</p>
            <p className="text-xs text-blue-100">Margen actual</p>
          </div>
          <div className="text-center p-3 bg-white/20 rounded-lg backdrop-blur-sm border-2 border-white/30">
            <p className="text-2xl md:text-3xl font-bold text-white mb-1">±8%</p>
            <p className="text-xs text-blue-100 font-semibold">Con más datos</p>
          </div>
        </div>

        {/* Lista de beneficios */}
        <div className="space-y-2 text-sm text-blue-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Solo 2 minutos más de tu tiempo</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Valoración hasta 3 veces más precisa</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Toma mejores decisiones sobre tu propiedad</span>
          </div>
        </div>

        {/* CTA Button - MUY DESTACADO */}
        <Button
          onClick={nextStep}
          className="w-full h-14 text-base md:text-lg font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-xl border-2 border-white/50"
          size="lg"
        >
          Mejorar mi valoración ahora
          <TrendingUp className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-xs text-center text-blue-100/80">
          Sin compromiso • Gratis • Resultados inmediatos
        </p>
      </div>

      {/* Detalles de la propiedad - SECUNDARIO */}
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

      {/* Acciones secundarias - Menos destacadas */}
      <div className="space-y-2 pt-2">
        <Button variant="outline" className="w-full" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Enviar informe por email
        </Button>
        <Button variant="ghost" className="w-full" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="flex gap-2 pt-3 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex-1"
          size="sm"
        >
          Cerrar
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = "/contacto"}
          className="flex-1"
          size="sm"
        >
          Hablar con un experto
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Esta valoración es orientativa. Para una tasación oficial, contacta con nuestros expertos.
      </p>
    </div>
  );
};
