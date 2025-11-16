import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ValoraciónMAX - Tasación Online de Viviendas | Valoración Inmobiliaria Gratis con IA",
    template: "%s | ValoraciónMAX",
  },
  description:
    "La plataforma de valoración inmobiliaria más precisa de España. Descubre el valor real de tu piso, casa o local al instante. Algoritmo con IA que analiza +20 bases de datos y compraventas reales de tu zona. Primera valoración 100% gratis en 2 minutos.",
  keywords: [
    "valoración inmobiliaria online",
    "tasación vivienda gratis",
    "valorar piso online",
    "cuánto vale mi casa",
    "tasación inmueble inteligencia artificial",
    "valoración propiedad IA",
    "precio piso por m2",
    "valoración casa gratis",
    "tasación online Madrid",
    "valorar inmueble España",
    "precio de mercado vivienda",
    "tasador inmobiliario online",
  ],
  authors: [{ name: "ValoraciónMAX" }],
  creator: "ValoraciónMAX",
  publisher: "ValoraciónMAX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://valoracionmax.es"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://valoracionmax.es",
    title: "ValoraciónMAX - Valoración Inmobiliaria con IA | Tasación Gratis en 2 Minutos",
    description:
      "Descubre el valor exacto de tu vivienda con inteligencia artificial. Analizamos +20 bases de datos y compraventas reales. Primera valoración 100% gratis. Empresa innovadora española.",
    siteName: "ValoraciónMAX",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ValoraciónMAX - Valoración inmobiliaria con inteligencia artificial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ValoraciónMAX - Valoración Inmobiliaria con IA | Tasación Gratis",
    description:
      "Descubre el valor exacto de tu vivienda con IA. Analizamos +20 bases de datos. Primera valoración gratis en 2 minutos.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Añade aquí los códigos de verificación cuando los tengas
    // google: "google-verification-code",
    // yandex: "yandex-verification-code",
    // bing: "bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
