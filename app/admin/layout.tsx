import type { Metadata } from "next";
import { db, hayBaseDeDatos } from "@/lib/db";
import { asegurarEsquema } from "@/lib/esquema";
import { usuarioDeLaSesion } from "@/lib/auth";
import { salir } from "./acciones";
import Barra from "./Barra";

/*
 * El panel no lleva la cabecera ni el pie del sitio: es una herramienta de
 * trabajo, no una página más del portfolio. Comparte la tipografía y los
 * colores para no sentirse ajeno, y nada más.
 */
export const metadata: Metadata = {
  title: "Panel — BASADO ESTUDIO",
  // Que ningún buscador lo indexe ni lo siga.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Puesta al día del esquema antes de nada. Es lo que permite añadir una
   * columna en el código y que aparezca sola, sin que nadie tenga que
   * ejecutar nada a mano. Si la base no está configurada todavía, se sigue
   * adelante: la pantalla de instalación explicará qué falta.
   */
  if (hayBaseDeDatos()) {
    try {
      await asegurarEsquema((instruccion) => db().query(instruccion));
    } catch (error) {
      console.error("[panel] no se pudo poner al día el esquema:", error);
    }
  }

  const dentro = Boolean(await usuarioDeLaSesion());

  return (
    <div className="a-lienzo min-h-svh text-fg md:flex">
      {dentro && <Barra salir={salir} />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
