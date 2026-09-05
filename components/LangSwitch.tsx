"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabel, type Locale } from "@/lib/i18n";

/**
 * Conmutador de idioma.
 *
 * Cambia sólo el primer segmento de la ruta, así que se mantiene la página
 * en la que está el visitante: /es/work/latin-wok → /en/work/latin-wok.
 */
export default function LangSwitch({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const pathname = usePathname();

  const swap = (locale: Locale) => {
    const rest = pathname.split("/").slice(2).join("/");
    return rest ? `/${locale}/${rest}` : `/${locale}`;
  };

  return (
    <div className="t-meta flex items-center gap-1" aria-label={label}>
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="opacity-30">/</span>}
          {locale === current ? (
            <span aria-current="true">{localeLabel[locale]}</span>
          ) : (
            <Link href={swap(locale)} hrefLang={locale} className="opacity-45 transition-opacity duration-300 hover:opacity-100">
              {localeLabel[locale]}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
