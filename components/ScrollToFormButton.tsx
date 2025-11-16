"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScrollToFormButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón cuando el usuario haya bajado 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToForm = () => {
    // Scroll suave hacia arriba (donde está el formulario)
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToForm}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "w-14 h-14 md:w-16 md:h-16",
        "bg-gradient-to-r from-primary to-accent",
        "hover:from-primary/90 hover:to-accent/90",
        "text-white rounded-full shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:scale-110 hover:shadow-2xl",
        "group",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
      aria-label="Volver al formulario de valoración"
    >
      <div className="relative">
        <Calculator className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
        <ArrowUp className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 animate-bounce" />
      </div>
    </button>
  );
};
