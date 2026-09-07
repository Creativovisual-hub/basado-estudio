"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   Pieza generativa del hero: curvas de nivel que respiran.

   Qué es: una topografía abstracta, como las curvas de un mapa o los estratos
   de una piedra cortada. Encaja con lo que dice la marca —algo con base— y no
   compite con la tipografía porque es sólo línea fina, sin masa ni color.

   Cómo está hecha:

   · Canvas 2D, sin librerías ni WebGL. Son anillos concéntricos cuyo radio se
     modula con una suma de senos: barato de calcular y suficientemente
     irregular para no parecer un círculo deformado.
   · El cursor empuja las curvas hacia fuera con una caída suave, y aclara la
     línea a su paso. No hay física ni partículas: es geometría.
   · Se dibuja con el color del texto (currentColor), así funciona igual en
     claro y en oscuro sin duplicar nada.

   Cuándo NO se dibuja, que es tan importante como lo anterior:

   · Con prefers-reduced-motion se pinta un solo fotograma y se para.
   · Fuera de la pantalla o con la pestaña en segundo plano se detiene el
     bucle: una animación que nadie ve sólo gasta batería.
   · En pantallas de puntero grueso (móvil) no hay cursor al que reaccionar,
     así que se queda en su movimiento lento.
--------------------------------------------------------------------------- */

const ANILLOS = 26;
const SEGMENTOS = 96;
const RADIO_CURSOR = 260; // px de influencia del puntero

export default function HeroField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ancho = 0;
    let alto = 0;
    let dpr = 1;
    let animacion = 0;
    let visible = true;

    // Puntero en coordenadas del lienzo. Fuera de rango = sin influencia.
    let px = -9999;
    let py = -9999;

    const medir = () => {
      const caja = lienzo.getBoundingClientRect();
      // Se limita la densidad a 2: por encima no se aprecia y cuesta el doble.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = caja.width;
      alto = caja.height;
      lienzo.width = Math.round(ancho * dpr);
      lienzo.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pintar = (t: number) => {
      ctx.clearRect(0, 0, ancho, alto);
      if (!ancho || !alto) return;

      // El color lo hereda del texto, así el tema claro y el oscuro salen solos.
      const tinta = getComputedStyle(lienzo).color;
      ctx.strokeStyle = tinta;
      ctx.lineJoin = "round";

      const cx = ancho * 0.5;
      const cy = alto * 0.5;
      const radioBase = Math.min(ancho, alto) * 0.5;
      const tiempo = t * 0.00013;

      for (let a = 0; a < ANILLOS; a++) {
        const paso = (a + 1) / ANILLOS;
        const radio = radioBase * paso;

        ctx.beginPath();
        for (let s = 0; s <= SEGMENTOS; s++) {
          const ang = (s / SEGMENTOS) * Math.PI * 2;

          /*
           * Tres senos de frecuencias distintas: uno da la forma grande, otro
           * la ondulación media y el tercero el temblor fino. Sumados no
           * repiten patrón a simple vista, que es lo que se busca.
           */
          const onda =
            Math.sin(ang * 3 + tiempo * 6 + paso * 5.2) * 0.085 +
            Math.sin(ang * 5 - tiempo * 4 + paso * 9.1) * 0.045 +
            Math.sin(ang * 9 + tiempo * 9 - paso * 3.7) * 0.018;

          let r = radio * (1 + onda);

          let x = cx + Math.cos(ang) * r;
          let y = cy + Math.sin(ang) * r;

          // El cursor empuja el punto hacia fuera, con caída suave.
          const dx = x - px;
          const dy = y - py;
          const d = Math.hypot(dx, dy);
          if (d < RADIO_CURSOR) {
            const k = 1 - d / RADIO_CURSOR;
            const empuje = k * k * 62;
            x += (dx / (d || 1)) * empuje;
            y += (dy / (d || 1)) * empuje;
          }

          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Los anillos de fuera se desvanecen: la pieza no tiene borde duro.
        ctx.globalAlpha = 0.075 + (1 - paso) * 0.135;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const bucle = (t: number) => {
      pintar(t);
      animacion = requestAnimationFrame(bucle);
    };

    const arrancar = () => {
      if (animacion || quieto) return;
      animacion = requestAnimationFrame(bucle);
    };
    const parar = () => {
      cancelAnimationFrame(animacion);
      animacion = 0;
    };

    medir();
    pintar(0);
    if (!quieto) arrancar();

    const alMover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const caja = lienzo.getBoundingClientRect();
      px = e.clientX - caja.left;
      py = e.clientY - caja.top;
    };
    const alSalir = () => {
      px = -9999;
      py = -9999;
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    document.addEventListener("pointerleave", alSalir);

    const ro = new ResizeObserver(() => {
      medir();
      if (quieto) pintar(0);
    });
    ro.observe(lienzo);

    // Fuera de pantalla no se dibuja.
    const io = new IntersectionObserver((entradas) => {
      visible = entradas.some((e) => e.isIntersecting);
      if (visible) arrancar();
      else parar();
    });
    io.observe(lienzo);

    // Pestaña en segundo plano tampoco.
    const alCambiarVisibilidad = () => {
      if (document.hidden) parar();
      else if (visible) arrancar();
    };
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      parar();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", alMover);
      document.removeEventListener("pointerleave", alSalir);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-(--header-h) -z-10 h-[58svh] w-full text-fg md:w-[62%]"
    />
  );
}
