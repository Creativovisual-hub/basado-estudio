"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { ReactNode } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Enlace de contacto que avisa a la analítica al pulsarlo.
 *
 * En un portfolio, lo único que importa medir es cuánta gente intenta
 * escribir. Y justamente eso no se mide solo: la medición automática de
 * Google cuenta los clics a otros dominios, pero no los de tipo mailto,
 * que aquí son los que valen.
 *
 * El evento se llama "contacto" y lleva el canal, así que en los informes
 * se puede separar correo de Instagram o Behance.
 */
export default function ContactLink({
  href,
  canal,
  className,
  children,
}: {
  href: string;
  canal: string;
  className?: string;
  children: ReactNode;
}) {
  const externo = href.startsWith("http");

  return (
    <a
      href={href}
      className={className}
      {...(externo ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      onClick={() => {
        // Sin consentimiento no hay medición cargada, y no hay nada que avisar.
        if (typeof window.gtag === "function") sendGAEvent("event", "contacto", { canal });
        window.fbq?.("track", "Contact", { canal });
      }}
    >
      {children}
    </a>
  );
}
