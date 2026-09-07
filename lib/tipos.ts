/* ---------------------------------------------------------------------------
   La forma de un proyecto tal como lo consumen las páginas.

   Vive aparte de dónde salen los datos a propósito: las páginas y los
   componentes hablan de esta forma y no saben de bases de datos ni de
   almacenes. Cambiar el origen —como acaba de pasar con Adobe Portfolio— no
   les afecta.
--------------------------------------------------------------------------- */

export type RemoteImage = {
  src: string;
  srcSet: string;
  /** Qué se ve en la imagen: lo lee un lector de pantalla y los buscadores. */
  alt?: string;
  width: number | null;
  height: number | null;
  ratio: number | null;
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  year: string | null;
  client: string;
  services: string[];
  intro: string;
  cover: { src: string; srcSet: string };
  images: RemoteImage[];
  /** Párrafos sin sitio asignado. Herencia de Adobe; ya no se usa. */
  notes: string[];
  /** Bloques de texto con su posición elegida: tras qué lámina aparecen. */
  bloques?: { posicion: number; parrafos: string[] }[];
  /** Descripción propia para buscadores; si falta, se recorta la intro. */
  descripcion?: string;
};
