"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Home, Building2, Store, HelpCircle, ArrowRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValuationModal } from "./ValuationModal";

type PropertyType = "piso" | "casa" | "local" | "otros" | null;
type Bedrooms = "1" | "2" | "3" | "4" | "5+" | null;
type LandSize = "0" | "150" | "400" | "1000" | "1500" | null;

const propertyTypes = [
  { id: "piso", label: "Piso", icon: Building2 },
  { id: "casa", label: "Casa", icon: Home },
  { id: "local", label: "Local", icon: Store },
  { id: "otros", label: "Otros", icon: HelpCircle },
];

const bedroomOptions = [
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5+", label: "5+" },
];

const landSizeOptions = [
  { id: "0", label: "No tiene" },
  { id: "150", label: "150 m²" },
  { id: "400", label: "400 m²" },
  { id: "1000", label: "1000 m²" },
  { id: "1500", label: "1500 m²" },
];

export const HeroWizard = () => {
  const [propertyType, setPropertyType] = useState<PropertyType>("piso");
  const [bedrooms, setBedrooms] = useState<Bedrooms>(null);
  const [landSize, setLandSize] = useState<LandSize>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Botón clickeado - abriendo modal");
    setModalOpen(true);
  }, []);

  return (
    <div className="space-y-6 p-6 md:p-8 animate-scale-in">
      <div className="text-center space-y-2">
        <p className="text-sm md:text-base text-muted-foreground">
          Miles de propietarios ya conocen el valor exacto de su inmueble
        </p>
      </div>

        {/* Property Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de vivienda</label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setPropertyType(type.id as PropertyType)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300",
                    "hover:border-primary/50 hover:shadow-card",
                    propertyType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bedrooms Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Número de habitaciones</label>
          <div className="flex flex-wrap gap-2 justify-center">
            {bedroomOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBedrooms(option.id as Bedrooms)}
                className={cn(
                  "py-2 px-4 rounded-full border-2 transition-all duration-300 text-sm font-medium",
                  "hover:border-primary/50 hover:shadow-sm",
                  bedrooms === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Land Size Selection - only for casa */}
        {propertyType === "casa" && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Tamaño del terreno</label>

            {/* Bubbles selector */}
            <div className="flex flex-wrap gap-2 justify-center">
              {landSizeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setLandSize(option.id as LandSize)}
                  className={cn(
                    "py-2 px-4 rounded-full border-2 transition-all duration-300 text-sm font-medium",
                    "hover:border-primary/50 hover:shadow-sm",
                    landSize === option.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Numeric selector with - and + */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setLandSize(Math.max(0, (parseInt(landSize || "0") - 100)).toString() as LandSize)}
                className="w-10 h-10 rounded-full border-2 border-border hover:border-primary/50 flex items-center justify-center transition-all hover:bg-primary/5"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg min-w-[100px] justify-center">
                <span className="text-2xl font-bold">{landSize || "0"}</span>
                <span className="text-sm text-muted-foreground">m²</span>
              </div>

              <button
                onClick={() => setLandSize((parseInt(landSize || "0") + 100).toString() as LandSize)}
                className="w-10 h-10 rounded-full border-2 border-border hover:border-primary/50 flex items-center justify-center transition-all hover:bg-primary/5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          type="button"
          role="button"
          aria-label="Obtener valoración gratuita"
          className={cn(
            "group relative w-full h-12 px-8 text-base rounded-lg",
            "btn-cta-gradient text-cta-foreground font-semibold shadow-lg",
            "inline-flex items-center justify-center gap-2",
            "transition-all duration-300",
            "hover:shadow-hover hover:scale-[1.02]",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "cursor-pointer select-none"
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <span>Obtener valoración gratuita</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-700 dark:text-green-400">Basado en datos reales de tu zona</span>
          </div>
        </div>

      <ValuationModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};
