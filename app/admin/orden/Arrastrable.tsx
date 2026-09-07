"use client";

import { useRef, useState, useTransition } from "react";
import { eliminarDesdeLista, reordenarPortada } from "../proyectos";

/* ---------------------------------------------------------------------------
   Orden de la portada, arrastrando.

   Se reordena en pantalla al soltar y se guarda por detrás. Esperar la
   respuesta del servidor para mover una fila haría que arrastrar se sintiera
   pegajoso, y aquí el gesto tiene que ir por delante.

   Con teclado no se puede arrastrar, así que cada fila se enfoca con el
   tabulador y se mueve con Alt + flecha. Sin eso, esta pantalla sería
   inutilizable para quien no maneja un ratón.

   Borrar pide confirmación en una ventana propia, no con el aviso del
   navegador: hay que poder leer QUÉ se va a borrar y que se lleva por
   delante las imágenes. Un "¿estás seguro?" sin nombre se acepta sin mirar.
--------------------------------------------------------------------------- */

type Fila = {
  id: string;
  nombre: string;
  slug: string;
  imagenes: number;
  miniatura: string | null;
};

export default function Arrastrable({ inicial }: { inicial: Fila[] }) {
  const [lista, setLista] = useState(inicial);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [aBorrar, setABorrar] = useState<Fila | null>(null);
  const [borrando, setBorrando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const dialogo = useRef<HTMLDialogElement>(null);

  function aplicar(nueva: Fila[]) {
    setLista(nueva);
    iniciar(() => {
      reordenarPortada(nueva.map((p) => p.id));
    });
  }

  function soltarSobre(destinoId: string) {
    if (!arrastrando || arrastrando === destinoId) return;
    const desde = lista.findIndex((p) => p.id === arrastrando);
    const hasta = lista.findIndex((p) => p.id === destinoId);
    if (desde < 0 || hasta < 0) return;

    const nueva = [...lista];
    const [movido] = nueva.splice(desde, 1);
    nueva.splice(hasta, 0, movido);
    aplicar(nueva);
  }

  function mover(indice: number, salto: number) {
    const destino = indice + salto;
    if (destino < 0 || destino >= lista.length) return;
    const nueva = [...lista];
    [nueva[indice], nueva[destino]] = [nueva[destino], nueva[indice]];
    aplicar(nueva);
  }

  function preguntar(p: Fila) {
    setABorrar(p);
    setAviso(null);
    // showModal atrapa el foco y cierra con Escape sin escribir nada de eso.
    dialogo.current?.showModal();
  }

  function cerrar() {
    dialogo.current?.close();
    setABorrar(null);
  }

  async function confirmar() {
    if (!aBorrar) return;
    setBorrando(true);
    try {
      await eliminarDesdeLista(aBorrar.id);
      setLista((antes) => antes.filter((p) => p.id !== aBorrar.id));
      setAviso(`«${aBorrar.nombre}» se borró de la web y del almacén.`);
    } catch {
      setAviso("No se pudo borrar. Vuelve a intentarlo.");
    }
    setBorrando(false);
    cerrar();
  }

  return (
    <>
      {aviso && (
        <p
          role="status"
          className="a-etiqueta a-panel a-destacada mb-4 px-5 py-4 opacity-75"
        >
          {aviso}
        </p>
      )}

      <ul data-guia="lista-orden" className="a-panel flex flex-col gap-1 p-4 md:p-5">
        {lista.map((p, i) => (
          <li
            key={p.id}
            draggable
            onDragStart={() => setArrastrando(p.id)}
            onDragEnd={() => setArrastrando(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              soltarSobre(p.id);
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              // Alt + flecha, y no la flecha sola, para no secuestrar el
              // desplazamiento normal de la página con el teclado.
              if (!e.altKey) return;
              if (e.key === "ArrowUp") {
                e.preventDefault();
                mover(i, -1);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                mover(i, 1);
              }
            }}
            className={`a-fila group flex cursor-grab items-center gap-4 px-2 py-3 transition-opacity ${
              arrastrando === p.id ? "opacity-40" : ""
            }`}
          >
            {/* Asidero: dice sin palabras que la fila se puede coger. */}
            <span aria-hidden="true" className="opacity-30">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </span>

            <span className="a-etiqueta w-5 shrink-0 opacity-35">{i + 1}</span>

            <span className="h-12 w-16 shrink-0 overflow-hidden rounded-[8px] bg-shade">
              {p.miniatura && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.miniatura}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[1.05rem] font-semibold tracking-[-0.025em]">
                {p.nombre}
              </span>
              <span className="a-etiqueta mt-1 block opacity-40">/{p.slug}</span>
            </span>

            {/* Aparece al acercarse, pero siempre presente para el teclado y
                los lectores de pantalla. */}
            <button
              type="button"
              onClick={() => preguntar(p)}
              aria-label={`Borrar ${p.nombre}`}
              className="a-etiqueta shrink-0 rounded-[8px] px-3 py-2 opacity-0 transition-opacity hover:bg-[var(--a-suave)] focus-visible:opacity-100 group-hover:opacity-55"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        onClose={() => setABorrar(null)}
        className="a-panel m-auto w-[min(30rem,92vw)] p-6 text-fg backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {aBorrar && (
          <>
            <h2 className="mb-3 text-[1.25rem] font-semibold tracking-[-0.03em]">
              ¿Borrar «{aBorrar.nombre}»?
            </h2>
            <p className="t-body mb-6 opacity-65">
              Desaparece de la web y se borran sus {aBorrar.imagenes}{" "}
              {aBorrar.imagenes === 1 ? "imagen" : "imágenes"} del almacén.
              <strong className="font-semibold"> No se puede deshacer.</strong>
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={confirmar}
                disabled={borrando}
                className="a-etiqueta a-boton"
                style={{ background: "#e0342f", color: "#fff" }}
              >
                {borrando ? "Borrando…" : "Sí, borrar"}
              </button>
              <button
                type="button"
                onClick={cerrar}
                disabled={borrando}
                className="a-etiqueta a-boton a-boton--linea"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
