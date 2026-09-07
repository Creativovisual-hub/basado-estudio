import raw from "./portfolio-data.json";
import type { Locale } from "./i18n";

/* =========================================================================
   Proyectos de BASADO ESTUDIO.

   Las imágenes y los textos vienen de creativovisualchile.myportfolio.com y
   se sirven desde el CDN de Adobe. Para actualizarlos tras publicar cambios
   allí:  npm run sync

   La ficha editorial de cada proyecto se mantiene abajo, en EDITORIAL: es lo
   único que hay que tocar a mano. Los campos con texto llevan las dos
   versiones, {es, en}.
   ========================================================================= */

export type RemoteImage = {
  src: string;
  srcSet: string;
  width: number | null;
  height: number | null;
  ratio: number | null;
};

type T = Record<Locale, string>;
type TList = Record<Locale, string[]>;

export type Project = {
  slug: string;
  name: string;
  category: string;
  /** Sin dato en el portfolio de origen: se rellena a mano. */
  year: string | null;
  client: string;
  services: string[];
  intro: string;
  cover: { src: string; srcSet: string };
  images: RemoteImage[];
  /** Textos publicados en el proyecto original, si los hay. */
  notes: string[];
  /**
   * Bloques de texto con su sitio marcado: cada uno dice tras qué imagen
   * aparece. Sólo los proyectos del panel los traen; los de Adobe siguen
   * repartiendo sus notas automáticamente.
   */
  bloques?: { posicion: number; parrafos: string[] }[];
};

type Editorial = {
  source: string;
  slug: string;
  name: string;
  category: T;
  year: string | null;
  client: string;
  services: TList;
  intro: T;
  /**
   * Texto largo del case study en inglés. El español sale del scraper
   * (portfolio-data.json); esta traducción es manual, así que si cambias el
   * texto en Adobe Portfolio hay que actualizarla aquí.
   */
  notesEn?: string[];
};

const IDENTITY: T = { es: "Identidad Visual", en: "Visual Identity" };
const BRANDING: T = { es: "Branding", en: "Branding" };

const S = {
  identity: { es: "Identidad Visual", en: "Visual Identity" },
  applications: { es: "Aplicaciones de Marca", en: "Brand Applications" },
  artDirection: { es: "Dirección de Arte", en: "Art Direction" },
  branding: { es: "Branding", en: "Branding" },
};
const services = (...keys: (keyof typeof S)[]): TList => ({
  es: keys.map((k) => S[k].es),
  en: keys.map((k) => S[k].en),
});

/*
 * REVISAR: el portfolio de origen no publica año en ningún proyecto, y sólo
 * Latin Wok trae texto descriptivo. Los años están en null (no se muestran
 * hasta rellenarlos) y las introducciones de los seis proyectos restantes
 * son un borrador de estudio, no información verificada del cliente.
 */
