import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProyectos } from "@/lib/contenido";
import { getDict, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import ProjectGrid from "@/components/ProjectGrid";
import { Reveal, RevealLines } from "@/components/Reveal";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.workTitle,
    description: t.meta.workDescription,
    alternates: {
      canonical: `/${lang}/work`,
      languages: {
        es: `${site.url}/es/work`,
        en: `${site.url}/en/work`,
        "x-default": `${site.url}/es/work`,
      },
    },
  };
}

export default async function WorkPage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const projects = await getProyectos(lang);

  return (
    <>
      <section
        className="gutter pb-[10vh]"
        style={{ paddingTop: "calc(var(--header-h) + 18vh)" }}
      >
        <h1 className="t-head">
          <RevealLines lines={t.work.titleLines} stagger={0.09} on="mount" />
        </h1>
        <Reveal on="mount" delay={0.35} className="t-meta mt-10 opacity-45">
          <p>{t.work.count(projects.length)}</p>
        </Reveal>
      </section>

      <ProjectGrid items={projects} locale={lang} />

      <div className="h-[var(--pad)]" />
    </>
  );
}
