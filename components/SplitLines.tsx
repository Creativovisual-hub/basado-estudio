"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   Revelado por líneas reales.

   RevealLines anima líneas escritas a mano; esto anima las que dibuja el
   navegador. La diferencia importa en los párrafos: cuántas líneas ocupa un
   texto depende del ancho de la ventana, del idioma y de la tipografía, así
   que no se pueden escribir de antemano.

   Cómo funciona:

   1. El servidor manda el párrafo tal cual. Si el JavaScript falla, si el
      visitante pide menos movimiento o si el navegador es antiguo, el texto
      ya está ahí y legible. La animación nunca es requisito para leer.
   2. Al montar, cada palabra se envuelve y se mide su posición vertical.
      Las que comparten altura forman una línea.
   3. Se reconstruye el párrafo con una caja por línea, que es lo que la hoja
      de estilos ya sabe animar (.rv-line, con su recorte y su retardo).
   4. Al cambiar el ancho, las líneas caen en otro sitio: se rehace el
      reparto. Esto es justo lo que se olvida en la mayoría de los montajes,
      y se nota al girar el teléfono o al partir la pantalla.

   Sin librerías: la máscara y la transición son las mismas que usa el resto
   del sitio, así que esto no añade ni un kilobyte de dependencias.
--------------------------------------------------------------------------- */

const FALLBACK_MS = 1800;

/** El texto viaja como HTML, así que hay que neutralizar sus símbolos. */
function escapar(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function SplitLines({
  text,
  className,
  delay = 0,
  stagger = 0.07,
  on = "view",
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  on?: "view" | "mount";
  as?: "p" | "div";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const plano = escapar(text);
    let visible = false;
    let io: IntersectionObserver | null = null;
    let temporizador = 0;
    let reajuste = 0;
    let anchoPrevio = el.clientWidth;

    const mostrar = () => {
      visible = true;
      el.querySelectorAll(".rv-line").forEach((l) => l.classList.add("is-in"));
    };

    const partir = () => {
      try {
        /*
         * Primero se deshace el reparto anterior. Es imprescindible: la clase
         * rv-lines pone el párrafo en columna, y midiendo las palabras dentro
         * de una columna cada una caería en su propia altura y saldría una
         * línea por palabra.
         */
        el.classList.remove("rv-lines");

        // Una palabra por caja, para poder preguntarle en qué altura cayó.
        el.innerHTML = text
          .split(/\s+/)
          .filter(Boolean)
          .map((p) => `<span class="sl-w">${escapar(p)}</span>`)
          .join(" ");

        const palabras = Array.from(el.querySelectorAll<HTMLElement>(".sl-w"));
        if (!palabras.length) return;

        const lineas: string[][] = [];
        let alturaActual: number | null = null;
        for (const palabra of palabras) {
          const arriba = Math.round(palabra.offsetTop);
          // Un par de píxeles de margen: acentos y mayúsculas mueven la caja.
          if (alturaActual === null || Math.abs(arriba - alturaActual) > 4) {
            alturaActual = arriba;
            lineas.push([]);
          }
          lineas[lineas.length - 1].push(palabra.textContent ?? "");
        }

        el.classList.add("rv-lines");
        el.innerHTML = lineas
          .map(
            (linea, i) =>
              `<span class="rv-line${visible ? " is-in" : ""}"><span style="--rv-d:${(
                delay +
                i * stagger
              ).toFixed(3)}s">${escapar(linea.join(" "))}</span></span>`
          )
          .join("");
      } catch {
        // Ante cualquier imprevisto, el texto vuelve a estar entero y visible.
        el.classList.remove("rv-lines");
        el.innerHTML = plano;
      }
    };

    partir();

    if (on === "mount") {
      temporizador = window.setTimeout(mostrar, 30);
    } else if (typeof IntersectionObserver === "undefined") {
      mostrar();
    } else {
      io = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((e) => e.isIntersecting)) {
            mostrar();
            io?.disconnect();
          }
        },
        { rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(el);
      // Red de seguridad: si el observador no llega a dispararse, se muestra.
      temporizador = window.setTimeout(mostrar, FALLBACK_MS);
    }

    /*
     * Se vigila la caja del propio párrafo, no la ventana. El ancho de un
     * párrafo puede cambiar sin que la ventana se mueva —una columna que se
     * reordena, una fuente que termina de cargar— y al revés: en el móvil la
     * barra del navegador cambia el alto al hacer scroll y dispararía un
     * reparto inútil. Por eso sólo se reacciona al ancho.
     */
    const revisarAncho = () => {
      if (el.clientWidth === anchoPrevio) return;
      anchoPrevio = el.clientWidth;
      window.clearTimeout(reajuste);
      reajuste = window.setTimeout(partir, 150);
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(revisarAncho);
      ro.observe(el);
    }
    // Y además el evento de ventana: cubre el giro del teléfono aunque el
    // observador no llegue, y no cuesta nada porque la comprobación de ancho
    // descarta enseguida lo que no toca.
    window.addEventListener("resize", revisarAncho, { passive: true });

    return () => {
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", revisarAncho);
      window.clearTimeout(temporizador);
      window.clearTimeout(reajuste);
    };
  }, [text, delay, stagger, on]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      // React no reconcilia el interior, así que el reparto en líneas puede
      // reescribirlo sin que la próxima renderización lo deshaga.
      dangerouslySetInnerHTML={{ __html: escapar(text) }}
    />
  );
}
