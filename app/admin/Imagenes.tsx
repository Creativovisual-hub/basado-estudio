"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import {
  guardarAltDeImagen,
  ponerPortada,
  quitarImagen,
  registrarImagen,
  reordenar,
} from "./proyectos";
import type { ImagenFila } from "@/lib/proyectos-db";

/* ---------------------------------------------------------------------------
   Imágenes del proyecto: subir, arrastrar para ordenar, elegir portada,
   escribir el texto alternativo y borrar.

   La subida va del navegador al almacén sin pasar por el servidor, que sólo
   firma el permiso. Antes de subir, el navegador lee el ancho y el alto de
   cada foto: son los que permiten reservar el hueco en la página y que la
   web no dé saltos mientras cargan.

   El orden se cambia arrastrando. Con veinte fotos, mover una del final al
   principio a golpe de flecha son diecinueve clics.
--------------------------------------------------------------------------- */

/** Lee las medidas reales del archivo antes de subirlo. */
function medir(archivo: File): Promise<{ ancho: number; alto: number }> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolver({ ancho: img.naturalWidth, alto: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

export default function Imagenes({
  proyectoId,
  imagenes,
}: {
  proyectoId: string;
  imagenes: ImagenFila[];
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  // Orden local: se reordena al vuelo mientras se arrastra y se confirma al
  // soltar. Esperar al servidor para mover una miniatura se siente roto.
  const [lista, setLista] = useState(imagenes);
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  // Si el servidor manda una lista distinta (subida, borrado), manda la suya.
  const idsServidor = imagenes.map((i) => i.id).join(",");
  const idsLocales = lista.map((i) => i.id).join(",");
  if (idsServidor !== idsLocales && !arrastrando && !pendiente) {
    setLista(imagenes);
  }

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    if (!archivos.length) return;
    setError(null);

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      setSubiendo(`${i + 1} de ${archivos.length} · ${archivo.name}`);
      try {
        const { ancho, alto } = await medir(archivo);
        const subido = await upload(`proyectos/${proyectoId}/${archivo.name}`, archivo, {
          access: "public",
          handleUploadUrl: "/api/subida",
        });
        await registrarImagen(proyectoId, {
          url: subido.url,
          ruta: subido.pathname,
          ancho,
          alto,
        });
      } catch (err) {
        setError(
          `No se pudo subir "${archivo.name}". ` +
            (err instanceof Error ? err.message : "")
        );
        break;
      }
    }

    setSubiendo(null);
    if (entrada.current) entrada.current.value = "";
  }

  function soltarSobre(destinoId: string) {
    if (!arrastrando || arrastrando === destinoId) return;
    const desde = lista.findIndex((i) => i.id === arrastrando);
    const hasta = lista.findIndex((i) => i.id === destinoId);
    if (desde < 0 || hasta < 0) return;

    const nueva = [...lista];
    const [movida] = nueva.splice(desde, 1);
    nueva.splice(hasta, 0, movida);
    setLista(nueva);
    iniciar(() => {
      reordenar(proyectoId, nueva.map((i) => i.id));
    });
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">
          Imágenes{" "}
          <span className="t-meta ml-1 opacity-40">({lista.length})</span>
        </h2>
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={Boolean(subiendo)}
          className="t-meta a-boton"
        >
          {subiendo ? "Subiendo…" : "Añadir imágenes"}
        </button>
      </div>

      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={alElegir}
      />

      {subiendo && <p className="t-meta mb-4 opacity-55">{subiendo}</p>}
      {error && (
        <p role="alert" className="t-meta mb-4 leading-relaxed text-[#e0342f]">
          {error}
        </p>
      )}

      {lista.length === 0 ? (
        <p className="t-body py-6 opacity-55">
          Sin imágenes todavía. La primera que subas será la portada del
          proyecto; después puedes cambiarla.
        </p>
      ) : (
        <>
          <p className="t-meta mb-4 opacity-40">
            Arrastra las miniaturas para cambiar el orden.
          </p>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lista.map((img) => (
              <li
                key={img.id}
                draggable
                onDragStart={() => setArrastrando(img.id)}
                onDragEnd={() => setArrastrando(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  soltarSobre(img.id);
                }}
                className={`a-panel flex cursor-grab flex-col gap-3 p-3 transition-opacity ${
                  arrastrando === img.id ? "opacity-40" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-shade">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                  {img.portada && (
                    <span className="t-meta a-pastilla a-pastilla--vivo absolute left-2 top-2">
                      Portada
                    </span>
                  )}
                </div>

                <form
                  action={guardarAltDeImagen.bind(null, img.id)}
                  className="flex flex-col gap-2"
                >
                  <input
                    name="alt_es"
                    defaultValue={img.alt_es}
                    placeholder="Qué se ve (español)"
                    className="a-campo"
                  />
                  <input
                    name="alt_en"
                    defaultValue={img.alt_en}
                    placeholder="Qué se ve (inglés)"
                    className="a-campo"
                  />
                  <button type="submit" className="t-meta link-underline self-start opacity-55">
                    Guardar textos
                  </button>
                </form>

                <div className="t-meta flex flex-wrap items-center gap-x-4 gap-y-2 opacity-55">
                  {!img.portada && (
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => iniciar(() => { ponerPortada(proyectoId, img.id); })}
                      className="link-underline"
                    >
                      Hacer portada
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => {
                      if (confirm("¿Borrar esta imagen? No se puede deshacer.")) {
                        iniciar(() => { quitarImagen(img.id); });
                      }
                    }}
                    className="link-underline text-[#e0342f]"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="t-meta mt-5 max-w-[62ch] leading-relaxed opacity-40">
            El texto alternativo describe la imagen para quien no puede verla y
            para los buscadores. Escribe lo que se ve, no el nombre del
            proyecto: «cartel del menú sobre una mesa de madera», no «Latin Wok
            3».
          </p>
        </>
      )}
    </section>
  );
}
