import fs from "node:fs";
import path from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjects } from "@/lib/projects";
import { getDict, isLocale, localePath } from "@/lib/i18n";
import ProjectGrid from "@/components/ProjectGrid";
import BaseSection from "@/components/BaseSection";
import { Reveal, RevealLines } from "@/components/Reveal";
import HeroType from "@/components/HeroType";
import { site } from "@/lib/site";
import Preloader, { type MedioIntro } from "@/components/Preloader";

/*
 * Pieza de introducción de la pantalla de carga. Se busca al construir el
 * sitio: si el archivo no está, la pantalla sale igual con el contador sobre
 * negro, sin imagen rota. Basta con dejarlo en public/img/precarga/.
 */
const INTRO_DIR = path.join(process.cwd(), "public", "img", "precarga");
const INTRO: { ext: string; tipo: "video" | "imagen" }[] = [
  { ext: "webm", tipo: "video" },
  { ext: "mp4", tipo: "video" },
  { ext: "gif", tipo: "imagen" },
  { ext: "webp", tipo: "imagen" },
  { ext: "png", tipo: "imagen" },
];

/** Vale cualquiera de los dos nombres, para no depender de acertar uno. */
const INTRO_NOMBRES = ["preloader", "intro"];

function buscarIntro(): MedioIntro {
  for (const nombre of INTRO_NOMBRES) {
    for (const { ext, tipo } of INTRO) {
      if (fs.existsSync(path.join(INTRO_DIR, `${nombre}.${ext}`))) {
        return { src: `/img/precarga/${nombre}.${ext}`, tipo };
      }
    }
  }
  return null;
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const projects = getProjects(lang);

  return (
    <>
      <Preloader medio={buscarIntro()} etiqueta={t.common.loading} />

      {/* ---------------------------------------------------------------
          Hero editorial. La tipografía es la única imagen.
      ----------------------------------------------------------------*/}
      <section
        className="gutter flex min-h-[100svh] flex-col justify-end pb-[var(--pad)]"
        style={{ paddingTop: "calc(var(--header-h) + 8vh)" }}
      >
        <h1 className="t-display" aria-label={t.home.heroLines.join(" ")}>
          <HeroType lines={t.home.heroLines} delay={0.15} stagger={0.1} />
        </h1>

        <div className="mt-[9vh] grid grid-cols-1 gap-8 md:mt-[7vh] md:grid-cols-12 md:items-end">
          <Reveal on="mount" delay={0.5} className="md:col-span-6 md:col-start-1">
            <p className="t-body max-w-[38ch] text-balance">{t.home.support}</p>
          </Reveal>

          {/* Sin el contador, la ubicación se va al borde derecho para que
              la fila no quede con un elemento suelto a medio camino. */}
          <Reveal
            on="mount"
            delay={0.6}
            className="t-meta md:col-span-4 md:col-start-9 md:pb-1 md:text-right"
          >
            <p className="opacity-55">{site.location}</p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Portfolio. Entra inmediatamente después del hero, a sangre.
      ----------------------------------------------------------------*/}
      <section aria-labelledby="portfolio-titulo" className="pt-[var(--pad)]">
        <h2 id="portfolio-titulo" className="sr-only">
          {t.home.projectsHeading}
        </h2>
        <ProjectGrid items={projects} locale={lang} />
      </section>

      {/* ---------------------------------------------------------------
          Manifiesto: pieza oscura con relieve. Corta el ritmo claro del
          portfolio antes de volver al texto editorial.
      ----------------------------------------------------------------*/}
      <BaseSection locale={lang} />

      {/* ---------------------------------------------------------------
          Bloque estudio, corto. La página completa vive en /studio.
      ----------------------------------------------------------------*/}
      <section className="gutter py-(--spacing-section)">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <Reveal className="t-meta md:col-span-3">
            <span className="opacity-45">{t.home.studioTag}</span>
          </Reveal>

          <div className="md:col-span-9">
            <h2 className="t-head max-w-[16ch]">
              <RevealLines lines={t.home.studioLines} stagger={0.08} />
            </h2>
            <Reveal delay={0.25} className="mt-12 max-w-[54ch]">
              <p className="t-body opacity-70">{t.home.studioBody}</p>
              <Link
                href={localePath(lang, "studio")}
                className="t-meta link-underline mt-10 inline-block"
              >
                {t.home.studioLink}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Cierre: llamada a contacto en tinta plena.
      ----------------------------------------------------------------*/}
      <section className="bg-inv text-inv-fg">
        <div className="gutter py-(--spacing-section)">
          <h2 className="t-head">
            <RevealLines lines={t.home.ctaLines} stagger={0.08} />
          </h2>
          <Reveal delay={0.2}>
            <Link
              href={localePath(lang, "contact")}
              className="t-head link-underline mt-2 inline-block opacity-45 transition-opacity duration-500 hover:opacity-100"
            >
              {t.home.ctaLink}
            </Link>
          </Reveal>
        </div>

        {/* Marquesina de servicios */}
        <div
          className="marquee overflow-hidden border-t border-inv-fg/15 py-6"
          aria-hidden="true"
        >
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0">
                {t.services.items.map((s) => (
                  <span
                    key={s.name}
                    className="t-meta px-8 opacity-60"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    {s.name} ·
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
