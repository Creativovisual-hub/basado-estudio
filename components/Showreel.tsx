"use client";

import { useEffect, useRef } from "react";

/* ===========================================================================
   Secuencia de scroll: los proyectos entran en profundidad, se alinean en
   paneles y acaban fundiéndose en una sola imagen continua.

   Estructura: un contenedor alto y, dentro, un lienzo pegado arriba
   (position: sticky). El progreso es cuánto has recorrido el contenedor, así
   que la animación va atada al scroll y se queda clavada donde pares — no hay
   reproducción propia que siga corriendo.

   Se dibuja de forma síncrona en el evento de scroll, sin bucle: nada se
   mueve si el scroll no se mueve, y en reposo el coste es cero.

   Las imágenes son las portadas reales de los proyectos, las mismas que ya
   sirve el CDN para la rejilla, así que a esta altura de la página suelen
   estar ya en caché. La carga no empieza hasta que la sección se acerca a
   metro y medio de pantalla; esa cercanía se mide en el propio scroll y no
   con IntersectionObserver, que depende del ciclo de pintado y no llega a
   dispararse cuando la pestaña no se está dibujando.
   =========================================================================== */

type Fuente = { src: string; srcSet: string };

const FASES = {
  /** Los paneles llegan desde el fondo y se colocan. */
  entrada: [0.0, 0.28],
  /** Cada panel va cambiando de proyecto. */
  relevo: [0.28, 0.72],
  /** Los huecos se cierran y la composición se vuelve una sola imagen. */
  fusion: [0.72, 1.0],
} as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const tramo = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
/** Suavizado de Hermite: sin tirones al entrar y salir de cada tramo. */
const suave = (t: number) => t * t * (3 - 2 * t);

