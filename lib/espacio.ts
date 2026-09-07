import { hayAlmacen, listarArchivos } from "./almacen";
import { db } from "./db";

/* ---------------------------------------------------------------------------
   Cuánto espacio ocupa el portfolio y cuánto queda.

   El peso se pregunta al almacén, no se guarda en la base: el almacén es
   quien sabe la verdad, y un número copiado se desincroniza en cuanto se
   borra un archivo por otra vía.

   El límite del plan gratuito es 1 GB. No se lee de ninguna parte porque no
   hay forma de preguntarlo: está escrito aquí, y si cambia el plan hay que
   cambiarlo aquí.
--------------------------------------------------------------------------- */

export const LIMITE_BYTES = 1024 * 1024 * 1024; // 1 GB del plan gratuito

export type Espacio = {
  usado: number;
  limite: number;
  archivos: number;
  porProyecto: { nombre: string; slug: string; bytes: number; imagenes: number }[];
  /** Peso medio de un proyecto, para estimar cuántos más caben. */
  mediaPorProyecto: number;
  caben: number | null;
};

export async function medirEspacio(): Promise<Espacio | null> {
  if (!hayAlmacen()) return null;

  const archivos = await listarArchivos();
  const usado = archivos.reduce((n, a) => n + a.bytes, 0);

  /*
   * Los archivos viven en carpetas "proyectos/<id>", así que el peso se
   * atribuye leyendo esa parte de la ruta. Es lo que permite ver qué
   * proyecto ocupa más sin guardar el tamaño de cada imagen.
   */
  const porCarpeta = new Map<string, { bytes: number; imagenes: number }>();
  for (const a of archivos) {
    const partes = a.ruta.split("/");
    if (partes[0] !== "proyectos" || !partes[1]) continue;
    const actual = porCarpeta.get(partes[1]) ?? { bytes: 0, imagenes: 0 };
    actual.bytes += a.bytes;
    actual.imagenes += 1;
    porCarpeta.set(partes[1], actual);
  }

  const proyectos = (await db()`
    select id, nombre, slug from proyectos
  `) as { id: string; nombre: string; slug: string }[];

  const porProyecto = proyectos
    .map((p) => ({
      nombre: p.nombre,
      slug: p.slug,
      bytes: porCarpeta.get(p.id)?.bytes ?? 0,
      imagenes: porCarpeta.get(p.id)?.imagenes ?? 0,
    }))
    .filter((p) => p.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes);

  const conPeso = porProyecto.length;
  const mediaPorProyecto = conPeso ? usado / conPeso : 0;
  const caben = mediaPorProyecto
    ? Math.max(0, Math.floor((LIMITE_BYTES - usado) / mediaPorProyecto))
    : null;

  return {
    usado,
    limite: LIMITE_BYTES,
    archivos: archivos.length,
    porProyecto,
    mediaPorProyecto,
    caben,
  };
}

/** Bytes en la unidad que toque, sin decimales inútiles. */
export function enTexto(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
