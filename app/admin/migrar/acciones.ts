"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { usuarioDeLaSesion } from "@/lib/auth";
import { siguientePaso, type Paso } from "@/lib/migracion";

/*
 * Un paso del traslado por llamada. Lo largo es descargar y volver a subir
 * cada archivo, así que se hace de uno en uno: cada llamada termina rápido y
 * la siguiente sigue donde quedó.
 */
export async function darUnPaso(): Promise<Paso | { error: string }> {
  if (!(await usuarioDeLaSesion())) redirect("/admin/entrar");

  try {
    const paso = await siguientePaso();
    if (paso.hecho) {
      revalidatePath("/admin");
      for (const lang of ["es", "en"]) {
        revalidatePath(`/${lang}`);
        revalidatePath(`/${lang}/work`);
      }
    }
    return paso;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error desconocido." };
  }
}
