"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Home, Building2, Store, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValuationModal } from "./ValuationModal";

type PropertyType = "piso" | "casa" | "local" | "otros" | null;
type Bedrooms = "1" | "2" | "3" | "4" | "5+" | null;

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

export const HeroWizard = () => {
  const [propertyType, setPropertyType] = useState<PropertyType>("piso");
  const [bedrooms, setBedrooms] = useState<Bedrooms>(null);
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
          Miles de propietarios ya han confiado en nosotros
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
            <span className="text-green-700 dark:text-green-400">Valoración inmediata online</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground font-semibold">Totalmente gratis</span>
        </div>

      <ValuationModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};
