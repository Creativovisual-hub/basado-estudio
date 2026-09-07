"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* ---------------------------------------------------------------------------
   Scroll suave del panel.

   La web pública ya lo tiene, pero el panel vive fuera de ese layout y se
   quedaba con el desplazamiento seco del navegador. Aquí se nota más que en
   la web: la ficha de un proyecto es larga y se recorre entera varias veces
   mientras se trabaja.

   Va más corto que en el sitio —0,85 frente a 1,05— porque en una
   herramienta la inercia larga estorba: uno quiere llegar, no pasear.

   No se reposiciona al navegar, al contrario que en la web: si vuelves al
   listado desde un proyecto, lo natural es aparecer donde estabas.
--------------------------------------------------------------------------- */

export default function ScrollPanel() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
