"use client";

import { useEffect } from "react";

/**
 * Fija el atributo lang del documento.
 *
 * El <html> lo pinta el layout raíz, que es común a los dos idiomas y no
 * conoce cuál está activo; este componente lo ajusta desde el layout de
 * idioma. Importa para lectores de pantalla, para el corte de palabras y
 * para los buscadores.
 */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
