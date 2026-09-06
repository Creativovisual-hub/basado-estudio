import fs from "node:fs";
import path from "node:path";

import { getDict, type Locale } from "@/lib/i18n";
import TerrainCanvas from "./TerrainCanvas";
import RockLight from "./RockLight";
import { Reveal, RevealLines } from "./Reveal";

/*
 * Fondo del bloque: la fotografía de la piedra si está puesta, y si no el
 * relieve generado por código. La comprobación ocurre al construir el sitio,
 * no en el navegador, así que nunca aparece una imagen rota: basta con dejar
 * el archivo en public/img/base/ y volver a desplegar.
 */
const ROCK_DIR = path.join(process.cwd(), "public", "img", "base");
const ROCK_EXT = ["jpg", "jpeg", "webp", "avif", "png"];

function findRock(): string | null {
  for (const ext of ROCK_EXT) {
    if (fs.existsSync(path.join(ROCK_DIR, `roca.${ext}`))) return `/img/base/roca.${ext}`;
  }
  return null;
}

/**
 * Bloque manifiesto. Siempre oscuro, en los dos temas: es una pieza con
 * dirección de arte propia, como una doble página dentro de la web, y su
 * contraste depende de la imagen que lleva detrás.
 */
export default function BaseSection({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const rock = findRock();

  return (
    <section className="relative isolate overflow-hidden bg-[#0a0a09] text-[#edece8]">
      <div className="absolute inset-0 -z-10">
        {rock ? <RockLight src={rock} alt={t.base.rockAlt} /> : <TerrainCanvas />}
      </div>

      {/* Velo lateral: asegura que la tipografía se lea sobre la imagen. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0a0a09] via-[#0a0a09]/85 to-transparent md:to-[#0a0a09]/10"
      />

      <div
        className="gutter relative flex min-h-[100svh] flex-col justify-between"
        style={{ paddingTop: "18vh", paddingBottom: "var(--pad)" }}
      >
        <div>
          {/* Medida holgada: a 15ch la primera línea partía y dejaba la
              última palabra sola ("Your brand needs / more"). */}
          <h2 className="t-head max-w-[22ch]">
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
            {/* La frase cabe entera: a 34ch partía y dejaba dos palabras
                sueltas en la segunda línea. La unidad ch mide el ancho del
                cero, y este texto va en mayúsculas y con más espaciado, así
                que ocupa bastante más de lo que su número de letras sugiere. */}
            <p className="t-meta max-w-[46ch] leading-[1.9]">
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
