import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealLines } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Identidad visual, branding, dirección de arte y diseño web. Basado Estudio, Santiago de Chile.",
  alternates: { canonical: "/servicios" },
};

const servicios = [
  {
    name: "Identidad Visual",
    text: "Marca, símbolo, tipografía, color y el sistema completo que los mantiene coherentes en cualquier soporte.",
  },
  {
    name: "Branding",
    text: "Posicionamiento, relato y arquitectura de marca. Lo que la marca dice, antes de cómo se ve.",
  },
  {
    name: "Dirección de Arte",
    text: "Criterio visual sostenido en el tiempo: campañas, fotografía, editorial y contenido.",
  },
  {
    name: "Diseño Web",
    text: "Sitios diseñados y construidos por el estudio, rápidos, accesibles y fieles a la identidad.",
  },
];

export default function ServiciosPage() {
  return (
    <>
      <section
        className="gutter pb-[10vh]"
        style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
      >
        <p className="t-meta mb-14 opacity-45">(Servicios)</p>
        <h1 className="t-head max-w-[14ch]">
          <RevealLines lines={["Lo que", "hacemos."]} stagger={0.09} />
        </h1>
      </section>

      {/* Lista tipográfica: sin iconos, sin tarjetas. */}
      <section className="gutter pb-(--spacing-section)">
        <ul className="border-t border-line">
          {servicios.map((s, i) => (
            <Reveal as="li" key={s.name} delay={i * 0.06}>
              <div className="group grid grid-cols-1 gap-6 border-b border-line py-10 md:grid-cols-12 md:items-start md:py-14">
                <span className="t-meta opacity-35 md:col-span-1">
                  0{i + 1}
                </span>
                <h2 className="text-[clamp(2rem,5.2vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.045em] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:col-span-6 md:group-hover:translate-x-3">
                  {s.name}
                </h2>
                <p className="t-body max-w-[40ch] opacity-65 md:col-span-5">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="bg-ink text-bone">
        <div className="gutter py-(--spacing-section)">
          <h2 className="t-head">
            <RevealLines lines={["¿Empezamos", "por algo real?"]} stagger={0.08} />
          </h2>
          <Reveal delay={0.2}>
            <Link href="/contacto" className="t-meta link-underline mt-12 inline-block">
              Escribir al estudio
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
