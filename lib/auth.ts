import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

/* ---------------------------------------------------------------------------
   Acceso al panel.

   Escrito con las herramientas que ya trae Node, sin librerías de terceros:
   son treinta líneas y cada una hace algo que se puede explicar. Meter una
   dependencia de autenticación aquí sería traer un armario para guardar un
   par de zapatos.

   Dos piezas:

   1. La contraseña se guarda como huella scrypt con una sal distinta por
      usuario. Scrypt está pensado para ser lento y consumir memoria a
      propósito: probar contraseñas a lo bruto se vuelve carísimo. Nunca se
      guarda ni se registra la contraseña en claro.

   2. La sesión es una galleta firmada. Lleva el identificador del usuario y
      la fecha de caducidad, más una firma que sólo se puede calcular con el
      secreto del sitio. Cambiar el contenido a mano invalida la firma.

   El secreto de firma vive en la base de datos, no en una variable de
   entorno, para que no haya que configurar nada a mano: se genera solo la
   primera vez que hace falta.
--------------------------------------------------------------------------- */

const GALLETA = "sesion";
const DURACION_DIAS = 30;

/* ------------------------------- contraseñas ---------------------------- */

export function huellaDeClave(clave: string) {
  const sal = randomBytes(16).toString("hex");
  const huella = scryptSync(clave, sal, 64).toString("hex");
  return `${sal}:${huella}`;
}

export function claveCoincide(clave: string, guardada: string) {
  const [sal, huella] = guardada.split(":");
  if (!sal || !huella) return false;
  const candidata = scryptSync(clave, sal, 64);
  const original = Buffer.from(huella, "hex");
  if (candidata.length !== original.length) return false;
  // Comparación de tiempo constante: comparar con === filtra información
  // sobre cuántos caracteres iniciales acertó quien lo intenta.
  return timingSafeEqual(candidata, original);
}

/* --------------------------------- sesión ------------------------------- */

async function secretoDeFirma(): Promise<string> {
  const sql = db();
  await sql`
    create table if not exists ajustes (
      clave text primary key,
      valor text not null
    )
  `;
  const filas = (await sql`
    select valor from ajustes where clave = 'sesion_secreto'
  `) as { valor: string }[];

  if (filas[0]) return filas[0].valor;

  const nuevo = randomBytes(32).toString("hex");
  await sql`
    insert into ajustes (clave, valor) values ('sesion_secreto', ${nuevo})
    on conflict (clave) do nothing
  `;
  return nuevo;
}

function firmar(cuerpo: string, secreto: string) {
  return createHmac("sha256", secreto).update(cuerpo).digest("hex");
}

export async function abrirSesion(usuarioId: string) {
  const secreto = await secretoDeFirma();
  const caduca = Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000;
  const cuerpo = `${usuarioId}.${caduca}`;
  const valor = `${cuerpo}.${firmar(cuerpo, secreto)}`;

  const almacen = await cookies();
  almacen.set(GALLETA, valor, {
    httpOnly: true, // fuera del alcance de cualquier script de la página
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_DIAS * 24 * 60 * 60,
  });
}

export async function cerrarSesion() {
  const almacen = await cookies();
  almacen.delete(GALLETA);
}

/** Devuelve el id del usuario con sesión válida, o null. */
export async function usuarioDeLaSesion(): Promise<string | null> {
  const almacen = await cookies();
  const valor = almacen.get(GALLETA)?.value;
  if (!valor) return null;

  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [id, caduca, firma] = partes;

  if (!Number(caduca) || Number(caduca) < Date.now()) return null;

  const secreto = await secretoDeFirma();
  const esperada = firmar(`${id}.${caduca}`, secreto);
  const a = Buffer.from(firma, "hex");
  const b = Buffer.from(esperada, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return id;
}
