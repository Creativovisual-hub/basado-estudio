import type { MetadataRoute } from "next";
import { slugsDeProyecto } from "@/lib/contenido";
import { locales } from "@/lib/i18n";
import { site } from "@/lib/site";

const SECTIONS = ["", "work", "studio", "services", "contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await slugsDeProyecto();

  return locales.flatMap((lang) => [
    ...SECTIONS.map((s) => ({
      url: s ? `${site.url}/${lang}/${s}` : `${site.url}/${lang}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: s ? 0.8 : 1,
    })),
    ...slugs.map((slug) => ({
      url: `${site.url}/${lang}/work/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ]);
}
