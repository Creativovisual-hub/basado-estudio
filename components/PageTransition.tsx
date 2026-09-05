"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Transición entre páginas: un velo de tinta que se retira hacia abajo.
 *
 * Animación CSS, no de librería. Su estado por reposo es scaleY(0), es decir
 * invisible: si la animación no llegara a ejecutarse —pestaña en segundo
 * plano, movimiento reducido— el velo simplemente no se ve, en lugar de
 * quedarse tapando la página entera en negro.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [veil, setVeil] = useState<string | null>(null);

  useEffect(() => {
    setVeil(pathname);
    // Se desmonta al acabar: nada de capas fijas a pantalla completa
    // sobreviviendo por encima del contenido el resto de la sesión.
    const id = window.setTimeout(() => setVeil(null), 800);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <>
      {veil && <div key={veil} aria-hidden="true" className="page-veil" />}
      {children}
    </>
  );
}
