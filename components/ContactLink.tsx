"use client";

import { sendGAEvent } from "@next/third-parties/google";
import type { ReactNode } from "react";

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
        sendGAEvent("event", "contacto", { canal });
        // El píxel sólo existe si está configurado; si no, esto no hace nada.
        window.fbq?.("track", "Contact", { canal });
      }}
    >
      {children}
    </a>
  );
}
