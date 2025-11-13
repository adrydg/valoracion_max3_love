import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroWizard } from "@/components/HeroWizard";
import { Benefits } from "@/components/Benefits";
import { Process } from "@/components/Process";
import { Testimonials } from "@/components/Testimonials";
import { Stats } from "@/components/Stats";
import { CTASection } from "@/components/CTASection";
import { FAQ } from "@/components/FAQ";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section with Wizard */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Commercial Info */}
            <div className="space-y-4 md:space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Venta en 30 días garantizada</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                ✨ Vende tu propiedad{" "}
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  rápido y seguro
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                La plataforma inmobiliaria más innovadora de España. Combinamos tecnología de vanguardia con
                expertos certificados para venderte tu casa al mejor precio del mercado.
              </p>

              {/* Key Features */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <p className="font-semibold text-sm">100% Seguro</p>
                    <p className="text-xs text-muted-foreground">Proceso legal garantizado</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">
                    💰
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mejor precio</p>
                    <p className="text-xs text-muted-foreground">Maximizamos tu ganancia</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Venta rápida</p>
                    <p className="text-xs text-muted-foreground">En 18 días de media</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Wizard */}
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <HeroWizard />
            </div>

          </div>
        </div>
      </section>

      {/* Stats */}
      <Stats />

      {/* Benefits */}
      <div id="beneficios">
        <Benefits />
      </div>

      {/* Process */}
      <div id="proceso">
        <Process />
      </div>

      {/* Testimonials */}
      <div id="testimonios">
        <Testimonials />
      </div>

      {/* FAQ */}
      <FAQ />

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  );
}
