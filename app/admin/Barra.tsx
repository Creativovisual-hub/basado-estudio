"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

/* ---------------------------------------------------------------------------
   Barra lateral del panel.

   Iconos y etiqueta, con la sección activa marcada por una pastilla llena.
   En un tablero se entra a hacer una tarea concreta y hay que ver de un
   vistazo dónde se está; en la web bastaba un subrayado, aquí no.

   Los iconos son trazos propios, no una librería: son cuatro dibujos de
   líneas y traerse un paquete entero para eso engordaría la descarga sin
   ganar nada.
--------------------------------------------------------------------------- */

const ICONO = {
  proyectos: "M3 6h18M3 12h18M3 18h10",
  orden: "M8 4v16M8 4L4 8M8 4l4 4M16 20V4M16 20l-4-4M16 20l4-4",
  cuenta: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  traer: "M12 3v12M12 15l-4-4M12 15l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
} as const;

const ENLACES = [
  { href: "/admin", texto: "Proyectos", icono: ICONO.proyectos },
  { href: "/admin/orden", texto: "Orden en la portada", icono: ICONO.orden },
  { href: "/admin/migrar", texto: "Traer de Adobe", icono: ICONO.traer },
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

export default function Barra({ salir }: { salir: () => Promise<void> }) {
  const ruta = usePathname();

  const activo = (href: string) =>
    href === "/admin"
      ? ruta === "/admin" || ruta.startsWith("/admin/proyecto")
      : ruta === href;

  return (
    <aside className="a-barra sticky top-0 z-40 md:h-[calc(100svh-3px)] md:w-[17rem] md:shrink-0">
      <div className="flex h-full flex-col gap-8 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            {/* La misma B del icono del sitio, en pequeño. */}
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-[10px] bg-fg text-[0.95rem] font-semibold text-bg"
            >
              B
            </span>
            <span className="t-meta leading-tight">
              {site.shortName}
              <span className="mt-1 block opacity-40">Panel</span>
            </span>
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
                  className="t-meta a-nav"
                >
                  <Trazo d={e.icono} />
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          <a href="/es" target="_blank" rel="noreferrer" className="t-meta a-nav">
            <Trazo d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            Ver la web
          </a>
          <form action={salir} className="contents">
            <button type="submit" className="t-meta a-nav w-full text-left">
              <Trazo d="M15 17l5-5-5-5M20 12H9M12 20H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
              Salir
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
