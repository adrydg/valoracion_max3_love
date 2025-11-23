"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExpertConsultButtonProps {
  valoracionCalculada: {
    valoracion_minima: number;
    valoracion_media: number;
    valoracion_maxima: number;
  };
  datosInmueble: any;
}

export function ExpertConsultButton({
  valoracionCalculada,
  datosInmueble,
}: ExpertConsultButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [aceptado, setAceptado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !telefono) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (!aceptado) {
      alert("Debes aceptar que un experto te contacte");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/solicitar-experto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          telefono,
          valoracionCalculada,
          datosInmueble,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la solicitud");
      }

      setSuccess(true);
      setTimeout(() => {
        setNombre("");
        setTelefono("");
        setAceptado(false);
        setSuccess(false);
        // NO cerramos el modal - se queda abierto como pidió el usuario
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar la solicitud. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full mt-4 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium"
        >
          <span className="mr-2">🤔</span>
          ¿No te cuadra la valoración?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Consulta con un Experto</DialogTitle>
              <DialogDescription className="text-base leading-relaxed pt-2">
                Si prefieres que un experto en la zona te informe del precio
                del último piso similar vendido en tu zona,{" "}
                <strong className="text-primary">te informará gratuitamente</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Tu teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="acepto"
                  checked={aceptado}
                  onCheckedChange={(checked) => setAceptado(checked as boolean)}
                />
                <label
                  htmlFor="acepto"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  Acepto que un experto me contacte para informarme del precio
                  de mercado en mi zona
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !aceptado}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📞</span>
                    Solicitar Consulta Gratuita
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl">✅</div>
            <DialogTitle className="text-2xl mb-2">¡Solicitud Enviada!</DialogTitle>
            <DialogDescription className="text-base">
              Un experto de la zona te contactará pronto al teléfono{" "}
              <strong>{telefono}</strong>
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
