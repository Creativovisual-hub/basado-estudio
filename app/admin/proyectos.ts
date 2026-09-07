"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { usuarioDeLaSesion } from "@/lib/auth";
import { borrarArchivo } from "@/lib/almacen";
import {
  anadirImagen,
  borrarImagen,
  borrarProyecto,
  crearProyecto,
  guardarProyecto,
  marcarPortada,
  moverImagen,
  obtenerImagen,
  slugLibre,
} from "@/lib/proyectos-db";

/* ---------------------------------------------------------------------------
   Acciones sobre proyectos.

   Cada una comprueba la sesión por su cuenta. Podría bastar con protegerlo en
   la página, pero estas acciones son direcciones que se pueden invocar
   directamente: si la única barrera estuviera en la pantalla, cualquiera
   podría saltársela llamando a la acción a pelo.

   Al terminar se refrescan las páginas públicas afectadas, así el cambio se
   ve en la web en segundos sin tener que reconstruir el sitio entero.
--------------------------------------------------------------------------- */

async function exigirSesion() {
  const id = await usuarioDeLaSesion();
  if (!id) redirect("/admin/entrar");
  return id;
}

/** Refresca lo que ve el público: portada, listado y ficha del proyecto. */
function refrescarWeb(slug?: string) {
  for (const lang of ["es", "en"]) {
    revalidatePath(`/${lang}`);
    revalidatePath(`/${lang}/work`);
    if (slug) revalidatePath(`/${lang}/work/${slug}`);
  }
}

/** Texto de varias líneas → lista, quitando líneas en blanco. */
function aLista(valor: FormDataEntryValue | null) {
  return String(valor ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Lista separada por comas → array. */
function aListaComas(valor: FormDataEntryValue | null) {
  return String(valor ?? "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function nuevoProyecto() {
  await exigirSesion();
  const id = await crearProyecto();
  redirect(`/admin/proyecto/${id}`);
}

export async function guardar(id: string, _previo: string | null, datos: FormData) {
  await exigirSesion();

  const nombre = String(datos.get("nombre") ?? "").trim();
  if (!nombre) return "El proyecto necesita un nombre.";

  const anioTexto = String(datos.get("anio") ?? "").trim();
  const anio = anioTexto ? Number(anioTexto) : null;
  if (anio !== null && (!Number.isInteger(anio) || anio < 1900 || anio > 2100)) {
    return "El año no parece válido.";
  }

  // El slug se calcula del nombre si no se escribe uno, y siempre se
  // comprueba que no choque con otro proyecto.
  const slugPedido = String(datos.get("slug") ?? "").trim() || nombre;
  const slug = await slugLibre(slugPedido, id);

  await guardarProyecto(id, {
    slug,
    orden: 0, // el orden se cambia desde el listado, no desde la ficha
    publicado: datos.get("publicado") === "on",
    nombre,
    cliente: String(datos.get("cliente") ?? "").trim() || null,
    anio,
    categoria_es: String(datos.get("categoria_es") ?? "").trim(),
    categoria_en: String(datos.get("categoria_en") ?? "").trim(),
    servicios_es: aListaComas(datos.get("servicios_es")),
    servicios_en: aListaComas(datos.get("servicios_en")),
    intro_es: String(datos.get("intro_es") ?? "").trim(),
    intro_en: String(datos.get("intro_en") ?? "").trim(),
    // Los textos intercalados viven en su propia tabla, con su posición.
    notas_es: [],
    notas_en: [],
    formato: String(datos.get("formato") ?? "16:9"),
  });

  refrescarWeb(slug);
  return undefined;
}

export async function eliminar(id: string) {
  await exigirSesion();
  await borrarProyecto(id);
  refrescarWeb();
  redirect("/admin");
}

/* -------------------------------- imágenes ------------------------------ */

export async function registrarImagen(
  proyectoId: string,
  img: { url: string; ruta: string; ancho: number; alto: number }
) {
  await exigirSesion();
  await anadirImagen(proyectoId, img);
  revalidatePath(`/admin/proyecto/${proyectoId}`);
  refrescarWeb();
}

export async function quitarImagen(id: string) {
  await exigirSesion();
  const img = await obtenerImagen(id);
  if (!img) return;

  await borrarImagen(id);
  // El archivo se borra después del registro: si fallara el borrado del
  // archivo, quedaría un huérfano en el almacén, que es mucho menos molesto
  // que una ficha apuntando a una imagen que ya no existe.
  try {
    await borrarArchivo(img.url);
  } catch {}

  revalidatePath(`/admin/proyecto/${img.proyecto_id}`);
  refrescarWeb();
}

export async function ponerPortada(proyectoId: string, imagenId: string) {
  await exigirSesion();
  await marcarPortada(proyectoId, imagenId);
  revalidatePath(`/admin/proyecto/${proyectoId}`);
  refrescarWeb();
}

export async function mover(proyectoId: string, imagenId: string, direccion: "arriba" | "abajo") {
  await exigirSesion();
  await moverImagen(imagenId, direccion);
  revalidatePath(`/admin/proyecto/${proyectoId}`);
  refrescarWeb();
}

export async function moverEnPortada(id: string, direccion: "arriba" | "abajo") {
  await exigirSesion();
  const { moverProyecto } = await import("@/lib/proyectos-db");
  await moverProyecto(id, direccion);
  revalidatePath("/admin/orden");
  refrescarWeb();
}

export async function cambiarContrasena(_previo: string | null, datos: FormData) {
  const usuarioId = await exigirSesion();
  const actual = String(datos.get("actual") ?? "");
  const nueva = String(datos.get("nueva") ?? "");
  const repetida = String(datos.get("repetida") ?? "");

  if (nueva.length < 10) return "La nueva contraseña necesita al menos 10 caracteres.";
  if (nueva !== repetida) return "Las dos contraseñas nuevas no coinciden.";

  const { cambiarClave } = await import("@/lib/proyectos-db");
  const { claveCoincide, huellaDeClave } = await import("@/lib/auth");

  const cambiada = await cambiarClave(
    usuarioId,
    (huella) => claveCoincide(actual, huella),
    huellaDeClave(nueva)
  );

  return cambiada
    ? "listo: Contraseña cambiada."
    : "La contraseña actual no es correcta.";
}

/* --------------------------- bloques de texto --------------------------- */

export async function nuevoTexto(proyectoId: string) {
  await exigirSesion();
  const { anadirTexto } = await import("@/lib/proyectos-db");
  await anadirTexto(proyectoId);
  revalidatePath(`/admin/proyecto/${proyectoId}`);
}

export async function guardarBloque(id: string, datos: FormData) {
  await exigirSesion();
  const { guardarTexto, proyectoDeTexto } = await import("@/lib/proyectos-db");

  const posicion = Math.max(0, Number(datos.get("posicion") ?? 1) || 0);
  await guardarTexto(id, {
    posicion,
    texto_es: String(datos.get("texto_es") ?? "").trim(),
    texto_en: String(datos.get("texto_en") ?? "").trim(),
  });

  const proyectoId = await proyectoDeTexto(id);
  if (proyectoId) revalidatePath(`/admin/proyecto/${proyectoId}`);
  refrescarWeb();
}

export async function quitarTexto(id: string) {
  await exigirSesion();
  const { borrarTexto, proyectoDeTexto } = await import("@/lib/proyectos-db");
  const proyectoId = await proyectoDeTexto(id);
  await borrarTexto(id);
  if (proyectoId) revalidatePath(`/admin/proyecto/${proyectoId}`);
  refrescarWeb();
}
