import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDict, isLocale } from "@/lib/i18n";
import { site, instagramHandle, behanceLabel } from "@/lib/site";
import { Reveal, RevealLines } from "@/components/Reveal";
import ContactLink from "@/components/ContactLink";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.contactTitle,
    description: t.meta.contactDescription,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: {
        es: `${site.url}/es/contact`,
        en: `${site.url}/en/contact`,
        "x-default": `${site.url}/es/contact`,
      },
    },
  };
}

export default async function ContactPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  const canales = [
    { label: t.contact.channels.email, value: site.email, href: `mailto:${site.email}`, canal: "email" },
    { label: t.contact.channels.instagram, value: instagramHandle, href: site.social.instagram, canal: "instagram" },
    { label: t.contact.channels.behance, value: behanceLabel, href: site.social.behance, canal: "behance" },
  ];

  return (
    <section
      className="gutter flex min-h-[100svh] flex-col justify-between pb-[12vh]"
      style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
    >
      <div>
        <Reveal on="mount" className="t-meta mb-6 opacity-45 md:mb-8">
          <p>{t.contact.tag}</p>
        </Reveal>
        <h1 className="t-head max-w-[16ch]">
          <RevealLines lines={t.contact.titleLines} stagger={0.09} on="mount" />
        </h1>
      </div>

      <ul className="mt-[14vh] grid grid-cols-1 gap-10 md:grid-cols-3">
        {canales.map((c, i) => (
          <Reveal as="li" key={c.label} on="mount" delay={0.55 + i * 0.09}>
            <p className="t-meta opacity-40">{c.label}</p>
            <ContactLink
              href={c.href}
              canal={c.canal}
              className="link-underline mt-4 inline-block text-[clamp(1.25rem,2.4vw,2rem)] font-medium leading-none tracking-[-0.035em]"
            >
              {c.value}
            </ContactLink>
          </Reveal>
        ))}
      </ul>

      <Reveal on="mount" delay={0.9} className="t-meta mt-16 opacity-45">
        <p>
          {site.location} — {t.contact.note}
        </p>
      </Reveal>
    </section>
  );
}
