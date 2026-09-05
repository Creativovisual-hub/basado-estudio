"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   Relieve en 3D, dibujado a mano sobre canvas 2D. Sin librerías.

   Técnica: un campo de ruido de valor da la altura del terreno; se recorren
   las filas de atrás hacia delante y cada una se pinta rellena y luego se
   perfila. Al pintar en ese orden, las filas cercanas tapan a las lejanas —
   ése es todo el "3D": oclusión por orden de pintado (algoritmo del pintor)
   más una proyección en perspectiva. No hace falta WebGL para esto, y así el
   sitio no carga una librería de 3D entera para un solo bloque decorativo.

   El primer fotograma se dibuja de forma síncrona al montar, antes de pedir
   ninguna animación: si el navegador congela requestAnimationFrame —pestaña
   en segundo plano— o el visitante pide menos movimiento, queda una imagen
   fija correcta en lugar de un hueco negro.
--------------------------------------------------------------------------- */

/** Ruido de valor 2D, determinista y sin dependencias. */
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  // Suavizado de Hermite: evita las aristas duras de la interpolación lineal.
  const fade = (t: number) => t * t * (3 - 2 * t);

  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
  };

  /** Varias octavas: crestas grandes con detalle fino encima. */
  return (x: number, y: number) => {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < 4; o++) {
      sum += value(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.05;
    }
    return sum / norm;
  };
}

const ROWS = 64;
const COLS = 150;

export default function TerrainCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const noise = makeNoise(17.3);
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Se limita la densidad de píxeles: en pantallas 3x el coste se
      // dispara sin que la diferencia se aprecie en un fondo desenfocado.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.fillStyle = "#0a0a09";
      ctx.fillRect(0, 0, width, height);

      // Horizonte alto: el terreno ocupa la mitad inferior y deja aire
      // arriba para la tipografía.
      const horizon = height * 0.34;
      const depth = height - horizon;

      for (let r = 0; r < ROWS; r++) {
        // 0 = fondo, 1 = primer plano. Al cuadrado para que las filas se
        // separen hacia el frente, como en una perspectiva real.
        const p = r / (ROWS - 1);
        const persp = p * p;
        const y0 = horizon + depth * persp;

        // Lo lejano se aplana y se estrecha.
        const amplitude = height * (0.05 + 0.34 * persp);
        const spread = 0.5 + 1.6 * persp;

        ctx.beginPath();
        let firstY = 0;

        for (let c = 0; c <= COLS; c++) {
          const u = c / COLS;
          const x = width * (0.5 + (u - 0.5) * spread);
          const n = noise(u * 5.2 * spread + 4, p * 3.1 + t);
          // Se hunde el centro y se realzan los bordes: da la lectura de
          // una masa rocosa y no de una duna uniforme.
          const ridge = Math.pow(Math.abs(n - 0.5) * 2, 1.35);
          const y = y0 - ridge * amplitude;
          if (c === 0) {
            firstY = y;
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Relleno hasta el borde inferior: tapa las filas de detrás.
        const lastX = width * (0.5 + 0.5 * spread);
        ctx.lineTo(lastX, height);
        ctx.lineTo(width * (0.5 - 0.5 * spread), height);
        ctx.closePath();

        // La roca aclara y se entibia hacia el frente: da distancia y
        // recoge el tono piedra del acento tipográfico.
        const shade = 5 + 30 * persp;
        ctx.fillStyle = `rgb(${shade + persp * 4} ${shade + persp * 2} ${shade})`;
        ctx.fill();

        // Luz de contorno: marca la arista de cada fila. Se apaga al fondo
        // para dar sensación de bruma y distancia.
        ctx.beginPath();
        ctx.moveTo(width * (0.5 - 0.5 * spread), firstY);
        for (let c = 0; c <= COLS; c++) {
          const u = c / COLS;
          const x = width * (0.5 + (u - 0.5) * spread);
          const n = noise(u * 5.2 * spread + 4, p * 3.1 + t);
          const ridge = Math.pow(Math.abs(n - 0.5) * 2, 1.35);
          ctx.lineTo(x, y0 - ridge * amplitude);
        }
        ctx.strokeStyle = `rgba(236, 231, 222, ${0.06 + 0.5 * persp})`;
        ctx.lineWidth = 0.7 + persp * 0.7;
        ctx.stroke();
      }

      // Desvanecido superior e inferior: funde el relieve con la sección.
      const fade = ctx.createLinearGradient(0, horizon - height * 0.1, 0, height);
      fade.addColorStop(0, "rgba(10,10,9,1)");
      fade.addColorStop(0.28, "rgba(10,10,9,0)");
      fade.addColorStop(0.86, "rgba(10,10,9,0)");
      fade.addColorStop(1, "rgba(10,10,9,0.95)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height);
    };

    resize();
    // Primer fotograma inmediato: el bloque nunca aparece vacío.
    draw(0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let onResize: (() => void) | null = null;

    if (!reduce) {
      // Deriva muy lenta: el relieve respira, no se desplaza.
      const start = performance.now();
      const loop = (now: number) => {
        draw((now - start) * 0.000035);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);

      onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener("resize", onResize, { passive: true });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}
