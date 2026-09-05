"use client";

import { useEffect, useState } from "react";
import { irArriba } from "@/lib/scroll";

/**
 * Botón para volver arriba. Aparece cuando ya se ha bajado lo suficiente
 * como para que el pie quede lejos, y se retira cerca del inicio.
 *
 * El umbral va en alturas de pantalla y no en píxeles: en un móvil, 800 px
 * es haber bajado mucho; en un monitor grande, casi nada.
 */
const UMBRAL = 1.4; // pantallas recorridas antes de mostrarlo

export default function BackToTop({ etiqueta }: { etiqueta: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mirar = () => setVisible(window.scrollY > window.innerHeight * UMBRAL);
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    window.addEventListener("resize", mirar, { passive: true });
    return () => {
      window.removeEventListener("scroll", mirar);
      window.removeEventListener("resize", mirar);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={irArriba}
      aria-label={etiqueta}
      title={etiqueta}
      // Sin foco ni lectura mientras está oculto: no debe salir en el tabulador.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`subir ${visible ? "is-in" : ""}`}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none">
        <path
          d="M12 19V5M12 5l-6 6M12 5l6 6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
