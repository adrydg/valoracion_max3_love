import { Home, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Home className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">PropTech</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              La plataforma inmobiliaria más innovadora de España. Vendemos tu propiedad rápido y al mejor
              precio.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Servicios</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Valoración gratuita
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Venta rápida
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Asesoramiento legal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Fotografía profesional
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Empresa</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Equipo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+34 900 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@proptech.es</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/70">
          <p>&copy; 2024 PropTech. Todos los derechos reservados.</p>
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
