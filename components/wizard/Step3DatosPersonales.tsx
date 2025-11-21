"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, User, Loader2, Info } from "lucide-react";
import { nanoid } from "nanoid";

export const Step3DatosPersonales = () => {
  const {
    name,
    email,
    phone,
    additionalComments,
    consentMarketing,
    consentDataProcessing,
    setName,
    setEmail,
    setPhone,
    setAdditionalComments,
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
    landSize,
    bathrooms,
    floor,
    hasElevator,
    buildingAge,
    directOfferInterest,
    agencyStatus,
    setLeadId,
  } = useWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PRECARGA DE DATOS PARA TESTING - DESACTIVADA
  // useEffect(() => {
  //   if (!name) setName("Juan Pérez");
  //   if (!email) setEmail("juan@ejemplo.com");
  //   if (!phone) setPhone("612345678");
  //   if (!consentDataProcessing) setConsentDataProcessing(true);
  // }, []);

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

      // Enviar email con formulario corto
      try {
        console.log("📧 Enviando email con formulario corto...");
        const emailResponse = await fetch("/api/lead/send-progress-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formType: "short",
            leadId: fakeLeadId,
            name,
            email,
            phone,
            additionalComments,
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
            directOfferInterest,
            agencyStatus,
          }),
        });

        if (emailResponse.ok) {
          console.log("✅ Email enviado correctamente");
        } else {
          console.warn("⚠️ Error al enviar email (continuando de todos modos)");
        }
      } catch (emailError) {
        console.error("❌ Error enviando email:", emailError);
        // No bloqueamos el flujo si falla el email
      }

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

        {/* Comentarios adicionales */}
        <div className="space-y-2">
          <Label htmlFor="additionalComments">
            Comentarios adicionales
          </Label>
          <Textarea
            id="additionalComments"
            placeholder="Cuéntanos algo más sobre tu propiedad..."
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Política de privacidad */}
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
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="text-primary underline hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                    política de privacidad
                    <Info className="w-3 h-3" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Política de Privacidad</DialogTitle>
                    <DialogDescription className="text-base">
                      Información sobre el uso de tus datos personales
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <section>
                      <h3 className="font-semibold text-base mb-2">1. Responsable del tratamiento</h3>
                      <p className="text-muted-foreground">
                        <strong>ValoracionMax</strong> es el responsable del tratamiento de los datos personales que nos proporciones a través de este formulario.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">2. Finalidad del tratamiento</h3>
                      <p className="text-muted-foreground mb-2">
                        Los datos que nos facilites serán utilizados para:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Ponernos en contacto contigo en relación con la valoración de tu propiedad</li>
                        <li>Proporcionarte información sobre el valor estimado de tu inmueble</li>
                        <li>Ofrecerte nuestros servicios de tasación y asesoramiento inmobiliario</li>
                        <li>Gestionar tu solicitud y responder a tus consultas</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">3. Cesión de datos a terceros</h3>
                      <p className="text-muted-foreground mb-2">
                        Tus datos podrán ser cedidos a <strong>empresas colaboradoras</strong> que nos ayudan a realizar valoraciones más precisas y a ofrecerte servicios de compraventa de inmuebles, siempre con el mismo objetivo de:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Proporcionar una valoración precisa de tu propiedad</li>
                        <li>Ofrecerte opciones de compra o venta</li>
                        <li>Ponerte en contacto con profesionales inmobiliarios cualificados</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        En ningún caso cederemos tus datos a terceros sin tu consentimiento, salvo obligación legal.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">4. Derechos del usuario</h3>
                      <p className="text-muted-foreground mb-2">
                        Puedes ejercer tus derechos de:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
                        <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                        <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                        <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
                        <li><strong>Limitación:</strong> Limitar el tratamiento de tus datos</li>
                        <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        Para ejercer estos derechos, puedes contactarnos a través de nuestros canales de atención al cliente.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">5. Seguridad</h3>
                      <p className="text-muted-foreground">
                        Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales frente a accesos no autorizados, pérdida o alteración.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">6. Conservación de datos</h3>
                      <p className="text-muted-foreground">
                        Conservaremos tus datos personales durante el tiempo necesario para cumplir con las finalidades descritas, o hasta que solicites su supresión.
                      </p>
                    </section>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground italic">
                        Al aceptar esta política, confirmas que has leído y comprendes cómo trataremos tus datos personales.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>{" "}
              <span className="text-destructive">*</span>
            </label>
          </div>
          {errors.consentDataProcessing && (
            <p className="text-sm text-destructive">{errors.consentDataProcessing}</p>
          )}
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
