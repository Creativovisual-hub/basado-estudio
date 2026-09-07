import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { imagenesTrasladadas, totalDeImagenes } from "@/lib/migracion";
import Traslado from "./Traslado";

export const dynamic = "force-dynamic";

export default async function Migrar() {
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  const total = totalDeImagenes();
  const hechas = await imagenesTrasladadas().catch(() => 0);

  return (
    <main className="max-w-[46rem] p-5 md:p-8">
      <h1 className="text-[1.7rem] font-semibold tracking-[-0.035em]">
        Traer los proyectos de Adobe
      </h1>
      <p className="t-meta mb-7 mt-2 max-w-[62ch] leading-relaxed opacity-45">
        Copia los ocho proyectos que hoy llegan de Adobe Portfolio a tu panel:
        sus textos, su orden y sus {total} imágenes, que pasan a vivir en tu
        propio almacén. A partir de ahí podrás editarlos como cualquier otro.
      </p>

      <Traslado total={total} hechas={hechas} />

      <div className="a-panel mt-6 p-5 md:p-6">
        <h2 className="t-meta mb-4 opacity-45">Qué conviene saber</h2>
        <ul className="t-body flex flex-col gap-3 opacity-65">
          <li>
            <strong className="font-semibold">Tu web no se cae en ningún momento.</strong>{" "}
            Cada proyecto trasladado pasa a servirse desde tu almacén; los que
            aún no lo estén siguen llegando de Adobe, como hasta ahora.
          </li>
          <li>
            <strong className="font-semibold">No se duplica nada.</strong> En
            cuanto un proyecto existe en el panel, deja de leerse el de Adobe.
          </li>
          <li>
            <strong className="font-semibold">Se puede parar y retomar.</strong>{" "}
            El progreso no se guarda en ningún contador: se deduce de lo que ya
            está trasladado, así que nunca queda a medias de forma confusa.
          </li>
          <li>
            <strong className="font-semibold">Adobe no se toca.</strong> Se
            copian las imágenes, no se mueven. Tu portfolio allí queda intacto
            por si quieres conservarlo.
          </li>
        </ul>
      </div>
    </main>
  );
}
