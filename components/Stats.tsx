"use client";

import { TrendingUp, Home, Clock, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const stats = [
  {
    icon: Home,
    value: 50000,
    suffix: "+",
    label: "Valoraciones realizadas",
  },
  {
    icon: Users,
    value: 45000,
    suffix: "+",
    label: "Propietarios informados",
  },
  {
    icon: Clock,
    value: 2,
    suffix: " minutos",
    label: "Tiempo de valoración",
  },
  {
    icon: TrendingUp,
    value: 95,
    suffix: "%",
    label: "Precisión garantizada",
  },
];

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1000; // 1 segundo
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <p ref={elementRef} className="text-3xl md:text-4xl font-bold text-primary-foreground">
      {count.toLocaleString()}{suffix}
    </p>
  );
};

export const Stats = () => {
  return (
    <section className="py-10 md:py-12 px-4 bg-gradient-primary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="w-8 h-8 mx-auto text-primary-foreground/80" />
                <div className="space-y-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  <p className="text-sm md:text-base text-primary-foreground/90">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
