import { db } from "./db";

/* ---------------------------------------------------------------------------
   Consultas de proyectos e imágenes.

   Todas las consultas viven aquí y no repartidas por las páginas. Así se ve
   de un vistazo qué se le pide a la base, y el día que haya que optimizar
   algo o cambiar de proveedor, hay un solo sitio donde mirar.

   Se usan plantillas etiquetadas (sql`...`), que envían los valores aparte
   de la instrucción. Eso hace imposible la inyección de SQL: lo que escriba
   alguien en un campo nunca puede convertirse en una orden.
--------------------------------------------------------------------------- */

export type ImagenFila = {
  id: string;
  url: string;
  ruta: string;
  ancho: number;
  alto: number;
  orden: number;
  portada: boolean;
  alt_es: string;
  alt_en: string;
};

export type ProyectoFila = {
  id: string;
  slug: string;
  orden: number;
  publicado: boolean;
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

/** Convierte un nombre en una dirección web: "Latin Wok" → "latin-wok". */
export function aSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes conservando la letra
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Un slug que no choque con otro ya existente. */
export async function slugLibre(base: string, excluirId?: string) {
  const raiz = aSlug(base) || "proyecto";
  let intento = raiz;
  for (let n = 2; n < 200; n++) {
    const filas = (
      excluirId
        ? await db()`select 1 from proyectos where slug = ${intento} and id <> ${excluirId}::uuid limit 1`
        : await db()`select 1 from proyectos where slug = ${intento} limit 1`
    ) as unknown[];
    if (filas.length === 0) return intento;
    intento = `${raiz}-${n}`;
  }
  return `${raiz}-${Date.now()}`;
}

export async function listarProyectos() {
  return (await db()`
    select p.id, p.slug, p.nombre, p.publicado, p.orden,
           (select count(*) from imagenes i where i.proyecto_id = p.id)::int as imagenes,
           (select i.url from imagenes i
             where i.proyecto_id = p.id
             order by i.portada desc, i.orden asc limit 1) as miniatura
    from proyectos p
    order by p.orden asc, p.creado_en desc
  `) as {
    id: string;
    slug: string;
    nombre: string;
    publicado: boolean;
    orden: number;
    imagenes: number;
    miniatura: string | null;
  }[];
}

export async function obtenerProyecto(id: string) {
  const filas = (await db()`
    select * from proyectos where id = ${id}::uuid
  `) as ProyectoFila[];
  if (!filas[0]) return null;

  const imagenes = (await db()`
    select id, url, ruta, ancho, alto, orden, portada, alt_es, alt_en
    from imagenes where proyecto_id = ${id}::uuid
    order by orden asc, creado_en asc
  `) as ImagenFila[];

  return { ...filas[0], imagenes };
}

/** Crea un proyecto vacío y devuelve su id, para abrirlo y rellenarlo. */
export async function crearProyecto() {
  const slug = await slugLibre("proyecto-nuevo");
  const filas = (await db()`
    insert into proyectos (slug, nombre, orden)
    values (
      ${slug},
      'Proyecto nuevo',
      coalesce((select max(orden) + 1 from proyectos), 0)
    )
    returning id
  `) as { id: string }[];
  return filas[0].id;
}

export async function guardarProyecto(id: string, d: Omit<ProyectoFila, "id">) {
  await db()`
    update proyectos set
      slug = ${d.slug},
      publicado = ${d.publicado},
      nombre = ${d.nombre},
      cliente = ${d.cliente},
      anio = ${d.anio},
      categoria_es = ${d.categoria_es},
      categoria_en = ${d.categoria_en},
      servicios_es = ${d.servicios_es},
      servicios_en = ${d.servicios_en},
      intro_es = ${d.intro_es},
      intro_en = ${d.intro_en},
      notas_es = ${d.notas_es},
      notas_en = ${d.notas_en},
      formato = ${d.formato},
      descripcion_es = ${d.descripcion_es},
      descripcion_en = ${d.descripcion_en},
      actualizado_en = now()
    where id = ${id}::uuid
  `;
}

export async function borrarProyecto(id: string) {
  // Las imágenes se borran solas por la relación en cascada del esquema.
  await db()`delete from proyectos where id = ${id}::uuid`;
}

/* -------------------------------- imágenes ------------------------------ */

export async function anadirImagen(
  proyectoId: string,
  img: { url: string; ruta: string; ancho: number; alto: number }
) {
  // La primera imagen de un proyecto pasa a ser su portada.
  const previas = (await db()`
    select count(*)::int as n from imagenes where proyecto_id = ${proyectoId}::uuid
  `) as { n: number }[];

  await db()`
    insert into imagenes (proyecto_id, url, ruta, ancho, alto, orden, portada)
    values (
      ${proyectoId}::uuid, ${img.url}, ${img.ruta}, ${img.ancho}, ${img.alto},
      coalesce((select max(orden) + 1 from imagenes where proyecto_id = ${proyectoId}::uuid), 0),
      ${previas[0].n === 0}
    )
  `;
}

export async function obtenerImagen(id: string) {
  const filas = (await db()`
    select id, proyecto_id, url, portada from imagenes where id = ${id}::uuid
  `) as { id: string; proyecto_id: string; url: string; portada: boolean }[];
  return filas[0] ?? null;
}

export async function borrarImagen(id: string) {
  await db()`delete from imagenes where id = ${id}::uuid`;
}

export async function marcarPortada(proyectoId: string, imagenId: string) {
  // Primero se quita la anterior: el esquema sólo admite una por proyecto.
  await db()`
    update imagenes set portada = false where proyecto_id = ${proyectoId}::uuid and portada
  `;
  await db()`update imagenes set portada = true where id = ${imagenId}::uuid`;
}

/** Mueve una imagen un puesto arriba o abajo intercambiando el orden. */
export async function moverImagen(id: string, direccion: "arriba" | "abajo") {
  const actual = (await db()`
    select id, proyecto_id, orden from imagenes where id = ${id}::uuid
  `) as { id: string; proyecto_id: string; orden: number }[];
  if (!actual[0]) return;

  /*
   * Dos consultas escritas enteras en vez de una con el operador metido por
   * variable: en una plantilla etiquetada los valores viajan aparte de la
   * instrucción —que es lo que impide la inyección de SQL—, así que un "<"
   * insertado ahí llegaría como texto y la consulta no haría lo que dice.
   */
  const vecina = (
    direccion === "arriba"
      ? await db()`
          select id, orden from imagenes
          where proyecto_id = ${actual[0].proyecto_id}::uuid and orden < ${actual[0].orden}
          order by orden desc limit 1
        `
      : await db()`
          select id, orden from imagenes
          where proyecto_id = ${actual[0].proyecto_id}::uuid and orden > ${actual[0].orden}
          order by orden asc limit 1
        `
  ) as { id: string; orden: number }[];
  if (!vecina[0]) return;

  await db()`update imagenes set orden = ${vecina[0].orden} where id = ${actual[0].id}::uuid`;
  await db()`update imagenes set orden = ${actual[0].orden} where id = ${vecina[0].id}::uuid`;
}

/** Sube o baja un proyecto en la portada intercambiando el orden con su vecino. */
export async function moverProyecto(id: string, direccion: "arriba" | "abajo") {
  const actual = (await db()`
    select id, orden from proyectos where id = ${id}::uuid
  `) as { id: string; orden: number }[];
  if (!actual[0]) return;

  const vecino = (
    direccion === "arriba"
      ? await db()`
          select id, orden from proyectos where orden < ${actual[0].orden}
          order by orden desc limit 1
        `
      : await db()`
          select id, orden from proyectos where orden > ${actual[0].orden}
          order by orden asc limit 1
        `
  ) as { id: string; orden: number }[];
  if (!vecino[0]) return;

  await db()`update proyectos set orden = ${vecino[0].orden} where id = ${actual[0].id}::uuid`;
  await db()`update proyectos set orden = ${actual[0].orden} where id = ${vecino[0].id}::uuid`;
}

/** Cambia la contraseña comprobando antes la actual. */
export async function cambiarClave(
  usuarioId: string,
  comprobar: (huella: string) => boolean,
  nuevaHuella: string
) {
  const filas = (await db()`
    select clave_huella from usuarios where id = ${usuarioId}::uuid
  `) as { clave_huella: string }[];
  if (!filas[0] || !comprobar(filas[0].clave_huella)) return false;

  await db()`
    update usuarios set clave_huella = ${nuevaHuella} where id = ${usuarioId}::uuid
  `;
  return true;
}

export async function datosDeCuenta(usuarioId: string) {
  const filas = (await db()`
    select usuario, creado_en, ultimo_acceso from usuarios where id = ${usuarioId}::uuid
  `) as { usuario: string; creado_en: string; ultimo_acceso: string | null }[];
  return filas[0] ?? null;
}

/* --------------------------- bloques de texto --------------------------- */

export type TextoFila = {
  id: string;
  posicion: number;
  orden: number;
  texto_es: string;
  texto_en: string;
};

export async function textosDe(proyectoId: string) {
  return (await db()`
    select id, posicion, orden, texto_es, texto_en
    from textos where proyecto_id = ${proyectoId}::uuid
    order by posicion asc, orden asc, creado_en asc
  `) as TextoFila[];
}

export async function anadirTexto(proyectoId: string) {
  await db()`
    insert into textos (proyecto_id, posicion, orden)
    values (
      ${proyectoId}::uuid,
      1,
      coalesce((select max(orden) + 1 from textos where proyecto_id = ${proyectoId}::uuid), 0)
    )
  `;
}

export async function guardarTexto(
  id: string,
  d: { posicion: number; texto_es: string; texto_en: string }
) {
  await db()`
    update textos set
      posicion = ${d.posicion},
      texto_es = ${d.texto_es},
      texto_en = ${d.texto_en}
    where id = ${id}::uuid
  `;
}

export async function borrarTexto(id: string) {
  await db()`delete from textos where id = ${id}::uuid`;
}

export async function proyectoDeTexto(id: string) {
  const filas = (await db()`
    select proyecto_id from textos where id = ${id}::uuid
  `) as { proyecto_id: string }[];
  return filas[0]?.proyecto_id ?? null;
}

/** Texto alternativo de una imagen: lo que lee un lector de pantalla. */
export async function guardarAlt(id: string, alt_es: string, alt_en: string) {
  await db()`
    update imagenes set alt_es = ${alt_es}, alt_en = ${alt_en}
    where id = ${id}::uuid
  `;
}

/**
 * Reordena las imágenes de un proyecto según la lista recibida.
 *
 * Se reescriben todas de una vez en lugar de intercambiar de dos en dos: al
 * arrastrar, lo que llega es el orden final completo, y aplicarlo entero
 * evita estados intermedios raros si algo falla a mitad.
 */
export async function reordenarImagenes(proyectoId: string, ids: string[]) {
  for (let i = 0; i < ids.length; i++) {
    await db()`
      update imagenes set orden = ${i}
      where id = ${ids[i]}::uuid and proyecto_id = ${proyectoId}::uuid
    `;
  }
}

/**
 * Duplica un proyecto entero: ficha, bloques de texto e imágenes.
 *
 * Las imágenes se copian de verdad en el almacén, no se comparten. Si
 * apuntaran al mismo archivo, borrar una foto en la copia dejaría un hueco
 * en el original y dejarían de ser proyectos independientes.
 */
export async function duplicarProyecto(
  id: string,
  copiar: (url: string, carpeta: string, nombre: string) => Promise<{ url: string; ruta: string }>
) {
  const original = await obtenerProyecto(id);
  if (!original) return null;

  const slug = await slugLibre(`${original.nombre} copia`);

  const filas = (await db()`
    insert into proyectos (
      slug, orden, publicado, nombre, cliente, anio,
      categoria_es, categoria_en, servicios_es, servicios_en,
      intro_es, intro_en, notas_es, notas_en, formato,
      descripcion_es, descripcion_en
    )
    select ${slug},
           coalesce((select max(orden) + 1 from proyectos), 0),
           false,
           nombre || ' (copia)', cliente, anio,
           categoria_es, categoria_en, servicios_es, servicios_en,
           intro_es, intro_en, notas_es, notas_en, formato,
           descripcion_es, descripcion_en
    from proyectos where id = ${id}::uuid
    returning id
  `) as { id: string }[];

  const nuevo = filas[0].id;

  await db()`
    insert into textos (proyecto_id, posicion, orden, texto_es, texto_en)
    select ${nuevo}::uuid, posicion, orden, texto_es, texto_en
    from textos where proyecto_id = ${id}::uuid
  `;

  for (const img of original.imagenes) {
    const nombre = img.ruta.split("/").pop() ?? "imagen";
    const copia = await copiar(img.url, `proyectos/${nuevo}`, nombre);
    await db()`
      insert into imagenes (proyecto_id, url, ruta, ancho, alto, orden, portada, alt_es, alt_en)
      values (
        ${nuevo}::uuid, ${copia.url}, ${copia.ruta}, ${img.ancho}, ${img.alto},
        ${img.orden}, ${img.portada}, ${img.alt_es}, ${img.alt_en}
      )
    `;
  }

  return nuevo;
}
