"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Upload, Camera, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ValuationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PhotoScores {
  limpieza: number;
  luminosidad: number;
  estado_conservacion: number;
  calidad_acabados: number;
  distribucion: number;
  modernidad: number;
  atractivo_visual: number;
}

interface PhotoAnalysis {
  foto_numero: number;
  estancia: string;
  descripcion_detallada: string;
  elementos_apreciados: string[];
  estado_elementos: string;
  elementos_no_apreciados: string[];
  valoracion_particular: string;
  puntuaciones: PhotoScores;
}

interface ScoreGlobal {
  puntuacion_total: number;
  desglose: {
    estado_fisico: number;
    presentacion: number;
    caracteristicas: number;
    ubicacion: number;
  };
  categoria: "Excelente" | "Muy Bueno" | "Bueno" | "Necesita mejoras" | "Requiere reforma";
  explicacion: string;
}

interface MejoraROI {
  categoria: "Esencial" | "Recomendada" | "Opcional";
  mejora: string;
  razon: string;
  inversion_estimada: number;
  incremento_valor: number;
  roi_porcentaje: number;
  impacto_velocidad_venta: "Alto" | "Medio" | "Bajo";
  tiempo_implementacion: string;
}

interface ResumenROI {
  inversion_total_recomendada: number;
  incremento_valor_total: number;
  roi_total_porcentaje: number;
  reduccion_tiempo_venta_estimada: string;
}

interface ValuationResponse {
  analisis_fotos?: PhotoAnalysis[];
  score_global?: ScoreGlobal;
  mejoras_con_roi?: MejoraROI[];
  resumen_roi?: ResumenROI;
  valoracion_minima: number;
  valoracion_maxima: number;
  valoracion_media: number;
  valoracion_con_mejoras?: number;
  confianza: "alta" | "media" | "baja";
  analisis: {
    estado_general: string;
    puntos_fuertes: string[];
    puntos_debiles: string[];
    ubicacion_valoracion: string;
  };
  recomendaciones: string[];
  tiempo_venta_estimado: string;
  mejoras_sugeridas?: string[];
}

interface PhotoData {
  file: File;
  preview: string;
}

const agentMessages = [
  "¡Hola! 👋 Soy tu agente virtual. Vamos a tasar tu propiedad de forma rápida y divertida. ¡Empecemos!",
  "¡Genial! 🏠 Ahora cuéntame todos los detalles de tu propiedad. Necesito conocerla bien para darte la mejor valoración.",
  "¡Fotos! 📸 Es hora de presumir de tu casa. Sube las mejores fotos, pero si hay calcetines en el suelo, no pasa nada.",
  "📋 Casi terminamos. Necesito tus datos para mandarte el informe. Prometo no vendérselos a nadie... ¡es broma!",
  "🎉 ¡TACHÁAAN! Aquí está tu informe personalizado. ¿Listo para saber cuánto vale tu propiedad?",
];

