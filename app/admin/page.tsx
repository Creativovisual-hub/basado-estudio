import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { listarProyectos } from "@/lib/proyectos-db";
import { hayUsuarios, salir } from "./acciones";
import { nuevoProyecto } from "./proyectos";

export const dynamic = "force-dynamic";

export default async function Panel() {
  if (!(await hayUsuarios())) redirect("/admin/instalar");
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const proyectos = await listarProyectos();

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

      <form action={nuevoProyecto} className="mb-10">
        <button type="submit" className="t-meta bg-inv px-8 py-4 text-inv-fg">
          Nuevo proyecto
        </button>
      </form>

      {proyectos.length === 0 ? (
        <p className="t-body opacity-65">
          Todavía no hay ningún proyecto. Pulsa &laquo;Nuevo proyecto&raquo;
          para crear el primero.
        </p>
      ) : (
        <ul className="border-t border-line">
          {proyectos.map((p) => (
            <li key={p.id} className="border-b border-line">
              <Link
                href={`/admin/proyecto/${p.id}`}
                className="flex items-center gap-5 py-5"
              >
                <span className="h-14 w-20 shrink-0 overflow-hidden bg-shade">
                  {p.miniatura && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.miniatura}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="flex-1 text-[1.35rem] font-semibold tracking-[-0.03em]">
                  {p.nombre}
                </span>
                <span className="t-meta opacity-45">
                  {p.imagenes} {p.imagenes === 1 ? "imagen" : "imágenes"} ·{" "}
                  {p.publicado ? "Visible" : "Borrador"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
