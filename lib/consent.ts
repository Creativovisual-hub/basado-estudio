/* =========================================================================
   Consentimiento de cookies.

   Una sola decisión guardada en el navegador: "si" o "no". Mientras no haya
   ninguna de las dos, no se carga ni Google Analytics ni el pixel de Meta,
   así que la web no pone ninguna cookie de seguimiento hasta que la persona
   elige. Esto es lo que exige la ley europea y lo que pide la chilena.

   Se guarda en localStorage y no en una cookie propia porque no hace falta
   que el servidor lo sepa: la decisión sólo gobierna scripts del navegador.
   ========================================================================= */

export type Consentimiento = "si" | "no";

export const CLAVE = "cookies";

/** Aviso interno para que el pie pueda reabrir el banner. */
export const EVENTO_ABRIR = "abrir-cookies";

export function leerConsentimiento(): Consentimiento | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "si" || v === "no" ? v : null;
  } catch {
    // Navegación privada con el almacenamiento bloqueado: sin decisión
    // guardada, y por tanto sin medición. Es el lado seguro.
    return null;
  }
}

export function guardarConsentimiento(v: Consentimiento) {
  try {
    localStorage.setItem(CLAVE, v);
  } catch {}
}

/** Reabre el banner desde cualquier parte, para cambiar de opinión. */
export function abrirCookies() {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}
