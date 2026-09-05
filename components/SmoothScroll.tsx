"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

/** Scroll suave global. Se desactiva solo si el usuario pide menos motion. */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    });
    lenis.current = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  /*
   * Cada navegación arranca arriba, y tiene que hacerlo ANTES del primer
   * pintado: si la página nueva se monta con el scroll de la anterior, sus
   * elementos nacen fuera de la pantalla y las animaciones que esperan a
   * verlos entrar no llegan a dispararse.
   *
   * Se reposiciona también Lenis, que lleva su propia cuenta del scroll y
   * revertiría un window.scrollTo en su siguiente fotograma.
   */
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    lenis.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
