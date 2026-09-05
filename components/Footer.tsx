import Link from "next/link";
import { site } from "@/lib/site";

const social = [
  { href: site.social.instagram, label: "Instagram" },
  { href: site.social.behance, label: "Behance" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bone">
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
          <p className="mt-3 opacity-55">Trabajamos con marcas en todo el mundo</p>
        </div>

        <nav className="t-meta md:col-span-2 md:pt-2" aria-label="Redes">
          <ul className="space-y-3">
            {social.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="t-meta md:col-span-2 md:pt-2">
          <a href={`mailto:${site.email}`} className="link-underline">
            {site.email}
          </a>
          <p className="mt-8 opacity-40">
            © {new Date().getFullYear()} {site.shortName}
          </p>
          <Link href="/" className="link-underline mt-3 inline-block opacity-55">
            ↑ Volver al inicio
          </Link>
        </div>
      </div>
    </footer>
  );
}
