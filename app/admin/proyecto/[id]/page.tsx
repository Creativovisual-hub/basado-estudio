import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { obtenerProyecto, textosDe } from "@/lib/proyectos-db";
import { duplicar, eliminar } from "../../proyectos";
import FichaProyecto from "../../FichaProyecto";
import AvisoSinGuardar from "../../AvisoSinGuardar";
import Imagenes from "../../Imagenes";
import Textos from "../../Textos";

export const dynamic = "force-dynamic";

export default async function EditarProyecto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const { id } = await params;
  const p = await obtenerProyecto(id).catch(() => null);
  if (!p) notFound();

  const { imagenes, ...ficha } = p;
  const textos = await textosDe(p.id);
  const borrarEste = eliminar.bind(null, p.id);
  const duplicarEste = duplicar.bind(null, p.id);

  return (
    <main className="p-5 md:p-8">
      <div className="mb-6 flex items-baseline justify-between gap-6">
        <Link href="/admin" className="t-meta link-underline opacity-55">
          ← Proyectos
        </Link>

        <div className="flex items-center gap-4">
          {/* Ver la ficha tal como queda en la web, sin salir del panel. */}
          <a
            href={`/es/work/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            className="t-meta link-underline opacity-55 transition-opacity hover:opacity-100"
          >
            Ver en la web ↗
          </a>

          <span
            className={`t-meta a-pastilla ${
              p.publicado ? "a-pastilla--vivo" : "opacity-45"
            }`}
          >
            {p.publicado ? "En la web" : "Borrador"}
          </span>
        </div>
      </div>

      <h1 className="text-[1.7rem] font-semibold tracking-[-0.035em]">{p.nombre}</h1>
      <p className="t-meta mb-7 mt-2 opacity-40">/work/{p.slug}</p>

      <FichaProyecto
        p={ficha}
        medio={
          <>
            <div className="a-panel mt-6 p-5 md:p-6">
              <Imagenes proyectoId={p.id} imagenes={imagenes} />
            </div>

            <div className="a-panel mt-6 p-5 md:p-6">
              <Textos proyectoId={p.id} textos={textos} totalImagenes={imagenes.length} />
            </div>
          </>
        }
      />
      <AvisoSinGuardar formulario="ficha-proyecto" />

      {/*
        Borrar va al final y separado: es la única acción de esta página que
        no se puede deshacer.
      */}
      <div className="mt-6 flex flex-wrap gap-3">
        <form action={duplicarEste}>
          <button type="submit" className="t-meta a-boton a-boton--linea">
            Duplicar proyecto
          </button>
        </form>
        <form action={borrarEste}>
        <button
          type="submit"
          className="t-meta a-boton a-boton--linea opacity-55 transition-opacity hover:opacity-100"
        >
            Borrar este proyecto y sus imágenes
          </button>
        </form>
      </div>
    </main>
  );
}
