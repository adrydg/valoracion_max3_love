"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useWizardStore } from "@/store/useWizardStore";
import { Progress } from "@/components/ui/progress";
import { Step1Ubicacion } from "./wizard/Step1Ubicacion";
import { Step2Caracteristicas } from "./wizard/Step2Caracteristicas";
import { Step3DatosPersonales } from "./wizard/Step3DatosPersonales";
import { LoadingScreen } from "./wizard/LoadingScreen";
import { DirectOfferScreen } from "./wizard/DirectOfferScreen";
import { BasicResult } from "./wizard/BasicResult";

interface ValuationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ValuationModal = ({ open, onOpenChange }: ValuationModalProps) => {
  const { currentStep, reset } = useWizardStore();

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Calcular progreso
  const progress = (currentStep / 6) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Valoración de propiedad</DialogTitle>

        {/* Barra de progreso */}
        {currentStep < 6 && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Paso {currentStep} de 6
            </p>
          </div>
        )}

        {/* Renderizar paso actual */}
        {currentStep === 1 && <Step1Ubicacion />}
        {currentStep === 2 && <Step2Caracteristicas />}
        {currentStep === 3 && <Step3DatosPersonales />}
        {currentStep === 4 && <LoadingScreen />}
        {currentStep === 5 && <DirectOfferScreen />}
        {currentStep === 6 && <BasicResult onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
};
