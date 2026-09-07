import { redirect } from "next/navigation";
import { entrar, hayUsuarios } from "../acciones";
import { usuarioDeLaSesion } from "@/lib/auth";
import Formulario from "../Formulario";
import Campo from "../Campo";

export const dynamic = "force-dynamic";

export default async function Entrar() {
  // Sin cuenta creada todavía, lo que toca es instalar.
  if (!(await hayUsuarios())) redirect("/admin/instalar");
  if (await usuarioDeLaSesion()) redirect("/admin");

  return (
    <main className="gutter mx-auto flex min-h-svh max-w-[26rem] flex-col justify-center py-20">
      <p className="t-meta mb-4 opacity-45">(Panel)</p>
      <h1 className="t-head mb-10">Entrar.</h1>

      <Formulario accion={entrar} envio="Entrar">
        <Campo nombre="usuario" etiqueta="Usuario" auto="username" />
        <Campo nombre="clave" etiqueta="Contraseña" tipo="password" auto="current-password" />
      </Formulario>
    </main>
  );
}
