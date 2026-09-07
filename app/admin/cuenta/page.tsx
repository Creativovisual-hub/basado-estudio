import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { datosDeCuenta } from "@/lib/proyectos-db";
import { cambiarContrasena } from "../proyectos";
import Formulario from "../Formulario";
import Campo from "../Campo";

export const dynamic = "force-dynamic";

export default async function Cuenta() {
  const id = await usuarioDeLaSesion();
  if (!id) redirect("/admin/entrar");

  const cuenta = await datosDeCuenta(id);

  return (
    <main className="p-5 md:p-8">
      <h1 className="mb-7 text-[1.7rem] font-semibold tracking-[-0.035em]">Mi cuenta</h1>

      {cuenta && (
        <dl className="a-panel t-meta mb-6 grid max-w-[34rem] grid-cols-2 gap-y-4 p-5 md:p-6">
          <dt className="opacity-45">Usuario</dt>
          <dd>{cuenta.usuario}</dd>
          <dt className="opacity-45">Último acceso</dt>
          <dd>
            {cuenta.ultimo_acceso
              ? new Date(cuenta.ultimo_acceso).toLocaleString("es-CL")
              : "—"}
          </dd>
        </dl>
      )}

      <h2 className="t-meta mb-5 opacity-45">Cambiar la contraseña</h2>

      <div className="a-panel max-w-[34rem] p-5 md:p-6">
      <Formulario accion={cambiarContrasena} envio="Cambiar contraseña">
        <Campo
          nombre="actual"
          etiqueta="Contraseña actual"
          tipo="password"
          auto="current-password"
        />
        <Campo
          nombre="nueva"
          etiqueta="Contraseña nueva"
          tipo="password"
          auto="new-password"
          pista="Mínimo 10 caracteres."
        />
        <Campo
          nombre="repetida"
          etiqueta="Repite la nueva"
          tipo="password"
          auto="new-password"
        />
      </Formulario>
      </div>

      <p className="t-meta mt-10 leading-relaxed opacity-40">
        La contraseña no se guarda en ningún sitio: sólo una huella suya, que
        no se puede revertir. Si la pierdes no hay forma de recuperarla, hay
        que crear una nueva desde el código.
      </p>
    </main>
  );
}
