import type { Metadata } from "next";

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-bg text-fg">{children}</div>;
}
