import fs from "node:fs";
import path from "node:path";

/* ---------------------------------------------------------------------------
   Logotipo: símbolo y palabra.

   El símbolo se dibuja, no se carga: la B resultó ser geometría exacta —un
   asta recta y dos círculos, tangentes al borde superior y al inferior—, así
   que se traza con esa geometría y sale nítida a cualquier tamaño. Se pintan
   con currentColor, de modo que el tema claro y el oscuro se resuelven solos.

   La palabra va en la tipografía del sitio. Si algún día el logotipo oficial
   usa otra, basta con dejar el archivo en public/img/panel/logo.svg y se usa
   ése en su lugar.
--------------------------------------------------------------------------- */

const CARPETA = path.join(process.cwd(), "public", "img", "panel");
const EXTENSIONES = ["svg", "webp", "png"];

function logoPropio() {
  for (const ext of EXTENSIONES) {
    if (fs.existsSync(path.join(CARPETA, `logo.${ext}`))) {
      return `/img/panel/logo.${ext}`;
    }
  }
  return null;
}

export default function LogoBasado({ alto = 34 }: { alto?: number }) {
  const propio = logoPropio();

  if (propio) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={propio} alt="Basado" style={{ height: alto }} className="w-auto" />
    );
  }

  return (
    <span className="flex items-center" style={{ gap: alto * 0.28 }}>
      <svg
        viewBox="0 0 142 184"
        height={alto}
        width={(alto * 142) / 184}
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="84" height="184" />
        <circle cx="72.25" cy="59.5" r="59.5" />
        <circle cx="81.75" cy="124" r="60" />
      </svg>
      <span
        className="font-semibold leading-none tracking-[-0.035em]"
        style={{ fontSize: alto * 0.78 }}
      >
        Basado
      </span>
    </span>
  );
}
