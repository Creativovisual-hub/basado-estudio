"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

/* ---------------------------------------------------------------------------
   Barra lateral del panel.

   Se pliega a sólo iconos. Trabajando en la ficha de un proyecto —ancha, con
   los campos en dos columnas y las imágenes en tres— esos 17 rem de menú
   estorban; plegada quedan 4,5.

   La elección se recuerda en el navegador. Un menú que hay que volver a
   plegar en cada visita acaba siendo peor que no poder plegarlo.

   Los iconos son trazos propios, no una librería: son unos pocos dibujos de
   líneas y traerse un paquete entero para eso engordaría la descarga sin
   ganar nada.
--------------------------------------------------------------------------- */

const CLAVE = "panel-plegado";

const ICONO = {
  proyectos: "M3 6h18M3 12h18M3 18h10",
  orden: "M8 4v16M8 4L4 8M8 4l4 4M16 20V4M16 20l-4-4M16 20l4-4",
  analitica: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  cuenta: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  guia: "M12 17h.01M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18",
} as const;

const ENLACES = [
  { href: "/admin", texto: "Proyectos", icono: ICONO.proyectos },
  { href: "/admin/orden", texto: "Orden en la portada", icono: ICONO.orden },
  { href: "/admin/analitica", texto: "Analítica", icono: ICONO.analitica },
  { href: "/admin/cuenta", texto: "Mi cuenta", icono: ICONO.cuenta },
];

function Trazo({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

export default function Barra({
  salir,
  logo,
}: {
  salir: () => Promise<void>;
  /* El logotipo llega dibujado desde el servidor: mira el disco por si hay
     un archivo propio, y eso no puede hacerse en el navegador. */
  logo: React.ReactNode;
}) {
  const ruta = usePathname();
  const [plegada, setPlegada] = useState(false);

  // Se lee tras montar, no durante el pintado del servidor: allí no existe
  // el almacenamiento del navegador y habría un desajuste de hidratación.
  useEffect(() => {
    try {
      setPlegada(localStorage.getItem(CLAVE) === "si");
    } catch {}
  }, []);

  function alternar() {
    setPlegada((antes) => {
      const ahora = !antes;
      try {
        localStorage.setItem(CLAVE, ahora ? "si" : "no");
      } catch {}
      return ahora;
    });
  }

  const activo = (href: string) =>
    href === "/admin"
      ? ruta === "/admin" || ruta.startsWith("/admin/proyecto")
      : ruta === href;

  /* Plegada, el texto sale de la vista pero no del documento: quien navega
     con lector de pantalla sigue oyendo el nombre de cada sección. */
  const etiqueta = plegada ? "md:sr-only" : "";
  const centrar = plegada ? "md:justify-center" : "";

  return (
    <aside
      className={`a-barra sticky top-0 z-40 shrink-0 transition-[width] duration-300 md:h-[calc(100svh-3px)] ${
        plegada ? "md:w-[4.5rem]" : "md:w-[17rem]"
      }`}
    >
      <div className="flex h-full flex-col gap-8 p-4 md:p-5">
        <div
          className={`flex items-center gap-3 ${
            plegada ? "md:flex-col md:gap-4" : "justify-between"
          }`}
        >
          <Link
            href="/admin"
            aria-label="Panel de BASADO ESTUDIO"
            className={plegada ? "md:hidden" : ""}
          >
            {logo}
          </Link>
          <ThemeToggle label="Cambiar entre modo claro y oscuro" />
        </div>

        <nav className="flex-1" aria-label="Secciones del panel">
          <ul className="flex flex-wrap gap-2 md:flex-col md:gap-1">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={activo(e.href) ? "page" : undefined}
                  data-activo={activo(e.href) ? "true" : "false"}
                  title={plegada ? e.texto : undefined}
                  className={`t-meta a-nav ${centrar}`}
                >
                  <Trazo d={e.icono} />
                  <span className={etiqueta}>{e.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          {/* Relanza la guía. No es una sección: por eso va con las acciones
              del final, no en la navegación. */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("abrir-guia"))}
            title={plegada ? "Ver la guía" : undefined}
            className={`t-meta a-nav w-full text-left ${centrar}`}
          >
            <Trazo d={ICONO.guia} />
            <span className={etiqueta}>Ver la guía</span>
          </button>

          <a
            href="/es"
            target="_blank"
            rel="noreferrer"
            title={plegada ? "Ver la web" : undefined}
            className={`t-meta a-nav ${centrar}`}
          >
            <Trazo d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            <span className={etiqueta}>Ver la web</span>
          </a>

          <form action={salir} className="contents">
            <button
              type="submit"
              title={plegada ? "Salir" : undefined}
              className={`t-meta a-nav w-full text-left ${centrar}`}
            >
              <Trazo d="M15 17l5-5-5-5M20 12H9M12 20H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
              <span className={etiqueta}>Salir</span>
            </button>
          </form>

          {/* Plegar es una acción sobre el panel, no una sección: va la
              última y sin destacar, para no competir con la navegación. */}
          <button
            type="button"
            onClick={alternar}
            aria-expanded={!plegada}
            title={plegada ? "Desplegar menú" : undefined}
            className={`t-meta a-nav hidden w-full text-left md:flex ${centrar}`}
          >
            <Trazo d={plegada ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
            <span className={etiqueta}>Plegar menú</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
