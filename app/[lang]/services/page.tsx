import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDict, isLocale, localePath } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Reveal, RevealLines } from "@/components/Reveal";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.servicesTitle,
    description: t.meta.servicesDescription,
    alternates: {
      canonical: `/${lang}/services`,
      languages: {
        es: `${site.url}/es/services`,
        en: `${site.url}/en/services`,
        "x-default": `${site.url}/es/services`,
      },
    },
  };
}

export default async function ServicesPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      <section
        className="gutter pb-[10vh]"
        style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
      >
        <Reveal on="mount" className="t-meta mb-6 opacity-45 md:mb-8">
          <p>{t.services.tag}</p>
        </Reveal>
        <h1 className="t-head max-w-[14ch]">
          <RevealLines lines={t.services.titleLines} stagger={0.09} on="mount" />
        </h1>
      </section>

      {/* Lista tipográfica: sin iconos, sin tarjetas. */}
      <section className="gutter pb-(--spacing-section)">
        <ul className="border-t border-line">
          {t.services.items.map((s, i) => (
            <Reveal as="li" key={s.name} delay={i * 0.06}>
              <div className="group grid grid-cols-1 gap-6 border-b border-line py-10 md:grid-cols-12 md:items-start md:py-14">
                <span className="t-meta opacity-35 md:col-span-1">0{i + 1}</span>
                <h2 className="text-[clamp(2rem,5.2vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.045em] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:col-span-6 md:group-hover:translate-x-3">
                  {s.name}
                </h2>
                <p className="t-body max-w-[40ch] opacity-65 md:col-span-5">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="bg-inv text-inv-fg">
        <div className="gutter py-(--spacing-section)">
          <h2 className="t-head">
            <RevealLines lines={t.services.ctaLines} stagger={0.08} />
          </h2>
          <Reveal delay={0.2}>
            <Link
              href={localePath(lang, "contact")}
              className="t-meta link-underline mt-12 inline-block"
            >
              {t.services.ctaLink}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
