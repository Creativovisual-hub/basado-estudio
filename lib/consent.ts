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

/*
 * Prefijos de las cookies que ponen Google y Meta. Se borran al rechazar:
 * dejar de cargar los scripts no basta si alguien ya aceptó antes —o visitó
 * el sitio cuando aún no había banner—, porque esas cookies duran hasta dos
 * años y seguirían identificando a la persona.
 */
const PREFIJOS = ["_ga", "_gid", "_gcl", "_fbp", "_fbc"];

export function borrarCookiesDeMedicion() {
  // El dominio propio y el de nivel superior: Google y Meta las escriben en
  // ".basadoestudio.com", y una cookie sólo se borra desde su mismo dominio.
  const host = location.hostname;
  const partes = host.split(".");
  const dominios = [undefined, host, `.${host}`];
  if (partes.length > 2) {
    const raiz = partes.slice(-2).join(".");
    dominios.push(raiz, `.${raiz}`);
  }

  for (const cookie of document.cookie.split(";")) {
    const nombre = cookie.split("=")[0]?.trim();
    if (!nombre || !PREFIJOS.some((p) => nombre.startsWith(p))) continue;
    for (const dominio of dominios) {
      document.cookie =
        `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
        (dominio ? `; domain=${dominio}` : "");
    }
  }
}

/** Reabre el banner desde cualquier parte, para cambiar de opinión. */
export function abrirCookies() {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}
