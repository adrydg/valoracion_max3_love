"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const orientationOptions = [
  { id: "norte", label: "Norte", icon: "⬆️" },
  { id: "sur", label: "Sur", icon: "⬇️" },
  { id: "este", label: "Este", icon: "➡️" },
  { id: "oeste", label: "Oeste", icon: "⬅️" },
  { id: "noreste", label: "Noreste", icon: "↗️" },
  { id: "noroeste", label: "Noroeste", icon: "↖️" },
  { id: "sureste", label: "Sureste", icon: "↘️" },
  { id: "suroeste", label: "Suroeste", icon: "↙️" },
];

const conditionOptions = [
  { id: "a-estrenar", label: "A estrenar", description: "Nunca habitado" },
  { id: "reformado", label: "Reformado", description: "Recientemente renovado" },
  { id: "buen-estado", label: "Buen estado", description: "Pequeñas mejoras" },
  { id: "para-reformar", label: "Para reformar", description: "Necesita actualización" },
];

const qualityOptions = [
  { id: "lujo", label: "Lujo", description: "Materiales premium" },
  { id: "alta", label: "Alta", description: "Calidades superiores" },
  { id: "media", label: "Media", description: "Calidades estándar" },
  { id: "basica", label: "Básica", description: "Calidades económicas" },
];

export const Step7AdvancedFeatures = () => {
  const {
    orientation,
    propertyCondition,
    hasTerrace,
    terraceSize,
    hasGarage,
    hasStorage,
    quality,
    setOrientation,
    setPropertyCondition,
    setHasTerrace,
    setTerraceSize,
    setHasGarage,
    setHasStorage,
    setQuality,
    nextStep,
    prevStep,
  } = useWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state para multi-select
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>(
    orientation ? [orientation] : []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    propertyCondition ? [propertyCondition] : []
  );
  const [selectedTerraceTypes, setSelectedTerraceTypes] = useState<string[]>([]);

  // PRECARGA DE DATOS PARA TESTING
  useEffect(() => {
    if (!orientation) setOrientation("sur");
    if (!propertyCondition) setPropertyCondition("buen-estado");
    if (hasTerrace === null) setHasTerrace(true);
    if (!terraceSize) setTerraceSize(15);
    if (hasGarage === null) setHasGarage(true);
    if (hasStorage === null) setHasStorage(false);
    if (!quality) setQuality("media");
  }, []);

  const handleContinue = () => {
    // Guardar el primero seleccionado en el store (para compatibilidad)
    if (selectedOrientations.length > 0) {
      setOrientation(selectedOrientations[0] as any);
    }
    if (selectedConditions.length > 0) {
      setPropertyCondition(selectedConditions[0] as any);
    }

    // Todos los campos son opcionales, continuar directamente
    setErrors({});
    nextStep();
  };

  const toggleOrientation = (id: string) => {
    setSelectedOrientations(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const toggleCondition = (id: string) => {
    setSelectedConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleTerraceType = (type: string) => {
    if (type === "ninguno") {
      setSelectedTerraceTypes(["ninguno"]);
      setHasTerrace(false);
    } else {
      setSelectedTerraceTypes(prev => {
        const filtered = prev.filter(t => t !== "ninguno");
        if (filtered.includes(type)) {
          return filtered.filter(t => t !== type);
        } else {
          return [...filtered, type];
        }
      });
      setHasTerrace(true);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Características avanzadas
        </h2>
        <p className="text-sm text-muted-foreground">
          Estos detalles mejorarán la precisión a <strong className="text-green-600">±8%</strong>
        </p>
      </div>

      <div className="space-y-6">
        {/* Orientación */}
        <div className="space-y-2">
          <Label className="text-xs">
            Orientación principal (puedes seleccionar varias)
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {orientationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleOrientation(option.id)}
                className={cn(
                  "py-1.5 px-1 rounded-md border-2 transition-all text-xs font-medium",
                  "hover:border-primary/50 flex flex-col items-center gap-0",
                  selectedOrientations.includes(option.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                <span className="text-xs">{option.icon}</span>
                <span className="text-[9px]">{option.label}</span>
              </button>
            ))}
          </div>
          {errors.orientation && (
            <p className="text-sm text-destructive">{errors.orientation}</p>
          )}
        </div>

        {/* Estado de la propiedad */}
        <div className="space-y-2">
          <Label className="text-xs">
            Estado de la propiedad (puedes seleccionar varios)
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {conditionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleCondition(option.id)}
                className={cn(
                  "py-2 px-1 rounded-md border-2 transition-all text-center",
                  "hover:border-primary/50",
                  selectedConditions.includes(option.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                <div className="font-medium text-[10px] leading-tight">{option.label}</div>
              </button>
            ))}
          </div>
          {errors.propertyCondition && (
            <p className="text-sm text-destructive">{errors.propertyCondition}</p>
          )}
        </div>

        {/* Terraza/Balcón/Patio */}
        <div className="space-y-2">
          <Label className="text-xs">
            ¿Tiene terraza, balcón o patio? (multirespuesta)
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "terraza", label: "Terraza" },
              { id: "balcon", label: "Balcón" },
              { id: "patio", label: "Patio" },
              { id: "ninguno", label: "Ninguno" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => toggleTerraceType(option.id)}
                className={cn(
                  "py-2 px-1 rounded-md border-2 transition-all text-[10px] font-medium",
                  "hover:border-primary/50",
                  selectedTerraceTypes.includes(option.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.hasTerrace && (
            <p className="text-sm text-destructive">{errors.hasTerrace}</p>
          )}
        </div>

        {/* Garaje y Trastero */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">
              ¿Plaza de garaje?
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setHasGarage(true)}
                className={cn(
                  "py-2 px-2 rounded-md border-2 transition-all text-[10px] font-medium",
                  "hover:border-primary/50",
                  hasGarage === true
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                Sí
              </button>
              <button
                onClick={() => setHasGarage(false)}
                className={cn(
                  "py-2 px-2 rounded-md border-2 transition-all text-[10px] font-medium",
                  "hover:border-primary/50",
                  hasGarage === false
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                No
              </button>
            </div>
            {errors.hasGarage && (
              <p className="text-sm text-destructive">{errors.hasGarage}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              ¿Trastero?
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setHasStorage(true)}
                className={cn(
                  "py-2 px-2 rounded-md border-2 transition-all text-[10px] font-medium",
                  "hover:border-primary/50",
                  hasStorage === true
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                Sí
              </button>
              <button
                onClick={() => setHasStorage(false)}
                className={cn(
                  "py-2 px-2 rounded-md border-2 transition-all text-[10px] font-medium",
                  "hover:border-primary/50",
                  hasStorage === false
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                No
              </button>
            </div>
            {errors.hasStorage && (
              <p className="text-sm text-destructive">{errors.hasStorage}</p>
            )}
          </div>
        </div>

        {/* Calidad de acabados */}
        <div className="space-y-2">
          <Label className="text-xs">
            Calidad de acabados
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {qualityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setQuality(option.id as any)}
                className={cn(
                  "py-2 px-1 rounded-md border-2 transition-all text-center",
                  "hover:border-primary/50",
                  quality === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                <div className="font-medium text-[10px] leading-tight">{option.label}</div>
              </button>
            ))}
          </div>
          {errors.quality && (
            <p className="text-sm text-destructive">{errors.quality}</p>
          )}
        </div>
      </div>

      {/* Botones navegación */}
      <div className="flex gap-2 pt-4">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="w-[20%]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleContinue}
          className="w-[80%] group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          size="lg"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Paso 1 de 2 • Faltan las fotos para completar
      </p>
    </div>
  );
};
