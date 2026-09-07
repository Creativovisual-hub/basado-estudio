import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // El panel queda fuera de los buscadores. Las páginas ya lo piden por su
    // cuenta con una etiqueta, pero esto lo corta antes de que entren.
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
