"use client";

import { useState } from "react";
import { darUnPaso } from "./acciones";

/* ---------------------------------------------------------------------------
   Traslado en marcha.

   Llama al servidor una y otra vez, un paso por llamada, y va contando. Se
   puede parar en cualquier momento y retomar: el progreso no vive aquí, se
   deduce de lo que ya está en la base.
--------------------------------------------------------------------------- */

export default function Traslado({ total, hechas }: { total: number; hechas: number }) {
  const [enMarcha, setEnMarcha] = useState(false);
  const [hecho, setHecho] = useState(hechas >= total && total > 0);
  const [progreso, setProgreso] = useState(hechas);
  const [ahora, setAhora] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function arrancar() {
    setEnMarcha(true);
    setError(null);

    // Tope de seguridad: si algo no avanzara, esto evita un bucle infinito.
    for (let i = 0; i < 400; i++) {
      const paso = await darUnPaso();

      if ("error" in paso) {
        setError(paso.error);
        break;
      }
      if (paso.hecho) {
        setHecho(true);
        setProgreso(paso.total);
        setAhora(null);
        break;
      }

      setProgreso(paso.hechas);
      setAhora(paso.que);
    }

    setEnMarcha(false);
  }

  const porcentaje = total ? Math.round((progreso / total) * 100) : 0;

  return (
    <div className="a-panel p-5 md:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="t-meta opacity-45">
          {progreso} de {total} imágenes
        </p>
        <p className="t-meta opacity-45">{porcentaje}%</p>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--a-suave)]">
        <div
          className="a-filete h-full transition-[width] duration-500"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {hecho ? (
        <p className="t-body opacity-65">
          Traslado terminado. Los ocho proyectos ya viven en tu panel y sus
          imágenes en tu almacén.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={arrancar}
            disabled={enMarcha}
            className="t-meta a-boton"
          >
            {enMarcha ? "Trasladando…" : progreso > 0 ? "Continuar" : "Empezar el traslado"}
          </button>

          {ahora && <p className="t-meta mt-4 opacity-55">{ahora}</p>}

          <p className="t-meta mt-4 max-w-[58ch] leading-relaxed opacity-40">
            Puede tardar varios minutos. No cierres esta pestaña mientras
            avanza; si se corta, vuelve aquí y continúa donde se quedó.
          </p>
        </>
      )}

      {error && (
        <p role="alert" className="t-meta mt-4 leading-relaxed text-[#e0342f]">
          {error} — puedes volver a intentarlo: seguirá donde se quedó.
        </p>
      )}
    </div>
  );
}
