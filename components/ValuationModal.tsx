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

interface ValuationResponse {
  valoracion_minima: number;
  valoracion_maxima: number;
  valoracion_media: number;
  confianza: "alta" | "media" | "baja";
  analisis: {
    estado_general: string;
    puntos_fuertes: string[];
    puntos_debiles: string[];
    ubicacion_valoracion: string;
  };
  recomendaciones: string[];
  tiempo_venta_estimado: string;
  mejoras_sugeridas: string[];
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
        return photos.length > 0;
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
                  <Label className="text-base font-semibold">📐 Metros cuadrados</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 85"
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(e.target.value)}
                    className="text-lg p-6"
                  />
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

                {photos.length > 0 && (
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
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
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

                  {isLoading && (
                    <div className="flex items-center justify-center gap-3 p-6 rounded-xl bg-accent/10 border border-accent/20">
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      <p className="text-sm font-medium">
                        Analizando tu propiedad con inteligencia artificial...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                </div>
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
                  {/* Valoración principal */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Valoración estimada</p>
                      <p className="text-4xl md:text-5xl font-bold text-primary">
                        {valuation.valoracion_minima.toLocaleString()}€ -{" "}
                        {valuation.valoracion_maxima.toLocaleString()}€
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Valor medio: {valuation.valoracion_media.toLocaleString()}€
                      </p>
                      <div className="mt-3">
                        <span
                          className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-medium",
                            valuation.confianza === "alta"
                              ? "bg-green-500/10 text-green-700 border border-green-500/20"
                              : valuation.confianza === "media"
                              ? "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"
                              : "bg-orange-500/10 text-orange-700 border border-orange-500/20"
                          )}
                        >
                          Confianza: {valuation.confianza}
                        </span>
                      </div>
                    </div>
                  </div>

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
                  {valuation.mejoras_sugeridas.length > 0 && (
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
