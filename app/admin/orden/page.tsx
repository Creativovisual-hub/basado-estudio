import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { listarProyectos } from "@/lib/proyectos-db";
import { moverEnPortada } from "../proyectos";

export const dynamic = "force-dynamic";

export default async function Orden() {
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const proyectos = await listarProyectos();
  const visibles = proyectos.filter((p) => p.publicado);

  return (
    <main className="p-5 md:p-8">
      <h1 className="text-[1.7rem] font-semibold tracking-[-0.035em]">Orden en la portada</h1>
      <p className="t-meta mb-7 mt-2 max-w-[62ch] leading-relaxed opacity-45">
        El orden en que se ven los proyectos en la portada y en Work. Los de
        Adobe Portfolio van después de éstos, en el orden que ya tenían.
      </p>

      {visibles.length === 0 ? (
        <p className="t-body opacity-65">
          No hay ningún proyecto visible todavía. Marca la casilla
          &laquo;Visible en la web&raquo; en alguno para que aparezca aquí.
        </p>
      ) : (
        <ul className="a-panel flex flex-col gap-1 p-4 md:p-5">
          {visibles.map((p, i) => (
            <li
              key={p.id}
              className="a-fila flex items-center gap-4 px-2 py-3"
            >
              <span className="t-meta w-6 shrink-0 opacity-35">{i + 1}</span>
              <span className="h-12 w-16 shrink-0 overflow-hidden bg-shade">
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
              <span className="flex-1 text-[1.15rem] font-semibold tracking-[-0.03em]">
                {p.nombre}
              </span>
              <span className="t-meta flex gap-3 opacity-55">
                <form action={moverEnPortada.bind(null, p.id, "arriba")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="link-underline disabled:opacity-25"
                    aria-label={`Subir ${p.nombre}`}
                  >
                    ↑
                  </button>
                </form>
                <form action={moverEnPortada.bind(null, p.id, "abajo")}>
                  <button
                    type="submit"
                    disabled={i === visibles.length - 1}
                    className="link-underline disabled:opacity-25"
                    aria-label={`Bajar ${p.nombre}`}
                  >
                    ↓
                  </button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
