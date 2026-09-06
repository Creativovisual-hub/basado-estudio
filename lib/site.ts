/* =========================================================================
   Configuración del sitio.

   Esto es lo único que hay que cambiar para poner la web en producción.
   Todo lo demás (metadatos, sitemap, robots, pie, contacto, JSON-LD) lee
   de aquí.
   ========================================================================= */

export const site = {
  /** Dominio en producción, sin barra final. */
  url: "https://basadoestudio.com",

  name: "BASADO ESTUDIO",
  shortName: "Basado Estudio",
  tagline: "Estudio creativo especializado en identidad visual y branding.",
  location: "Santiago / Chile",
  locale: "es_CL",

  email: "hola@basadoestudio.com",

  social: {
    instagram: "https://www.instagram.com/basadoestudio",
    behance: "https://www.behance.net/basadoestudio",
  },

  /**
   * Medición de Google Analytics 4 (formato G-XXXXXXXXXX). Vacío = apagado:
   * sin ID no se carga ningún script ni se pone ninguna cookie, así que el
   * sitio funciona igual mientras no lo rellenes.
   */
  analyticsId: "G-S04DQRR925",

  /**
   * Contenedor de Google Tag Manager (formato GTM-XXXXXXX). Es una
   * alternativa a lo anterior, no un complemento: usa uno u otro.
   *
   * Cuidado: el contenedor por sí solo NO mide nada. Hay que crear dentro
   * una etiqueta de configuración de GA4 apuntando a un ID G-XXXXXXXXXX y
   * publicar el contenedor. Si sólo se pega este ID, no habrá datos.
   */
  gtmId: "",

  /**
   * Píxel de Meta, para Facebook e Instagram (son sólo dígitos, unos quince).
   * Vacío = apagado. Sirve sobre todo si algún día se hace publicidad: sin él,
   * Meta no puede saber quién llegó a la web ni a quién volver a mostrarle
   * los anuncios.
   */
  metaPixelId: "28317147271272626",

  /** Portfolio de origen del que se leen los proyectos. */
  portfolioOrigin: "https://creativovisualchile.myportfolio.com",
} as const;

/** Handle de Instagram tal como se muestra en pantalla. */
export const instagramHandle = `@${site.social.instagram.split("/").filter(Boolean).pop()}`;

/** Perfil de Behance sin protocolo, para mostrarlo en texto. */
export const behanceLabel = site.social.behance.replace(/^https?:\/\/(www\.)?/, "");
