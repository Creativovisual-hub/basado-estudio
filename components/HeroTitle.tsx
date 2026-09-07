"use client";

import { useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------------------
   Titular del hero: las líneas fijas entran desde detrás de su máscara y la
   última se escribe sola, se borra y se escribe otra.

   Decisiones que importan:

   · El servidor manda ya la primera palabra escrita. Sin JavaScript, o con
     menos movimiento pedido, el titular se lee entero y quieto. La frase
     nunca depende de que la animación arranque.
   · La escritura empieza cuando termina la entrada de las líneas, no antes:
     dos animaciones a la vez sobre el mismo titular se estorban.
   · El nombre accesible del encabezado es fijo (aria-label). Sin eso, un
     lector de pantalla anunciaría el titular otra vez con cada letra.
   · Un solo temporizador encadenado, no un intervalo: cada fase dura lo suyo
     y así no hay dos relojes que se desincronicen.
--------------------------------------------------------------------------- */

const ESCRIBIR = 78; // ms por letra al escribir
const BORRAR = 34; // ms por letra al borrar
const ESPERA = 2600; // ms con la palabra completa en pantalla
const ANTES = 420; // ms en blanco antes de la siguiente

export default function HeroTitle({
  lines,
  words,
  delay = 0.15,
  stagger = 0.1,
}: {
  lines: string[];
  words: string[];
  delay?: number;
  stagger?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [texto, setTexto] = useState(words[0] ?? "");
  const [tecleando, setTecleando] = useState(false);
  const reloj = useRef(0);

  // Entrada de las líneas. Temporizador y no requestAnimationFrame: los
  // navegadores lo congelan en pestañas de segundo plano.
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 30);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let indice = 0;
    let letras = words[0].length;
    let borrando = true;

    // Se espera a que la última línea haya terminado de subir.
    const arranque = (delay + (lines.length - 1) * stagger) * 1000 + 1200;

    const paso = () => {
      const palabra = words[indice];

      if (borrando) {
        letras -= 1;
        setTexto(palabra.slice(0, letras));
        if (letras === 0) {
          borrando = false;
          indice = (indice + 1) % words.length;
          reloj.current = window.setTimeout(paso, ANTES);
          return;
        }
        reloj.current = window.setTimeout(paso, BORRAR);
        return;
      }

      letras += 1;
      setTexto(palabra.slice(0, letras));
      if (letras === palabra.length) {
        borrando = true;
        reloj.current = window.setTimeout(paso, ESPERA);
        return;
      }
      reloj.current = window.setTimeout(paso, ESCRIBIR);
    };

    reloj.current = window.setTimeout(() => {
      setTecleando(true);
      paso();
    }, arranque);

    return () => window.clearTimeout(reloj.current);
  }, [words, lines.length, delay, stagger]);

  const linea = (contenido: React.ReactNode, i: number) => (
    <span key={i} className={`rv-line ${visible ? "is-in" : ""}`}>
      <span style={{ "--rv-d": `${delay + i * stagger}s` } as React.CSSProperties}>
        {contenido}
      </span>
    </span>
  );

  return (
    <span className="rv-lines">
      {lines.map((l, i) => linea(l, i))}
      {linea(
        <>
          {texto}
          <span
            aria-hidden="true"
            className={`type-caret ${tecleando ? "is-typing" : ""}`}
          />
        </>,
        lines.length
      )}
    </span>
  );
}
