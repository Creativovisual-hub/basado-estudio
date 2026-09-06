"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import MetaPixel from "./MetaPixel";
import {
  EVENTO_ABRIR,
  borrarCookiesDeMedicion,
  guardarConsentimiento,
  leerConsentimiento,
  type Consentimiento,
} from "@/lib/consent";

export type TextosCookies = {
  titulo: string;
  texto: string;
  aceptar: string;
  rechazar: string;
};

/**
 * Banner de cookies y, a la vez, la llave que enciende la medición.
 *
 * Que las dos cosas vivan en el mismo componente no es casualidad: es la
 * única forma de garantizar que ningún script de seguimiento pueda cargarse
 * antes de que alguien diga que sí. Si el banner y los scripts estuvieran
 * separados, bastaría un descuido para que se colaran.
 *
 * La decisión se lee tras montar, no durante el pintado del servidor: en el
 * servidor no existe localStorage, y leerlo antes provocaría un desajuste de
 * hidratación. Por eso el estado empieza en "sin saber" y el banner no se
 * dibuja en ese primer instante.
 */
export default function Cookies({
  gaId,
  gtmId,
  pixelId,
  t,
}: {
  gaId?: string;
  gtmId?: string;
  pixelId?: string;
  t: TextosCookies;
}) {
  const [decision, setDecision] = useState<Consentimiento | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const guardada = leerConsentimiento();
    setDecision(guardada);
    // Sin decisión previa, el banner aparece con un respiro, para no competir
    // con la entrada de la portada.
    if (!guardada) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  // El pie puede volver a abrirlo para cambiar de opinión.
  useEffect(() => {
    const abrir = () => setVisible(true);
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  const responder = (v: Consentimiento) => {
    guardarConsentimiento(v);
    setDecision(v);
    setVisible(false);
    if (v === "no") {
      // Rechazar no es sólo dejar de cargar: hay que retirar lo ya puesto.
      // Y recargar después, porque un script ya cargado no se desmonta.
      borrarCookiesDeMedicion();
      window.location.reload();
    }
  };

  const acepta = decision === "si";

  return (
    <>
      {acepta && gaId && <GoogleAnalytics gaId={gaId} />}
      {acepta && gtmId && <GoogleTagManager gtmId={gtmId} />}
      {acepta && pixelId && <MetaPixel id={pixelId} />}

      {visible && (
        <div className="cookies" role="dialog" aria-label={t.titulo}>
          <p className="t-meta cookies__texto">{t.texto}</p>
          <div className="cookies__acciones">
            <button type="button" className="cookies__btn" onClick={() => responder("no")}>
              {t.rechazar}
            </button>
            <button
              type="button"
              className="cookies__btn cookies__btn--si"
              onClick={() => responder("si")}
            >
              {t.aceptar}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
