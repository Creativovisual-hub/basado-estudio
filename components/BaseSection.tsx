import { getDict, type Locale } from "@/lib/i18n";
import TerrainCanvas from "./TerrainCanvas";
import { Reveal, RevealLines } from "./Reveal";

/**
 * Bloque manifiesto. Siempre oscuro, en los dos temas: es una pieza con
 * dirección de arte propia, como una doble página dentro de la web, y su
 * contraste depende del relieve que lleva detrás.
 */
export default function BaseSection({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="relative isolate overflow-hidden bg-[#0a0a09] text-[#edece8]">
      {/* Relieve de fondo */}
      <div className="absolute inset-0 -z-10">
        <TerrainCanvas />
      </div>

      <div
        className="gutter relative flex min-h-[100svh] flex-col justify-between"
        style={{ paddingTop: "18vh", paddingBottom: "var(--pad)" }}
      >
        <div>
          <h2 className="t-head max-w-[15ch]">
            <RevealLines lines={[t.base.line1]} stagger={0.09} />
            <span className="rv-line">
              <span>
                {t.base.line2Pre}
                <span className="text-[#b9ada0]">{t.base.line2Hi}</span>
              </span>
            </span>
          </h2>

          <Reveal delay={0.3} className="mt-14 md:mt-20">
            {/* Filete corto: el "cimiento" del que habla el texto. */}
            <span className="mb-7 block h-10 w-px bg-[#edece8]/40" aria-hidden="true" />
            <p className="t-meta max-w-[34ch] leading-[1.9]">
              {t.base.subPre}
              <span className="text-[#b9ada0]">{t.base.subHi}</span>
              {t.base.subPost}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.45} className="mt-[12vh]">
          <ul className="t-meta flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#edece8]/15 pt-6 opacity-70 md:gap-x-16">
            {t.base.tags.map((tag, i) => (
              <li key={tag} className="flex items-center gap-6 md:gap-16">
                {i > 0 && (
                  <span aria-hidden="true" className="opacity-40">
                    /
                  </span>
                )}
                {tag}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
