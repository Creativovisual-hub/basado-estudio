import { guardarBloque, nuevoTexto, quitarTexto } from "./proyectos";
import type { TextoFila } from "@/lib/proyectos-db";

/* ---------------------------------------------------------------------------
   Bloques de texto intercalados entre las láminas.

   Cada bloque sabe DÓNDE va: tras qué imagen aparece. Antes se repartían
   solos entre las fotos, y eso quitaba justo la decisión que importa —una
   ficha de proyecto se lee por su ritmo entre imagen y texto, no por tener
   los párrafos guardados en algún sitio.

   Latin Wok, de referencia: introducción arriba y cuatro bloques más de tres
   párrafos cada uno, repartidos entre sus diez láminas.

   Cada bloque se guarda por separado, con su propio botón. Un formulario
   único para todos obligaría a guardar cambios que quizá no querías tocar.
--------------------------------------------------------------------------- */

export default function Textos({
  proyectoId,
  textos,
  totalImagenes,
}: {
  proyectoId: string;
  textos: TextoFila[];
  totalImagenes: number;
}) {
  const crear = nuevoTexto.bind(null, proyectoId);

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between gap-6">
        <h2 className="t-meta opacity-45">
          Bloques de texto entre imágenes ({textos.length})
        </h2>
        <form action={crear}>
          <button type="submit" className="t-meta link-underline">
            Añadir bloque
          </button>
        </form>
      </div>

      {textos.length === 0 ? (
        <p className="t-body border-t border-line py-8 opacity-55">
          Sin bloques todavía. Son los respiros que separan las láminas: en
          Latin Wok hay cuatro, de tres párrafos cada uno. La introducción del
          proyecto va aparte, arriba en el formulario.
        </p>
      ) : (
        <ul className="flex flex-col gap-10">
          {textos.map((t, i) => (
            <li key={t.id} className="a-bloque">
              <form action={guardarBloque.bind(null, t.id)} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="t-meta opacity-55">
                      Bloque {i + 1} · aparece después de la imagen
                    </span>
                    <input
                      name="posicion"
                      type="number"
                      min={0}
                      max={Math.max(totalImagenes, 1)}
                      defaultValue={t.posicion}
                      className="a-campo w-24"
                    />
                  </label>
                  <span className="t-meta max-w-[26ch] leading-relaxed opacity-40">
                    De 1 a {Math.max(totalImagenes, 1)}. Con 0 aparece antes de
                    la primera lámina.
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="t-meta opacity-55">Español</span>
                    <textarea
                      name="texto_es"
                      rows={5}
                      defaultValue={t.texto_es}
                      className="a-campo"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="t-meta opacity-55">Inglés</span>
                    <textarea
                      name="texto_en"
                      rows={5}
                      defaultValue={t.texto_en}
                      className="a-campo"
                    />
                  </label>
                </div>

                <span className="t-meta leading-relaxed opacity-40">
                  Un párrafo por línea, como en Latin Wok.
                </span>

                <div className="flex items-center gap-6">
                  <button type="submit" className="t-meta a-boton">
                    Guardar bloque
                  </button>
                </div>
              </form>

              <form action={quitarTexto.bind(null, t.id)} className="mt-3">
                <button
                  type="submit"
                  className="t-meta link-underline opacity-45 transition-opacity hover:opacity-100"
                >
                  Borrar bloque
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
