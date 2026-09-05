import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";
import Cursor from "@/components/Cursor";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "BASADO ESTUDIO — Identidad visual y branding",
    template: "%s — BASADO ESTUDIO",
  },
  description:
    "Estudio creativo especializado en identidad visual y branding. Santiago de Chile. Diseñamos marcas basadas en algo real.",
  keywords: [
    "branding",
    "identidad visual",
    "estudio de diseño",
    "dirección de arte",
    "diseño web",
    "Santiago de Chile",
  ],
  authors: [{ name: "Basado Estudio" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: "BASADO ESTUDIO — Identidad visual y branding",
    description:
      "Estudio creativo especializado en identidad visual y branding. Santiago de Chile.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BASADO ESTUDIO",
    description: "Estudio creativo especializado en identidad visual y branding.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f3f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={display.variable}>
      <body className="bg-bone text-ink antialiased">
        <a
          href="#contenido"
          className="t-meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-3 focus:text-bone"
        >
          Saltar al contenido
        </a>

        <SmoothScroll />
        <Cursor />
        <Header />

        <main id="contenido">
          <PageTransition>{children}</PageTransition>
        </main>

        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: site.shortName,
              url: site.url,
              description:
                "Estudio creativo especializado en identidad visual y branding.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Santiago",
                addressCountry: "CL",
              },
              email: site.email,
              sameAs: [site.social.instagram, site.social.behance],
            }),
          }}
        />
      </body>
    </html>
  );
}
