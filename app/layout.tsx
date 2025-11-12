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
    default: "Valoración Max3 - Vende tu Propiedad Rápido y Seguro | Tasación Gratuita",
    template: "%s | Valoración Max3",
  },
  description:
    "Plataforma inmobiliaria líder en España. Vende tu piso, casa o local en 30 días con valoración gratuita. Tecnología avanzada + expertos certificados. Mejor precio garantizado.",
  keywords: [
    "vender piso rápido",
    "valoración vivienda gratis",
    "tasación inmueble online",
    "vender casa",
    "inmobiliaria",
    "valoración propiedad",
    "tasación piso",
    "vender local",
    "venta rápida inmueble",
    "compramos tu piso",
  ],
  authors: [{ name: "Valoración Max3" }],
  creator: "Valoración Max3",
  publisher: "Valoración Max3",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://valoracionmax3.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://valoracionmax3.com",
    title: "Valoración Max3 - Vende tu Propiedad Rápido y Seguro",
    description:
      "Plataforma inmobiliaria líder en España. Vende tu piso en 30 días con valoración gratuita. Tecnología avanzada + expertos certificados.",
    siteName: "Valoración Max3",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Valoración Max3 - Vende tu propiedad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valoración Max3 - Vende tu Propiedad Rápido y Seguro",
    description:
      "Plataforma inmobiliaria líder en España. Vende tu piso en 30 días con valoración gratuita.",
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
