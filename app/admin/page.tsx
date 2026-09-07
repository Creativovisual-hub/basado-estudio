import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { usuarioDeLaSesion } from "@/lib/auth";
import { hayUsuarios, salir } from "./acciones";

export const dynamic = "force-dynamic";

type Fila = {
  id: string;
  slug: string;
  nombre: string;
  publicado: boolean;
  imagenes: number;
};

export default async function Panel() {
  if (!(await hayUsuarios())) redirect("/admin/instalar");
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const proyectos = (await db()`
    select p.id, p.slug, p.nombre, p.publicado,
           (select count(*) from imagenes i where i.proyecto_id = p.id)::int as imagenes
    from proyectos p
    order by p.orden asc, p.creado_en desc
  `) as Fila[];

  return (
    <main className="gutter mx-auto max-w-[64rem] py-16">
      <div className="mb-14 flex items-baseline justify-between gap-6">
        <div>
          <p className="t-meta mb-3 opacity-45">(Panel)</p>
          <h1 className="t-head">Proyectos.</h1>
        </div>
        <form action={salir}>
          <button type="submit" className="t-meta link-underline opacity-55">
            Salir
          </button>
        </form>
      </div>

      {proyectos.length === 0 ? (
        <p className="t-body opacity-65">
          Todavía no hay ningún proyecto. En el siguiente paso añado el
          formulario para crearlos y subir imágenes.
        </p>
      ) : (
        <ul className="border-t border-line">
          {proyectos.map((p) => (
            <li
              key={p.id}
              className="flex items-baseline justify-between gap-6 border-b border-line py-6"
            >
              <span className="text-[1.35rem] font-semibold tracking-[-0.03em]">
                {p.nombre}
              </span>
              <span className="t-meta opacity-45">
                {p.imagenes} imágenes · {p.publicado ? "Publicado" : "Borrador"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
