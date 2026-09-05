"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Conmutador de tema.
 *
 * El tema real lo fija un script en línea antes del primer pintado (ver
 * app/layout.tsx); aquí sólo se lee lo ya aplicado y se cambia. La elección
 * se guarda en el navegador; sin elección, manda la preferencia del sistema.
 */
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const attr = document.documentElement.dataset.theme as Theme | undefined;
    setTheme(
      attr ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("tema", next);
    } catch {
      // Modo privado o almacenamiento bloqueado: el tema vale para esta visita.
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-fg transition-colors duration-300 hover:bg-fg/[0.07] focus-visible:outline-offset-2"
    >
      {/* Un solo glifo que gira: sol en claro, luna en oscuro. */}
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
        {theme === "dark" ? (
          <path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
            fill="currentColor"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2" />
              <path d="M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
            </g>
          </>
        )}
      </svg>
    </button>
  );
}
