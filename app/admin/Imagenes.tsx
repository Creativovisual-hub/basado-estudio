"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { mover, ponerPortada, quitarImagen, registrarImagen } from "./proyectos";
import type { ImagenFila } from "@/lib/proyectos-db";

/* ---------------------------------------------------------------------------
   Imágenes del proyecto: subir, ordenar, elegir portada y borrar.

   La subida va del navegador al almacén sin pasar por el servidor, que sólo
   firma el permiso. Antes de subir, el navegador lee el ancho y el alto de
   cada foto: son los que permiten reservar el hueco en la página y que la
   web no dé saltos mientras cargan las imágenes.
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

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between gap-6">
        <h2 className="t-meta opacity-45">Imágenes ({imagenes.length})</h2>
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={Boolean(subiendo)}
          className="t-meta link-underline disabled:opacity-40"
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
        <p role="alert" className="t-meta mb-4 leading-relaxed text-[#c0392b]">
          {error}
        </p>
      )}

      {imagenes.length === 0 ? (
        <p className="t-body border-t border-line py-8 opacity-55">
          Sin imágenes todavía. La primera que subas será la portada del
          proyecto; después puedes cambiarla.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {imagenes.map((img, i) => (
            <li key={img.id} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] overflow-hidden bg-shade">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {img.portada && (
                  <span className="t-meta absolute left-2 top-2 bg-inv px-2 py-1 text-inv-fg">
                    Portada
                  </span>
                )}
              </div>

              <div className="t-meta flex flex-wrap items-center gap-x-3 gap-y-1 opacity-55">
                <button
                  type="button"
                  disabled={i === 0 || pendiente}
                  onClick={() => iniciar(() => { mover(proyectoId, img.id, "arriba"); })}
                  className="link-underline disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={i === imagenes.length - 1 || pendiente}
                  onClick={() => iniciar(() => { mover(proyectoId, img.id, "abajo"); })}
                  className="link-underline disabled:opacity-30"
                >
                  →
                </button>
                {!img.portada && (
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => iniciar(() => { ponerPortada(proyectoId, img.id); })}
                    className="link-underline"
                  >
                    Portada
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
                  className="link-underline text-[#c0392b]"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
