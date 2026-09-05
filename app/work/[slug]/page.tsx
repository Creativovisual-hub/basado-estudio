import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects, getProject, adjacentProjects } from "@/lib/projects";
import CaseImage from "@/components/CaseImage";
import { Reveal, RevealLines } from "@/components/Reveal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Proyecto no encontrado" };

  return {
    title: `${p.name} — ${p.category}`,
    description: p.intro.slice(0, 160),
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      title: `${p.name} — ${p.category} — BASADO ESTUDIO`,
      description: p.intro.slice(0, 160),
      type: "article",
      images: [{ url: p.cover.src }],
    },
  };
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const [next, after] = adjacentProjects(p.slug);

  /*
   * Los proyectos vienen del portfolio como una secuencia de láminas, casi
   * todas 16:9. Se presentan a sangre completa y en orden, y los textos
   * publicados (cuando existen) se reparten como respiros entre ellas.
   */
  const notes = [...p.notes];
  const noteAfter = new Map<number, string[]>();
  if (notes.length) {
    const stops = [1, 3, 5, 7].filter((i) => i < p.images.length - 1);
    const perStop = Math.ceil(notes.length / Math.max(stops.length, 1));
    stops.forEach((stop, i) => {
      const slice = notes.slice(i * perStop, (i + 1) * perStop);
      if (slice.length) noteAfter.set(stop, slice);
    });
  }

  return (
    <article>
      {/* --------------------------------------------------------------
          Cabecera: nombre, categoría, año. Ficha a la izquierda,
          introducción centrada. Poco texto, mucho aire.
      ---------------------------------------------------------------*/}
      <header
        className="gutter pb-[8vh]"
        style={{ paddingTop: "calc(var(--header-h) + 16vh)" }}
      >
        <p className="t-meta mb-8 opacity-45">
          <Link href="/work" className="link-underline">
            Work
          </Link>
          <span className="mx-2">/</span>
          {p.category}
        </p>

        <h1 className={`t-display ${p.name.length > 14 ? "is-long" : ""}`}>
          <RevealLines lines={[p.name]} delay={0.1} />
        </h1>

        <Reveal delay={0.35}>
          <dl className="t-meta mt-12 grid grid-cols-2 gap-y-6 border-t border-line pt-6 md:grid-cols-4">
            <div>
              <dt className="opacity-40">Cliente</dt>
              <dd className="mt-2">{p.client}</dd>
            </div>
            <div>
              <dt className="opacity-40">Categoría</dt>
              <dd className="mt-2">{p.category}</dd>
            </div>
            <div>
              <dt className="opacity-40">Servicios</dt>
              <dd className="mt-2">
                {p.services.map((s) => (
                  <span key={s} className="block">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
            {p.year && (
              <div>
                <dt className="opacity-40">Año</dt>
                <dd className="mt-2">{p.year}</dd>
              </div>
            )}
          </dl>
        </Reveal>
      </header>

      <Reveal delay={0.15} className="gutter pb-[10vh]">
        <p className="t-body mx-auto max-w-[62ch] text-balance md:text-center">
          {p.intro}
        </p>
      </Reveal>

      {/* --------------------------------------------------------------
          Recorrido visual a sangre completa.
      ---------------------------------------------------------------*/}
      <div className="flex flex-col" style={{ gap: "var(--gutter)" }}>
        {p.images.map((img, i) => (
          <div key={img.src} className="contents">
            <CaseImage
              src={img.src}
              srcSet={img.srcSet}
              sizes="100vw"
              alt={`${p.name} — lámina ${i + 1} de ${p.images.length}`}
              ratio={img.ratio}
              priority={i === 0}
            />

            {noteAfter.has(i) && (
              <section className="gutter py-[12vh]">
                <div className="mx-auto max-w-[60ch] space-y-5">
                  {noteAfter.get(i)!.map((t, n) => (
                    <Reveal key={n} delay={n * 0.06}>
                      <p className="t-body">{t}</p>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
          </div>
        ))}
      </div>

      {/* --------------------------------------------------------------
          Siguiente proyecto
      ---------------------------------------------------------------*/}
      <section className="gutter pt-(--spacing-section) pb-10">
        <h2 className="t-meta opacity-45">(Siguiente proyecto)</h2>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--gutter)" }}>
        {[next, after].map((n) => (
          <Link
            key={n.slug}
            href={`/work/${n.slug}`}
            data-cursor="Ver proyecto"
            className="group block"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e7e5e1]">
              <img
                src={n.cover.src}
                srcSet={n.cover.srcSet}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
              />
            </div>
            <div className="gutter flex items-baseline justify-between py-5">
              <span className="text-[clamp(1.25rem,2.2vw,2.25rem)] font-semibold leading-none tracking-[-0.04em]">
                {n.name}
              </span>
              <span className="t-meta opacity-50">{n.year ?? n.category}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="h-[10vh]" />
    </article>
  );
}
