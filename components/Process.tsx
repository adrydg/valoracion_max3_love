import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Valoración instantánea",
    description:
      "Completa nuestro formulario y recibe una valoración preliminar en menos de 24 horas. Nuestro algoritmo analiza el mercado en tiempo real.",
  },
  {
    number: "02",
    title: "Visita personalizada",
    description:
      "Un experto certificado visita tu propiedad para realizar una tasación profesional y fotografías de alta calidad para la publicación.",
  },
  {
    number: "03",
    title: "Venta garantizada",
    description:
      "Publicamos tu propiedad en nuestra red exclusiva y gestionamos todas las visitas. Cobras en tu cuenta en un plazo máximo de 30 días.",
  },
];

export const Process = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">Nuestro proceso de venta</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tres simples pasos que transforman la venta de tu propiedad en una experiencia fluida
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines (hidden on mobile) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/30 -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <Card className="p-8 h-full hover:shadow-hover transition-all duration-300 border-border/50">
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-elegant">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <CheckCircle2 className="absolute -right-2 -bottom-2 w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
