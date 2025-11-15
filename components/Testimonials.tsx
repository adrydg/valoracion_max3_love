import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    location: "Madrid",
    rating: 5,
    text: "Increíble precisión. La valoración online coincidió casi exactamente con la tasación bancaria. Me ahorré tiempo y dinero. 100% recomendable.",
    property: "Piso en Chamberí",
  },
  {
    name: "Carlos Ruiz",
    location: "Barcelona",
    rating: 5,
    text: "Súper fácil de usar desde el móvil. En 2 minutos tenía mi valoración con datos reales de ventas en mi barrio. Totalmente gratis y muy profesional.",
    property: "Casa en Sarrià",
  },
  {
    name: "Ana Martínez",
    location: "Valencia",
    rating: 5,
    text: "Probé la versión avanzada con análisis de fotos y me sorprendió la exactitud. El informe es muy completo con gráficos y tendencias del mercado.",
    property: "Apartamento en Ruzafa",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-12 md:py-16 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">Opiniones de usuarios ValoracionMax</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de propietarios ya conocen el valor real de su inmueble
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-hover transition-all duration-300 border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed italic">"{testimonial.text}"</p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.property}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
