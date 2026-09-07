import { db, hayBaseDeDatos } from "./db";
import { getProjects as proyectosHeredados, type Project } from "./projects";
import type { Locale } from "./i18n";

/* ---------------------------------------------------------------------------
   El contenido que ve el público.

   Durante la mudanza conviven dos orígenes:

   · los proyectos creados en el panel, que viven en la base de datos;
   · los ocho que todavía vienen de Adobe Portfolio.

   Se juntan en una sola lista con la misma forma, así que las páginas no
   saben —ni les importa— de dónde salió cada uno. El día que se migren los
   de Adobe, se borra la segunda mitad de este archivo y nada más cambia.

   Los del panel van primero: son el trabajo nuevo, y lo nuevo abre el
   portfolio.

   Si la base de datos no responde, la web sigue mostrando los de Adobe en
   vez de quedarse en blanco. Un fallo de la base no puede tumbar el sitio.
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
};

type FilaImagen = {
  slug: string;
  url: string;
  ancho: number;
  alto: number;
  portada: boolean;
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
function comoImagen(i: FilaImagen, proporcion: number | null) {
  return {
    src: i.url,
    srcSet: `${i.url} ${i.ancho}w`,
    width: i.ancho,
    height: i.alto,
    ratio: proporcion ?? (i.alto ? i.ancho / i.alto : null),
  };
}

async function proyectosDelPanel(locale: Locale): Promise<Project[]> {
  if (!hayBaseDeDatos()) return [];

  try {
    const sql = db();

    const filas = (await sql`
      select slug, nombre, cliente, anio,
             categoria_es, categoria_en, servicios_es, servicios_en,
             intro_es, intro_en, notas_es, notas_en, formato
      from proyectos
      where publicado
      order by orden asc, creado_en desc
    `) as FilaProyecto[];

    if (filas.length === 0) return [];

    // Una sola consulta para todas las imágenes: pedirlas proyecto a proyecto
    // multiplicaría los viajes a la base por el número de proyectos.
    const imagenes = (await sql`
      select p.slug, i.url, i.ancho, i.alto, i.portada
      from imagenes i
      join proyectos p on p.id = i.proyecto_id
      where p.publicado
      order by i.orden asc, i.creado_en asc
    `) as FilaImagen[];

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
          images: suyas.map((i) => comoImagen(i, proporcion)),
          notes: es ? p.notas_es : p.notas_en,
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
  const delPanel = await proyectosDelPanel(locale);
  const deAdobe = proyectosHeredados(locale);

  // Si un slug existe en los dos sitios manda el del panel: es el que se ha
  // editado a mano y el que se supone correcto.
  const vistos = new Set(delPanel.map((p) => p.slug));
  return [...delPanel, ...deAdobe.filter((p) => !vistos.has(p.slug))];
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
