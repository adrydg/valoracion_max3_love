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
            ¿Listo para conocer el valor real de tu inmueble?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Obtén tu valoración profesional GRATIS en solo 2 minutos. Análisis de +20 bases de datos oficiales y compraventas reales de tu zona. Sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="accent" size="xl">
              Valorar GRATIS ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" className="bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              <Phone className="w-5 h-5" />
              663 616 147
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/70 pt-2">
            Más de 45.000 valoraciones realizadas con éxito
          </p>
          </div>
        </div>
      </div>
    </section>
  );
};
