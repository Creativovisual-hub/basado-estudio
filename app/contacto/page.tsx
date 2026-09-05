import type { Metadata } from "next";
import { Reveal, RevealLines } from "@/components/Reveal";
import { site, instagramHandle, behanceLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: `¿Tienes algo en mente? Hablemos. ${site.shortName} — ${site.email}, ${site.location}.`,
  alternates: { canonical: "/contacto" },
};

const canales = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Instagram", value: instagramHandle, href: site.social.instagram },
  { label: "Behance", value: behanceLabel, href: site.social.behance },
];

export default function ContactoPage() {
  return (
    <section
      className="gutter flex min-h-[100svh] flex-col justify-between pb-[12vh]"
      style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
    >
      <div>
        <Reveal on="mount" className="t-meta mb-14 opacity-45"><p>(Contacto)</p></Reveal>
        <h1 className="t-head max-w-[16ch]">
          <RevealLines
            lines={["¿Tienes algo", "en mente?", "Hablemos."]}
            stagger={0.09}
            on="mount"
          />
        </h1>
      </div>

      <ul className="mt-[14vh] grid grid-cols-1 gap-10 md:grid-cols-3">
        {canales.map((c, i) => (
          <Reveal as="li" key={c.label} on="mount" delay={0.55 + i * 0.09}>
            <p className="t-meta opacity-40">{c.label}</p>
            <a
              href={c.href}
              {...(c.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
              className="link-underline mt-4 inline-block text-[clamp(1.25rem,2.4vw,2rem)] font-medium leading-none tracking-[-0.035em]"
            >
              {c.value}
            </a>
          </Reveal>
        ))}
      </ul>

      <Reveal on="mount" delay={0.9} className="t-meta mt-16 opacity-45">
        <p>{site.location} — Respondemos en 48 horas hábiles.</p>
      </Reveal>
    </section>
  );
}
