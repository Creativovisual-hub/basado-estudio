import Link from "next/link";
import { site } from "@/lib/site";
import { getDict, localePath, type Locale } from "@/lib/i18n";
import ContactLink from "./ContactLink";
import CookiesLink from "./CookiesLink";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  const social = [
    { href: site.social.instagram, label: "Instagram", canal: "instagram" },
    { href: site.social.behance, label: "Behance", canal: "behance" },
  ];

  return (
    <footer className="border-t border-line bg-bg">
      <div className="gutter grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <p className="text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            BASADO
            <br />
            ESTUDIO
          </p>
        </div>

        <div className="t-meta md:col-span-3 md:pt-2">
          <p className="opacity-55">{site.location}</p>
          <p className="mt-3 opacity-55">{t.footer.worldwide}</p>
        </div>

        <nav className="t-meta md:col-span-2 md:pt-2" aria-label={t.footer.social}>
          <ul className="space-y-3">
            {social.map((s) => (
              <li key={s.href}>
                <ContactLink href={s.href} canal={s.canal} className="link-underline">
                  {s.label}
                </ContactLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="t-meta md:col-span-2 md:pt-2">
          <ContactLink href={`mailto:${site.email}`} canal="email" className="link-underline">
            {site.email}
          </ContactLink>
          <p className="mt-8 opacity-40">
            © {new Date().getFullYear()} {site.shortName}
          </p>
          <Link
            href={localePath(locale)}
            className="link-underline mt-3 inline-block opacity-55"
          >
            {t.footer.backToTop}
          </Link>
          <br />
          <CookiesLink>{t.cookies.enlace}</CookiesLink>
        </div>
      </div>
    </footer>
  );
}