export default function Showreel({
  fuentes,
  etiqueta,
}: {
  fuentes: Fuente[];
  etiqueta: string;
}) {
  const contenedor = useRef<HTMLDivElement | null>(null);
  const lienzo = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cont = contenedor.current;
    const canvas = lienzo.current;
    if (!cont || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const movil = window.matchMedia("(max-width: 767px)").matches;
    const PANELES = movil ? 3 : 5;

    const imagenes: (HTMLImageElement | null)[] = fuentes.map(() => null);
    let listas = 0;
    let ancho = 0;
    let alto = 0;

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = Math.max(r.width, 1);
      alto = Math.max(r.height, 1);
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Dibuja una imagen cubriendo el rectángulo, recortando el sobrante. */
    const cubrir = (
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = w / escala;
      const sh = h / escala;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    };

    const pintar = (p: number) => {
      if (!ancho) return;

      const fondo = getComputedStyle(canvas).getPropertyValue("--c-shade").trim() || "#e7e5e1";
      ctx.fillStyle = fondo;
      ctx.fillRect(0, 0, ancho, alto);

      const tEntrada = suave(tramo(p, FASES.entrada));
      const tRelevo = tramo(p, FASES.relevo);
      const tFusion = suave(tramo(p, FASES.fusion));

      // Hueco entre paneles: ancho al principio, cerrado al fundirse.
      const hueco = (movil ? 10 : 18) * (1 - tFusion);
      // Alto de los paneles: recortados al entrar, a sangre completa al final.
      const altoPanel = alto * (0.52 + 0.48 * tFusion);
      const y0 = (alto - altoPanel) / 2;
      const anchoPanel = (ancho - hueco * (PANELES - 1)) / PANELES;

      for (let i = 0; i < PANELES; i++) {
        // Cada panel entra un poco después que el anterior.
        const retardo = i / (PANELES * 2.2);
        const e = suave(clamp01((tEntrada - retardo) / (1 - retardo)));
        if (e <= 0) continue;

        /*
         * Profundidad: al entrar, el panel viene pequeño y desde abajo. Los
         * de los extremos llegan desde más lejos que los centrales, que es
         * lo que da la lectura de perspectiva sin usar 3D real.
         */
        const centro = (i - (PANELES - 1) / 2) / ((PANELES - 1) / 2 || 1);
        const lejania = (1 - e) * (0.35 + Math.abs(centro) * 0.4);
        const escala = 1 - lejania;
        const desvio = (1 - e) * alto * 0.22;

        // Relevo de proyectos: cada panel avanza por la lista a su ritmo.
        const avance = tRelevo * (fuentes.length - 1) + i * 0.55;
        const iA = Math.floor(avance) % fuentes.length;
        const iB = (iA + 1) % fuentes.length;
        const mezcla = suave(avance - Math.floor(avance));

        const x = i * (anchoPanel + hueco);
        const w = anchoPanel * escala;
        const h = altoPanel * escala;
        const cx = x + anchoPanel / 2;

        ctx.save();
        ctx.globalAlpha = e;
        ctx.beginPath();
        ctx.rect(cx - w / 2, y0 + desvio + (altoPanel - h) / 2, w, h);
        ctx.clip();

        const rx = cx - w / 2;
        const ry = y0 + desvio + (altoPanel - h) / 2;

        const a = imagenes[iA];
        if (a?.complete && a.naturalWidth) cubrir(a, rx, ry, w, h);

        // En la fusión los paneles muestran ya el mismo proyecto, para que
        // al cerrarse los huecos la imagen sea de verdad continua.
        if (tFusion < 1) {
          const b = imagenes[iB];
          if (b?.complete && b.naturalWidth) {
            ctx.globalAlpha = e * mezcla * (1 - tFusion);
            cubrir(b, rx, ry, w, h);
          }
        }
        ctx.restore();
      }

      // Al final, una sola imagen a sangre por encima: el cierre de showreel.
      if (tFusion > 0) {
        const ultima = imagenes[imagenes.length - 1];
        if (ultima?.complete && ultima.naturalWidth) {
          ctx.save();
          ctx.globalAlpha = suave(clamp01((tFusion - 0.55) / 0.45));
          cubrir(ultima, 0, 0, ancho, alto);
          ctx.restore();
        }
      }
    };

    const progreso = () => {
      const r = cont.getBoundingClientRect();
      const recorrido = cont.offsetHeight - window.innerHeight;
      if (recorrido <= 0) return 0;
      return clamp01(-r.top / recorrido);
    };

    const onScroll = () => pintar(progreso());
    const onResize = () => {
      medir();
      onScroll();
    };

    let pedidas = false;

    const pedirImagenes = () => {
      if (pedidas) return;
      pedidas = true;
      medir();

      fuentes.forEach((f, i) => {
        const img = new Image();
        // Sin crossOrigin a proposito: la rejilla ya cargó estas mismas URL
        // sin CORS, y añadirlo cambiaría la clave de caché y obligaría a
        // descargar las siete portadas otra vez. El lienzo queda contaminado,
        // pero aquí sólo se dibuja, nunca se leen píxeles.
        img.decoding = "async";
        img.sizes = movil ? "100vw" : "34vw";
        img.srcset = f.srcSet;
        img.src = f.src;
        const alCargar = () => {
          imagenes[i] = img;
          listas++;
          // Sin movimiento se muestra la composición ya resuelta.
          pintar(reduce ? 1 : progreso());
        };
        if (img.complete && img.naturalWidth) alCargar();
        else img.addEventListener("load", alCargar, { once: true });
      });
    };

    /** ¿Está la sección a menos de metro y medio de pantalla? */
    const cerca = () => {
      const r = cont.getBoundingClientRect();
      const margen = window.innerHeight * 1.5;
      return r.top < window.innerHeight + margen && r.bottom > -margen;
    };

    const alScroll = () => {
      if (!pedidas) {
        if (!cerca()) return;
        pedirImagenes();
      }
      if (!reduce && listas) onScroll();
    };

    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [fuentes]);

  return (
    <section ref={contenedor} className="showreel" aria-labelledby="showreel-titulo">
      <h2 id="showreel-titulo" className="sr-only">
        {etiqueta}
      </h2>
      <div className="showreel__pin">
        <canvas ref={lienzo} className="showreel__lienzo" aria-hidden="true" />
      </div>
    </section>
  );
}
