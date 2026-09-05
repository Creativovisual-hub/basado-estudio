import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { site } from "@/lib/site";
import { getDict, htmlLang, isLocale, locales, type Locale } from "@/lib/i18n";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";
import Cursor from "@/components/Cursor";
import HtmlLang from "@/components/HtmlLang";

type Params = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** Enlaces hreflang: cada página declara su equivalente en el otro idioma. */
export const languageAlternates = (path = "") => ({
  es: `${site.url}/es${path}`,
  en: `${site.url}/en${path}`,
  "x-default": `${site.url}/es${path}`,
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);

  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.homeTitle, template: "%s — BASADO ESTUDIO" },
    description: t.meta.homeDescription,
    authors: [{ name: site.shortName }],
    alternates: { canonical: `/${lang}`, languages: languageAlternates() },
    openGraph: {
      type: "website",
      locale: htmlLang[lang],
      url: `${site.url}/${lang}`,
      siteName: site.name,
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: t.meta.orgDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDict(locale);

  return (
    <>
      {/* El <html> se pinta en el layout raíz; aquí sólo se le fija el idioma. */}
      <HtmlLang lang={htmlLang[locale]} />

      <a
        href="#contenido"
        className="t-meta sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-inv focus:px-4 focus:py-3 focus:text-inv-fg"
      >
        {t.common.skipToContent}
      </a>

      <SmoothScroll />
      <Cursor />
      <Header locale={locale} />

      <main id="contenido">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer locale={locale} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.shortName,
            url: `${site.url}/${locale}`,
            description: t.meta.orgDescription,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Santiago",
              addressCountry: "CL",
            },
            email: site.email,
            sameAs: [site.social.instagram, site.social.behance],
          }),
        }}
      />
    </>
  );
}
