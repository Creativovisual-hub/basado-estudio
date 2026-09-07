import fs from "node:fs";
import path from "node:path";

/* ---------------------------------------------------------------------------
   Logotipo: símbolo y palabra.

   Se usa el logotipo real, pero como MÁSCARA y no como imagen. El archivo
   original es trazo blanco sobre fondo negro opaco: puesto tal cual, en el
   tema claro aparecería un rectángulo negro alrededor. Convertido en máscara,
   lo que se pinta es el color del texto a través de su silueta, así que se
   resuelve solo en claro y en oscuro.

   La máscara se genera a partir de public/img/panel/logo.png y se guarda como
   logo-mascara.png, recortada a su contenido para que no arrastre márgenes.

   Si no hubiera archivo, se dibuja el símbolo con su geometría —la B es un
   asta recta y dos círculos tangentes a los bordes— y la palabra en la
   tipografía del sitio. Nunca queda un hueco.
--------------------------------------------------------------------------- */

const CARPETA = path.join(process.cwd(), "public", "img", "panel");

/** Ancho y alto de un PNG, leídos de su cabecera. */
function medidasPng(archivo: string) {
  try {
    const cabecera = Buffer.alloc(24);
    const fd = fs.openSync(archivo, "r");
    fs.readSync(fd, cabecera, 0, 24, 0);
    fs.closeSync(fd);
    return { ancho: cabecera.readUInt32BE(16), alto: cabecera.readUInt32BE(20) };
  } catch {
    return null;
  }
}

function mascara() {
  const archivo = path.join(CARPETA, "logo-mascara.png");
  if (!fs.existsSync(archivo)) return null;
  const medidas = medidasPng(archivo);
  if (!medidas?.ancho || !medidas.alto) return null;
  return { ruta: "/img/panel/logo-mascara.png", ...medidas };
}

export default function LogoBasado({ alto = 34 }: { alto?: number }) {
  const m = mascara();

  if (m) {
    return (
      <span
        role="img"
        aria-label="Basado"
        className="inline-block shrink-0"
        style={{
          height: alto,
          width: (alto * m.ancho) / m.alto,
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(${m.ruta})`,
          maskImage: `url(${m.ruta})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
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
