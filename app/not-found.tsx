"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold">Página no encontrada</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <Link href="/">
          <Button variant="cta" size="xl" className="gap-2">
            <Home className="w-5 h-5" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
