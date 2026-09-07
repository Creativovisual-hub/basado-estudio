import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { obtenerProyecto } from "@/lib/proyectos-db";
import { eliminar } from "../../proyectos";
import FichaProyecto from "../../FichaProyecto";
import Imagenes from "../../Imagenes";

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
  const borrarEste = eliminar.bind(null, p.id);

  return (
    <main className="gutter max-w-[64rem] py-14">
      <div className="mb-12 flex items-baseline justify-between gap-6">
        <Link href="/admin" className="t-meta link-underline opacity-55">
          ← Proyectos
        </Link>
        <span className="t-meta opacity-40">
          {p.publicado ? "Visible en la web" : "Borrador"}
        </span>
      </div>

      <h1 className="t-head mb-12">{p.nombre}</h1>

      <FichaProyecto p={ficha} />

      <div className="mt-16 border-t border-line pt-12">
        <Imagenes proyectoId={p.id} imagenes={imagenes} />
      </div>

      {/*
        Borrar va al final y separado: es la única acción de esta página que
        no se puede deshacer.
      */}
      <form action={borrarEste} className="mt-20 border-t border-line pt-8">
        <button
          type="submit"
          className="t-meta link-underline opacity-45 transition-opacity hover:opacity-100"
        >
          Borrar este proyecto y sus imágenes
        </button>
      </form>
    </main>
  );
}
