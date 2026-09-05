import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealLines } from "@/components/Reveal";
import CaseImage from "@/components/CaseImage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Estudio",
  description:
    "Basado Estudio es un estudio creativo de identidad visual y branding en Santiago de Chile. Diseñamos marcas basadas en algo real.",
  alternates: { canonical: "/estudio" },
};

const manifiesto = [
  "Una historia.",
  "Una necesidad.",
  "Una conversación.",
  "Una obsesión.",
  "Una idea.",
];

export default function EstudioPage() {
  return (
    <>
      {/* Composición tipográfica: el manifiesto es la imagen de la página. */}
      <section
        className="gutter pb-[14vh]"
        style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
      >
        <Reveal on="mount" className="t-meta mb-14 opacity-45"><p>(Estudio)</p></Reveal>

        <h1 className="t-head">
          <RevealLines lines={["Todo parte", "de algo."]} stagger={0.09} on="mount" />
        </h1>

        <div className="mt-[10vh] grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-[clamp(1.5rem,3.4vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.035em]">
              <RevealLines lines={manifiesto} stagger={0.075} on="mount" delay={0.35} />
            </p>
            <Reveal on="mount" delay={0.85}>
              <p className="t-head mt-14 max-w-[14ch]">Diseñamos marcas basadas en algo real.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <CaseImage
        src="/img/studio/studio-01.svg"
        alt="Basado Estudio — declaración de principios"
        ratio={16 / 9}
      />

      {/* Cómo trabajamos */}
      <section className="gutter py-(--spacing-section)">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <Reveal className="t-meta md:col-span-3">
            <h2 className="opacity-45">(Cómo trabajamos)</h2>
          </Reveal>

          <div className="md:col-span-8 md:col-start-5">
            <Reveal>
              <p className="t-body max-w-[54ch]">
                Empezamos preguntando. Antes de abrir un archivo pasamos por el
                negocio, el equipo y el cliente final, porque una marca que no
                nace de ahí termina siendo decoración.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="t-body mt-8 max-w-[54ch] opacity-70">
                Tomamos pocos proyectos al año y los llevamos completos: estrategia,
                identidad, sistema gráfico y las piezas donde la marca realmente vive.
                Entregamos manuales que se usan, no que se archivan.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="t-body mt-8 max-w-[54ch] opacity-70">
                Somos un estudio pequeño en Santiago de Chile, y esa escala es una
                decisión: quien conversa contigo es quien diseña.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Datos, en tipografía grande y sin adornos */}
      <section className="gutter border-t border-line py-(--spacing-section)">
        <dl className="grid grid-cols-1 gap-14 md:grid-cols-3">
          {[
            ["Desde", "2019"],
            ["Base", site.location],
            ["Foco", "Identidad y branding"],
          ].map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <dt className="t-meta opacity-45">{k}</dt>
              <dd className="mt-4 text-[clamp(1.75rem,3.4vw,3rem)] font-semibold leading-none tracking-[-0.04em]">
                {v}
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="gutter pb-(--spacing-section)">
        <Reveal>
          <Link href="/work" className="t-head link-underline inline-block">
            Ver el trabajo
          </Link>
        </Reveal>
      </section>
    </>
  );
}
