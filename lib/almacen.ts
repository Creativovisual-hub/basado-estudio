import { put, del, list } from "@vercel/blob";

/* ---------------------------------------------------------------------------
   Almacén de archivos.

   TODO lo que sube, borra o lista imágenes pasa por aquí, y sólo por aquí.
   No es manía de orden: es la pieza que ata el proyecto a un proveedor
   concreto. Manteniéndola en un único archivo, cambiar Vercel Blob por S3,
   Cloudflare R2 o Supabase Storage es reescribir estas tres funciones, no
   buscar llamadas sueltas por todo el código.

   Por eso también se devuelve siempre la pareja { url, ruta }:

   · url  es la dirección pública de hoy, la que ve el navegador;
   · ruta es el nombre del archivo dentro del almacén, que sobrevive a la
     mudanza. Con la ruta guardada, migrar es volver a subir cada archivo con
     el mismo nombre y regenerar las direcciones.

   Guardar sólo la url dejaría las imágenes atadas para siempre al dominio de
   un proveedor: exactamente el problema que tenemos hoy con Adobe.
--------------------------------------------------------------------------- */

export type ArchivoSubido = {
  url: string;
  ruta: string;
};

/**
 * Sube un archivo y devuelve dónde quedó.
 *
 * El nombre lleva un sufijo aleatorio que añade el propio almacén, así que
 * subir dos veces "portada.jpg" no pisa la anterior: cada imagen es un
 * archivo distinto y se puede volver atrás.
 */
export async function subirArchivo(
  carpeta: string,
  nombre: string,
  datos: Blob | ArrayBuffer | Buffer
): Promise<ArchivoSubido> {
  const ruta = `${carpeta}/${nombre}`;
  const blob = await put(ruta, datos as Blob, {
    access: "public",
    addRandomSuffix: true,
    // Un año de caché: la dirección es única por archivo, así que nunca
    // apunta a un contenido distinto y puede guardarse sin miedo.
    cacheControlMaxAge: 31536000,
  });
  return { url: blob.url, ruta: blob.pathname };
}

/** Borra un archivo. Se le pasa la dirección pública que guardamos. */
export async function borrarArchivo(url: string) {
  await del(url);
}

/**
 * Lista lo que hay en el almacén, con su peso.
 *
 * Se piden todas las páginas: el almacén devuelve como mucho mil archivos
 * por llamada, y contar sólo la primera daría un total falso en cuanto el
 * portfolio crezca.
 */
export async function listarArchivos(carpeta?: string) {
  const archivos: { url: string; ruta: string; bytes: number }[] = [];
  let cursor: string | undefined;

  do {
    const pagina = await list({ prefix: carpeta, cursor, limit: 1000 });
    for (const b of pagina.blobs) {
      archivos.push({ url: b.url, ruta: b.pathname, bytes: b.size });
    }
    cursor = pagina.hasMore ? pagina.cursor : undefined;
  } while (cursor);

  return archivos;
}

/** ¿Hay almacén configurado? */
export const hayAlmacen = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * Copia un archivo dentro del almacén.
 *
 * Se usa al duplicar un proyecto. Podría bastar con apuntar las dos fichas a
 * la misma dirección, pero entonces borrar una imagen en la copia dejaría un
 * hueco en el original: dejarían de ser proyectos independientes.
 */
export async function copiarArchivo(url: string, carpeta: string, nombre: string) {
  const { copy } = await import("@vercel/blob");
  const copia = await copy(url, `${carpeta}/${nombre}`, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: copia.url, ruta: copia.pathname };
}
