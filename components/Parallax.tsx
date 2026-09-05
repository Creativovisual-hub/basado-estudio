"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { seguirPuntero, type OpcionesInercia } from "@/lib/pointer";

/**
 * Envuelve una imagen para que se desplace con inercia siguiendo al cursor
 * dentro de su propio marco. El recorte lo pone el contenedor: la imagen se
 * dibuja algo mayor que su hueco, de modo que al moverse nunca descubre un
 * borde vacío.
 */
export default function Parallax({
  children,
  className = "",
  ...opciones
}: { children: ReactNode; className?: string } & OpcionesInercia) {
  const zona = useRef<HTMLDivElement | null>(null);
  const movil = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!zona.current || !movil.current) return;
    return seguirPuntero(zona.current, movil.current, opciones);
    // Las opciones son constantes en cada uso; no se re-suscribe por ellas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={zona} className={`relative h-full w-full overflow-hidden ${className}`}>
      <div ref={movil} className="parallax-capa">
        {children}
      </div>
    </div>
  );
}
