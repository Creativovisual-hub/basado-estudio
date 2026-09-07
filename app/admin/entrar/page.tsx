import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { entrar, hayUsuarios } from "../acciones";
import { usuarioDeLaSesion } from "@/lib/auth";
import Formulario from "../Formulario";
import Campo from "../Campo";

export const dynamic = "force-dynamic";

/*
 * Foto de la pantalla de acceso. Se busca al construir el sitio: si el
 * archivo no está, la pantalla sale sin ella y centrada, no con un hueco
 * roto. Basta con dejarla en public/img/panel/.
 */
const CARPETA = path.join(process.cwd(), "public", "img", "panel");
const NOMBRES = ["acceso", "login", "foto"];
const EXTENSIONES = ["webp", "jpg", "jpeg", "png", "avif"];

function buscarFoto() {
  for (const nombre of NOMBRES) {
    for (const ext of EXTENSIONES) {
      if (fs.existsSync(path.join(CARPETA, `${nombre}.${ext}`))) {
        return `/img/panel/${nombre}.${ext}`;
      }
    }
  }
  return null;
}

export default async function Entrar() {
  // Sin cuenta creada todavía, lo que toca es instalar.
  if (!(await hayUsuarios())) redirect("/admin/instalar");
  if (await usuarioDeLaSesion()) redirect("/admin");

  const foto = buscarFoto();

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      {/* Columna del formulario. */}
      <main className="flex flex-col justify-center px-6 py-16 md:px-14">
        <div className="mx-auto w-full max-w-[24rem]">
          <div className="mb-10 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-[10px] bg-fg text-[1rem] font-semibold text-bg"
            >
              B
            </span>
            <span className="t-meta leading-tight">
              BASADO ESTUDIO
              <span className="mt-1 block opacity-40">Panel</span>
            </span>
          </div>

          <h1 className="mb-2 text-[1.7rem] font-semibold tracking-[-0.035em]">
            Entrar
          </h1>
          <p className="t-meta mb-8 opacity-45">
            Para administrar los proyectos de la web.
          </p>

          <Formulario accion={entrar} envio="Entrar">
            <Campo nombre="usuario" etiqueta="Usuario" auto="username" />
            <Campo
              nombre="clave"
              etiqueta="Contraseña"
              tipo="password"
              auto="current-password"
            />
          </Formulario>
        </div>
      </main>

      {/* Columna de la foto. Sólo en pantallas anchas: en un móvil quitaría
          sitio al formulario, que es a lo que se viene. */}
      {foto && (
        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Filete de marca sobre la foto, como en la identidad. */}
          <span className="a-filete absolute inset-x-0 bottom-0" />
        </aside>
      )}
    </div>
  );
}
