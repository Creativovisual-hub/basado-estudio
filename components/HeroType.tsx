"use client";

import { useEffect, useRef } from "react";
import { RevealLines } from "./Reveal";

/* ---------------------------------------------------------------------------
   Titular del hero con la piedra revelándose dentro de las letras.

   Dos capas con los mismos glifos, exactamente en la misma posición: debajo
   el texto en tinta, encima una copia cuyo relleno es la fotografía de la
   roca, recortada por una máscara radial centrada en el puntero. Al pasar el
   ratón, las letras se encienden como piedra iluminada; al salir, vuelven a
   tinta plana.

   La capa de piedra reutiliza las clases del revelado de entrada con is-in
   ya puesto: así ocupa exactamente la misma caja que el texto animado y las
   dos capas encajan glifo con glifo, sin recalcular nada.
--------------------------------------------------------------------------- */

export default function HeroType({
  lines,
  delay = 0.15,
  stagger = 0.1,
}: {
  lines: string[];
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      el.classList.add("is-lit");
    };
    const onLeave = () => el.classList.remove("is-lit");

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <span ref={ref} className="hero-type">
      <RevealLines lines={lines} delay={delay} stagger={stagger} on="mount" />

      <span className="hero-type__stone" aria-hidden="true">
        {lines.map((line, i) => (
          <span key={i} className="rv-line is-in">
            <span>{line}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
