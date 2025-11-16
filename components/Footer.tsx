import { TrendingUp, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-white via-white to-accent flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-primary" strokeWidth={2.5} />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full"></div>
              </div>
              <span className="text-xl font-bold">ValoraciónMAX</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Empresa innovadora española de valoración inmobiliaria. La plataforma de valoración más precisa de España.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Servicios</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <span className="cursor-default">
                  Valoración gratuita
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Venta rápida
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Asesoramiento legal
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Fotografía profesional
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Empresa</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <span className="cursor-default">
                  Sobre nosotros
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Equipo
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Testimonios
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Blog
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>663 616 147</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/70">
          <p>&copy; 2025 ValoraciónMAX. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
