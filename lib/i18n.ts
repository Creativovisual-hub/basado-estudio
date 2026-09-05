/* =========================================================================
   Idiomas del sitio.

   Las rutas llevan el idioma delante: /es/work, /en/work. Los segmentos son
   los mismos en ambos (work, studio, services, contact) para que un enlace
   compartido se pueda cambiar de idioma sin recalcular la ruta; lo que se
   traduce son las etiquetas.
   ========================================================================= */

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v);

/** Etiqueta del idioma en el conmutador. */
export const localeLabel: Record<Locale, string> = { es: "ES", en: "EN" };

/** Código para el atributo lang y para hreflang. */
export const htmlLang: Record<Locale, string> = { es: "es-CL", en: "en" };

export const nav = [
  { path: "work", es: "Work", en: "Work" },
  { path: "studio", es: "Estudio", en: "Studio" },
  { path: "services", es: "Servicios", en: "Services" },
  { path: "contact", es: "Contacto", en: "Contact" },
] as const;

type Dict = {
  meta: {
    homeTitle: string;
    homeDescription: string;
    workTitle: string;
    workDescription: string;
    studioTitle: string;
    studioDescription: string;
    servicesTitle: string;
    servicesDescription: string;
    contactTitle: string;
    contactDescription: string;
    orgDescription: string;
  };
  home: {
    heroLines: string[];
    support: string;
    projectsHeading: string;
    studioTag: string;
    studioLines: string[];
    studioBody: string;
    studioLink: string;
    ctaLines: string[];
    ctaLink: string;
  };
  base: {
    line1: string;
    line2Pre: string;
    line2Hi: string;
    subPre: string;
    subHi: string;
    subPost: string;
    tags: string[];
    rockAlt: string;
  };
  work: { titleLines: string[]; count: (n: number) => string };
  studio: {
    tag: string;
    titleLines: string[];
    manifesto: string[];
    claim: string;
    imageAlt: string;
    howTag: string;
    how: string[];
    facts: [string, string][];
    link: string;
  };
  services: {
    tag: string;
    titleLines: string[];
    items: { name: string; text: string }[];
    ctaLines: string[];
    ctaLink: string;
  };
  contact: {
    tag: string;
    titleLines: string[];
    channels: { email: string; instagram: string; behance: string };
    note: string;
  };
  project: {
    client: string;
    year: string;
    category: string;
    services: string;
    nextTag: string;
    plateAlt: (name: string, i: number, total: number) => string;
    viewProject: string;
  };
  header: { menu: string; close: string; nav: string; navMobile: string; brandHome: string };
  footer: { worldwide: string; backToTop: string; social: string };
  common: { skipToContent: string; themeToggle: string; langSwitch: string; loading: string };
  notFound: { tag: string; title: string; link: string };
};

