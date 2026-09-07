import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { listarProyectos } from "@/lib/proyectos-db";
import { hayUsuarios } from "./acciones";
import { nuevoProyecto } from "./proyectos";

export const dynamic = "force-dynamic";

export default async function Panel() {
  if (!(await hayUsuarios())) redirect("/admin/instalar");
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const proyectos = await listarProyectos();
  const visibles = proyectos.filter((p) => p.publicado).length;

  return (
    <main className="gutter max-w-[68rem] py-12 md:py-16">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="t-meta mb-3 opacity-45">
            {proyectos.length === 0
              ? "Ningún proyecto"
              : `${proyectos.length} ${
                  proyectos.length === 1 ? "proyecto" : "proyectos"
                } · ${visibles} en la web`}
          </p>
          <h1 className="t-head">Proyectos.</h1>
        </div>

        <form action={nuevoProyecto}>
          <button type="submit" className="t-meta a-boton">
            Nuevo proyecto
          </button>
        </form>
      </header>

      {proyectos.length === 0 ? (
        <div className="a-bloque">
          <p className="t-body opacity-65">
            Todavía no hay ningún proyecto aquí. Pulsa{" "}
            <strong className="font-semibold">Nuevo proyecto</strong> para crear
            el primero.
          </p>
          <p className="t-meta mt-4 leading-relaxed opacity-40">
            Los ocho que ya se ven en la web siguen llegando de Adobe Portfolio
            y no aparecen en esta lista. Se irán retirando de allí a medida que
            los recrees aquí.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {proyectos.map((p) => (
            <li key={p.id} className="border-b border-line first:border-t">
              <Link
                href={`/admin/proyecto/${p.id}`}
                className="a-fila -mx-3 flex items-center gap-5 px-3 py-4"
              >
                <span className="h-16 w-24 shrink-0 overflow-hidden rounded-sm bg-shade">
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

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[1.3rem] font-semibold tracking-[-0.03em]">
                    {p.nombre}
                  </span>
                  <span className="t-meta mt-2 block opacity-40">
                    /{p.slug} · {p.imagenes}{" "}
                    {p.imagenes === 1 ? "imagen" : "imágenes"}
                  </span>
                </span>

                <span
                  className={`t-meta a-pastilla ${
                    p.publicado ? "a-pastilla--vivo" : "opacity-45"
                  }`}
                >
                  {p.publicado ? "En la web" : "Borrador"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
