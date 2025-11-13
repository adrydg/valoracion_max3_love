import { Zap, Shield, TrendingUp, Clock, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Venta rápida garantizada",
    description: "Vendemos tu propiedad en un tiempo récord con nuestra tecnología avanzada",
  },
  {
    icon: TrendingUp,
    title: "Máximo precio de mercado",
    description: "Optimizamos el precio para conseguir la mejor oferta posible",
  },
  {
    icon: Shield,
    title: "Proceso 100% seguro",
    description: "Transacciones protegidas y proceso legal totalmente gestionado",
  },
  {
    icon: Clock,
    title: "Disponibilidad 24/7",
    description: "Soporte y seguimiento continuo durante todo el proceso",
  },
  {
    icon: Users,
    title: "Red de compradores exclusiva",
    description: "Acceso a miles de compradores verificados en nuestra plataforma",
  },
  {
    icon: Award,
    title: "Expertos certificados",
    description: "Equipo de profesionales con más de 15 años de experiencia",
  },
];

export const Benefits = () => {
  return (
    <section className="py-12 md:py-16 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">
            ¿Por qué elegirnos para vender tu propiedad?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combinamos tecnología de vanguardia con experiencia humana para ofrecerte el mejor servicio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-hover transition-all duration-300 hover:scale-[1.02] border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-transparent border-2 border-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
