import { db, hayBaseDeDatos } from "./db";
import type { Project } from "./tipos";
import type { Locale } from "./i18n";

/* ---------------------------------------------------------------------------
   El contenido que ve el público.

   Todo sale de la base de datos y del almacén propio. Hasta el traslado de
   septiembre de 2026 convivía con los proyectos de Adobe Portfolio; ya no
   queda nada de aquello, y por eso este archivo es corto.

   Si la base no responde, la web se queda sin proyectos pero no se rompe:
   las páginas siguen sirviéndose y el resto del sitio funciona.
--------------------------------------------------------------------------- */

type FilaProyecto = {
  slug: string;
  nombre: string;
  cliente: string | null;
  anio: number | null;
  categoria_es: string;
  categoria_en: string;
  servicios_es: string[];
  servicios_en: string[];
  intro_es: string;
  intro_en: string;
  notas_es: string[];
  notas_en: string[];
  formato: string;
  descripcion_es: string;
  descripcion_en: string;
};

type FilaTexto = {
  slug: string;
  posicion: number;
  texto_es: string;
  texto_en: string;
};

type FilaImagen = {
  slug: string;
  url: string;
  ancho: number;
  alto: number;
  portada: boolean;
  alt_es: string;
  alt_en: string;
};

/*
 * Proporciones con las que se pueden presentar las láminas de un proyecto.
 * Que todas midan lo mismo es lo que da el ritmo apilado y el scroll largo
 * de un case study; Latin Wok, por ejemplo, son diez piezas de 1920x1080.
 * "original" respeta la de cada archivo y no entra en esta tabla.
 */
const PROPORCIONES: Record<string, number> = {
  "16:9": 16 / 9,
  "3:2": 3 / 2,
  "4:3": 4 / 3,
  "1:1": 1,
  "4:5": 4 / 5,
};

/**
 * Una imagen del almacén propio no tiene variantes por anchura como las del
 * CDN de Adobe: es un solo archivo. Se declara igualmente con su anchura
 * real para que el navegador sepa qué está eligiendo.
 *
 * La proporción que se declara no es la del archivo sino la del proyecto:
 * es la que decide el hueco que reserva la página, y la imagen se recorta
 * para llenarlo. Así se pueden subir fotos de cualquier medida sin que la
 * ficha pierda el pulso.
 */
function comoImagen(i: FilaImagen, proporcion: number | null, es: boolean) {
  return {
    src: i.url,
    alt: (es ? i.alt_es : i.alt_en) || i.alt_es,
    srcSet: `${i.url} ${i.ancho}w`,
    width: i.ancho,
    height: i.alto,
    ratio: proporcion ?? (i.alto ? i.ancho / i.alto : null),
  };
}

async function proyectosPublicados(locale: Locale): Promise<Project[]> {
  if (!hayBaseDeDatos()) return [];

  try {
    const sql = db();

    const filas = (await sql`
      select slug, nombre, cliente, anio,
             categoria_es, categoria_en, servicios_es, servicios_en,
             intro_es, intro_en, notas_es, notas_en, formato,
             descripcion_es, descripcion_en
      from proyectos
      where publicado
      order by orden asc, creado_en desc
    `) as FilaProyecto[];

    if (filas.length === 0) return [];

    // Una sola consulta para todas las imágenes: pedirlas proyecto a proyecto
    // multiplicaría los viajes a la base por el número de proyectos.
    const imagenes = (await sql`
      select p.slug, i.url, i.ancho, i.alto, i.portada, i.alt_es, i.alt_en
      from imagenes i
      join proyectos p on p.id = i.proyecto_id
      where p.publicado
      order by i.orden asc, i.creado_en asc
    `) as FilaImagen[];

    // Los bloques de texto, también de una vez.
    const textos = (await sql`
      select p.slug, t.posicion, t.texto_es, t.texto_en
      from textos t
      join proyectos p on p.id = t.proyecto_id
      where p.publicado
      order by t.posicion asc, t.orden asc, t.creado_en asc
    `) as FilaTexto[];

    const textosPorProyecto = new Map<string, FilaTexto[]>();
    for (const t of textos) {
      const lista = textosPorProyecto.get(t.slug) ?? [];
      lista.push(t);
      textosPorProyecto.set(t.slug, lista);
    }

    const porProyecto = new Map<string, FilaImagen[]>();
    for (const img of imagenes) {
      const lista = porProyecto.get(img.slug) ?? [];
      lista.push(img);
      porProyecto.set(img.slug, lista);
    }

    return filas.flatMap((p) => {
      const suyas = porProyecto.get(p.slug) ?? [];
      // Sin imágenes no hay ficha que enseñar: se omite en vez de publicar
      // un proyecto vacío.
      if (suyas.length === 0) return [];

      const portada = suyas.find((i) => i.portada) ?? suyas[0];
      const proporcion = PROPORCIONES[p.formato] ?? null;
      const es = locale === "es";

      return [
        {
          slug: p.slug,
          name: p.nombre,
          category: (es ? p.categoria_es : p.categoria_en) || p.categoria_es,
          year: p.anio ? String(p.anio) : null,
          client: p.cliente ?? p.nombre,
          services: es ? p.servicios_es : p.servicios_en,
          intro: (es ? p.intro_es : p.intro_en) || p.intro_es,
          cover: { src: portada.url, srcSet: `${portada.url} ${portada.ancho}w` },
          images: suyas.map((i) => comoImagen(i, proporcion, es)),
          descripcion: (es ? p.descripcion_es : p.descripcion_en) || undefined,
          notes: es ? p.notas_es : p.notas_en,
          bloques: (textosPorProyecto.get(p.slug) ?? [])
            .map((t) => ({
              posicion: t.posicion,
              // Un párrafo por línea, igual que se escriben en el panel.
              parrafos: (es ? t.texto_es : t.texto_en)
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            }))
            .filter((b) => b.parrafos.length > 0),
        },
      ];
    });
  } catch (error) {
    console.error("[contenido] la base de datos no respondió:", error);
    return [];
  }
}

/** Todos los proyectos visibles, en el idioma pedido. */
export async function getProyectos(locale: Locale): Promise<Project[]> {
  return proyectosPublicados(locale);
}

export async function getProyecto(locale: Locale, slug: string) {
  return (await getProyectos(locale)).find((p) => p.slug === slug);
}

export async function slugsDeProyecto(): Promise<string[]> {
  return (await getProyectos("es")).map((p) => p.slug);
}

/** Los dos proyectos siguientes, para el pie de una ficha. */
export async function proyectosContiguos(locale: Locale, slug: string) {
  const lista = await getProyectos(locale);
  const i = lista.findIndex((p) => p.slug === slug);
  return [lista[(i + 1) % lista.length], lista[(i + 2) % lista.length]];
}
