import type Lenis from "lenis";

/* ===========================================================================
   Punto único de acceso al scroll suave.

   Lenis lleva su propia cuenta de la posición, así que un window.scrollTo lo
   revierte en el siguiente fotograma: hay que pedírselo a él. Como la
   instancia la crea SmoothScroll y la necesita también el botón de subir, se
   guarda aquí en vez de colgarla de window.

   Si Lenis no está —movimiento reducido, o el componente aún no ha montado—
   se recurre al scroll nativo. El destino se alcanza igual; sólo cambia el
   acompañamiento.
   =========================================================================== */

let instancia: Lenis | null = null;

export const registrarLenis = (l: Lenis | null) => {
  instancia = l;
};

export function irArriba() {
  if (instancia) {
    instancia.scrollTo(0, { duration: 1.1 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
