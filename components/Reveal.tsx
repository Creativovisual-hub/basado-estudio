"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Revelados de entrada.
 *
 * La animación es CSS puro (transiciones), no una librería de motion: el
 * estado visible se aplica añadiendo una clase. Así el contenido no puede
 * quedarse atrapado a medio camino, que es justo lo que ocurría antes —
 * en navegación interna los textos se quedaban en su posición inicial,
 * fuera de su máscara, y la página se veía en blanco hasta recargar.
 *
 * Red de seguridad: si el observador no llega a dispararse, un temporizador
 * revela igualmente. El contenido nunca depende de que todo salga bien.
 */

export type RevealTrigger = "view" | "mount";

const FALLBACK_MS = 1800;

function useReveal(on: RevealTrigger) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (on === "mount") {
      /*
       * Con temporizador, no con requestAnimationFrame: los navegadores lo
       * congelan en pestañas de segundo plano, así que una página abierta
       * con "abrir en pestaña nueva" se quedaría en blanco hasta mirarla.
       * El retardo sólo da tiempo a pintar el estado inicial para que la
       * transición tenga de dónde salir.
       */
      const id = window.setTimeout(() => setShown(true), 30);
      return () => window.clearTimeout(id);
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);

    const timer = window.setTimeout(() => setShown(true), FALLBACK_MS);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [on]);

  return { ref, shown };
}

/** Fade + translate sutil. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: Tag = "div",
  on = "view",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "p";
  on?: RevealTrigger;
}) {
  const { ref, shown } = useReveal(on);

  return (
    <Tag
      ref={ref as never}
      className={`rv ${shown ? "is-in" : ""} ${className ?? ""}`}
      style={{ "--rv-y": `${y}px`, "--rv-d": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * Aparición progresiva de texto: cada línea sube desde debajo de su recorte.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  on = "view",
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  on?: RevealTrigger;
}) {
  const { ref, shown } = useReveal(on);

  return (
    <span ref={ref as never} className={`rv-lines ${className ?? ""}`}>
      {lines.map((line, i) => (
        <span key={i} className={`rv-line ${shown ? "is-in" : ""}`}>
          <span
            className={lineClassName}
            style={{ "--rv-d": `${delay + i * stagger}s` } as React.CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
