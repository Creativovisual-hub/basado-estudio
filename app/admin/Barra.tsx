"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

/* ---------------------------------------------------------------------------
   Menú lateral del panel.

   Vidrio y pegado al lado, como la cabecera del sitio: al bajar por una
   ficha larga el contenido pasa por detrás desenfocado y el menú sigue
   legible sin cortar la página con una banda opaca.

   Marca dónde estás, que en un panel importa más que en una web: aquí se
   entra a hacer una tarea concreta y hay que saber en todo momento sobre qué
   se está trabajando.
--------------------------------------------------------------------------- */

const ENLACES = [
  { href: "/admin", texto: "Proyectos" },
  { href: "/admin/orden", texto: "Orden en la portada" },
  { href: "/admin/cuenta", texto: "Mi cuenta" },
];

export default function Barra({ salir }: { salir: () => Promise<void> }) {
  const ruta = usePathname();

  const activo = (href: string) =>
    href === "/admin"
      ? ruta === "/admin" || ruta.startsWith("/admin/proyecto")
      : ruta === href;

  return (
    <aside className="vidrio sticky top-0 z-40 border-b border-line md:h-svh md:w-[16rem] md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-10 px-6 py-5 md:px-7 md:py-9">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="t-meta" style={{ letterSpacing: "0.09em" }}>
            {site.name}
            <span className="mt-1.5 block opacity-40">Panel</span>
          </Link>
          <ThemeToggle label="Cambiar entre modo claro y oscuro" />
        </div>

        <nav className="flex-1" aria-label="Secciones del panel">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 md:flex-col md:gap-y-1">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={activo(e.href) ? "page" : undefined}
                  className={`t-meta -mx-3 flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors duration-300 md:mx-0 ${
                    activo(e.href)
                      ? "bg-[color-mix(in_srgb,var(--c-fg)_8%,transparent)] opacity-100"
                      : "opacity-45 hover:opacity-100"
                  }`}
                >
                  {/* Filete que sólo aparece en la sección activa. */}
                  <span
                    aria-hidden="true"
                    className={`hidden h-3.5 w-px md:block ${
                      activo(e.href) ? "bg-fg" : "bg-transparent"
                    }`}
                  />
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:flex-col md:items-start md:gap-y-3">
          <a
            href="/es"
            target="_blank"
            rel="noreferrer"
            className="t-meta link-underline opacity-45 transition-opacity hover:opacity-100"
          >
            Ver la web ↗
          </a>
          <form action={salir}>
            <button
              type="submit"
              className="t-meta link-underline opacity-45 transition-opacity hover:opacity-100"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
