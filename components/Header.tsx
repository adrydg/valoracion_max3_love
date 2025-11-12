"use client";

import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-card">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              PropTech
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-sm font-medium hover:text-primary transition-colors">
              Beneficios
            </a>
            <a href="#proceso" className="text-sm font-medium hover:text-primary transition-colors">
              Proceso
            </a>
            <a href="#testimonios" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonios
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
            <Button variant="premium" size="sm">
              Contacto
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-2 pt-4">
            <a
              href="#beneficios"
              className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
            >
              Beneficios
            </a>
            <a
              href="#proceso"
              className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
            >
              Proceso
            </a>
            <a
              href="#testimonios"
              className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
            >
              Testimonios
            </a>
            <div className="flex flex-col gap-2 mt-2 px-4">
              <Button variant="ghost" size="sm" className="w-full">
                Iniciar sesión
              </Button>
              <Button variant="premium" size="sm" className="w-full">
                Contacto
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
