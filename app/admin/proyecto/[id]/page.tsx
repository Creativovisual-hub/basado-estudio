import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { obtenerProyecto, textosDe } from "@/lib/proyectos-db";
import { eliminar } from "../../proyectos";
import FichaProyecto from "../../FichaProyecto";
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

  return (
    <main className="gutter max-w-[68rem] py-12 md:py-16">
      <div className="mb-12 flex items-baseline justify-between gap-6">
        <Link href="/admin" className="t-meta link-underline opacity-55">
          ← Proyectos
        </Link>
        <span
          className={`t-meta a-pastilla ${
            p.publicado ? "a-pastilla--vivo" : "opacity-45"
          }`}
        >
          {p.publicado ? "En la web" : "Borrador"}
        </span>
      </div>

      <h1 className="t-head mb-3">{p.nombre}</h1>
      <p className="t-meta mb-12 opacity-40">/work/{p.slug}</p>

      <FichaProyecto p={ficha} />

      <div className="mt-16 border-t border-line pt-12">
        <Imagenes proyectoId={p.id} imagenes={imagenes} />
      </div>

      <div className="mt-16 border-t border-line pt-12">
        <Textos proyectoId={p.id} textos={textos} totalImagenes={imagenes.length} />
      </div>

      {/*
        Borrar va al final y separado: es la única acción de esta página que
        no se puede deshacer.
      */}
      <form action={borrarEste} className="mt-20 border-t border-line pt-8">
        <button
          type="submit"
          className="t-meta a-boton a-boton--linea opacity-55 transition-opacity hover:opacity-100"
        >
          Borrar este proyecto y sus imágenes
        </button>
      </form>
    </main>
  );
}