const es: Dict = {
  meta: {
    homeTitle: "BASADO ESTUDIO — Identidad visual y branding",
    homeDescription:
      "Estudio creativo especializado en identidad visual y branding. Santiago de Chile. Diseñamos marcas basadas en algo real.",
    workTitle: "Work",
    workDescription:
      "Proyectos de identidad visual, branding, dirección de arte y diseño web de Basado Estudio.",
    studioTitle: "Estudio",
    studioDescription:
      "Basado Estudio es un estudio creativo de identidad visual y branding en Santiago de Chile. Diseñamos marcas basadas en algo real.",
    servicesTitle: "Servicios",
    servicesDescription:
      "Identidad visual, branding, dirección de arte y diseño web. Basado Estudio, Santiago de Chile.",
    contactTitle: "Contacto",
    contactDescription: "¿Tienes algo en mente? Hablemos. Basado Estudio, Santiago de Chile.",
    orgDescription: "Estudio creativo especializado en identidad visual y branding.",
  },
  home: {
    heroLines: ["BASADO", "EN ALGO REAL."],
    support: "Estudio creativo especializado en identidad visual y branding.",
    projectsHeading: "Proyectos seleccionados",
    studioTag: "(Estudio)",
    studioLines: ["Diseñamos marcas", "basadas en algo real."],
    studioBody:
      "Trabajamos en pocos proyectos al año, de principio a fin y con el cliente dentro del proceso. Sin plantillas, sin capas decorativas y sin nada que la marca no pueda sostener.",
    studioLink: "Conocer el estudio",
    ctaLines: ["¿Tienes algo", "en mente?"],
    ctaLink: "Hablemos.",
  },
  base: {
    line1: "Tu marca necesita más",
    line2Pre: "que un ",
    line2Hi: "logo.",
    subPre: "Necesita una ",
    subHi: "base",
    subPost: " que la sostenga.",
    tags: ["Branding", "Identidad Visual", "Estrategia"],
    rockAlt: "Roca oscura iluminada de canto",
  },
  work: {
    titleLines: ["Trabajo", "seleccionado."],
    count: (n) => `${n} proyectos — Identidad visual y branding`,
  },
  studio: {
    tag: "(Estudio)",
    titleLines: ["Todo parte", "de algo."],
    manifesto: [
      "Una historia.",
      "Una necesidad.",
      "Una conversación.",
      "Una obsesión.",
      "Una idea.",
    ],
    claim: "Diseñamos marcas basadas en algo real.",
    imageAlt: "Basado Estudio — declaración de principios",
    howTag: "(Cómo trabajamos)",
    how: [
      "Empezamos preguntando. Antes de abrir un archivo pasamos por el negocio, el equipo y el cliente final, porque una marca que no nace de ahí termina siendo decoración.",
      "Tomamos pocos proyectos al año y los llevamos completos: estrategia, identidad, sistema gráfico y las piezas donde la marca realmente vive. Entregamos manuales que se usan, no que se archivan.",
      "Somos un estudio pequeño en Santiago de Chile, y esa escala es una decisión: quien conversa contigo es quien diseña.",
    ],
    facts: [
      ["Desde", "2019"],
      ["Base", "Santiago / Chile"],
      ["Foco", "Identidad y branding"],
    ],
    link: "Ver el trabajo",
  },
  services: {
    tag: "(Servicios)",
    titleLines: ["Lo que", "hacemos."],
    items: [
      {
        name: "Identidad Visual",
        text: "Marca, símbolo, tipografía, color y el sistema completo que los mantiene coherentes en cualquier soporte.",
      },
      {
        name: "Branding",
        text: "Posicionamiento, relato y arquitectura de marca. Lo que la marca dice, antes de cómo se ve.",
      },
      {
        name: "Dirección de Arte",
        text: "Criterio visual sostenido en el tiempo: campañas, fotografía, editorial y contenido.",
      },
      {
        name: "Diseño Web",
        text: "Sitios diseñados y construidos por el estudio, rápidos, accesibles y fieles a la identidad.",
      },
    ],
    ctaLines: ["¿Empezamos", "por algo real?"],
    ctaLink: "Escribir al estudio",
  },
  contact: {
    tag: "(Contacto)",
    titleLines: ["¿Tienes algo", "en mente?", "Hablemos."],
    channels: { email: "Email", instagram: "Instagram", behance: "Behance" },
    note: "Respondemos en 48 horas hábiles.",
  },
  project: {
    client: "Cliente",
    year: "Año",
    category: "Categoría",
    services: "Servicios",
    nextTag: "(Siguiente proyecto)",
    plateAlt: (name, i, total) => `${name} — lámina ${i} de ${total}`,
    viewProject: "Ver proyecto",
  },
  header: {
    menu: "Menú",
    close: "Cerrar",
    nav: "Principal",
    navMobile: "Principal móvil",
    brandHome: "BASADO ESTUDIO — inicio",
  },
  footer: {
    worldwide: "Trabajamos con marcas en todo el mundo",
    backToTop: "↑ Volver al inicio",
    social: "Redes",
  },
  common: {
    skipToContent: "Saltar al contenido",
    themeToggle: "Cambiar entre modo claro y oscuro",
    langSwitch: "Cambiar idioma",
    loading: "Cargando el sitio",
  },
  notFound: {
    tag: "(404)",
    title: "Esta página no está basada en nada.",
    link: "Volver al inicio",
  },
};

