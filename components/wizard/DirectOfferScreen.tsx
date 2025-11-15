"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const DirectOfferScreen = () => {
  const { leadId, setDirectOfferInterest, nextStep } = useWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResponse = async (interest: "open-to-offers" | "not-interested") => {
    setIsSubmitting(true);
    setDirectOfferInterest(interest);

    try {
      // MODO TESTING: No llamar API, solo loguear
      console.log("🎁 Interés oferta directa (testing):", interest);

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
    <div className="space-y-6 p-4 text-center">
      {/* Icon */}
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      {/* Título */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Un momento antes de mostrarte tu valoración...
        </h2>
        <p className="text-lg text-muted-foreground">
          Tu inmueble nos parece interesante y nos gustaría hacerte una{" "}
          <span className="font-semibold text-primary">oferta de compra directa</span>,
          sin intermediarios.
        </p>
      </div>

      {/* Pregunta */}
      <div className="pt-4">
        <p className="text-lg font-medium mb-6">
          ¿Te interesaría escuchar una propuesta?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sí, me interesa */}
          <Button
            size="lg"
            onClick={() => handleResponse("open-to-offers")}
            disabled={isSubmitting}
            className="h-auto py-6 flex flex-col gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <span className="text-2xl">✨</span>
            <span className="font-semibold">Sí, me interesa</span>
            <span className="text-xs opacity-90">
              Siempre está bien escuchar propuestas
            </span>
          </Button>

          {/* No, solo mi valoración */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleResponse("not-interested")}
            disabled={isSubmitting}
            className="h-auto py-6 flex flex-col gap-2"
          >
            <span className="text-2xl">📊</span>
            <span className="font-semibold">No, solo mi valoración</span>
            <span className="text-xs text-muted-foreground">
              Ver el informe directamente
            </span>
          </Button>
        </div>
      </div>

      {/* Beneficios */}
      <div className="pt-4 space-y-2 text-sm text-muted-foreground">
        <p>✓ Sin comisiones de agencia</p>
        <p>✓ Proceso rápido y transparente</p>
        <p>✓ Pago al contado garantizado</p>
      </div>

      <p className="text-xs text-muted-foreground pt-4">
        No te preocupes, podrás ver tu valoración en el siguiente paso
      </p>
    </div>
  );
};
