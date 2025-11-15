"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";

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
      <div className="pt-4 text-center">
        <p className="text-lg font-medium mb-6">
          ¿Te interesaría escuchar una propuesta?
        </p>

        <div className="space-y-3">
          {/* Sí, me interesa - GRANDE Y VERDE */}
          <Button
            size="lg"
            onClick={() => handleResponse("open-to-offers")}
            disabled={isSubmitting}
            className="w-full h-auto py-6 flex flex-col gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          >
            <CheckCircle className="w-12 h-12" strokeWidth={2.5} />
            <span className="text-xl font-bold">¡Sí, me interesa!</span>
            <span className="text-sm opacity-95">
              Siempre está bien escuchar propuestas
            </span>
          </Button>

          {/* No, solo mi valoración - PEQUEÑO Y ROJO CLARO */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResponse("not-interested")}
            disabled={isSubmitting}
            className="w-full h-auto py-3 flex items-center justify-center gap-2 bg-red-50 border-red-200 hover:bg-red-100 text-red-800"
          >
            <XCircle className="w-5 h-5" />
            <span className="text-sm">No, solo mi valoración</span>
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
