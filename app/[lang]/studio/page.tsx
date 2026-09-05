import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDict, isLocale, localePath } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Reveal, RevealLines } from "@/components/Reveal";
import CaseImage from "@/components/CaseImage";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.studioTitle,
    description: t.meta.studioDescription,
    alternates: {
      canonical: `/${lang}/studio`,
      languages: {
        es: `${site.url}/es/studio`,
        en: `${site.url}/en/studio`,
        "x-default": `${site.url}/es/studio`,
      },
    },
  };
}

export default async function StudioPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      {/* El manifiesto es la imagen de la página. */}
      <section
        className="gutter pb-[14vh]"
        style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
      >
        <Reveal on="mount" className="t-meta mb-14 opacity-45">
          <p>{t.studio.tag}</p>
        </Reveal>

        <h1 className="t-head">
          <RevealLines lines={t.studio.titleLines} stagger={0.09} on="mount" />
        </h1>

        <div className="mt-[10vh] grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-[clamp(1.5rem,3.4vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.035em]">
              <RevealLines
                lines={t.studio.manifesto}
                stagger={0.075}
                on="mount"
                delay={0.35}
              />
            </p>
            <Reveal on="mount" delay={0.85}>
              <p className="t-head mt-14 max-w-[14ch]">{t.studio.claim}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <CaseImage
        src="/img/studio/studio-01.svg"
        alt={t.studio.imageAlt}
        ratio={16 / 9}
      />

      <section className="gutter py-(--spacing-section)">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <Reveal className="t-meta md:col-span-3">
            <h2 className="opacity-45">{t.studio.howTag}</h2>
          </Reveal>

          <div className="md:col-span-8 md:col-start-5">
            {t.studio.how.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className={`t-body max-w-[54ch] ${i > 0 ? "mt-8 opacity-70" : ""}`}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="gutter border-t border-line py-(--spacing-section)">
        <dl className="grid grid-cols-1 gap-14 md:grid-cols-3">
          {t.studio.facts.map(([k, v], i) => (
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
          <Link href={localePath(lang, "work")} className="t-head link-underline inline-block">
            {t.studio.link}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
