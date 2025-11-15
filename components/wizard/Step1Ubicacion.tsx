"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin } from "lucide-react";

export const Step1Ubicacion = () => {
  const {
    postalCode,
    street,
    squareMeters,
    bedrooms,
    propertyType,
    setPostalCode,
    setStreet,
    setSquareMeters,
    setBedrooms,
    setPropertyType,
    nextStep,
  } = useWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // PRECARGA DE DATOS PARA TESTING
  useEffect(() => {
    if (!postalCode) setPostalCode("28001");
    if (!squareMeters) setSquareMeters(85);
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

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Ubicación y tamaño</h2>
        <p className="text-muted-foreground">
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
            Calle (opcional)
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

        {/* Metros cuadrados */}
        <div className="space-y-2">
          <Label htmlFor="squareMeters">
            Metros cuadrados <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="squareMeters"
              type="number"
              inputMode="decimal"
              placeholder="85"
              value={squareMeters || ""}
              onChange={(e) => setSquareMeters(Number(e.target.value))}
              min={20}
              max={1000}
              autoComplete="off"
              autoCorrect="off"
              className={errors.squareMeters ? "border-destructive pr-12" : "pr-12"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              m²
            </span>
          </div>
          {errors.squareMeters && (
            <p className="text-sm text-destructive">{errors.squareMeters}</p>
          )}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full group"
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
