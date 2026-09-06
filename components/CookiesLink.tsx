"use client";

import { abrirCookies } from "@/lib/consent";

/** Reabre el banner de cookies desde el pie, para cambiar de opinión. */
export default function CookiesLink({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={abrirCookies} className="link-underline mt-2 inline-block opacity-55">
      {children}
    </button>
  );
}
