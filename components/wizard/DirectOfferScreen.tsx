"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, ArrowRight, PartyPopper, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

export const DirectOfferScreen = () => {
  const { leadId, setDirectOfferInterest, nextStep } = useWizardStore();
  const [selected, setSelected] = useState<"open-to-offers" | "not-interested" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;

    setIsSubmitting(true);
    setDirectOfferInterest(selected);

    try {
      // MODO TESTING: No llamar API, solo loguear
      console.log("🎁 Interés oferta directa (testing):", selected);

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Continuar al resultado
      nextStep();
    } catch (error) {
      console.error("Error:", error);
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Título con icono */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500" />
          Valoración básica
        </h2>
        <p className="text-lg text-muted-foreground text-center">
          Ya tenemos tu valoración, pero antes de que la veas te queremos hacer una{" "}
          <span className="font-semibold text-primary">propuesta</span>.
        </p>
        <p className="text-sm text-center text-primary font-semibold">
          Solo 2 pasos más para completar tu valoración
        </p>
      </div>

      {/* Pregunta */}
      <div className="pt-4">
        <p className="text-lg font-medium mb-6 text-center">
          ¿Te interesaría escuchar una propuesta?
        </p>

        <div className="space-y-3">
          {/* Opción 1: Recibir valoración y escuchar oferta */}
          <button
            onClick={() => setSelected("open-to-offers")}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-all text-left",
              "hover:border-primary/50",
              selected === "open-to-offers"
                ? "border-primary bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5",
                selected === "open-to-offers"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {selected === "open-to-offers" && (
                  <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />
                )}
              </div>
              <PartyPopper className="w-10 h-10 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-base">Recibir valoración y escuchar oferta</p>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    Siempre está bien escuchar ofertas
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Opción 2: Solo valoración */}
          <button
            onClick={() => setSelected("not-interested")}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-all text-left",
              "hover:border-primary/50",
              selected === "not-interested"
                ? "border-primary bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5",
                selected === "not-interested"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {selected === "not-interested" && (
                  <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />
                )}
              </div>
              <Skull className="w-10 h-10 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-base">Solo valoración, no me interesan propuestas</p>
                <div className="mt-2">
                  <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">
                    No me interesan oportunidades
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Botón Continuar - Desactivado hasta seleccionar */}
      <Button
        onClick={handleContinue}
        disabled={!selected || isSubmitting}
        className={cn(
          "w-full h-auto py-4 text-lg font-bold shadow-lg transition-all",
          selected
            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
        size="lg"
      >
        <span>Continuar</span>
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      {/* Beneficios debajo del botón verde */}
      <div className="space-y-2 text-sm text-muted-foreground text-center">
        <p>✓ 100% gratuito, sin compromiso</p>
        <p>✓ Proceso rápido y transparente</p>
        <p>✓ Desde el sofá de tu casa</p>
      </div>

      <p className="text-xs text-center flex items-center justify-center gap-1">
        <span className="text-green-600">✓</span>
        <span className="font-medium text-foreground">No te preocupes</span>
        <span className="text-muted-foreground">, podrás ver tu valoración en el siguiente paso</span>
      </p>
    </div>
  );
};
