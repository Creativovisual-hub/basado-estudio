"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { site } from "@/lib/site";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/estudio", label: "Estudio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // Cerrar el menú al navegar.
  useEffect(() => setOpen(false), [pathname]);

  // Bloquear el scroll del documento mientras el menú está abierto.
  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", open);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape cierra el menú.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/work" ? pathname === "/work" || pathname.startsWith("/work/") : pathname === href;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 mix-blend-difference"
        style={{ height: "var(--header-h)" }}
      >
        <div className="gutter flex h-full items-center justify-between">
          <Link
            href="/"
            aria-label="BASADO ESTUDIO — inicio"
            className="t-meta text-bone"
            style={{ letterSpacing: "0.09em" }}
          >
            {site.name}
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:block" aria-label="Principal">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-active={isActive(item.href)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="t-meta link-underline text-bone"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Disparador mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="t-meta text-bone md:hidden"
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </header>

      {/* Menú mobile a pantalla completa: navegación simplificada, tipografía grande */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink text-bone md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <nav
              className="gutter flex flex-1 flex-col justify-center gap-2"
              aria-label="Principal móvil"
            >
              {NAV.map((item, i) => (
                <span key={item.href} className="overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, delay: 0.06 + i * 0.06, ease: EASE }}
                  >
                    <Link href={item.href} className="t-head block uppercase">
                      {item.label}
                    </Link>
                  </motion.span>
                </span>
              ))}
            </nav>
            <div className="gutter t-meta flex justify-between pb-8 opacity-60">
              <span>{site.location}</span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
