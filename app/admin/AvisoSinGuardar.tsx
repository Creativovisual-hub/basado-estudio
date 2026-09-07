"use client";

import { useEffect } from "react";

/* ---------------------------------------------------------------------------
   Aviso de cambios sin guardar.

   El formulario de un proyecto es largo y se tarda un rato en rellenarlo.
   Cerrar la pestaña o volver atrás por error y perder veinte minutos de
   escritura es de las peores experiencias que puede dar una herramienta, y
   se evita con diez líneas.

   Sólo avisa si algo cambió de verdad: se escucha la primera modificación y
   se deja de avisar en cuanto se envía el formulario.
--------------------------------------------------------------------------- */

export default function AvisoSinGuardar({ formulario }: { formulario: string }) {
  useEffect(() => {
    const form = document.getElementById(formulario) as HTMLFormElement | null;
    if (!form) return;

    let sucio = false;
    const ensuciar = () => {
      sucio = true;
    };
    const limpiar = () => {
      sucio = false;
    };

    const alSalir = (e: BeforeUnloadEvent) => {
      if (!sucio) return;
      // El navegador enseña su propio mensaje; el nuestro se ignora desde
      // hace años. Basta con cancelar el evento para que pregunte.
      e.preventDefault();
    };

    form.addEventListener("input", ensuciar);
    form.addEventListener("submit", limpiar);
    window.addEventListener("beforeunload", alSalir);

    return () => {
      form.removeEventListener("input", ensuciar);
      form.removeEventListener("submit", limpiar);
      window.removeEventListener("beforeunload", alSalir);
    };
  }, [formulario]);

  return null;
}
