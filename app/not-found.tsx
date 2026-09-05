import Link from "next/link";
import { getDict, defaultLocale, localePath } from "@/lib/i18n";

/*
 * 404 global. Vive fuera de [lang], así que no conoce el idioma del
 * visitante: se muestra en el idioma por defecto.
 */
export default function NotFound() {
  const t = getDict(defaultLocale);

  return (
    <section
      className="gutter flex min-h-[70svh] flex-col justify-center"
      style={{ paddingTop: "var(--header-h)" }}
    >
      <p className="t-meta mb-8 opacity-45">{t.notFound.tag}</p>
      <h1 className="t-head max-w-[18ch]">{t.notFound.title}</h1>
      <Link
        href={localePath(defaultLocale)}
        className="t-meta link-underline mt-12 inline-block self-start"
      >
        {t.notFound.link}
      </Link>
    </section>
  );
}
