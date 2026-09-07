"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

/* ---------------------------------------------------------------------------
   Formulario del panel, con estado de envío y mensaje de error.

   El botón se desactiva mientras se envía. No es un detalle estético: sin
   eso, dos clics seguidos mandan el formulario dos veces, y en la
   instalación eso significa intentar crear la cuenta dos veces.
--------------------------------------------------------------------------- */

function Boton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="t-meta mt-2 w-full bg-inv px-6 py-4 text-inv-fg transition-opacity duration-300 disabled:opacity-40"
    >
      {pending ? "Un momento…" : children}
    </button>
  );
}

export default function Formulario({
  accion,
  envio,
  children,
}: {
  accion: (previo: string | null, datos: FormData) => Promise<string | undefined>;
  envio: string;
  children: React.ReactNode;
}) {
  const [mensaje, ejecutar] = useActionState<string | null, FormData>(
    async (previo, datos) => (await accion(previo, datos)) ?? null,
    null
  );

  const exito = Boolean(mensaje?.startsWith("listo:"));

  return (
    <form action={ejecutar} className="flex flex-col gap-4">
      {children}
      {/*
        Un mensaje que empieza por "listo:" es un acierto, no un fallo: se
        muestra en el color del texto y sin avisar como alarma a un lector de
        pantalla. Distinguirlos por el contenido evita tener que devolver dos
        cosas distintas desde cada acción.
      */}
      {mensaje && (
        <p
          role={exito ? "status" : "alert"}
          className={`t-meta leading-relaxed ${
            exito ? "opacity-55" : "text-[#c0392b]"
          }`}
        >
          {exito ? mensaje.slice(6).trim() : mensaje}
        </p>
      )}
      <Boton>{envio}</Boton>
    </form>
  );
}
