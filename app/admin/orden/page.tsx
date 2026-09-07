import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { listarProyectos } from "@/lib/proyectos-db";
import Arrastrable from "./Arrastrable";

export const dynamic = "force-dynamic";

export default async function Orden() {
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const visibles = (await listarProyectos()).filter((p) => p.publicado);

  return (
    <main className="p-5 md:p-8">
      <h1 className="text-[1.7rem] font-semibold tracking-[-0.035em]">
        Orden en la portada
      </h1>
      <p className="t-meta mb-7 mt-2 max-w-[62ch] leading-relaxed opacity-45">
        Arrastra los proyectos para cambiar el orden en que se ven en la
        portada y en Work. Se guarda solo, no hay que confirmar nada. Con
        teclado: tabulador para llegar a una fila y Alt + flecha para moverla.
        El icono de la papelera borra el proyecto, preguntando antes.
      </p>

      {visibles.length === 0 ? (
        <div className="a-panel p-5 md:p-6">
          <p className="t-body opacity-65">
            No hay ningún proyecto visible todavía. Marca la casilla
            &laquo;Visible en la web&raquo; en alguno para que aparezca aquí.
          </p>
        </div>
      ) : (
        <Arrastrable
          inicial={visibles.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            slug: p.slug,
            imagenes: p.imagenes,
            miniatura: p.miniatura,
          }))}
        />
      )}
    </main>
  );
}
