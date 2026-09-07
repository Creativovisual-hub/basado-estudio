"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/* ---------------------------------------------------------------------------
   Menú lateral del panel.

   Fijo en escritorio y plegado arriba en móvil. Marca dónde estás, que en un
   panel importa más que en una web: aquí se entra a hacer una tarea concreta
   y hay que saber en todo momento sobre qué se está trabajando.
--------------------------------------------------------------------------- */

const ENLACES = [
  { href: "/admin", texto: "Proyectos" },
  { href: "/admin/orden", texto: "Orden en la portada" },
  { href: "/admin/cuenta", texto: "Mi cuenta" },
];

export default function Barra({ salir }: { salir: () => Promise<void> }) {
  const ruta = usePathname();

  const activo = (href: string) =>
    href === "/admin" ? ruta === "/admin" || ruta.startsWith("/admin/proyecto") : ruta === href;

  return (
    <aside className="border-b border-line md:sticky md:top-0 md:h-svh md:w-[15rem] md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-8 px-6 py-6 md:px-7 md:py-9">
        <Link href="/admin" className="t-meta shrink-0" style={{ letterSpacing: "0.09em" }}>
          {site.name}
          <span className="mt-1 block opacity-40">Panel</span>
        </Link>

        <nav className="flex-1" aria-label="Secciones del panel">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 md:flex-col md:gap-y-4">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={activo(e.href) ? "page" : undefined}
                  className={`t-meta link-underline transition-opacity duration-300 ${
                    activo(e.href) ? "opacity-100" : "opacity-45 hover:opacity-100"
                  }`}
                  data-active={activo(e.href) ? "true" : undefined}
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