export const ValuationModal = ({ open, onOpenChange }: ValuationModalProps) => {
  const [step, setStep] = useState(1);

  // Paso 1: Dirección (prerrellenado)
  const [address, setAddress] = useState("Calle Gran Vía 28, 3º A, Madrid");

  // Paso 2: Detalles de la propiedad (prerrellenado)
  const [squareMeters, setSquareMeters] = useState("85");
  const [showCustomSquareMeters, setShowCustomSquareMeters] = useState(false);
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("2");
  const [propertyType, setPropertyType] = useState("piso");
  const [buildingAge, setBuildingAge] = useState("10-30");
  const [floor, setFloor] = useState("1-3");
  const [hasElevator, setHasElevator] = useState("si");
  const [hasGarage, setHasGarage] = useState("no");
  const [hasTerrace, setHasTerrace] = useState("balcon");
  const [condition, setCondition] = useState("bueno");

  // Paso 3: Fotos
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // Paso 4: Datos de contacto (prerrellenado)
  const [name, setName] = useState("María García");
  const [email, setEmail] = useState("maria.garcia@example.com");
  const [phone, setPhone] = useState("+34 612 345 678");

  // Estados de carga y respuesta
  const [isLoading, setIsLoading] = useState(false);
  const [valuation, setValuation] = useState<ValuationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = async () => {
    // Si estamos en el paso 4, llamar a la API antes de pasar al paso 5
    if (step === 4) {
      setIsLoading(true);
      setError(null);

      try {
        // Crear FormData para enviar las fotos y datos
        const formData = new FormData();
        formData.append("address", address);
        formData.append("squareMeters", squareMeters);
        formData.append("bedrooms", bedrooms);
        formData.append("bathrooms", bathrooms);
        formData.append("propertyType", propertyType);
        formData.append("buildingAge", buildingAge);
        formData.append("floor", floor);
        formData.append("hasElevator", hasElevator);
        formData.append("hasGarage", hasGarage);
        formData.append("hasTerrace", hasTerrace);
        formData.append("condition", condition);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);

        // Agregar las fotos al FormData
        photos.forEach((photo, index) => {
          formData.append(`photo_${index}`, photo.file);
        });

        // Llamar a la API
        const response = await fetch("/api/valuation", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || "Error al procesar la tasación");
        }

        if (data.success && data.valuation) {
          setValuation(data.valuation);
          setStep(step + 1);
        } else {
          throw new Error(data.error || "Error desconocido");
        }
      } catch (err) {
        console.error("Error en la tasación:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al procesar la tasación. Por favor, intenta de nuevo."
        );
      } finally {
        setIsLoading(false);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      router.push("/confirmacion");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          // Redimensionar si es muy grande (max 1920px de ancho)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir a JPEG con calidad 0.8
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const compressedPhotos = await Promise.all(
        Array.from(files).map(async (file) => {
          const compressedFile = await compressImage(file);
          return {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
          };
        })
      );
      setPhotos([...photos, ...compressedPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return address.trim().length > 0;
      case 2:
        return (
          squareMeters.length > 0 &&
          bedrooms.length > 0 &&
          bathrooms.length > 0 &&
          propertyType.length > 0 &&
          buildingAge.length > 0 &&
          floor.length > 0 &&
          hasElevator.length > 0 &&
          hasGarage.length > 0 &&
          hasTerrace.length > 0 &&
          condition.length > 0
        );
      case 3:
        return true; // Photos are optional
      case 4:
        return name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen m-0 p-0 rounded-none flex flex-col">
        {/* Header with Progress */}
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Valoración de tu propiedad</DialogTitle>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2",
                  i < totalSteps - 1 && "after:content-[''] after:w-8 after:h-0.5 after:bg-border"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    i + 1 < step
                      ? "bg-primary text-primary-foreground"
                      : i + 1 === step
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1 < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Message */}
        <div className="px-6 py-4 bg-accent/10 border-b">
          <p className="text-center text-lg font-medium">
            {agentMessages[step - 1]}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-2xl font-bold">¿Dónde está tu propiedad?</h3>
                  <p className="text-muted-foreground">Cuéntanos la dirección completa</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección completa</Label>
                  <Input
                    id="address"
                    placeholder="Calle, número, piso, ciudad..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-lg p-6"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold">Detalles de tu propiedad</h3>
                  <p className="text-muted-foreground">Cuéntanos más sobre tu inmueble</p>
                </div>

                {/* Metros cuadrados */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">📐 Metros cuadrados (aprox.)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["50", "70", "85", "95", "110", "Otro"].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          if (size === "Otro") {
                            setShowCustomSquareMeters(true);
                            setSquareMeters("");
                          } else {
                            setShowCustomSquareMeters(false);
                            setSquareMeters(size);
                          }
                        }}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-semibold",
                          (size === "Otro" ? showCustomSquareMeters : squareMeters === size)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {size === "Otro" ? size : `${size}m²`}
                      </button>
                    ))}
                  </div>
                  {showCustomSquareMeters && (
                    <Input
                      type="number"
                      placeholder="Introduce los m² exactos"
                      value={squareMeters}
                      onChange={(e) => setSquareMeters(e.target.value)}
                      className="text-lg p-6 mt-3"
                      autoFocus
                    />
                  )}
                </div>

                {/* Habitaciones */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🛏️ Habitaciones</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {["1", "2", "3", "4", "5", "5+"].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBedrooms(num === "5+" ? "6" : num)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-semibold",
                          bedrooms === (num === "5+" ? "6" : num)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baños */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🚿 Baños</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {["1", "2", "3", "3+"].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBathrooms(num === "3+" ? "4" : num)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-semibold",
                          bathrooms === (num === "3+" ? "4" : num)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de propiedad */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🏠 Tipo de vivienda</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "piso", label: "Piso", icon: "🏢" },
                      { value: "casa", label: "Casa", icon: "🏡" },
                      { value: "atico", label: "Ático", icon: "🏙️" },
                      { value: "duplex", label: "Dúplex", icon: "🏘️" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPropertyType(type.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          propertyType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-semibold">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Antigüedad */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">📅 Antigüedad del edificio</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "nuevo", label: "Obra nueva" },
                      { value: "<10", label: "< 10 años" },
                      { value: "10-30", label: "10-30 años" },
                      { value: ">30", label: "> 30 años" },
                    ].map((age) => (
                      <button
                        key={age.value}
                        onClick={() => setBuildingAge(age.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-medium",
                          buildingAge === age.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {age.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Planta */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🔢 Planta</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "bajo", label: "Bajo" },
                      { value: "1-3", label: "1º-3º" },
                      { value: "4-6", label: "4º-6º" },
                      { value: "7+", label: "7º+" },
                      { value: "atico-planta", label: "Ático" },
                    ].map((fl) => (
                      <button
                        key={fl.value}
                        onClick={() => setFloor(fl.value)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all font-medium text-sm",
                          floor === fl.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {fl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ascensor */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🛗 ¿Tiene ascensor?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "si", label: "✅ Sí", icon: "🛗" },
                      { value: "no", label: "❌ No", icon: "🚫" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setHasElevator(opt.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-medium",
                          hasElevator === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garaje */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🚗 ¿Incluye garaje?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "si", label: "✅ Sí" },
                      { value: "no", label: "❌ No" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setHasGarage(opt.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-medium",
                          hasGarage === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terraza/Balcón */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">🌿 Exterior</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "no", label: "No tiene" },
                      { value: "balcon", label: "Balcón" },
                      { value: "terraza", label: "Terraza" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setHasTerrace(opt.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all font-medium",
                          hasTerrace === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estado de conservación */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">✨ Estado de conservación</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "perfecto", label: "Perfecto", icon: "⭐" },
                      { value: "bueno", label: "Bueno", icon: "👍" },
                      { value: "reformar", label: "A reformar", icon: "🔧" },
                    ].map((cond) => (
                      <button
                        key={cond.value}
                        onClick={() => setCondition(cond.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          condition === cond.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="text-center space-y-1">
                          <div className="text-2xl">{cond.icon}</div>
                          <div className="font-medium text-sm">{cond.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-2xl font-bold">Muéstranos tu propiedad</h3>
                  <p className="text-muted-foreground">Sube fotos o haz una foto ahora</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-background"
                  >
                    <Upload className="w-8 h-8 text-primary" />
                    <span className="font-medium">Subir fotos</span>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </Label>

                  <Label
                    htmlFor="camera-upload"
                    className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-background"
                  >
                    <Camera className="w-8 h-8 text-primary" />
                    <span className="font-medium">Hacer foto</span>
                    <Input
                      id="camera-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </Label>
                </div>

                {photos.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Fotos subidas ({photos.length})</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.preview}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          📸 Fotos opcionales (recomendadas)
                        </h4>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Puedes continuar sin fotos, pero ten en cuenta:
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                          <li>• La valoración será <strong>menos precisa</strong></li>
                          <li>• No podremos analizar el estado visual del inmueble</li>
                          <li>• No se podrán proporcionar <strong>mejoras recomendadas</strong></li>
                          <li>• El score global tendrá menor confiabilidad</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                {!isLoading && (
                  <>
                    <div className="text-center space-y-2 mb-8">
                      <h3 className="text-2xl font-bold">Datos de contacto</h3>
                      <p className="text-muted-foreground">Para enviarte tu valoración personalizada</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-lg p-6"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-lg p-6"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+34 600 000 000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="text-lg p-6"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                {isLoading && (
                    <div className="relative p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse"></div>
                      </div>

                      <div className="relative z-10 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                          <div className="inline-block relative">
                            {/* Scanning circle animation */}
                            <div className="w-20 h-20 mx-auto mb-4 relative">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin"></div>
                              <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              {/* Pulse rings */}
                              <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
                              <div className="absolute inset-0 rounded-full bg-purple-500 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Analizando tu propiedad
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Nuestro sistema de IA está procesando las fotos y datos...
                          </p>
                        </div>

                        {/* Analysis steps */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Analizando fotos</p>
                              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-progress"></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur" style={{ animationDelay: '0.3s' }}>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Calculando valoración</p>
                              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 animate-progress" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur" style={{ animationDelay: '0.6s' }}>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Generando recomendaciones</p>
                              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-pink-500 to-pink-600 animate-progress" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur" style={{ animationDelay: '0.9s' }}>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Calculando ROI de mejoras</p>
                              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 animate-progress" style={{ animationDelay: '0.6s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer message */}
                        <div className="text-center pt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                            ⚡ Esto puede tomar entre 5-15 segundos...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </div>
            )}

            {step === 5 && valuation && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-3xl font-bold">¡Tu informe está listo!</h3>
                  <p className="text-muted-foreground">
                    Análisis realizado por inteligencia artificial
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Valoración principal - Comparación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Valoración actual */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">Valoración Actual</p>
                        <p className="text-3xl md:text-4xl font-bold text-primary">
                          {valuation.valoracion_media.toLocaleString()}€
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Estado actual del inmueble
                        </p>
                      </div>
                    </div>

                    {/* Valoración con mejoras */}
                    {valuation.mejoras_con_roi && valuation.mejoras_con_roi.length > 0 && (
                      <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-2 border-green-300 dark:border-green-700">
                        <div className="text-center space-y-2">
                          <p className="text-sm text-green-700 dark:text-green-300 font-medium">Con Mejoras Recomendadas</p>
                          <p className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-300">
                            {(valuation.valoracion_media +
                              valuation.mejoras_con_roi.reduce((sum, mejora) => sum + mejora.incremento_valor, 0)
                            ).toLocaleString()}€
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            +{valuation.mejoras_con_roi.reduce((sum, mejora) => sum + mejora.incremento_valor, 0).toLocaleString()}€ de potencial
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score Global - Comparación de Velocímetros */}
                  {valuation.score_global && (
                    <div className="p-8 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                      <h4 className="font-bold text-xl mb-6 text-center text-slate-900 dark:text-slate-100">
                        🎯 Comparación de Score
                      </h4>

                      {/* Dos velocímetros lado a lado */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Velocímetro Actual */}
                        <div className="relative w-full">
                          <h5 className="font-semibold text-center text-slate-700 dark:text-slate-300 mb-4">
                            Estado Actual
                          </h5>
                        {/* SVG Gauge - Semicírculo perfecto */}
                        <svg viewBox="0 0 200 110" className="w-full" style={{ overflow: 'visible' }}>
                          {/* Arco de fondo (gris claro) */}
                          <path
                            d="M 30 100 A 70 70 0 0 1 170 100"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="18"
                            strokeLinecap="round"
                          />

                          {/* Rojo 0-25 */}
                          <path
                            d="M 30 100 A 70 70 0 0 1 50.5 50.5"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="18"
                            strokeLinecap="round"
                          />

                          {/* Naranja 25-50 */}
                          <path
                            d="M 50.5 50.5 A 70 70 0 0 1 100 30"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="18"
                            strokeLinecap="round"
                          />

                          {/* Verde claro 50-75 */}
                          <path
                            d="M 100 30 A 70 70 0 0 1 149.5 50.5"
                            fill="none"
                            stroke="#84cc16"
                            strokeWidth="18"
                            strokeLinecap="round"
                          />

                          {/* Verde fuerte 75-100 */}
                          <path
                            d="M 149.5 50.5 A 70 70 0 0 1 170 100"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="18"
                            strokeLinecap="round"
                          />

                          {/* Marcas en el arco */}
                          {[0, 25, 50, 75, 100].map((mark) => {
                            const angle = (mark / 100) * Math.PI; // 0 a PI (180 grados)
                            const x1 = 100 + 70 * Math.cos(Math.PI - angle);
                            const y1 = 100 - 70 * Math.sin(Math.PI - angle);
                            const x2 = 100 + 60 * Math.cos(Math.PI - angle);
                            const y2 = 100 - 60 * Math.sin(Math.PI - angle);
                            return (
                              <line
                                key={mark}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#94a3b8"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            );
                          })}

                          {/* Aguja indicadora */}
                          {(() => {
                            const score = valuation.score_global.puntuacion_total;
                            const angle = (score / 100) * Math.PI; // Convertir score a ángulo en radianes (0 a PI)
                            const needleLength = 60;
                            const x = 100 + needleLength * Math.cos(Math.PI - angle);
                            const y = 100 - needleLength * Math.sin(Math.PI - angle);

                            return (
                              <>
                                {/* Sombra de la aguja */}
                                <line
                                  x1="100"
                                  y1="100"
                                  x2={x + 2}
                                  y2={y + 2}
                                  stroke="rgba(0,0,0,0.2)"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                />
                                {/* Aguja principal */}
                                <line
                                  x1="100"
                                  y1="100"
                                  x2={x}
                                  y2={y}
                                  stroke="#1f2937"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                />
                              </>
                            );
                          })()}

                          {/* Centro de la aguja */}
                          <circle cx="100" cy="100" r="6" fill="#1f2937" />
                          <circle cx="100" cy="100" r="3" fill="#94a3b8" />

                          {/* Puntuación central */}
                          <text
                            x="100"
                            y="90"
                            textAnchor="middle"
                            fontSize="32"
                            fontWeight="bold"
                            fill={
                              valuation.score_global.puntuacion_total >= 75 ? "#22c55e" :
                              valuation.score_global.puntuacion_total >= 50 ? "#84cc16" :
                              valuation.score_global.puntuacion_total >= 25 ? "#f97316" :
                              "#ef4444"
                            }
                          >
                            {valuation.score_global.puntuacion_total}
                          </text>
                          <text x="100" y="100" textAnchor="middle" fontSize="10" fill="#64748b">
                            / 100
                          </text>
                        </svg>

                          {/* Etiquetas debajo del semicírculo */}
                          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 px-4">
                            <span>0</span>
                            <span className="text-red-500">25</span>
                            <span className="text-orange-500">50</span>
                            <span className="text-lime-500">75</span>
                            <span className="text-green-500">100</span>
                          </div>

                          {/* Categoría */}
                          <div className="text-center mt-4">
                            <div
                              className={cn(
                                "inline-block px-4 py-2 rounded-full text-sm font-bold",
                                valuation.score_global.puntuacion_total >= 75
                                  ? "bg-green-100 text-green-800 border-2 border-green-600"
                                  : valuation.score_global.puntuacion_total >= 50
                                  ? "bg-lime-100 text-lime-800 border-2 border-lime-600"
                                  : valuation.score_global.puntuacion_total >= 25
                                  ? "bg-orange-100 text-orange-800 border-2 border-orange-600"
                                  : "bg-red-100 text-red-800 border-2 border-red-600"
                              )}
                            >
                              {valuation.score_global.categoria}
                            </div>
                          </div>
                        </div>

                        {/* Velocímetro Con Mejoras */}
                        {valuation.mejoras_con_roi && valuation.mejoras_con_roi.length > 0 && (() => {
                          // Calcular score mejorado (estimación: +15-25 puntos con mejoras)
                          const inversionTotal = valuation.mejoras_con_roi.reduce((sum, m) => sum + m.inversion_estimada, 0);
                          const incrementoValor = valuation.mejoras_con_roi.reduce((sum, m) => sum + m.incremento_valor, 0);
                          const roiPromedio = (incrementoValor / inversionTotal) * 100;
                          const scoreBoost = Math.min(25, Math.floor(roiPromedio / 20)); // Máximo +25 puntos
                          const improvedScore = Math.min(100, valuation.score_global.puntuacion_total + scoreBoost);

                          return (
                            <div className="relative w-full">
                              <h5 className="font-semibold text-center text-green-700 dark:text-green-300 mb-4">
                                Con Mejoras
                              </h5>
                              {/* SVG Gauge - Semicírculo perfecto */}
                              <svg viewBox="0 0 200 110" className="w-full" style={{ overflow: 'visible' }}>
                                {/* Arco de fondo (gris claro) */}
                                <path
                                  d="M 30 100 A 70 70 0 0 1 170 100"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="18"
                                  strokeLinecap="round"
                                />

                                {/* Rojo 0-25 */}
                                <path
                                  d="M 30 100 A 70 70 0 0 1 50.5 50.5"
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="18"
                                  strokeLinecap="round"
                                />

                                {/* Naranja 25-50 */}
                                <path
                                  d="M 50.5 50.5 A 70 70 0 0 1 100 30"
                                  fill="none"
                                  stroke="#f97316"
                                  strokeWidth="18"
                                  strokeLinecap="round"
                                />

                                {/* Verde claro 50-75 */}
                                <path
                                  d="M 100 30 A 70 70 0 0 1 149.5 50.5"
                                  fill="none"
                                  stroke="#84cc16"
                                  strokeWidth="18"
                                  strokeLinecap="round"
                                />

                                {/* Verde fuerte 75-100 */}
                                <path
                                  d="M 149.5 50.5 A 70 70 0 0 1 170 100"
                                  fill="none"
                                  stroke="#22c55e"
                                  strokeWidth="18"
                                  strokeLinecap="round"
                                />

                                {/* Marcas en el arco */}
                                {[0, 25, 50, 75, 100].map((mark) => {
                                  const angle = (mark / 100) * Math.PI;
                                  const x1 = 100 + 70 * Math.cos(Math.PI - angle);
                                  const y1 = 100 - 70 * Math.sin(Math.PI - angle);
                                  const x2 = 100 + 60 * Math.cos(Math.PI - angle);
                                  const y2 = 100 - 60 * Math.sin(Math.PI - angle);
                                  return (
                                    <line
                                      key={mark}
                                      x1={x1}
                                      y1={y1}
                                      x2={x2}
                                      y2={y2}
                                      stroke="#94a3b8"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  );
                                })}

                                {/* Aguja indicadora */}
                                {(() => {
                                  const angle = (improvedScore / 100) * Math.PI;
                                  const needleLength = 60;
                                  const x = 100 + needleLength * Math.cos(Math.PI - angle);
                                  const y = 100 - needleLength * Math.sin(Math.PI - angle);

                                  return (
                                    <>
                                      <line
                                        x1="100"
                                        y1="100"
                                        x2={x + 2}
                                        y2={y + 2}
                                        stroke="rgba(0,0,0,0.2)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                      />
                                      <line
                                        x1="100"
                                        y1="100"
                                        x2={x}
                                        y2={y}
                                        stroke="#15803d"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                      />
                                    </>
                                  );
                                })()}

                                {/* Centro de la aguja */}
                                <circle cx="100" cy="100" r="6" fill="#15803d" />
                                <circle cx="100" cy="100" r="3" fill="#86efac" />

                                {/* Puntuación central */}
                                <text
                                  x="100"
                                  y="90"
                                  textAnchor="middle"
                                  fontSize="32"
                                  fontWeight="bold"
                                  fill={
                                    improvedScore >= 75 ? "#22c55e" :
                                    improvedScore >= 50 ? "#84cc16" :
                                    improvedScore >= 25 ? "#f97316" :
                                    "#ef4444"
                                  }
                                >
                                  {improvedScore}
                                </text>
                                <text x="100" y="100" textAnchor="middle" fontSize="10" fill="#64748b">
                                  / 100
                                </text>
                              </svg>

                              {/* Etiquetas */}
                              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 px-4">
                                <span>0</span>
                                <span className="text-red-500">25</span>
                                <span className="text-orange-500">50</span>
                                <span className="text-lime-500">75</span>
                                <span className="text-green-500">100</span>
                              </div>

                              {/* Mejora */}
                              <div className="text-center mt-4">
                                <div className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border-2 border-green-600">
                                  +{scoreBoost} puntos
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Resumen de inversión */}
                      {valuation.mejoras_con_roi && valuation.mejoras_con_roi.length > 0 && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Inversión Total</p>
                              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {valuation.mejoras_con_roi.reduce((sum, m) => sum + m.inversion_estimada, 0).toLocaleString()}€
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Incremento de Valor</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                +{valuation.mejoras_con_roi.reduce((sum, m) => sum + m.incremento_valor, 0).toLocaleString()}€
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">ROI Estimado</p>
                              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {Math.round((valuation.mejoras_con_roi.reduce((sum, m) => sum + m.incremento_valor, 0) /
                                valuation.mejoras_con_roi.reduce((sum, m) => sum + m.inversion_estimada, 0)) * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Desglose simplificado de puntuaciones */}
                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Estado físico</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {valuation.score_global.desglose.estado_fisico}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${valuation.score_global.desglose.estado_fisico}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500">30% del total</span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Presentación</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {valuation.score_global.desglose.presentacion}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${valuation.score_global.desglose.presentacion}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500">25% del total</span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Características</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {valuation.score_global.desglose.caracteristicas}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-amber-600 h-2 rounded-full transition-all"
                              style={{ width: `${valuation.score_global.desglose.caracteristicas}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500">25% del total</span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Ubicación</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {valuation.score_global.desglose.ubicacion}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${valuation.score_global.desglose.ubicacion}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500">20% del total</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Análisis detallado de fotos */}
                  {valuation.analisis_fotos && valuation.analisis_fotos.length > 0 && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        📸 Análisis Detallado de las Fotos
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-6">
                        La inteligencia artificial ha analizado cada foto individualmente. Aquí está lo que pudo ver:
                      </p>

                      <div className="space-y-4">
                        {valuation.analisis_fotos.map((fotoAnalisis, index) => (
                          <div
                            key={index}
                            className="p-5 rounded-lg bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 shadow-sm"
                          >
                            {/* Header de la foto */}
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-blue-100 dark:border-blue-900">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                {fotoAnalisis.foto_numero}
                              </div>
                              <div>
                                <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                                  {fotoAnalisis.estancia}
                                </h5>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  Foto #{fotoAnalisis.foto_numero}
                                </p>
                              </div>
                            </div>

                            {/* Descripción detallada */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                  🔍 Lo que se ve:
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {fotoAnalisis.descripcion_detallada}
                                </p>
                              </div>

                              {/* Elementos apreciados */}
                              <div>
                                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                                  ✅ Elementos identificados:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {fotoAnalisis.elementos_apreciados.map((elemento, i) => (
                                    <span
                                      key={i}
                                      className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                    >
                                      {elemento}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Estado de elementos */}
                              <div>
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                  📊 Estado observado:
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {fotoAnalisis.estado_elementos}
                                </p>
                              </div>

                              {/* Elementos NO apreciados */}
                              {fotoAnalisis.elementos_no_apreciados.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">
                                    ⚠️ No se pudo verificar:
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {fotoAnalisis.elementos_no_apreciados.map((elemento, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                                      >
                                        {elemento}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Valoración particular */}
                              <div className="pt-2 border-t border-blue-100 dark:border-blue-900">
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                  💭 Impresión:
                                </p>
                                <p className="text-sm italic text-gray-600 dark:text-gray-400">
                                  "{fotoAnalisis.valoracion_particular}"
                                </p>
                              </div>

                              {/* Tabla de puntuaciones */}
                              {fotoAnalisis.puntuaciones && (
                                <div className="pt-3 border-t border-blue-100 dark:border-blue-900">
                                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                    📊 Puntuaciones detalladas (escala 1-10):
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(fotoAnalisis.puntuaciones).map(([key, value]) => {
                                      const labels: Record<string, string> = {
                                        limpieza: "Limpieza",
                                        luminosidad: "Luminosidad",
                                        estado_conservacion: "Conservación",
                                        calidad_acabados: "Acabados",
                                        distribucion: "Distribución",
                                        modernidad: "Modernidad",
                                        atractivo_visual: "Atractivo"
                                      };
                                      const score = value as number;
                                      const color = score >= 8 ? "text-green-700 dark:text-green-400" :
                                                   score >= 6 ? "text-blue-700 dark:text-blue-400" :
                                                   score >= 4 ? "text-orange-700 dark:text-orange-400" :
                                                   "text-red-700 dark:text-red-400";
                                      return (
                                        <div key={key} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                                          <span className="text-gray-600 dark:text-gray-400">{labels[key]}</span>
                                          <span className={cn("font-bold", color)}>{score}/10</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Análisis general */}
                  <div className="p-6 rounded-xl bg-card border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      📋 Estado general
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {valuation.analisis.estado_general}
                    </p>
                  </div>

                  {/* Ubicación */}
                  {valuation.analisis.ubicacion_valoracion && (
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        📍 Análisis de ubicación
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {valuation.analisis.ubicacion_valoracion}
                      </p>
                    </div>
                  )}

                  {/* Puntos fuertes y débiles */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-3 text-green-700">
                        ✅ Puntos fuertes
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {valuation.analisis.puntos_fuertes.map((punto, i) => (
                          <li key={i}>• {punto}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-3 text-orange-700">
                        ⚠️ Puntos a mejorar
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {valuation.analisis.puntos_debiles.map((punto, i) => (
                          <li key={i}>• {punto}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tiempo de venta */}
                  <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ⚡ Tiempo estimado de venta
                    </h4>
                    <p className="text-2xl font-bold text-accent">
                      {valuation.tiempo_venta_estimado}
                    </p>
                  </div>

                  {/* Análisis de ROI - Mejoras con retorno de inversión */}
                  {valuation.mejoras_con_roi && valuation.mejoras_con_roi.length > 0 && (
                    <div className="p-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800">
                      <h4 className="font-bold text-2xl mb-2 text-emerald-900 dark:text-emerald-100">
                        💰 Plan de Mejoras con Retorno de Inversión
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
                        Basado en el análisis de las fotos, estas mejoras pueden aumentar el valor de tu propiedad significativamente.
                      </p>

                      {/* Resumen ROI */}
                      {valuation.resumen_roi && (
                        <div className="grid md:grid-cols-4 gap-4 mb-6 p-5 bg-white dark:bg-gray-900 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inversión Total</p>
                            <p className="text-2xl font-bold text-red-600">
                              {valuation.resumen_roi.inversion_total_recomendada.toLocaleString()}€
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Incremento de Valor</p>
                            <p className="text-2xl font-bold text-green-600">
                              +{valuation.resumen_roi.incremento_valor_total.toLocaleString()}€
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ROI Total</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {valuation.resumen_roi.roi_total_porcentaje}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reducción Tiempo Venta</p>
                            <p className="text-lg font-bold text-purple-600">
                              {valuation.resumen_roi.reduccion_tiempo_venta_estimada}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Precio con mejoras */}
                      {valuation.valoracion_con_mejoras && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300 dark:border-green-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-800 dark:text-green-300">Valoración actual</p>
                              <p className="text-xl font-bold text-green-900 dark:text-green-100">
                                {valuation.valoracion_media.toLocaleString()}€
                              </p>
                            </div>
                            <div className="text-3xl">→</div>
                            <div className="text-right">
                              <p className="text-sm text-green-800 dark:text-green-300">Con mejoras aplicadas</p>
                              <p className="text-2xl font-bold text-green-600">
                                {valuation.valoracion_con_mejoras.toLocaleString()}€
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tabla de mejoras */}
                      <div className="space-y-4">
                        {valuation.mejoras_con_roi.map((mejora, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-5 rounded-lg border-2 bg-white dark:bg-gray-900",
                              mejora.categoria === "Esencial"
                                ? "border-red-300 dark:border-red-700"
                                : mejora.categoria === "Recomendada"
                                ? "border-amber-300 dark:border-amber-700"
                                : "border-blue-300 dark:border-blue-700"
                            )}
                          >
                            {/* Header de la mejora */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={cn(
                                      "text-xs font-bold px-3 py-1 rounded-full",
                                      mejora.categoria === "Esencial"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                        : mejora.categoria === "Recomendada"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                    )}
                                  >
                                    {mejora.categoria}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-xs font-semibold px-2 py-1 rounded",
                                      mejora.impacto_velocidad_venta === "Alto"
                                        ? "bg-green-100 text-green-800"
                                        : mejora.impacto_velocidad_venta === "Medio"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    )}
                                  >
                                    Impacto: {mejora.impacto_velocidad_venta}
                                  </span>
                                </div>
                                <h5 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                                  {mejora.mejora}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {mejora.razon}
                                </p>
                              </div>
                            </div>

                            {/* Métricas de la mejora */}
                            <div className="grid grid-cols-4 gap-3">
                              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inversión</p>
                                <p className="text-lg font-bold text-red-600">
                                  {mejora.inversion_estimada.toLocaleString()}€
                                </p>
                              </div>
                              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Incremento</p>
                                <p className="text-lg font-bold text-green-600">
                                  +{mejora.incremento_valor.toLocaleString()}€
                                </p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ROI</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {mejora.roi_porcentaje}%
                                </p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tiempo</p>
                                <p className="text-xs font-semibold text-purple-600">
                                  {mejora.tiempo_implementacion}
                                </p>
                              </div>
                            </div>

                            {/* Cálculo visual del beneficio */}
                            <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/30 rounded border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Beneficio neto:</p>
                              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                                +{(mejora.incremento_valor - mejora.inversion_estimada).toLocaleString()}€
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Por cada euro invertido, ganas{" "}
                                <span className="font-bold text-green-600">
                                  {(mejora.incremento_valor / mejora.inversion_estimada).toFixed(2)}€
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Nota final */}
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>💡 Consejo profesional:</strong> Implementar las mejoras "Esenciales" y "Recomendadas" puede reducir significativamente el tiempo en el mercado y aumentar las ofertas recibidas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recomendaciones */}
                  <div className="p-6 rounded-xl bg-card border">
                    <h4 className="font-semibold mb-3">💡 Recomendaciones</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {valuation.recomendaciones.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Mejoras sugeridas */}
                  {valuation.mejoras_sugeridas && valuation.mejoras_sugeridas.length > 0 && (
                    <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold mb-3">🔧 Mejoras sugeridas</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {valuation.mejoras_sugeridas.map((mejora, i) => (
                          <li key={i}>• {mejora}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Próximos pasos */}
                  <div className="p-6 rounded-xl bg-gradient-primary text-primary-foreground">
                    <h4 className="font-semibold mb-3">📞 Próximos pasos</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Un agente se pondrá en contacto en menos de 24h</li>
                      <li>• Recibirás este informe detallado por email</li>
                      <li>• Podemos hacer una visita para afinar la valoración</li>
                      <li>• Si decides vender, te acompañamos en todo el proceso</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="p-6 border-t flex items-center justify-between bg-background">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            variant="cta"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizando...
              </>
            ) : step === totalSteps ? (
              <>
                Ver confirmación
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
