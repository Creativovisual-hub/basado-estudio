import Link from "next/link";
import { projects } from "@/lib/projects";
import ProjectGrid from "@/components/ProjectGrid";
import { Reveal, RevealLines } from "@/components/Reveal";
import { site } from "@/lib/site";

export default function Home() {
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
          <RevealLines lines={["BASADO", "EN ALGO REAL."]} delay={0.15} stagger={0.1} />
        </h1>

        <div className="mt-[9vh] grid grid-cols-1 gap-8 md:mt-[7vh] md:grid-cols-12 md:items-end">
          <Reveal delay={0.5} className="md:col-span-6 md:col-start-1">
            <p className="t-body max-w-[38ch] text-balance">
              Estudio creativo especializado en identidad visual y branding.
            </p>
          </Reveal>

          <Reveal delay={0.6} className="t-meta md:col-span-3 md:col-start-8 md:pb-1">
            <p className="opacity-55">{site.location}</p>
          </Reveal>

          <Reveal delay={0.65} className="t-meta md:col-span-2 md:col-start-11 md:pb-1 md:text-right">
            <span className="opacity-55">Índice — {projects.length} proyectos</span>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Portfolio. Entra inmediatamente después del hero, a sangre.
      ----------------------------------------------------------------*/}
      <section aria-labelledby="portfolio-titulo" className="pt-[var(--pad)]">
        <h2 id="portfolio-titulo" className="sr-only">
          Proyectos seleccionados
        </h2>
        <ProjectGrid items={projects} />
      </section>

      {/* ---------------------------------------------------------------
          Bloque estudio, corto. La página completa vive en /estudio.
      ----------------------------------------------------------------*/}
      <section className="gutter py-(--spacing-section)">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <Reveal className="t-meta md:col-span-3">
            <span className="opacity-45">(Estudio)</span>
          </Reveal>

          <div className="md:col-span-9">
            <h2 className="t-head max-w-[16ch]">
              <RevealLines
                lines={["Diseñamos marcas", "basadas en algo real."]}
                stagger={0.08}
              />
            </h2>
            <Reveal delay={0.25} className="mt-12 max-w-[54ch]">
              <p className="t-body opacity-70">
                Trabajamos en pocos proyectos al año, de principio a fin y con el
                cliente dentro del proceso. Sin plantillas, sin capas decorativas
                y sin nada que la marca no pueda sostener.
              </p>
              <Link href="/estudio" className="t-meta link-underline mt-10 inline-block">
                Conocer el estudio
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Cierre: llamada a contacto en tinta plena.
      ----------------------------------------------------------------*/}
      <section className="bg-ink text-bone">
        <div className="gutter py-(--spacing-section)">
          <h2 className="t-head">
            <RevealLines lines={["¿Tienes algo", "en mente?"]} stagger={0.08} />
          </h2>
          <Reveal delay={0.2}>
            <Link
              href="/contacto"
              className="t-head link-underline mt-2 inline-block opacity-45 transition-opacity duration-500 hover:opacity-100"
            >
              Hablemos.
            </Link>
          </Reveal>
        </div>

        {/* Marquesina de servicios */}
        <div className="marquee overflow-hidden border-t border-bone/15 py-6" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0">
                {[
                  "Identidad Visual",
                  "Branding",
                  "Dirección de Arte",
                  "Diseño Web",
                ].map((s) => (
                  <span
                    key={s}
                    className="t-meta px-8 opacity-60"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    {s} ·
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
