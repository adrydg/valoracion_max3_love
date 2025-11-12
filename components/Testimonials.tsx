import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    location: "Madrid",
    rating: 5,
    text: "Increíble experiencia. Vendí mi piso en menos de dos semanas y obtuve un precio por encima de mis expectativas. El equipo fue muy profesional.",
    property: "Piso en Chamberí",
  },
  {
    name: "Carlos Ruiz",
    location: "Barcelona",
    rating: 5,
    text: "La plataforma es muy intuitiva y el seguimiento fue excelente. Me mantuvieron informado en cada paso. Lo recomiendo totalmente.",
    property: "Casa en Sarrià",
  },
  {
    name: "Ana Martínez",
    location: "Valencia",
    rating: 5,
    text: "Después de intentar vender por mi cuenta durante meses, ellos lo consiguieron en 3 semanas. El servicio de valoración fue muy preciso.",
    property: "Apartamento en Ruzafa",
  },
];

export const Testimonials = () => {
  return (
    <section className="pt-12 pb-20 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">Lo que dicen nuestros clientes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de propietarios han confiado en nosotros para vender sus propiedades
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
