"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ESQUEMA } from "@/lib/esquema";
import { abrirSesion, cerrarSesion, claveCoincide, huellaDeClave } from "@/lib/auth";

/* ---------------------------------------------------------------------------
   Acciones del panel: instalar, entrar y salir.

   Todo ocurre en el servidor. El navegador manda el formulario y recibe una
   redirección; la contraseña no pasa por ningún script de la página ni queda
   en el historial.
--------------------------------------------------------------------------- */

/** ¿Ya hay alguien registrado? Si no, toca instalar. */
export async function hayUsuarios(): Promise<boolean> {
  try {
    const filas = (await db()`
      select 1 from usuarios limit 1
    `) as unknown[];
    return filas.length > 0;
  } catch {
    // La tabla aún no existe: es una instalación nueva.
    return false;
  }
}

/**
 * Primera puesta en marcha: crea las tablas y la cuenta inicial.
 *
 * Se cierra sola. En cuanto existe un usuario, esta acción se niega a hacer
 * nada, así que la página de instalación deja de servir para entrar aunque
 * alguien dé con su dirección.
 */
export async function instalar(_previo: string | null, datos: FormData) {
  const usuario = String(datos.get("usuario") ?? "").trim();
  const clave = String(datos.get("clave") ?? "");
  const repetida = String(datos.get("repetida") ?? "");

  if (usuario.length < 3) return "El usuario necesita al menos 3 caracteres.";
  if (clave.length < 10) return "La contraseña necesita al menos 10 caracteres.";
  if (clave !== repetida) return "Las dos contraseñas no coinciden.";

  const sql = db();

  for (const instruccion of ESQUEMA) {
    await sql.query(instruccion);
  }

  if (await hayUsuarios()) {
    return "Ya existe una cuenta. Entra con ella o pide que la restablezcan.";
  }

  const filas = (await sql`
    insert into usuarios (usuario, clave_huella)
    values (${usuario}, ${huellaDeClave(clave)})
    returning id
  `) as { id: string }[];

  await abrirSesion(filas[0].id);
  redirect("/admin");
}

export async function entrar(_previo: string | null, datos: FormData) {
  const usuario = String(datos.get("usuario") ?? "").trim();
  const clave = String(datos.get("clave") ?? "");

  const filas = (await db()`
    select id, clave_huella from usuarios where usuario = ${usuario}
  `) as { id: string; clave_huella: string }[];

  const cuenta = filas[0];

  // Mismo mensaje exista o no el usuario: decir "ese usuario no existe"
  // regalaría medio trabajo a quien esté probando nombres.
  if (!cuenta || !claveCoincide(clave, cuenta.clave_huella)) {
    return "Usuario o contraseña incorrectos.";
  }

  await db()`update usuarios set ultimo_acceso = now() where id = ${cuenta.id}`;
  await abrirSesion(cuenta.id);
  redirect("/admin");
}

export async function salir() {
  await cerrarSesion();
  redirect("/admin/entrar");
}
