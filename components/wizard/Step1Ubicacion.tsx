"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Step1Ubicacion = () => {
  const {
    postalCode,
    street,
    squareMeters,
    landSize,
    bedrooms,
    propertyType,
    setPostalCode,
    setStreet,
    setSquareMeters,
    setLandSize,
    setBedrooms,
    setPropertyType,
    nextStep,
  } = useWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // PRECARGA DE DATOS PARA TESTING
  useEffect(() => {
    if (!postalCode) setPostalCode("28001");
    if (!squareMeters) setSquareMeters(75);
    if (!street) setStreet("Calle Gran Vía 28");
    if (!bedrooms) setBedrooms(3);
    if (!propertyType) setPropertyType("piso");
  }, []);

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    // Validar código postal
    if (!postalCode || postalCode.length !== 5 || !/^\d{5}$/.test(postalCode)) {
      newErrors.postalCode = "Código postal inválido (5 dígitos)";
    }

    // Validar metros cuadrados
    if (!squareMeters || squareMeters < 20 || squareMeters > 1000) {
      newErrors.squareMeters = "Metros cuadrados inválidos (20-1000 m²)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  const squareMetersOptions = [
    { id: 50, label: "<50" },
    { id: 60, label: "60" },
    { id: 75, label: "75" },
    { id: 90, label: "90" },
    { id: 110, label: "110" },
  ];

  const landSizeOptions = [
    { id: 0, label: "No tiene" },
    { id: 150, label: "150" },
    { id: 400, label: "400" },
    { id: 1000, label: "1000" },
    { id: 1500, label: "1500" },
  ];

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Ubicación y tamaño
        </h2>
        <p className="text-sm text-muted-foreground">
          Cuéntanos dónde está tu propiedad
        </p>
      </div>

      <div className="space-y-4">
        {/* Código Postal */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            Código postal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postalCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="28001"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.slice(0, 5))}
            maxLength={5}
            autoComplete="postal-code"
            autoCorrect="off"
            spellCheck={false}
            className={errors.postalCode ? "border-destructive" : ""}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>

        {/* Calle */}
        <div className="space-y-2">
          <Label htmlFor="street">
            Calle y número
          </Label>
          <Input
            id="street"
            type="text"
            placeholder="Calle Gran Vía 28"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            autoComplete="street-address"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">
            No lo mostraremos públicamente
          </p>
        </div>

        {/* Metros cuadrados vivienda */}
        <div className="space-y-3">
          <Label>
            Metros cuadrados {propertyType === "casa" ? "vivienda" : ""} <span className="text-destructive">*</span>
          </Label>

          {/* Bubbles selector */}
          <div className="grid grid-cols-5 gap-2">
            {squareMetersOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSquareMeters(option.id)}
                className={cn(
                  "py-2 px-2 rounded-full border-2 transition-all text-sm font-medium",
                  "hover:border-primary/50",
                  squareMeters === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Numeric selector con - y + */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setSquareMeters(Math.max(20, (squareMeters || 75) - 1))}
              className="w-10 h-10 rounded-full border-2 border-border hover:border-primary/50 flex items-center justify-center transition-all hover:bg-primary/5"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg min-w-[100px] justify-center">
              <span className="text-2xl font-bold">{squareMeters || 75}</span>
              <span className="text-sm text-muted-foreground">m²</span>
            </div>

            <button
              onClick={() => setSquareMeters(Math.min(1000, (squareMeters || 75) + 1))}
              className="w-10 h-10 rounded-full border-2 border-border hover:border-primary/50 flex items-center justify-center transition-all hover:bg-primary/5"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {errors.squareMeters && (
            <p className="text-sm text-destructive">{errors.squareMeters}</p>
          )}
        </div>

        {/* Tamaño del terreno - solo para casas */}
        {propertyType === "casa" && (
          <div className="space-y-3">
            <Label>
              Tamaño del terreno
            </Label>

            {/* Bubbles selector */}
            <div className="grid grid-cols-5 gap-2">
              {landSizeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLandSize(option.id)}
                  className={cn(
                    "py-2 px-2 rounded-full border-2 transition-all text-sm font-medium",
                    "hover:border-primary/50",
                    landSize === option.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Numeric selector con - y + */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setLandSize(Math.max(0, (landSize || 0) - 100))}
                className="w-10 h-10 rounded-full border-2 border-border hover:border-primary/50 flex items-center justify-center transition-all hover:bg-primary/5"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg min-w-[100px] justify-center">
                <span className="text-2xl font-bold">{landSize || 0}</span>
                <span className="text-sm text-muted-foreground">m²</span>
              </div>

              <button
                onClick={() => setLandSize((landSize || 0) + 100)}
                className="w-10 h-10 rounded-full border-2 border-border hover:border-primary/50 flex items-center justify-center transition-all hover:bg-primary/5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleContinue}
        className="w-full group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
        size="lg"
      >
        Continuar
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Tus datos están protegidos y no se compartirán sin tu consentimiento
      </p>
    </div>
  );
};
