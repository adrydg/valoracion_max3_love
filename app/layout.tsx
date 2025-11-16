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
    default: "ValoraciónMAX - Herramienta Online de Valoración de Inmuebles | Datos del Registro de la Propiedad",
    template: "%s | ValoraciónMAX",
  },
  description:
    "Herramienta online de valoración de inmuebles con datos reales del Registro de la Propiedad y algoritmo propio. Valora tu piso, casa o local de forma rápida, segura e inmediata. Resultado en 2 minutos. Primera valoración 100% gratis.",
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
    title: "ValoraciónMAX - Herramienta Online de Valoración de Inmuebles | Registro de la Propiedad",
    description:
      "Herramienta online de valoración de inmuebles con datos reales del Registro de la Propiedad y algoritmo propio. Valora tu piso, casa o local de forma rápida, segura e inmediata en 2 minutos. Primera valoración gratis.",
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
    title: "ValoraciónMAX - Herramienta Online de Valoración de Inmuebles",
    description:
      "Herramienta online con datos reales del Registro de la Propiedad y algoritmo propio. Valora tu inmueble de forma rápida, segura e inmediata en 2 minutos.",
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
