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
import { trackWizardEvent, trackWizardAbandoned } from "@/lib/analytics";

interface ValuationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ValuationModal = ({ open, onOpenChange }: ValuationModalProps) => {
  const { currentStep, totalSteps, reset } = useWizardStore();

  // Fix para viewport height en móviles
  useEffect(() => {
    if (!open) return;

    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateVH();
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);

    // Fix para Samsung Browser y otros
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateVH);
    }

    return () => {
      window.removeEventListener('resize', updateVH);
      window.removeEventListener('orientationchange', updateVH);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateVH);
      }
    };
  }, [open]);

  // Track step views
  useEffect(() => {
    if (open) {
      trackWizardEvent('step_view', {
        step: currentStep,
        totalSteps,
      });
    }
  }, [currentStep, open, totalSteps]);

  // Reset cuando se cierra el modal + tracking abandono
  useEffect(() => {
    if (!open) {
      // Track abandono si no llegó al final
      if (currentStep < totalSteps) {
        trackWizardAbandoned(currentStep, totalSteps);
      }
      reset();
    }
  }, [open, reset, currentStep, totalSteps]);

  // Calcular progreso - separar proceso corto (1-6) y largo (7-10)
  const shortProcessSteps = [1, 2, 3]; // Pasos del proceso corto
  const longProcessSteps = [7, 8]; // Pasos del proceso largo (avanzado)

  const isShortProcess = currentStep >= 1 && currentStep <= 6;
  const isLongProcess = currentStep >= 7 && currentStep <= 10;

  const isWizardStep = shortProcessSteps.includes(currentStep) || longProcessSteps.includes(currentStep);

  let progress = 0;
  let currentStepNum = 0;
  let totalStepsNum = 0;

  if (shortProcessSteps.includes(currentStep)) {
    currentStepNum = shortProcessSteps.indexOf(currentStep) + 1;
    totalStepsNum = shortProcessSteps.length;
    progress = (currentStepNum / totalStepsNum) * 100;
  } else if (longProcessSteps.includes(currentStep)) {
    currentStepNum = longProcessSteps.indexOf(currentStep) + 1;
    totalStepsNum = longProcessSteps.length;
    progress = (currentStepNum / totalStepsNum) * 100;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 h-[100dvh] max-h-[100dvh]"
        style={{
          maxHeight: 'calc(var(--vh, 1vh) * 100)',
          height: '100%',
        }}
      >
        <DialogTitle className="sr-only">Valoración de propiedad</DialogTitle>

        {/* Header fijo con progress - solo en pasos de wizard */}
        {isWizardStep && (
          <div className="sticky top-0 z-10 bg-background border-b p-4 rounded-t-lg">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Paso {currentStepNum} de {totalStepsNum}
            </p>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