const EDITORIAL: Editorial[] = [
  {
    source: "latin-wok-propuesta-de-logo",
    slug: "latin-wok",
    name: "LATIN WOK",
    category: IDENTITY,
    year: "2020",
    client: "Latin Wok",
    services: services("identity", "applications"),
    intro: {
      es: "Latin Wok es un restaurante de comida china fusión en Santiago de Chile. El encargo era reconstruir una identidad de marca fresca, distinta y moderna, partiendo de su herencia y de lo que buscaban en el cambio.",
      en: "Latin Wok is a Chinese fusion restaurant in Santiago, Chile. The brief was to rebuild a brand identity that felt fresh, different and modern, starting from its heritage and from what they wanted out of the change.",
    },
    notesEn: [
      "Brand identity",
      "LATIN WOK is a Chinese fusion restaurant based in Santiago, Chile.",
      "Their mission: to give customers a unique dining experience, blending the highest-quality Chinese essences of oriental cooking with Latin flavours, and offering a wide range of dishes made to the highest standards.",
      "Their vision: to be recognised as the first choice for Chinese food and to grow into a franchise and one of the fastest-growing companies nationally and internationally.",
      "Brand — Latin Wok's goal was to rebuild a brand identity that was genuinely fresh, different and modern. Asian food is a pleasure for many people. We wanted an image that made the customer hungry just by looking at the logotype.",
      "The first step was understanding their heritage and what they wanted from the rebrand. With their past and their wishes in mind, we started brainstorming words tied to the wok and to Asian restaurants. With the team we pushed ahead with the wok idea, and I started drawing.",
      "Result",
      "An imagotype: one of the ways a brand can be represented graphically.",
      "Here the icon and the brand name form a single element, a visual whole. Looking up the meaning of the word wok, we found it came from the name of a round, deep-bottomed pan — and from there came the circle of the imagotype, with two lines underneath as a differentiator, standing for one of the most important elements of Asian food: chopsticks.",
      "Typography",
      "We used a sans serif called Maximize Bold: modern, elegant and striking. We set the Latin Wok name on two lines so it stayed visible and equally legible when scaled down.",
      "Applications — a few examples of how the brand would work as it rolls out.",
    ],
  },
  {
    source: "arte-floral-identidad-visual",
    slug: "arte-floral",
    name: "ARTE FLORAL",
    category: IDENTITY,
    year: null,
    client: "Arte Floral",
    services: services("identity", "artDirection"),
    intro: {
      es: "Identidad visual completa para Arte Floral: marca, sistema gráfico y las aplicaciones donde se sostiene en el día a día.",
      en: "Full visual identity for Arte Floral: logo, graphic system and the applications that carry it day to day.",
    },
  },
  {
    source: "team-dallas-identidad-visual",
    slug: "team-dallas",
    name: "TEAM DALLAS",
    category: IDENTITY,
    year: null,
    client: "Team Dallas",
    services: services("identity", "applications"),
    intro: {
      es: "Identidad visual para Team Dallas. Marca, construcción del símbolo y despliegue del sistema en sus distintos soportes.",
      en: "Visual identity for Team Dallas: logo, construction of the symbol and roll-out of the system across its different surfaces.",
    },
  },
  {
    source: "basado-estudio",
    slug: "basado-estudio",
    name: "BASADO ESTUDIO",
    category: BRANDING,
    year: null,
    client: "Proyecto propio",
    services: services("branding", "identity", "artDirection"),
    intro: {
      es: "La identidad del propio estudio. Todo parte de algo: una historia, una necesidad, una conversación, una obsesión, una idea.",
      en: "The studio's own identity. It all starts with something: a story, a need, a conversation, an obsession, an idea.",
    },
  },
  {
    source: "zelect-logo-clothing-brand",
    slug: "zelect",
    name: "ZELECT",
    category: IDENTITY,
    year: null,
    client: "Zelect",
    services: services("identity", "applications"),
    intro: {
      es: "Identidad para Zelect, una marca de ropa. Logotipo, sistema gráfico y las aplicaciones donde la marca se ve todos los días.",
      en: "Identity for Zelect, a clothing brand. Logotype, graphic system and the applications where the brand shows up every day.",
    },
  },
  {
    source: "logo-open-web-learning",
    slug: "open-web-learning",
    name: "OPEN WEB LEARNING",
    category: IDENTITY,
    year: null,
    client: "Open Web Learning",
    services: services("identity"),
    intro: {
      es: "Marca para una plataforma de aprendizaje en línea. Construcción del logotipo y del sistema que lo acompaña.",
      en: "Brand for an online learning platform: logotype construction and the system that surrounds it.",
    },
  },
  {
    source: "logo-ilisto",
    slug: "ilisto",
    name: "I.LISTO",
    category: IDENTITY,
    year: null,
    client: "I.Listo",
    services: services("identity", "applications"),
    intro: {
      es: "Diseño de marca para I.Listo: logotipo, sistema cromático y aplicaciones.",
      en: "Brand design for I.Listo: logotype, colour system and applications.",
    },
  },
  {
    source: "logo-el-negro-de-las-carnes",
    slug: "el-negro-de-las-carnes",
    name: "EL NEGRO DE LAS CARNES",
    category: IDENTITY,
    year: null,
    client: "El Negro de las Carnes",
    services: services("identity", "applications"),
    intro: {
      es: "Identidad para una carnicería. Una marca directa, de alto contraste, pensada para leerse desde la calle.",
      en: "Identity for a butcher's shop. A direct, high-contrast brand built to be read from the street.",
    },
  },
];

