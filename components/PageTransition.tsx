"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Transición entre páginas: un velo de tinta barre desde abajo al entrar
 * y el contenido aparece con un fade corto. Nada de wipes largos.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [veilDone, setVeilDone] = useState(false);

  // El velo vuelve para cada navegación y se retira al terminar.
  useEffect(() => setVeilDone(false), [pathname]);

  if (reduce) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname}>
        {/*
         * Se desmonta al acabar: un elemento fijo a pantalla completa por
         * encima del contenido (z-55) no debe quedarse en el árbol de capas
         * el resto de la vida de la página.
         */}
        {!veilDone && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[55] origin-bottom bg-ink"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setVeilDone(true)}
          />
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
