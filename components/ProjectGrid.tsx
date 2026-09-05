import Link from "next/link";
import type { Project } from "@/lib/projects";
import { getDict, localePath, type Locale } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import Parallax from "./Parallax";

/**
 * Índice de portfolio: rejilla a sangre completa, sin contenedor ni tarjetas.
 * Dos columnas en desktop con un gutter mínimo; una columna a ancho total
 * en móvil. La imagen es el elemento; el texto sólo la acompaña.
 */
export default function ProjectGrid({
  items,
  locale,
}: {
  items: Project[];
  locale: Locale;
}) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--gutter)" }}>
      {items.map((p, i) => (
        <Reveal key={p.slug} as="li" y={40} delay={(i % 2) * 0.08}>
          <ProjectTile project={p} index={i} locale={locale} />
        </Reveal>
      ))}
    </ul>
  );
}

function ProjectTile({
  project: p,
  index,
  locale,
}: {
  project: Project;
  index: number;
  locale: Locale;
}) {
  const t = getDict(locale);

  return (
    <Link
      href={localePath(locale, `work/${p.slug}`)}
      data-cursor={t.project.viewProject}
      className="group block focus-visible:outline-offset-[-3px]"
      aria-label={`${p.name} — ${p.category}${p.year ? `, ${p.year}` : ""}`}
    >
      <div className="relative aspect-square overflow-hidden bg-shade">
        {/* La imagen sigue al cursor con inercia dentro de su propio marco. */}
        <div className="absolute inset-0">
          <Parallax amp={18} zoom={1.05}>
            <img
              src={p.cover.src}
              srcSet={p.cover.srcSet}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt=""
              loading={index < 2 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </Parallax>
        </div>

        {/* Sobreimpresión de escritorio: el nombre entra desde abajo en hover.
            Va sobre un velo oscuro porque las portadas reales traen
            fotografía y color, no fondos planos. Por eso usa blanco fijo y
            no el color invertido del tema. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden items-end md:flex"
        >
          <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/40" />
          <div className="relative w-full overflow-hidden px-[var(--pad)] pb-[var(--pad)]">
            <div className="translate-y-[110%] transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0">
              <span className="t-project block text-white">{p.name}</span>
              <span className="t-meta mt-3 block text-white/70">
                {p.category}
                {p.year ? ` — ${p.year}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Móvil: la ficha vive bajo la imagen, siempre visible */}
      <div className="gutter flex items-baseline justify-between py-4 md:hidden">
        <span className="text-[1.375rem] font-semibold leading-none tracking-[-0.04em]">
          {p.name}
        </span>
        {p.year && <span className="t-meta opacity-55">{p.year}</span>}
      </div>
      <div className="gutter t-meta pb-8 opacity-55 md:hidden">{p.category}</div>
    </Link>
  );
}
