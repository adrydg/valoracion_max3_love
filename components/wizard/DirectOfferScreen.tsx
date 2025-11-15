"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";
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
    <div className="space-y-6 p-4">
      {/* Título con icono */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500" />
          Un momento...
        </h2>
        <p className="text-lg text-muted-foreground text-center">
          Tu inmueble nos parece interesante y nos gustaría hacerte una{" "}
          <span className="font-semibold text-primary">oferta de compra directa</span>,
          sin intermediarios.
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
              <div className="flex-1">
                <p className="font-semibold text-base">Recibir valoración y escuchar oferta</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Siempre está bien escuchar propuestas
                </p>
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
              <div className="flex-1">
                <p className="font-semibold text-base">Solo valoración, no me interesan propuestas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ver el informe directamente
                </p>
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
        <p>✓ Sin comisiones de agencia</p>
        <p>✓ Proceso rápido y transparente</p>
        <p>✓ Pago al contado garantizado</p>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        No te preocupes, podrás ver tu valoración en el siguiente paso
      </p>
    </div>
  );
};
