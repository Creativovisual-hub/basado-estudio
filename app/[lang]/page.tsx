import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjects } from "@/lib/projects";
import { getDict, isLocale, localePath } from "@/lib/i18n";
import ProjectGrid from "@/components/ProjectGrid";
import { Reveal, RevealLines } from "@/components/Reveal";
import { site } from "@/lib/site";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const projects = getProjects(lang);

  return (
    <>
      {/* ---------------------------------------------------------------
          Hero editorial. La tipografía es la única imagen.
      ----------------------------------------------------------------*/}
      <section
        className="gutter flex min-h-[100svh] flex-col justify-end pb-[var(--pad)]"
        style={{ paddingTop: "calc(var(--header-h) + 8vh)" }}
      >
        <h1 className="t-display">
          <RevealLines lines={t.home.heroLines} delay={0.15} stagger={0.1} on="mount" />
        </h1>

        <div className="mt-[9vh] grid grid-cols-1 gap-8 md:mt-[7vh] md:grid-cols-12 md:items-end">
          <Reveal on="mount" delay={0.5} className="md:col-span-6 md:col-start-1">
            <p className="t-body max-w-[38ch] text-balance">{t.home.support}</p>
          </Reveal>

          <Reveal on="mount" delay={0.6} className="t-meta md:col-span-3 md:col-start-8 md:pb-1">
            <p className="opacity-55">{site.location}</p>
          </Reveal>

          <Reveal
            on="mount"
            delay={0.68}
            className="t-meta md:col-span-2 md:col-start-11 md:pb-1 md:text-right"
          >
            <span className="opacity-55">{t.home.indexCount(projects.length)}</span>
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
