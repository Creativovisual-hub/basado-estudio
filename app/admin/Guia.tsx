"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/* ---------------------------------------------------------------------------
   Guía del panel.

   Recorre las secciones señalando qué se hace en cada una. Se muestra sola la
   primera vez y después sólo si se pide desde el menú.

   Decisiones que importan:

   · Señala elementos reales, no dibujos de ellos. Una guía con capturas
     envejece mal: en cuanto se mueve un botón, miente.
   · Los pasos viven en varias páginas. Al pasar a uno que está en otra
     sección, se navega y se espera a que el elemento exista de verdad, con
     un tope de espera para no quedarse colgada si algo cambió de sitio.
   · Si un paso apunta a algo que ya no está —porque se rediseñó el panel—,
     se salta en lugar de bloquear. Una guía rota no puede impedir trabajar.
   · Se puede cerrar en cualquier momento, con el botón o con Escape.
--------------------------------------------------------------------------- */

const CLAVE = "panel-guia-vista";
const ESPERA_MAXIMA = 2500;

type Paso = {
  ruta: string;
  /** A qué señala. Vacío = tarjeta centrada, sin foco en nada. */
  selector?: string;
  titulo: string;
  texto: string;
};

const PASOS: Paso[] = [
  {
    ruta: "/admin",
    titulo: "Este es tu panel",
    texto:
      "Desde aquí se administra todo lo que se ve en basadoestudio.com: los proyectos, sus textos, sus imágenes y en qué orden aparecen. No hace falta tocar código ni esperar a nadie.",
  },
  {
    ruta: "/admin",
    selector: "[data-guia='resumen']",
    titulo: "Cómo va la cosa",
    texto:
      "Cuántos proyectos tienes, cuántos están publicados y cuántos siguen en borrador. Un borrador puede quedarse a medias todo el tiempo que quieras: no lo ve nadie.",
  },
  {
    ruta: "/admin",
    selector: "[data-guia='nuevo']",
    titulo: "Crear un proyecto",
    texto:
      "Se abre vacío y lo vas rellenando: nombre, cliente, textos en español e inglés, y las imágenes. Se guarda cuando tú digas, con el botón del final.",
  },
  {
    ruta: "/admin",
    selector: "[data-guia='lista']",
    titulo: "Tus proyectos",
    texto:
      "Pulsa cualquiera para editarlo. Verás su dirección web, cuántas imágenes tiene y si está publicado o en borrador. Dentro puedes subir fotos, arrastrarlas para ordenarlas, elegir la portada y escribir los bloques de texto que van entre las imágenes.",
  },
  {
    ruta: "/admin/orden",
    selector: "[data-guia='lista-orden']",
    titulo: "El orden de la portada",
    texto:
      "Arrastra los proyectos para decidir en qué orden se ven en la portada y en Work. Se guarda solo. La papelera de cada fila borra el proyecto, preguntando antes.",
  },
  {
    ruta: "/admin/analitica",
    selector: "[data-guia='espacio']",
    titulo: "Cuánto espacio queda",
    texto:
      "Tu almacén tiene 1 GB. Aquí ves cuánto llevas usado y cuántos proyectos más caben al ritmo actual. Abajo, cuál pesa más: útil el día que convenga comprimir en vez de ampliar el plan.",
  },
  {
    ruta: "/admin/cuenta",
    selector: "[data-guia='cuenta']",
    titulo: "Tu cuenta",
    texto:
      "Aquí cambias la contraseña. Ten cuidado: no se guarda en ningún sitio, sólo una huella suya. Si la pierdes no hay forma de recuperarla.",
  },
];

type Caja = { top: number; left: number; width: number; height: number };

