"use client";

import { useState, useTransition } from "react";
import { reordenarPortada } from "../proyectos";

/* ---------------------------------------------------------------------------
   Orden de la portada, arrastrando.

   Se reordena en pantalla al soltar y se guarda por detrás. Esperar la
   respuesta del servidor para mover una fila haría que arrastrar se sintiera
   pegajoso, y aquí el gesto tiene que ir por delante.

   Con teclado no se puede arrastrar, así que cada fila se puede enfocar con
   el tabulador y moverse con Alt + flecha arriba o abajo. Sin eso, esta
   pantalla sería inutilizable para quien no maneja un ratón, y las flechas
   dibujadas en cada fila ensuciaban la lista.
--------------------------------------------------------------------------- */

type Fila = {
  id: string;
  nombre: string;
  slug: string;
  miniatura: string | null;
};

export default function Arrastrable({ inicial }: { inicial: Fila[] }) {
  const [lista, setLista] = useState(inicial);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [, iniciar] = useTransition();

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

  return (
    <ul className="a-panel flex flex-col gap-1 p-4 md:p-5">
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
          className={`a-fila flex cursor-grab items-center gap-4 px-2 py-3 transition-opacity ${
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

          <span className="t-meta w-5 shrink-0 opacity-35">{i + 1}</span>

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
            <span className="t-meta mt-1 block opacity-40">/{p.slug}</span>
          </span>

        </li>
      ))}
    </ul>
  );
}
