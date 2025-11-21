"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const bathroomOptions = [
  { id: 1, label: "1" },
  { id: 2, label: "2" },
  { id: 3, label: "3+" },
];

const floorOptions = [
  { id: "bajo", label: "Bajo" },
  { id: "1-2", label: "1ª-2ª" },
  { id: "3-5", label: "3ª-5ª" },
  { id: "6+", label: "6ª+" },
  { id: "atico", label: "Ático" },
];

const buildingAgeOptions = [
  { id: "nueva", label: "<5 años" },
  { id: "reciente", label: "5-15 años" },
  { id: "moderna", label: "15-30 años" },
  { id: "antigua", label: "30-50 años" },
  { id: "muy-antigua", label: ">50 años" },
];

export const Step2Caracteristicas = () => {
  const {
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    setBathrooms,
    setFloor,
    setHasElevator,
    setBuildingAge,
    nextStep,
    prevStep,
  } = useWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // PRECARGA DE DATOS PARA TESTING - DESACTIVADA
  // useEffect(() => {
  //   if (!bathrooms) setBathrooms(2);
  //   if (!floor) setFloor("3-5");
  //   if (hasElevator === null) setHasElevator(true);
  //   if (!buildingAge) setBuildingAge("moderna");
  // }, []);

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    if (!bathrooms) newErrors.bathrooms = "Selecciona el número de baños";
    if (!floor) newErrors.floor = "Selecciona la planta";
    if (hasElevator === null) newErrors.hasElevator = "Indica si tiene ascensor";
    if (!buildingAge) newErrors.buildingAge = "Selecciona la antigüedad";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          Características
        </h2>
        <p className="text-muted-foreground">
          Ayúdanos a conocer mejor tu propiedad
        </p>
      </div>

      <div className="space-y-6">
        {/* Número de baños */}
        <div className="space-y-3">
          <Label>
            Número de baños <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {bathroomOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBathrooms(option.id)}
                className={cn(
                  "py-2 px-2 rounded-lg border-2 transition-all text-xs font-medium",
                  "hover:border-primary/50",
                  bathrooms === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.bathrooms && (
            <p className="text-sm text-destructive">{errors.bathrooms}</p>
          )}
        </div>

        {/* Planta */}
        <div className="space-y-3">
          <Label>
            Planta del inmueble <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            {floorOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFloor(option.id as any)}
                className={cn(
                  "py-2 px-2 rounded-lg border-2 transition-all text-xs font-medium",
                  "hover:border-primary/50",
                  floor === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.floor && (
            <p className="text-sm text-destructive">{errors.floor}</p>
          )}
        </div>

        {/* ¿Tiene ascensor? */}
        <div className="space-y-3">
          <Label>
            ¿Tiene ascensor? <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setHasElevator(true)}
              className={cn(
                "py-2 px-2 rounded-lg border-2 transition-all text-xs font-medium",
                "hover:border-primary/50",
                hasElevator === true
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              )}
            >
              Sí
            </button>
            <button
              onClick={() => setHasElevator(false)}
              className={cn(
                "py-2 px-2 rounded-lg border-2 transition-all text-xs font-medium",
                "hover:border-primary/50",
                hasElevator === false
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              )}
            >
              No
            </button>
          </div>
          {errors.hasElevator && (
            <p className="text-sm text-destructive">{errors.hasElevator}</p>
          )}
        </div>

        {/* Antigüedad del edificio */}
        <div className="space-y-3">
          <Label>
            Antigüedad del edificio <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            {buildingAgeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBuildingAge(option.id as any)}
                className={cn(
                  "py-2 px-2 rounded-lg border-2 transition-all text-xs font-medium text-center",
                  "hover:border-primary/50",
                  buildingAge === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.buildingAge && (
            <p className="text-sm text-destructive">{errors.buildingAge}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
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
    </div>
  );
};
