/* ===========================================================================
   Movimiento con inercia ligado al puntero.

   Un único bucle para toda la página, no uno por elemento: con una rejilla de
   proyectos habría una decena de bucles compitiendo por el mismo fotograma.
   Cada elemento se registra, declara cuánto se desplaza como máximo, y el
   bucle interpola su posición actual hacia la que marca el cursor.

   El bucle se detiene solo cuando todo ha llegado a su sitio y no queda
   movimiento pendiente, así que en reposo no consume nada. Vuelve a arrancar
   con el siguiente movimiento del ratón.

   El estado en reposo es "sin desplazamiento": si el bucle no llegara a
   correr —pestaña en segundo plano, movimiento reducido— la composición se
   ve exactamente igual, sólo que quieta.
   =========================================================================== */

type Objetivo = {
  el: HTMLElement;
  /** Desplazamiento máximo en píxeles, por eje. */
  amp: number;
  /** Cuánto persigue al cursor por fotograma. Más bajo = más inercia. */
  seguimiento: number;
  /** Escala aplicada mientras el cursor está dentro. */
  zoom: number;
  activo: boolean;
  /* Posición deseada y posición actual, normalizadas a -1..1 */
  tx: number;
  ty: number;
  x: number;
  y: number;
  tz: number;
  z: number;
};

const objetivos = new Set<Objetivo>();
let corriendo = false;

/** Se considera asentado cuando la diferencia es menor que medio píxel. */
const CASI = 0.0015;

/** Avanza un objetivo un paso hacia su destino. Devuelve si aun se mueve. */
function paso(o: Objetivo) {
  o.x += (o.tx - o.x) * o.seguimiento;
  o.y += (o.ty - o.y) * o.seguimiento;
  o.z += (o.tz - o.z) * o.seguimiento;

  const vivo =
    Math.abs(o.tx - o.x) > CASI ||
    Math.abs(o.ty - o.y) > CASI ||
    Math.abs(o.tz - o.z) > CASI;

  if (!vivo) {
    o.x = o.tx;
    o.y = o.ty;
    o.z = o.tz;
  }

  const escala = 1 + o.z * (o.zoom - 1);
  o.el.style.transform =
    o.x === 0 && o.y === 0 && o.z === 0
      ? ""
      : `translate3d(${(o.x * o.amp).toFixed(2)}px, ${(o.y * o.amp).toFixed(2)}px, 0) scale(${escala.toFixed(4)})`;

  return vivo;
}

function tick() {
  let vivo = false;
  for (const o of objetivos) if (paso(o)) vivo = true;

  if (vivo) {
    requestAnimationFrame(tick);
  } else {
    corriendo = false;
  }
}

function arrancar() {
  if (corriendo) return;
  corriendo = true;
  requestAnimationFrame(tick);
}

export type OpcionesInercia = {
  amp?: number;
  seguimiento?: number;
  zoom?: number;
};

/**
 * Hace que `movil` siga al cursor con inercia mientras el puntero está sobre
 * `zona`. Devuelve la función de limpieza.
 */
export function seguirPuntero(
  zona: HTMLElement,
  movil: HTMLElement,
  { amp = 14, seguimiento = 0.085, zoom = 1 }: OpcionesInercia = {}
) {
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    return () => {};
  }

  const o: Objetivo = {
    el: movil,
    amp,
    seguimiento,
    zoom,
    activo: false,
    tx: 0,
    ty: 0,
    x: 0,
    y: 0,
    tz: 0,
    z: 0,
  };
  objetivos.add(o);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = zona.getBoundingClientRect();
    // -1 en un borde, +1 en el opuesto, 0 en el centro.
    o.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    o.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    o.tz = 1;
    // Un primer paso ya, sin esperar al siguiente fotograma: la respuesta
    // arranca en el mismo instante en que el cursor se mueve.
    paso(o);
    arrancar();
  };

  const onLeave = () => {
    o.tx = 0;
    o.ty = 0;
    o.tz = 0;
    paso(o);
    arrancar();
  };

  zona.addEventListener("pointermove", onMove, { passive: true });
  zona.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);

  return () => {
    zona.removeEventListener("pointermove", onMove);
    zona.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onLeave);
    objetivos.delete(o);
    movil.style.transform = "";
  };
}