type RawProject = {
  slug: string;
  title: string;
  paragraphs: string[];
  hasVideo: boolean;
  cover: { src: string; srcSet: string } | null;
  images: RemoteImage[];
};

const bySource = new Map((raw as RawProject[]).map((p) => [p.slug, p]));

const build = (src: RawProject, e: Editorial, locale: Locale): Project => ({
  slug: e.slug,
  name: e.name,
  category: e.category[locale],
  year: e.year,
  client: e.client,
  services: e.services[locale],
  intro: e.intro[locale],
  cover: src.cover ?? { src: src.images[0].src, srcSet: src.images[0].srcSet },
  images: src.images,
  // El primer rótulo repite el título del proyecto: se descarta.
  notes: locale === "es" ? src.paragraphs.slice(1) : (e.notesEn ?? []),
});

/**
 * Ficha provisional para un proyecto que ya está en Adobe pero todavía no en
 * EDITORIAL. Se deduce del título para que el proyecto se publique igual;
 * después se afina a mano, y se traduce.
 */
function derive(src: RawProject): Editorial {
  const title = src.title.trim();
  const isWeb = /web|sitio/i.test(title);
  const category: T = isWeb
    ? { es: "Diseño Web", en: "Web Design" }
    : /identidad|logo|marca/i.test(title)
      ? IDENTITY
      : BRANDING;

  const name =
    title
      .replace(/^(logo|logotipo)\s*[-–—]\s*/i, "")
      .replace(/\s*[-–—]\s*(propuesta de logo|identidad visual|branding|logo).*$/i, "")
      .trim()
      .toUpperCase() || src.slug.toUpperCase();

  return {
    source: src.slug,
    slug: src.slug,
    name,
    category,
    year: null,
    client: name,
    services: { es: [category.es], en: [category.en] },
    intro: {
      es: `${name} — proyecto de ${category.es.toLowerCase()}.`,
      en: `${name} — ${category.en.toLowerCase()} project.`,
    },
  };
}

const editado = new Set(EDITORIAL.map((e) => e.source));
const pendientes = (raw as RawProject[]).filter((p) => !editado.has(p.slug));

if (pendientes.length && process.env.NODE_ENV !== "production") {
  console.warn(
    `[projects] ${pendientes.length} proyecto(s) sin ficha en EDITORIAL, publicados con datos deducidos: ` +
      pendientes.map((p) => p.slug).join(", ")
  );
}

/** Proyectos en el idioma pedido, en el orden de EDITORIAL. */
export function getProjects(locale: Locale): Project[] {
  return [
    ...EDITORIAL.flatMap((e) => {
      const src = bySource.get(e.source);
      if (!src) {
        // El proyecto se despublicó en Adobe: se omite en vez de romper el build.
        console.warn(`[projects] "${e.source}" ya no está en el portfolio: se omite.`);
        return [];
      }
      return [build(src, e, locale)];
    }),
    ...pendientes.map((src) => build(src, derive(src), locale)),
  ];
}

/** Slugs de proyecto, iguales en los dos idiomas. */
export const projectSlugs = (): string[] => getProjects("es").map((p) => p.slug);

export const getProject = (locale: Locale, slug: string) =>
  getProjects(locale).find((p) => p.slug === slug);

export const adjacentProjects = (locale: Locale, slug: string) => {
  const list = getProjects(locale);
  const i = list.findIndex((p) => p.slug === slug);
  return [list[(i + 1) % list.length], list[(i + 2) % list.length]];
};
