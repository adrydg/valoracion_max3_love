import { Zap, Shield, TrendingUp, Clock, Users, Award, Database, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Valoración instantánea",
    description: "Conoce el valor de tu propiedad en 2 minutos desde tu móvil",
  },
  {
    icon: TrendingUp,
    title: "Máxima precisión",
    description: "Algoritmo propio que consulta +20 fuentes de datos oficiales",
  },
  {
    icon: Smartphone,
    title: "100% Online y Digital",
    description: "Sin desplazamientos, sin esperas, desde cualquier dispositivo",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Valora tu inmueble cuando quieras, donde quieras",
  },
  {
    icon: Database,
    title: "Datos reales de tu zona",
    description: "Información actualizada de compraventas en tu barrio",
  },
  {
    icon: Award,
    title: "Tecnología avanzada",
    description: "Análisis de fotos con IA para mayor precisión (opcional)",
  },
];

export const Benefits = () => {
  return (
    <section className="py-12 md:py-16 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">
            ¿Por qué confiar en ValoracionMax?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combinamos inteligencia artificial con datos reales de compraventas para ofrecerte la valoración más precisa del mercado
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
