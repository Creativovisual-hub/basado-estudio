import raw from "./portfolio-data.json";

/* =========================================================================
   Proyectos de BASADO ESTUDIO.

   Las imágenes y los textos vienen de creativovisualchile.myportfolio.com y
   se sirven desde el CDN de Adobe. Para actualizarlos tras publicar cambios
   allí:  node scripts/scrape-portfolio.mjs

   La ficha editorial de cada proyecto (nombre corto, categoría, año, cliente,
   servicios e introducción) se mantiene aquí abajo, en EDITORIAL: es lo único
   que hay que tocar a mano.
   ========================================================================= */

export type RemoteImage = {
  src: string;
  srcSet: string;
  width: number | null;
  height: number | null;
  ratio: number | null;
};

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
  /** Rótulos y párrafos publicados en el proyecto original, si los hay. */
  notes: string[];
};

type Editorial = {
  source: string;
  slug: string;
  name: string;
  category: string;
  year: string | null;
  client: string;
  services: string[];
  intro: string;
};

/*
 * REVISAR: el portfolio de origen no publica año en ningún proyecto, y sólo
 * Latin Wok trae texto descriptivo. Los años están en null (no se muestran
 * hasta rellenarlos) y las introducciones de los seis proyectos restantes
 * son un borrador de estudio, no información del cliente.
 */
const EDITORIAL: Editorial[] = [
  {
    source: "latin-wok-propuesta-de-logo",
    slug: "latin-wok",
    name: "LATIN WOK",
    category: "Identidad Visual",
    year: "2020",
    client: "Latin Wok",
    services: ["Identidad Visual", "Aplicaciones de Marca"],
    intro:
      "Latin Wok es un restaurante de comida china fusión en Santiago de Chile. El encargo era reconstruir una identidad de marca fresca, distinta y moderna, partiendo de su herencia y de lo que buscaban en el cambio.",
  },
  {
    source: "arte-floral-identidad-visual",
    slug: "arte-floral",
    name: "ARTE FLORAL",
    category: "Identidad Visual",
    year: null,
    client: "Arte Floral",
    services: ["Identidad Visual", "Dirección de Arte"],
    intro:
      "Identidad visual completa para Arte Floral: marca, sistema gráfico y las aplicaciones donde se sostiene en el día a día.",
  },
  {
    source: "team-dallas-identidad-visual",
    slug: "team-dallas",
    name: "TEAM DALLAS",
    category: "Identidad Visual",
    year: null,
    client: "Team Dallas",
    services: ["Identidad Visual", "Aplicaciones de Marca"],
    intro:
      "Identidad visual para Team Dallas. Marca, construcción del símbolo y despliegue del sistema en sus distintos soportes.",
  },
  {
    source: "basado-estudio",
    slug: "basado-estudio",
    name: "BASADO ESTUDIO",
    category: "Branding",
    year: null,
    client: "Proyecto propio",
    services: ["Branding", "Identidad Visual", "Dirección de Arte"],
    intro:
      "La identidad del propio estudio. Todo parte de algo: una historia, una necesidad, una conversación, una obsesión, una idea.",
  },
  {
    source: "logo-open-web-learning",
    slug: "open-web-learning",
    name: "OPEN WEB LEARNING",
    category: "Identidad Visual",
    year: null,
    client: "Open Web Learning",
    services: ["Identidad Visual"],
    intro:
      "Marca para una plataforma de aprendizaje en línea. Construcción del logotipo y del sistema que lo acompaña.",
  },
  {
    source: "logo-ilisto",
    slug: "ilisto",
    name: "I.LISTO",
    category: "Identidad Visual",
    year: null,
    client: "I.Listo",
    services: ["Identidad Visual", "Aplicaciones de Marca"],
    intro:
      "Diseño de marca para I.Listo: logotipo, sistema cromático y aplicaciones.",
  },
  {
    source: "logo-el-negro-de-las-carnes",
    slug: "el-negro-de-las-carnes",
    name: "EL NEGRO DE LAS CARNES",
    category: "Identidad Visual",
    year: null,
    client: "El Negro de las Carnes",
    services: ["Identidad Visual", "Aplicaciones de Marca"],
    intro:
      "Identidad para una carnicería. Una marca directa, de alto contraste, pensada para leerse desde la calle.",
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

const build = (src: RawProject, e: Editorial): Project => ({
  slug: e.slug,
  name: e.name,
  category: e.category,
  year: e.year,
  client: e.client,
  services: e.services,
  intro: e.intro,
  cover: src.cover ?? { src: src.images[0].src, srcSet: src.images[0].srcSet },
  images: src.images,
  // El primer rótulo repite el título del proyecto: se descarta.
  notes: src.paragraphs.slice(1),
});

/**
 * Ficha provisional para un proyecto que ya está en Adobe pero todavía no en
 * EDITORIAL. Se deduce del título ("LOGO - X", "X - Identidad Visual") para
 * que el proyecto se publique igual; después se afina a mano.
 */
function derive(src: RawProject): Editorial {
  const title = src.title.trim();
  const category = /identidad/i.test(title)
    ? "Identidad Visual"
    : /logo|marca/i.test(title)
      ? "Identidad Visual"
      : /web|sitio/i.test(title)
        ? "Diseño Web"
        : "Branding";

  // Se limpian los descriptores del título para quedarse con el nombre.
  const name = title
    .replace(/^(logo|logotipo)\s*[-–—]\s*/i, "")
    .replace(/\s*[-–—]\s*(propuesta de logo|identidad visual|branding|logo).*$/i, "")
    .trim()
    .toUpperCase();

  return {
    source: src.slug,
    slug: src.slug,
    name: name || src.slug.toUpperCase(),
    category,
    year: null,
    client: name,
    services: [category],
    intro: `${name} — proyecto de ${category.toLowerCase()}.`,
  };
}

const editado = new Set(EDITORIAL.map((e) => e.source));

/*
 * Se publican, en este orden: los proyectos con ficha propia y, detrás, los
 * que aún no la tienen. Un proyecto nuevo en Adobe entra solo tras ejecutar
 * scripts/scrape-portfolio.mjs; el aviso recuerda completarle la ficha.
 */
const pendientes = (raw as RawProject[]).filter((p) => !editado.has(p.slug));

if (pendientes.length && process.env.NODE_ENV !== "production") {
  console.warn(
    `[projects] ${pendientes.length} proyecto(s) sin ficha en EDITORIAL, publicados con datos deducidos: ` +
      pendientes.map((p) => p.slug).join(", ")
  );
}

export const projects: Project[] = [
  ...EDITORIAL.flatMap((e) => {
    const src = bySource.get(e.source);
    if (!src) {
      // El proyecto se despublicó en Adobe: se omite en vez de romper el build.
      console.warn(`[projects] "${e.source}" ya no está en el portfolio: se omite.`);
      return [];
    }
    return [build(src, e)];
  }),
  ...pendientes.map((src) => build(src, derive(src))),
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const adjacentProjects = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return [projects[(i + 1) % projects.length], projects[(i + 2) % projects.length]];
};