const en: Dict = {
  meta: {
    homeTitle: "BASADO ESTUDIO — Visual identity and branding",
    homeDescription:
      "Creative studio specialising in visual identity and branding. Santiago, Chile. We design brands based on something real.",
    workTitle: "Work",
    workDescription:
      "Visual identity, branding, art direction and web design projects by Basado Estudio.",
    studioTitle: "Studio",
    studioDescription:
      "Basado Estudio is a visual identity and branding studio in Santiago, Chile. We design brands based on something real.",
    servicesTitle: "Services",
    servicesDescription:
      "Visual identity, branding, art direction and web design. Basado Estudio, Santiago, Chile.",
    contactTitle: "Contact",
    contactDescription:
      "Got something in mind? Let's talk. Basado Estudio, Santiago, Chile.",
    orgDescription: "Creative studio specialising in visual identity and branding.",
  },
  home: {
    heroLines: ["BASED ON", "SOMETHING REAL."],
    support: "Creative studio specialising in visual identity and branding.",
    projectsHeading: "Selected projects",
    studioTag: "(Studio)",
    studioLines: ["We design brands", "based on something real."],
    studioBody:
      "We take on few projects a year, see them through end to end, and keep the client inside the process. No templates, no decorative layers, nothing the brand can't stand behind.",
    studioLink: "About the studio",
    ctaLines: ["Got something", "in mind?"],
    ctaLink: "Let's talk.",
  },
  base: {
    line1: "Your brand needs more",
    line2Pre: "than a ",
    line2Hi: "logo.",
    subPre: "It needs a ",
    subHi: "foundation",
    subPost: " to stand on.",
    tags: ["Branding", "Visual Identity", "Strategy"],
    rockAlt: "Dark rock lit along its edge",
  },
  work: {
    titleLines: ["Selected", "work."],
    count: (n) => `${n} projects — Visual identity and branding`,
  },
  studio: {
    tag: "(Studio)",
    titleLines: ["It all starts", "with something."],
    manifesto: ["A story.", "A need.", "A conversation.", "An obsession.", "An idea."],
    claim: "We design brands based on something real.",
    imageAlt: "Basado Estudio — statement of principles",
    howTag: "(How we work)",
    how: [
      "We start by asking. Before opening a file we go through the business, the team and the end customer, because a brand that doesn't come from there ends up being decoration.",
      "We take on few projects a year and carry them all the way: strategy, identity, graphic system and the pieces where the brand actually lives. We deliver guidelines that get used, not filed away.",
      "We're a small studio in Santiago, Chile, and that scale is a decision: whoever talks to you is the one designing.",
    ],
    facts: [
      ["Since", "2019"],
      ["Based in", "Santiago / Chile"],
      ["Focus", "Identity and branding"],
    ],
    link: "See the work",
  },
  services: {
    tag: "(Services)",
    titleLines: ["What we", "do."],
    items: [
      {
        name: "Visual Identity",
        text: "Logo, symbol, typography, colour and the whole system that keeps them coherent on any surface.",
      },
      {
        name: "Branding",
        text: "Positioning, narrative and brand architecture. What the brand says, before how it looks.",
      },
      {
        name: "Art Direction",
        text: "Visual judgement sustained over time: campaigns, photography, editorial and content.",
      },
      {
        name: "Web Design",
        text: "Sites designed and built in house — fast, accessible and true to the identity.",
      },
    ],
    ctaLines: ["Shall we start", "with something real?"],
    ctaLink: "Write to the studio",
  },
  contact: {
    tag: "(Contact)",
    titleLines: ["Got something", "in mind?", "Let's talk."],
    channels: { email: "Email", instagram: "Instagram", behance: "Behance" },
    note: "We reply within 48 working hours.",
  },
  project: {
    client: "Client",
    year: "Year",
    category: "Category",
    services: "Services",
    nextTag: "(Next project)",
    plateAlt: (name, i, total) => `${name} — plate ${i} of ${total}`,
    viewProject: "View project",
  },
  header: {
    menu: "Menu",
    close: "Close",
    nav: "Main",
    navMobile: "Main mobile",
    brandHome: "BASADO ESTUDIO — home",
  },
  footer: {
    worldwide: "We work with brands worldwide",
    backToTop: "↑ Back to top",
    social: "Social",
  },
  common: {
    skipToContent: "Skip to content",
    themeToggle: "Switch between light and dark mode",
    langSwitch: "Change language",
    loading: "Loading the site",
  },
  notFound: {
    tag: "(404)",
    title: "This page isn't based on anything.",
    link: "Back home",
  },
};

const dictionaries: Record<Locale, Dict> = { es, en };

export const getDict = (locale: Locale) => dictionaries[locale];

/** Prefija una ruta interna con el idioma: ("en", "work") → "/en/work" */
export const localePath = (locale: Locale, path = "") =>
  path ? `/${locale}/${path}` : `/${locale}`;
