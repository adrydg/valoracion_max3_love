"use client";

import { useState, useRef } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Camera, Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const Step8PhotoUpload = () => {
  const {
    photos,
    photoUrls,
    addPhotos,
    removePhoto,
    nextStep,
    prevStep,
    // Todos los datos para el email
    name,
    email,
    phone,
    propertyType,
    bedrooms,
    postalCode,
    street,
    squareMeters,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    landSize,
    consentMarketing,
    leadId,
    // Características avanzadas
    orientation,
    propertyCondition,
    hasTerrace,
    terraceSize,
    hasGarage,
    hasStorage,
    quality,
  } = useWizardStore();

  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    // Validar cantidad
    if (photos.length + fileArray.length > MAX_PHOTOS) {
      setErrors(`Solo puedes subir un máximo de ${MAX_PHOTOS} fotos`);
      return;
    }

    // Validar cada archivo
    fileArray.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errorMessages.push(`${file.name}: Formato no válido (solo JPG, PNG, WebP)`);
      } else if (file.size > MAX_FILE_SIZE) {
        errorMessages.push(`${file.name}: Archivo muy grande (máx 10MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      setErrors(errorMessages[0]);
      setTimeout(() => setErrors(""), 5000);
    }

    if (validFiles.length > 0) {
      addPhotos(validFiles);
      setErrors("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = async () => {
    setIsSubmitting(true);

    try {
      // Enviar email con formulario largo
      console.log("📧 Enviando email con formulario largo...");
      const emailResponse = await fetch("/api/lead/send-progress-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "long",
          leadId,
          name,
          email,
          phone,
          propertyType,
          bedrooms,
          postalCode,
          street,
          squareMeters,
          bathrooms,
          floor,
          hasElevator,
          buildingAge,
          landSize,
          consentMarketing,
          // Características avanzadas
          orientation,
          propertyCondition,
          hasTerrace,
          terraceSize,
          hasGarage,
          hasStorage,
          quality,
          photos: photos.length, // Solo enviamos el número de fotos
        }),
      });

      if (emailResponse.ok) {
        console.log("✅ Email formulario largo enviado correctamente");
      } else {
        console.warn("⚠️ Error al enviar email (continuando de todos modos)");
      }
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError);
      // No bloqueamos el flujo si falla el email
    }

    // Las fotos son OPCIONALES - se puede continuar sin fotos
    nextStep();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold">
          Sube fotos de tu propiedad (opcional)
        </h2>
        <p className="text-sm text-muted-foreground">
          Las fotos nos ayudarán a mejorar la precisión de tu valoración
        </p>
      </div>

      {/* Counter */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {photos.length} / {MAX_PHOTOS} fotos
          </span>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickUpload}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-background"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center relative">
            <Upload className="w-7 h-7 text-primary animate-bounce" />
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold">
              Selecciona o arrastra tus fotos aquí
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span>• JPG, PNG o WebP</span>
              <span>• Máx 10MB</span>
              <span>• Hasta {MAX_PHOTOS} fotos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errors && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive text-center">{errors}</p>
        </div>
      )}

      {/* Photo Grid Preview */}
      {photoUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Fotos seleccionadas</h3>
            <p className="text-xs text-muted-foreground">
              Toca para eliminar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              >
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Delete overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="bg-destructive rounded-full p-2">
                    <X className="w-5 h-5 text-white" />
                  </div>
                </button>

                {/* Photo number badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          💡 Consejos para mejores resultados:
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4">
          <li>• Incluye fotos del salón, cocina y habitaciones</li>
          <li>• Asegúrate de que haya buena iluminación</li>
          <li>• Muestra el estado general de la propiedad</li>
          <li>• Evita fotos borrosas o con objetos personales</li>
        </ul>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 group"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              {photos.length > 0 ? `Continuar con ${photos.length} foto${photos.length > 1 ? 's' : ''}` : 'Continuar sin fotos'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Paso 2 de 2 • Las fotos se analizarán para mejorar tu valoración
      </p>
    </div>
  );
};
