import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { listarProyectos } from "@/lib/proyectos-db";
import { hayUsuarios } from "./acciones";
import { nuevoProyecto } from "./proyectos";
import Tarjeta from "./Tarjeta";

export const dynamic = "force-dynamic";

export default async function Panel() {
  if (!(await hayUsuarios())) redirect("/admin/instalar");
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const proyectos = await listarProyectos();
  const visibles = proyectos.filter((p) => p.publicado).length;
  const imagenes = proyectos.reduce((n, p) => n + p.imagenes, 0);

  return (
    <main className="p-5 md:p-8">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-[1.7rem] font-semibold tracking-[-0.035em]">
            Tablero
          </h1>
          <p className="a-nota mt-2">Contenido de basadoestudio.com</p>
        </div>

        <form action={nuevoProyecto} data-guia="nuevo">
          <button type="submit" className="a-etiqueta a-boton">
            <span aria-hidden="true" className="text-[1.1em] leading-none">
              +
            </span>
            Nuevo proyecto
          </button>
        </form>
      </header>

      <section data-guia="resumen" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tarjeta titulo="Proyectos" cifra={proyectos.length} nota="Creados en el panel" />
        <Tarjeta titulo="En la web" cifra={visibles} nota="Visibles para el público" acento />
        <Tarjeta titulo="Borradores" cifra={proyectos.length - visibles} nota="Sin publicar" />
        <Tarjeta titulo="Imágenes" cifra={imagenes} nota="En tu almacén" />
      </section>

      <section data-guia="lista" className="a-panel p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[1.15rem] font-semibold tracking-[-0.03em]">
            Tus proyectos
          </h2>
          <p className="a-etiqueta opacity-40">
            Los de Adobe Portfolio no salen aquí
          </p>
        </div>

        {proyectos.length === 0 ? (
          <div className="py-10 text-center">
            <p className="t-body mb-2 opacity-65">Todavía no hay ninguno.</p>
            <p className="a-nota mx-auto">
              Los ocho que ya se ven en la web siguen llegando de Adobe
              Portfolio. Se irán retirando de allí a medida que los recrees
              aquí.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {proyectos.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/proyecto/${p.id}`}
                  className="a-fila -mx-2 flex items-center gap-4 px-2 py-3"
                >
                  <span className="h-14 w-20 shrink-0 overflow-hidden rounded-[10px] bg-shade">
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
                    <span className="block truncate text-[1.05rem] font-semibold tracking-[-0.025em]">
                      {p.nombre}
                    </span>
                    <span className="a-etiqueta mt-1.5 block opacity-40">
                      /{p.slug} · {p.imagenes}{" "}
                      {p.imagenes === 1 ? "imagen" : "imágenes"}
                    </span>
                  </span>

                  <span
                    className={`a-etiqueta a-pastilla ${
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
      </section>
    </main>
  );
}
