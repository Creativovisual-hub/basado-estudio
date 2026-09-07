import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { entrar, hayUsuarios } from "../acciones";
import { usuarioDeLaSesion } from "@/lib/auth";
import Formulario from "../Formulario";
import Campo from "../Campo";
import LogoBasado from "@/components/LogoBasado";

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
    /*
      Alto exacto de la ventana y sin desbordar: la pantalla de acceso cabe
      entera y no se hace scroll. La foto se recorta por los lados o por
      arriba y abajo, lo que haga falta, conservando siempre el centro.
    */
    <div className="grid h-svh grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* Columna del formulario. */}
      {/* Si la ventana fuera tan baja que el formulario no cupiera, se
          desplaza sólo esta columna: la página nunca. */}
      <main className="flex flex-col justify-center overflow-y-auto px-6 py-10 md:px-14">
        <div className="mx-auto w-full max-w-[24rem]">
          <div className="mb-10">
            <LogoBasado alto={38} />
            <p className="t-meta mt-4 opacity-40">Panel de administración</p>
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
            className="h-full w-full object-cover object-center"
          />
          {/* Filete de marca sobre la foto, como en la identidad. */}
          <span className="a-filete absolute inset-x-0 bottom-0" />
        </aside>
      )}
    </div>
  );
}
