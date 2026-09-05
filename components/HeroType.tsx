"use client";

import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   Titular del hero: las letras engordan al acercarse el cursor.

   Cada letra es un elemento propio. En cada movimiento del ratón se mide la
   distancia del puntero al centro de cada una y se interpola su peso: las
   cercanas se ensanchan, las lejanas vuelven al peso base. Sólo eso —ni
   color, ni sombra, ni imagen— porque el gesto tiene que ser tipográfico.

   Detalles que importan:

   · El peso se escribe con font-variation-settings, no con font-weight: el
     navegador redondea font-weight a los pesos disponibles y el movimiento
     saldría a saltos en vez de continuo.

   · Las medidas de cada letra se toman una sola vez y se guardan. Leer el
     rectángulo de veinte letras en cada movimiento del ratón obliga al
     navegador a recalcular la maquetación decenas de veces por segundo.

   · Se pinta de forma síncrona en el propio evento, sin requestAnimationFrame.
     El navegador ya agrupa los eventos de puntero a ritmo de fotograma, y
     para diecisiete letras con los centros memorizados el cálculo es
     inapreciable. A cambio, el efecto no depende de una API que los
     navegadores congelan en las pestañas de segundo plano.
--------------------------------------------------------------------------- */

const BASE = 600; // peso en reposo
const PEAK = 900; // peso justo bajo el cursor
const RADIO = 260; // px de influencia alrededor del puntero
const ALZADA = 7; // px que sube la letra bajo el cursor

export default function HeroType({
  lines,
  delay = 0.15,
  stagger = 0.1,
}: {
  lines: string[];
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }

    // Entrada: mismo revelado por líneas que el resto del sitio.
    const entrada = window.setTimeout(() => el.classList.add("is-in"), 30);

    const letras = Array.from(
      el.querySelectorAll<HTMLElement>(".hero-type__ch")
    );
    let centros: { x: number; y: number }[] = [];

    const medir = () => {
      centros = letras.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    let activo = false;

    const pintar = (px: number, py: number) => {
      for (let i = 0; i < letras.length; i++) {
        const c = centros[i];
        if (!c) continue;
        // Se pondera el eje vertical: el titular es mucho más ancho que
        // alto, y sin esto el foco se sentiría como una banda horizontal.
        const dx = px - c.x;
        const dy = (py - c.y) * 1.6;
        const d = Math.hypot(dx, dy);
        const t = activo ? Math.max(0, 1 - d / RADIO) : 0;
        // Curva suave: el ensanchado crece despacio y se dispara cerca.
        const k = t * t * (3 - 2 * t);
        letras[i].style.fontVariationSettings = `"wght" ${Math.round(BASE + (PEAK - BASE) * k)}`;
        letras[i].style.transform = k ? `translateY(${(-ALZADA * k).toFixed(2)}px)` : "";
      }
    };

    let ultimo = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!centros.length) medir();
      ultimo = { x: e.clientX, y: e.clientY };
      activo = true;
      pintar(ultimo.x, ultimo.y);
    };
    const onLeave = () => {
      activo = false;
      pintar(ultimo.x, ultimo.y);
    };
    const onGeometria = () => {
      centros = [];
      onLeave();
    };

    // El titular ocupa casi toda la pantalla: se escucha en la ventana para
    // que el peso reaccione al acercarse, no sólo al pisar las letras.
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onGeometria, { passive: true });
    window.addEventListener("scroll", onGeometria, { passive: true });

    return () => {
      window.clearTimeout(entrada);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onGeometria);
      window.removeEventListener("scroll", onGeometria);
    };
  }, []);

  return (
    <span ref={ref} className="hero-type">
      {lines.map((line, i) => (
        <span key={i} className="rv-line">
          <span style={{ "--rv-d": `${delay + i * stagger}s` } as React.CSSProperties}>
            {Array.from(line).map((ch, j) =>
              ch === " " ? (
                " "
              ) : (
                <span key={j} className="hero-type__ch">
                  {ch}
                </span>
              )
            )}
          </span>
        </span>
      ))}
    </span>
  );
}
