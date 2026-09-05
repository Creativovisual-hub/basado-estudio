import type { MetadataRoute } from "next";
import { projectSlugs } from "@/lib/projects";
import { locales } from "@/lib/i18n";
import { site } from "@/lib/site";

const SECTIONS = ["", "work", "studio", "services", "contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const slugs = projectSlugs();

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
