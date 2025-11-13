import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-hero rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-elegant animate-fade-in">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse opacity-50" />
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          {/* Content */}
          <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            ¿Listo para vender tu propiedad?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Obtén una valoración gratuita en 24 horas y descubre cuánto puedes ganar con la venta de tu
            propiedad. Sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="accent" size="xl">
              Valoración gratuita
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" className="bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              <Phone className="w-5 h-5" />
              Llamar ahora
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70 pt-2">
            Más de 5.000 propietarios confían en nosotros cada año
          </p>
          </div>
        </div>
      </div>
    </section>
  );
};
