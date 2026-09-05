"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   Piedra con luz que sigue al cursor.

   Dos copias de la misma imagen, una sobre otra: la de abajo en penumbra, la
   de arriba sobreexpuesta y recortada por una máscara radial centrada en el
   puntero. Al mover el ratón se mueve el recorte, y lo que se ve es la
   textura saliendo de la sombra — una relumbre sobre el relieve, no un
   brillo pegado encima.

   Se usan escuchas nativas en vez de los props de React: pointerenter y
   pointerleave no burbujean, así que React los reconstruye a partir de otros
   eventos, y esa capa de más no aporta nada aquí. Con listeners directos el
   comportamiento es el del navegador, sin intermediarios.

   La posición viaja por variables CSS y la clase se conmuta sobre el nodo:
   no hay re-render de React en cada píxel del recorrido.
--------------------------------------------------------------------------- */

export default function RockLight({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      // En táctil no hay cursor al que seguir: se deja la luz en reposo.
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      el.classList.add("is-lit");
    };
    const onLeave = () => el.classList.remove("is-lit");

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    // Si el puntero desaparece de la ventana, la luz también se apaga.
    window.addEventListener("blur", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={`rock ${className}`}>
      <img src={src} alt={alt} className="rock__base" decoding="async" />
      <img src={src} alt="" aria-hidden="true" className="rock__lit" decoding="async" />
    </div>
  );
}
