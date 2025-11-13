"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Upload, Camera, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ValuationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const agentMessages = [
  "¡Hola! 👋 Soy tu agente virtual. Vamos a tasar tu propiedad de forma rápida y divertida. ¡Empecemos!",
  "¡Genial! 📏 Ahora cuéntame, ¿qué tamaño tiene tu tesoro? No te preocupes, no juzgo si es pequeñito.",
  "¡Fotos! 📸 Es hora de presumir de tu casa. Sube las mejores fotos, pero si hay calcetines en el suelo, no pasa nada.",
  "📋 Casi terminamos. Necesito tus datos para mandarte el informe. Prometo no vendérselos a nadie... ¡es broma!",
  "🎉 ¡TACHÁAAN! Aquí está tu informe personalizado. ¿Listo para saber cuánto vale tu propiedad?",
];

const sizeOptions = [
  { label: "Menos de 50m²", value: "small" },
  { label: "50-80m²", value: "medium" },
  { label: "80-120m²", value: "large" },
  { label: "Más de 120m²", value: "xlarge" },
];

export const ValuationModal = ({ open, onOpenChange }: ValuationModalProps) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [size, setSize] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      router.push("/confirmacion");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
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
        return size.length > 0;
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
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-2xl font-bold">¿Cuántos metros tiene?</h3>
                  <p className="text-muted-foreground">Selecciona el rango que mejor se ajuste</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.value}
                    onClick={() => setSize(option.value)}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-300 text-center",
                      "hover:border-primary/50 hover:shadow-card",
                      size === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    )}
                    >
                      <span className="text-lg font-semibold">{option.label}</span>
                    </button>
                  ))}
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
                            src={photo}
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
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-3xl font-bold">¡Tu informe está listo!</h3>
                  <p className="text-muted-foreground">Estos son los resultados preliminares</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Valoración estimada</p>
                      <p className="text-4xl md:text-5xl font-bold text-primary">245.000€ - 265.000€</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-2">📍 Ubicación excelente</h4>
                      <p className="text-sm text-muted-foreground">Tu zona tiene alta demanda</p>
                    </div>
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-2">📈 Mercado favorable</h4>
                      <p className="text-sm text-muted-foreground">Precios al alza en tu zona</p>
                    </div>
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-2">⚡ Venta rápida</h4>
                      <p className="text-sm text-muted-foreground">Estimamos 15-20 días</p>
                    </div>
                    <div className="p-6 rounded-xl bg-card border">
                      <h4 className="font-semibold mb-2">✨ Recomendaciones</h4>
                      <p className="text-sm text-muted-foreground">Pequeñas mejoras pueden aumentar el valor</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                    <h4 className="font-semibold mb-3">💡 Próximos pasos recomendados</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Un agente se pondrá en contacto en menos de 24h</li>
                      <li>• Recibirás un informe detallado por email</li>
                      <li>• Podemos hacer una visita para afinar la valoración</li>
                      <li>• Si decides vender, te acompañamos todo el proceso</li>
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
            disabled={step === 1}
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            variant="cta"
            onClick={handleNext}
            disabled={!canProceed()}
            size="lg"
          >
            {step === totalSteps ? "Ver confirmación" : "Siguiente"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
