"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  Mail,
  TrendingUp,
  Home,
  Sparkles,
  Award,
  Eye,
  MapPin
} from "lucide-react";

interface DetailedResultProps {
  onClose: () => void;
}

export const Step10DetailedResult = ({ onClose }: DetailedResultProps) => {
  const {
    detailedValuation,
    postalCode,
    squareMeters,
    bedrooms,
    bathrooms,
    orientation,
    propertyCondition,
    hasTerrace,
    terraceSize,
    hasGarage,
    hasStorage,
    quality,
    photos
  } = useWizardStore();

  if (!detailedValuation) {
    return (
      <div className="p-8 text-center">
        <p>Error: No se pudo calcular la valoración detallada</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Valoración Premium Completa
            </h2>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            Análisis con IA • Precisión máxima • {photos.length} fotos procesadas
          </p>
        </div>
      </div>

      {/* Main Valuation Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 space-y-4 border-2 border-primary/30 shadow-xl">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Precisión Máxima
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Valor de mercado estimado
            </p>
            <p className="text-4xl md:text-5xl font-bold text-primary">
              {formatPrice(detailedValuation.avg)}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Rango: {formatPrice(detailedValuation.min)} - {formatPrice(detailedValuation.max)}
            </p>
          </div>
        </div>

        {/* Precision Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {detailedValuation.uncertainty}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-1">Margen de error</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {detailedValuation.precisionScore}/100
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-1">Índice de precisión</p>
          </div>
        </div>

        {/* Confidence level */}
        <div className="pt-3">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
              style={{ width: `${detailedValuation.precisionScore}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Confianza: <span className="font-semibold text-green-600 dark:text-green-400">Muy Alta</span>
          </p>
        </div>
      </div>

      {/* Market Comparison */}
      {detailedValuation.marketComparison && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            Comparativa de mercado
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Propiedades similares</p>
              <p className="font-semibold">{detailedValuation.marketComparison.similarProperties}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Precio medio zona</p>
              {detailedValuation.precioZona ? (
                <p className="font-semibold">{formatPrice(detailedValuation.precioZona)}/m²</p>
              ) : (
                <p className="font-semibold text-muted-foreground">Datos de zona insuficientes</p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Posición</p>
              <p className="font-semibold capitalize">{detailedValuation.marketComparison.pricePosition}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis from Photos */}
      {detailedValuation.aiAnalysis && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-5 space-y-3 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-sm">Análisis visual</h3>
            <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full font-medium">
              {detailedValuation.aiAnalysis.photoCount} fotos
            </span>
          </div>
          <div className="space-y-2">
            {detailedValuation.aiAnalysis.detectedFeatures.map((feature: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Details */}
      <div className="bg-muted/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Home className="w-4 h-4" />
          <span>Características de tu propiedad</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Ubicación</p>
            <div className="flex items-center gap-1 font-semibold mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>CP {postalCode}</span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Superficie</p>
            <p className="font-semibold mt-0.5">{squareMeters} m²</p>
          </div>
          <div>
            <p className="text-muted-foreground">Habitaciones</p>
            <p className="font-semibold mt-0.5">{bedrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Baños</p>
            <p className="font-semibold mt-0.5">{bathrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Orientación</p>
            <p className="font-semibold mt-0.5 capitalize">{orientation}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estado</p>
            <p className="font-semibold mt-0.5 capitalize">{propertyCondition?.replace(/-/g, ' ')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Terraza</p>
            <p className="font-semibold mt-0.5">
              {hasTerrace ? `${terraceSize} m²` : "No"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Garaje</p>
            <p className="font-semibold mt-0.5">{hasGarage ? "Sí" : "No"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Trastero</p>
            <p className="font-semibold mt-0.5">{hasStorage ? "Sí" : "No"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Precio/m²</p>
            <p className="font-semibold mt-0.5">{formatPrice(detailedValuation.pricePerM2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Calidad</p>
            <p className="font-semibold mt-0.5 capitalize">{quality}</p>
          </div>
        </div>
      </div>

      {/* Advanced Adjustments */}
      {detailedValuation.advancedAdjustments && detailedValuation.advancedAdjustments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ajustes aplicados por IA
          </h3>
          <div className="space-y-2">
            {detailedValuation.advancedAdjustments.map((adj: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                <span className="flex-1">{adj.factor}</span>
                <span className={`font-semibold min-w-[60px] text-right ${
                  adj.value.startsWith('+') ? 'text-green-600 dark:text-green-400' :
                  adj.value.startsWith('-') ? 'text-red-600 dark:text-red-400' :
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
      <div className="pt-4">
        <Button
          onClick={onClose}
          className="w-full h-auto py-4 text-lg font-bold shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          size="lg"
        >
          Finalizar
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Hemos enviado el informe completo a tu email
      </p>
    </div>
  );
};
