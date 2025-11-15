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
  { id: "muy-buen-estado", label: "Muy buen estado", description: "No necesita reformas" },
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
    const newErrors: Record<string, string> = {};

    if (selectedOrientations.length === 0) newErrors.orientation = "Selecciona al menos una orientación";
    if (selectedConditions.length === 0) newErrors.propertyCondition = "Selecciona al menos un estado";
    if (hasTerrace === null) newErrors.hasTerrace = "Indica si tiene terraza";
    if (hasTerrace && (!terraceSize || terraceSize < 1)) {
      newErrors.terraceSize = "Indica el tamaño de la terraza";
    }
    if (hasGarage === null) newErrors.hasGarage = "Indica si tiene garaje";
    if (hasStorage === null) newErrors.hasStorage = "Indica si tiene trastero";
    if (!quality) newErrors.quality = "Selecciona la calidad";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Guardar el primero seleccionado en el store (para compatibilidad)
    if (selectedOrientations.length > 0) {
      setOrientation(selectedOrientations[0] as any);
    }
    if (selectedConditions.length > 0) {
      setPropertyCondition(selectedConditions[0] as any);
    }

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

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold">
          Características avanzadas
        </h2>
        <p className="text-sm text-muted-foreground">
          Estos detalles mejorarán la precisión a <strong>±8%</strong>
        </p>
      </div>

      <div className="space-y-6">
        {/* Orientación */}
        <div className="space-y-3">
          <Label>
            Orientación principal (puedes seleccionar varias) <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {orientationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleOrientation(option.id)}
                className={cn(
                  "py-2 px-2 rounded-lg border-2 transition-all text-xs font-medium",
                  "hover:border-primary/50 flex flex-col items-center gap-1",
                  selectedOrientations.includes(option.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                <span className="text-base">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {errors.orientation && (
            <p className="text-sm text-destructive">{errors.orientation}</p>
          )}
        </div>

        {/* Estado de la propiedad */}
        <div className="space-y-3">
          <Label>
            Estado de la propiedad (puedes seleccionar varios) <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {conditionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleCondition(option.id)}
                className={cn(
                  "py-3 px-3 rounded-lg border-2 transition-all text-left",
                  "hover:border-primary/50",
                  selectedConditions.includes(option.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className={cn(
                  "text-xs mt-0.5",
                  selectedConditions.includes(option.id) ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          {errors.propertyCondition && (
            <p className="text-sm text-destructive">{errors.propertyCondition}</p>
          )}
        </div>

        {/* Terraza */}
        <div className="space-y-3">
          <Label>
            ¿Tiene terraza, balcón o patio? <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setHasTerrace(true)}
              className={cn(
                "py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium",
                "hover:border-primary/50",
                hasTerrace === true
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              )}
            >
              Sí
            </button>
            <button
              onClick={() => setHasTerrace(false)}
              className={cn(
                "py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium",
                "hover:border-primary/50",
                hasTerrace === false
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              )}
            >
              No
            </button>
          </div>
          {errors.hasTerrace && (
            <p className="text-sm text-destructive">{errors.hasTerrace}</p>
          )}

          {/* Tamaño de terraza (condicional) */}
          {hasTerrace && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="terraceSize">
                Tamaño aproximado <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="terraceSize"
                  type="number"
                  placeholder="15"
                  value={terraceSize || ""}
                  onChange={(e) => setTerraceSize(Number(e.target.value))}
                  min={1}
                  max={200}
                  className={errors.terraceSize ? "border-destructive pr-12" : "pr-12"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  m²
                </span>
              </div>
              {errors.terraceSize && (
                <p className="text-sm text-destructive">{errors.terraceSize}</p>
              )}
            </div>
          )}
        </div>

        {/* Garaje y Trastero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>
              ¿Tiene plaza de garaje? <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setHasGarage(true)}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium",
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
                  "py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium",
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

          <div className="space-y-3">
            <Label>
              ¿Tiene trastero? <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setHasStorage(true)}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium",
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
                  "py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium",
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
        <div className="space-y-3">
          <Label>
            Calidad de acabados <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {qualityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setQuality(option.id as any)}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 transition-all text-left",
                  "hover:border-primary/50",
                  quality === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className={cn(
                  "text-xs mt-0.5",
                  quality === option.id ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {option.description}
                </div>
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
