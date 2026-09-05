"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Revelado de imagen: la máscara sube y la imagen suelta un ligero
 * sobre-escalado. Un solo gesto, sin parallax ni rebotes.
 *
 * Las imágenes viven en el CDN de Adobe Portfolio, que ya publica variantes
 * por anchura: se pasan tal cual en srcSet para que el navegador elija.
 */
export default function CaseImage({
  src,
  srcSet,
  sizes = "100vw",
  alt,
  ratio,
  priority = false,
  className = "",
}: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  ratio: number | null;
  priority?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`relative overflow-hidden bg-[#e7e5e1] ${className}`}
      style={{ aspectRatio: String(ratio ?? 16 / 9) }}
    >
      <motion.img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="h-full w-full object-cover"
        initial={reduce ? false : { scale: 1.07, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 1.25, ease: EASE }}
      />
    </div>
  );
}
