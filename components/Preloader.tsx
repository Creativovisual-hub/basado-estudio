"use client";

import { useEffect, useRef, useState } from "react";

/* ===========================================================================
   Pantalla de carga: contador de 0 a 100 sobre la pieza de introducción.

   El porcentaje no es un temporizador disfrazado. Cuenta lo que de verdad
   falta: las imágenes que ya ha resuelto el documento y las tipografías. Sí
   lleva un suelo de tiempo para que en una conexión rápida no aparezca y
   desaparezca de un fogonazo, y un techo para que una imagen atascada no deje
   a nadie encerrado.

   Se muestra una vez por sesión. La marca se lee en un script en línea antes
   del primer pintado (ver app/layout.tsx), así que en las visitas siguientes
   la pantalla no llega a dibujarse: no hay parpadeo.
   =========================================================================== */

/*
 * El recorrido tiene que poder leerse: con un suelo demasiado corto la cifra
 * salta de golpe y no se ve contar. 2,6 s deja pasar los cien números a un
 * ritmo que se sigue con la vista sin llegar a impacientar.
 */
const SUELO_MS = 2600; // lo mínimo que dura el recorrido, aunque todo esté listo
const TECHO_MS = 7000; // rendición: se abre igualmente
const PASO_MS = 55; // cada cuánto se refresca la cifra
const REMATE_MS = 420; // el 100% se sostiene un momento antes de abrir

export type MedioIntro = { src: string; tipo: "video" | "imagen" } | null;

export default function Preloader({
  medio,
  etiqueta,
}: {
  medio: MedioIntro;
  etiqueta: string;
}) {
  const [pct, setPct] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const [fuera, setFuera] = useState(false);
  const raiz = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /*
     * Ya vista en esta sesión: el CSS la oculta, pero hay que salir aquí
     * además. Si no, el efecto seguiría su curso y dejaría el scroll
     * bloqueado un segundo y medio sin que se vea nada en pantalla.
     */
    if (document.documentElement.classList.contains("sin-precarga")) {
      setFuera(true);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cerrar = () => {
      try {
        sessionStorage.setItem("precarga", "1");
      } catch {
        // Modo privado: se volverá a ver en la próxima página. Aceptable.
      }
      setSaliendo(true);
      window.setTimeout(() => setFuera(true), reduce ? 0 : 900);
    };

    if (reduce) {
      setPct(100);
      cerrar();
      return;
    }

    // El documento no puede desplazarse mientras la pantalla está puesta.
    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";

    const inicio = performance.now();
    let temporizador = 0;
    let visto = 0; // el porcentaje nunca retrocede

    /** Cuánto hay realmente resuelto, de 0 a 1. */
    const real = () => {
      const imgs = Array.from(document.images);
      const listas = imgs.filter((i) => i.complete && i.naturalWidth > 0).length;
      const fuentes = document.fonts?.status === "loaded" ? 1 : 0;
      const total = imgs.length + 1;
      return total > 0 ? (listas + fuentes) / total : 1;
    };

    const latido = () => {
      const t = performance.now() - inicio;
      // El suelo marca el ritmo mínimo; lo real puede ir por delante.
      const porTiempo = Math.min(t / SUELO_MS, 1);
      const objetivo = Math.min(real(), porTiempo);
      visto = Math.max(visto, objetivo);

      const listo = t >= SUELO_MS && real() >= 0.999;
      const rendido = t >= TECHO_MS;
      if (listo || rendido) visto = 1;

      setPct(Math.round(visto * 100));

      if (visto >= 1) {
        window.clearInterval(temporizador);
        window.setTimeout(cerrar, REMATE_MS);
      }
    };

    latido();
    temporizador = window.setInterval(latido, PASO_MS);

    return () => {
      window.clearInterval(temporizador);
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
    };
  }, []);

  // Al terminar, se devuelve el scroll y el nodo desaparece del árbol.
  useEffect(() => {
    if (!fuera) return;
    document.documentElement.classList.remove("lenis-stopped");
    document.body.style.overflow = "";
  }, [fuera]);

  if (fuera) return null;

  return (
    <div
      ref={raiz}
      className={`precarga ${saliendo ? "is-out" : ""}`}
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      {medio && (
        <div className="precarga__medio" aria-hidden="true">
          {medio.tipo === "video" ? (
            <video src={medio.src} autoPlay muted loop playsInline />
          ) : (
            <img src={medio.src} alt="" />
          )}
        </div>
      )}

      <div className="precarga__cifra" aria-hidden="true">
        {pct}
        <span className="precarga__pc">%</span>
      </div>

      <div className="precarga__barra" aria-hidden="true">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}
