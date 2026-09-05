"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { site } from "@/lib/site";
import { getDict, nav, localePath, type Locale } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";
import LangSwitch from "./LangSwitch";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const t = getDict(locale);

  // Cerrar el menú al navegar.
  useEffect(() => setOpen(false), [pathname]);

  /*
   * Al salir del inicio de la página, el header se apoya en una banda del
   * color de fondo. Antes esto se resolvía con mix-blend-difference, que se
   * veía bien pero obliga al navegador a fusionar la cabecera fija contra
   * todo el fondo: en los case studies (12.000 px de scroll) Chrome dejaba
   * de pintar el contenido hasta forzar un repintado recargando.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const isActive = (path: string) => {
    const full = localePath(locale, path);
    return path === "work"
      ? pathname === full || pathname.startsWith(`${full}/`)
      : pathname === full;
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
          open
            ? "text-inv-fg"
            : scrolled
              ? "border-b border-line bg-bg/95 text-fg"
              : "text-fg"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="gutter flex h-full items-center justify-between gap-6">
          <Link
            href={localePath(locale)}
            aria-label={t.header.brandHome}
            className="t-meta shrink-0"
            style={{ letterSpacing: "0.09em" }}
          >
            {site.name}
          </Link>

          <div className="flex items-center gap-9">
            <nav className="hidden md:block" aria-label={t.header.nav}>
              <ul className="flex items-center gap-9">
                {nav.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={localePath(locale, item.path)}
                      data-active={isActive(item.path)}
                      aria-current={isActive(item.path) ? "page" : undefined}
                      className="t-meta link-underline"
                    >
                      {item[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <LangSwitch current={locale} label={t.common.langSwitch} />
              <ThemeToggle label={t.common.themeToggle} />

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu-movil"
                className="t-meta md:hidden"
              >
                {open ? t.header.close : t.header.menu}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa: navegación simplificada, tipografía grande */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-inv text-inv-fg md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <nav
              className="gutter flex flex-1 flex-col justify-center gap-2"
              aria-label={t.header.navMobile}
            >
              {nav.map((item, i) => (
                <span key={item.path} className="overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, delay: 0.06 + i * 0.06, ease: EASE }}
                  >
                    <Link
                      href={localePath(locale, item.path)}
                      className="t-head block uppercase"
                    >
                      {item[locale]}
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
