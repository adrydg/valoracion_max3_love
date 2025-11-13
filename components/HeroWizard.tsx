"use client";

import { useState } from "react";
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

  const handleSubmit = () => {
    setModalOpen(true);
  };

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
          <div className="grid grid-cols-5 gap-2">
            {bedroomOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBedrooms(option.id as Bedrooms)}
                className={cn(
                  "py-2.5 px-3 rounded-lg border-2 transition-all duration-300 text-sm font-medium",
                  "hover:border-primary/50 hover:shadow-card",
                  bedrooms === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          variant="cta"
          size="lg"
          className="w-full"
        >
          Obtener valoración gratuita
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Sin compromiso • Valoración en 24h • Totalmente gratis
        </p>

      <ValuationModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};
