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
import { Step7AdvancedFeatures } from "./wizard/Step7AdvancedFeatures";
import { Step8PhotoUpload } from "./wizard/Step8PhotoUpload";
import { Step9AIProcessing } from "./wizard/Step9AIProcessing";
import { Step10DetailedResult } from "./wizard/Step10DetailedResult";

interface ValuationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ValuationModal = ({ open, onOpenChange }: ValuationModalProps) => {
  const { currentStep, totalSteps, reset } = useWizardStore();

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Calcular progreso - solo para pasos del wizard (no loading/results)
  const wizardSteps = [1, 2, 3, 7, 8]; // Pasos con formulario
  const isWizardStep = wizardSteps.includes(currentStep);
  const progress = isWizardStep ? (wizardSteps.indexOf(currentStep) + 1) / wizardSteps.length * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Valoración de propiedad</DialogTitle>

        {/* Barra de progreso */}
        {isWizardStep && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Paso {wizardSteps.indexOf(currentStep) + 1} de {wizardSteps.length}
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
        {currentStep === 7 && <Step7AdvancedFeatures />}
        {currentStep === 8 && <Step8PhotoUpload />}
        {currentStep === 9 && <Step9AIProcessing />}
        {currentStep === 10 && <Step10DetailedResult onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
};
