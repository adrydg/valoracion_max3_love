"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function Confirmation() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="flex-1 flex items-center justify-center py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="max-w-2xl w-full animate-fade-in">
          <div className="text-center space-y-8">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                ¡Solicitud recibida con éxito! 🎉
              </h1>
              <p className="text-xl text-muted-foreground">
                Gracias por confiar en nosotros para la valoración de tu propiedad
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-card border rounded-2xl p-8 space-y-6 text-left">
              <h2 className="text-2xl font-bold text-center">¿Qué ocurre ahora?</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Confirmaremos tu solicitud por email</h3>
                    <p className="text-sm text-muted-foreground">
                      En los próximos minutos recibirás un email de confirmación con todos los detalles
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Un agente te contactará en 24h</h3>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo de expertos revisará tu solicitud y te llamará para afinar la valoración
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Informe detallado personalizado</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibirás un análisis completo del valor de tu propiedad con recomendaciones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-6 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-2">¿Necesitas ayuda inmediata?</p>
              <p className="font-semibold">Llámanos al: <span className="text-primary">900 123 456</span></p>
            </div>

            {/* CTA Button */}
            <Link href="/">
              <Button
                variant="cta"
                size="xl"
                className="w-full sm:w-auto"
              >
                <Home className="w-5 h-5" />
                Volver al inicio
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground">
              Referencia de solicitud: <span className="font-mono font-semibold">VAL-{Date.now().toString().slice(-6)}</span>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
