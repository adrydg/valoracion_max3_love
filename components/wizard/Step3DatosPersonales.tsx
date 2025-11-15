"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, User, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";

export const Step3DatosPersonales = () => {
  const {
    name,
    email,
    phone,
    consentMarketing,
    consentDataProcessing,
    setName,
    setEmail,
    setPhone,
    setConsentMarketing,
    setConsentDataProcessing,
    nextStep,
    prevStep,
    // Datos para enviar al backend
    propertyType,
    bedrooms,
    postalCode,
    street,
    squareMeters,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    setLeadId,
  } = useWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PRECARGA DE DATOS PARA TESTING
  useEffect(() => {
    if (!name) setName("Juan Pérez");
    if (!email) setEmail("juan@ejemplo.com");
    if (!phone) setPhone("612345678");
    if (!consentDataProcessing) setConsentDataProcessing(true);
  }, []);

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!name || name.trim().length < 2) {
      newErrors.name = "Nombre inválido";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Email inválido";
    }

    // Validar teléfono
    const phoneRegex = /^[0-9]{9}$/;
    if (!phone || !phoneRegex.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Teléfono inválido (9 dígitos)";
    }

    // Validar consentimiento obligatorio
    if (!consentDataProcessing) {
      newErrors.consentDataProcessing = "Debes aceptar la política de privacidad";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // MODO TESTING: Generar leadId fake sin llamar API
      const fakeLeadId = nanoid();
      setLeadId(fakeLeadId);

      console.log("📝 Lead creado (testing):", {
        id: fakeLeadId,
        name,
        email,
        phone,
        propertyType,
        bedrooms,
        postalCode,
        squareMeters,
        bathrooms,
        floor,
        hasElevator,
        buildingAge,
      });

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Continuar al loading screen
      nextStep();
    } catch (error) {
      console.error("Error:", error);
      setErrors({ submit: "Error al guardar. Por favor, intenta de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Último paso
        </h2>
        <p className="text-muted-foreground">
          Introduce tus datos de contacto
        </p>
        <p className="text-sm text-primary font-semibold">
          Te enviaremos el informe completo a tu email
        </p>
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            autoCorrect="off"
            spellCheck={false}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            placeholder="juan@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Teléfono <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="612345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            autoCorrect="off"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* Consentimientos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consentDataProcessing"
              checked={consentDataProcessing}
              onCheckedChange={(checked) => setConsentDataProcessing(checked as boolean)}
              className={errors.consentDataProcessing ? "border-destructive" : ""}
            />
            <label
              htmlFor="consentDataProcessing"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto la{" "}
              <a href="/politica-privacidad" target="_blank" className="text-primary underline">
                política de privacidad
              </a>{" "}
              <span className="text-destructive">*</span>
            </label>
          </div>
          {errors.consentDataProcessing && (
            <p className="text-sm text-destructive">{errors.consentDataProcessing}</p>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consentMarketing"
              checked={consentMarketing}
              onCheckedChange={(checked) => setConsentMarketing(checked as boolean)}
            />
            <label
              htmlFor="consentMarketing"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto recibir información comercial sobre servicios inmobiliarios
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={prevStep}
          variant="outline"
          size="lg"
          className="w-[20%]"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleContinue}
          className="w-[80%] group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              Ver valoración
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Tus datos están protegidos y encriptados
      </p>
    </div>
  );
};
