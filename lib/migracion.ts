import { db } from "./db";
import { subirArchivo } from "./almacen";
import { getProjects, type Project } from "./projects";
import { aSlug } from "./proyectos-db";

/* ---------------------------------------------------------------------------
   Traslado de los proyectos de Adobe Portfolio al panel.

   Se hace en pasos diminutos —un paso, una imagen— y no de una vez. No es
   manía: son 67 archivos que hay que descargar del servidor de Adobe y
   volver a subir al almacén propio, y una sola operación tan larga se corta
   por tiempo de espera a mitad, dejando el traslado en un estado incierto.

   Con pasos pequeños, cada uno termina o no termina, y el siguiente sigue
   donde quedó el anterior. Se puede cerrar la pestaña y continuar mañana.

   El estado no se guarda en ningún sitio: se deduce mirando qué falta. Un
   proyecto que no está en la base hay que crearlo; uno con menos imágenes de
   las que tiene en Adobe, completarlo. Así no hay un registro de progreso
   que pueda desincronizarse de la realidad.
--------------------------------------------------------------------------- */

export type Paso =
  | { hecho: false; que: string; total: number; hechas: number }
  | { hecho: true; total: number };

/** Proporciones reconocidas, para deducir el formato de las láminas. */
const FORMATOS: [string, number][] = [
  ["16:9", 16 / 9],
  ["3:2", 3 / 2],
  ["4:3", 4 / 3],
  ["1:1", 1],
  ["4:5", 4 / 5],
];

/**
 * Deduce el formato mirando las imágenes.
 *
 * Si casi todas comparten proporción —el caso de Latin Wok, diez piezas de
 * 1920x1080— se adopta ésa. Si son dispares, cada una conserva la suya: es
 * mejor un case study irregular que uno con las fotos recortadas a la fuerza.
 */
function deducirFormato(p: Project) {
  const proporciones = p.images
    .map((i) => (i.width && i.height ? i.width / i.height : null))
    .filter((r): r is number => r !== null);
  if (!proporciones.length) return "original";

  for (const [nombre, valor] of FORMATOS) {
    const parecidas = proporciones.filter((r) => Math.abs(r - valor) < 0.03).length;
    if (parecidas / proporciones.length >= 0.8) return nombre;
  }
  return "original";
}

/** Los ocho de Adobe, en los dos idiomas, emparejados por slug. */
function origen() {
  const es = getProjects("es");
  const en = new Map(getProjects("en").map((p) => [p.slug, p]));
  return es.map((p) => ({ es: p, en: en.get(p.slug) ?? p }));
}

/**
 * Reparte las notas igual que lo hacía la web: tras las láminas 2, 4, 6 y 8.
 * Se conserva el reparto para que las fichas queden como estaban; luego se
 * pueden mover una a una desde el panel.
 */
function repartirNotas(notas: string[], totalImagenes: number) {
  if (!notas.length) return [];
  const paradas = [1, 3, 5, 7].filter((i) => i < totalImagenes - 1);
  const porParada = Math.ceil(notas.length / Math.max(paradas.length, 1));
  return paradas
    .map((parada, i) => ({
      posicion: parada + 1,
      parrafos: notas.slice(i * porParada, (i + 1) * porParada),
    }))
    .filter((b) => b.parrafos.length > 0);
}

/** Cuántas imágenes hay que trasladar en total. */
export function totalDeImagenes() {
  return origen().reduce((n, p) => n + p.es.images.length, 0);
}

/** Cuántas se han trasladado ya. */
export async function imagenesTrasladadas() {
  const slugs = origen().map((p) => p.es.slug);
  const filas = (await db()`
    select count(i.*)::int as n
    from imagenes i join proyectos p on p.id = i.proyecto_id
    where p.slug = any(${slugs})
  `) as { n: number }[];
  return filas[0]?.n ?? 0;
}

