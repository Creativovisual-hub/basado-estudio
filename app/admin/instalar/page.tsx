import { redirect } from "next/navigation";
import { hayUsuarios, instalar } from "../acciones";
import Formulario from "../Formulario";
import Campo from "../Campo";

export const dynamic = "force-dynamic";

export default async function Instalar() {
  // Si ya hay cuenta, esta página no tiene nada que hacer.
  if (await hayUsuarios()) redirect("/admin/entrar");

  return (
    <main className="gutter mx-auto flex min-h-svh max-w-[30rem] flex-col justify-center py-20">
      <p className="t-meta mb-4 opacity-45">(Primera puesta en marcha)</p>
      <h1 className="t-head mb-4">Crea tu cuenta.</h1>
      <p className="t-body mb-10 opacity-65">
        Esto se hace una sola vez. Después, esta página deja de existir y sólo
        se entra con usuario y contraseña.
      </p>

      <Formulario accion={instalar} envio="Crear cuenta y entrar">
        <Campo nombre="usuario" etiqueta="Usuario" auto="username" />
        <Campo
          nombre="clave"
          etiqueta="Contraseña"
          tipo="password"
          auto="new-password"
          pista="Mínimo 10 caracteres. Usa una que no repitas en otros sitios: es la llave de tu web."
        />
        <Campo
          nombre="repetida"
          etiqueta="Repite la contraseña"
          tipo="password"
          auto="new-password"
        />
      </Formulario>
    </main>
  );
}