export default function Guia({ abrirAlEntrar }: { abrirAlEntrar: boolean }) {
  const router = useRouter();
  const ruta = usePathname();

  const [activa, setActiva] = useState(false);
  const [paso, setPaso] = useState(0);
  const [caja, setCaja] = useState<Caja | null>(null);
  const buscando = useRef(false);

  /* Arranque automático la primera vez, y desde el menú cuando se pida. */
  useEffect(() => {
    const abrir = () => {
      setPaso(0);
      setActiva(true);
    };
    window.addEventListener("abrir-guia", abrir);

    if (abrirAlEntrar) {
      try {
        if (!localStorage.getItem(CLAVE)) abrir();
      } catch {}
    }
    return () => window.removeEventListener("abrir-guia", abrir);
  }, [abrirAlEntrar]);

  const cerrar = useCallback(() => {
    setActiva(false);
    setCaja(null);
    try {
      localStorage.setItem(CLAVE, "si");
    } catch {}
  }, []);

  /* Localiza el elemento del paso, navegando si hace falta. */
  useEffect(() => {
    if (!activa) return;
    const actual = PASOS[paso];
    if (!actual) return cerrar();

    if (!actual.selector) {
      setCaja(null);
      return;
    }

    if (ruta !== actual.ruta) {
      router.push(actual.ruta);
      return;
    }

    let cancelado = false;
    const desde = Date.now();
    buscando.current = true;

    const buscar = () => {
      if (cancelado) return;
      const el = document.querySelector(actual.selector!);
      if (el) {
        buscando.current = false;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        // Un respiro para que termine el desplazamiento antes de medir.
        setTimeout(() => {
          if (cancelado) return;
          const r = el.getBoundingClientRect();
          setCaja({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 320);
        return;
      }
      // El elemento pudo cambiar de sitio: se salta en vez de bloquear.
      if (Date.now() - desde > ESPERA_MAXIMA) {
        buscando.current = false;
        setPaso((p) => p + 1);
        return;
      }
      setTimeout(buscar, 80);
    };
    buscar();

    return () => {
      cancelado = true;
    };
  }, [activa, paso, ruta, router, cerrar]);

  /* La caja se recalcula si la ventana cambia mientras la guía está abierta. */
  useEffect(() => {
    if (!activa) return;
    const recalcular = () => {
      const actual = PASOS[paso];
      if (!actual?.selector) return;
      const el = document.querySelector(actual.selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCaja({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    window.addEventListener("resize", recalcular);
    window.addEventListener("scroll", recalcular, true);
    return () => {
      window.removeEventListener("resize", recalcular);
      window.removeEventListener("scroll", recalcular, true);
    };
  }, [activa, paso]);

  useEffect(() => {
    if (!activa) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") setPaso((p) => p + 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [activa, cerrar]);

  if (!activa) return null;

  const actual = PASOS[paso];
  if (!actual) return null;

  const ultimo = paso === PASOS.length - 1;

  /*
   * La tarjeta se coloca debajo de lo señalado, o encima si no cabe. Sin
   * elemento, va centrada: es la bienvenida.
   */
  const margen = 16;
  const anchoTarjeta = 380;
  const estiloTarjeta: React.CSSProperties = caja
    ? {
        top:
          caja.top + caja.height + margen + 210 > window.innerHeight
            ? Math.max(margen, caja.top - 210 - margen)
            : caja.top + caja.height + margen,
        left: Math.min(
          Math.max(margen, caja.left),
          Math.max(margen, window.innerWidth - anchoTarjeta - margen)
        ),
      }
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Velo. Con elemento señalado, el hueco se hace con una sombra enorme
          alrededor del recuadro: así no hay que recortar nada. */}
      {caja ? (
        <div
          onClick={cerrar}
          className="pointer-events-auto absolute rounded-[12px] transition-all duration-300"
          style={{
            top: caja.top - 6,
            left: caja.left - 6,
            width: caja.width + 12,
            height: caja.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
            outline: "2px solid var(--a-acento)",
          }}
        />
      ) : (
        <div onClick={cerrar} className="absolute inset-0 bg-black/72" />
      )}

      <div
        className="a-panel absolute w-[min(23.75rem,92vw)] overflow-hidden p-0 shadow-2xl"
        style={estiloTarjeta}
      >
        <div className="a-filete" aria-hidden="true" />
        <div className="p-5">
          <p className="a-etiqueta mb-3 opacity-40">
            Paso {paso + 1} de {PASOS.length}
          </p>
          <h2 className="mb-2 text-[1.15rem] font-semibold tracking-[-0.03em]">
            {actual.titulo}
          </h2>
          <p className="a-nota" style={{ opacity: 0.7 }}>
            {actual.texto}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => (ultimo ? cerrar() : setPaso(paso + 1))}
              className="a-etiqueta a-boton"
            >
              {ultimo ? "Entendido" : "Siguiente"}
            </button>
            {paso > 0 && (
              <button
                type="button"
                onClick={() => setPaso(paso - 1)}
                className="a-etiqueta a-boton a-boton--linea"
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={cerrar}
              className="a-etiqueta ml-auto opacity-45 transition-opacity hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
