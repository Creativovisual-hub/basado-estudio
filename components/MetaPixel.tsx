"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Píxel de Meta (Facebook e Instagram).
 *
 * Dos detalles propios de esta web, que no vienen en el código que da Meta:
 *
 * · El fragmento oficial cuenta la visita una sola vez, al cargar la página.
 *   Aquí las navegaciones internas no recargan nada, así que sin este efecto
 *   toda la sesión contaría como una única vista. Se avisa a mano en cada
 *   cambio de ruta, saltando la primera porque ya la cuenta el fragmento.
 *
 * · El script se carga después de que la página sea interactiva, para que la
 *   medición no compita con el primer pintado.
 */
export default function MetaPixel({ id }: { id: string }) {
  const ruta = usePathname();
  const primeraVez = useRef(true);

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [ruta]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');fbq('track','PageView');`}
      </Script>
      {/* Recuento de visitas sin JavaScript. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