/**
 * Ejecuta un paso. Devuelve qué hizo y cuánto queda.
 *
 * Un paso es: crear un proyecto, trasladar una imagen o escribir sus bloques
 * de texto. Nunca más de una imagen, que es lo que tarda.
 */
export async function siguientePaso(): Promise<Paso> {
  const lista = origen();
  const total = totalDeImagenes();
  const sql = db();

  for (const { es, en } of lista) {
    const existentes = (await sql`
      select id, formato from proyectos where slug = ${es.slug}
    `) as { id: string; formato: string }[];

    // 1. El proyecto todavía no existe: se crea con su ficha.
    if (!existentes[0]) {
      await sql`
        insert into proyectos (
          slug, orden, publicado, nombre, cliente, anio,
          categoria_es, categoria_en, servicios_es, servicios_en,
          intro_es, intro_en, formato
        ) values (
          ${es.slug},
          coalesce((select max(orden) + 1 from proyectos), 0),
          true,
          ${es.name},
          ${es.client},
          ${es.year ? Number(es.year) : null},
          ${es.category}, ${en.category},
          ${es.services}, ${en.services},
          ${es.intro}, ${en.intro},
          ${deducirFormato(es)}
        )
      `;
      return {
        hecho: false,
        que: `Ficha de ${es.name}`,
        total,
        hechas: await imagenesTrasladadas(),
      };
    }

    const proyectoId = existentes[0].id;

    // 2. Faltan imágenes: se traslada la siguiente, sólo una.
    const yaTiene = (await sql`
      select count(*)::int as n from imagenes where proyecto_id = ${proyectoId}::uuid
    `) as { n: number }[];
    const indice = yaTiene[0].n;

    if (indice < es.images.length) {
      const img = es.images[indice];

      const respuesta = await fetch(img.src, {
        // Sin cabecera de navegador, el CDN de Adobe responde con un error.
        headers: { "user-agent": "Mozilla/5.0 (compatible; BasadoEstudio/1.0)" },
        cache: "no-store",
      });
      if (!respuesta.ok) {
        throw new Error(
          `No se pudo descargar la imagen ${indice + 1} de ${es.name} (${respuesta.status}).`
        );
      }
      const datos = Buffer.from(await respuesta.arrayBuffer());

      const extension = (img.src.split(".").pop() ?? "jpg").split("?")[0].slice(0, 5);
      const nombre = `${aSlug(es.name)}-${String(indice + 1).padStart(2, "0")}.${extension}`;
      const subida = await subirArchivo(`proyectos/${proyectoId}`, nombre, datos);

      await sql`
        insert into imagenes (proyecto_id, url, ruta, ancho, alto, orden, portada)
        values (
          ${proyectoId}::uuid, ${subida.url}, ${subida.ruta},
          ${img.width ?? 1920}, ${img.height ?? 1080},
          ${indice}, ${indice === 0}
        )
      `;

      return {
        hecho: false,
        que: `${es.name} · imagen ${indice + 1} de ${es.images.length}`,
        total,
        hechas: await imagenesTrasladadas(),
      };
    }

    // 3. Imágenes completas: quedan los bloques de texto.
    const bloques = (await sql`
      select count(*)::int as n from textos where proyecto_id = ${proyectoId}::uuid
    `) as { n: number }[];

    const reparto = repartirNotas(es.notes, es.images.length);
    const repartoEn = repartirNotas(en.notes, en.images.length);

    if (bloques[0].n === 0 && reparto.length > 0) {
      for (let i = 0; i < reparto.length; i++) {
        await sql`
          insert into textos (proyecto_id, posicion, orden, texto_es, texto_en)
          values (
            ${proyectoId}::uuid,
            ${reparto[i].posicion},
            ${i},
            ${reparto[i].parrafos.join("\n")},
            ${(repartoEn[i]?.parrafos ?? reparto[i].parrafos).join("\n")}
          )
        `;
      }
      return {
        hecho: false,
        que: `Textos de ${es.name}`,
        total,
        hechas: await imagenesTrasladadas(),
      };
    }
  }

  return { hecho: true, total };
}
