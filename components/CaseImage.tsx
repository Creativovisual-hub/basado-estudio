"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Revelado de imagen: fundido con un ligero sobre-escalado que se asienta.
 *
 * Igual que los textos, la animación es CSS y el estado final se aplica con
 * una clase, con temporizador de respaldo: una imagen nunca se queda oculta
 * porque el observador no haya llegado a dispararse.
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
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);

    const timer = window.setTimeout(() => setShown(true), 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-shade ${className}`}
      style={{ aspectRatio: String(ratio ?? 16 / 9) }}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`rv-img h-full w-full object-cover ${shown ? "is-in" : ""}`}
      />
    </div>
  );
}
