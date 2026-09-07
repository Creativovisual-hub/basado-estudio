import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { formats: ["image/avif", "image/webp"] },

  /*
   * Identificador del despliegue pegado a cada archivo estático.
   *
   * Los archivos de /_next/static se sirven con cache "immutable" durante un
   * año. Eso vale mientras el nombre cambie con el contenido, pero se ha visto
   * que no siempre cambia: tras un despliegue, la hoja de estilos seguía
   * llegando con la versión anterior y el diseño nuevo no se veía. Con esto,
   * cada despliegue añade su propio identificador a la URL y el navegador —y
   * el CDN— no pueden confundir una versión con otra.
   *
   * Se usa el identificador del despliegue y, si no estuviera disponible en
   * la construcción, el del commit: lo importante es que el valor cambie con
   * cada publicación, y el commit siempre cumple eso.
   *
   * Fuera de Vercel ninguna de las dos existe y todo sigue como antes.
   */
  deploymentId:
    process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA,

  /*
   * Las rutas pasaron a llevar idioma delante. Se redirigen las antiguas
   * para no dejar enlaces rotos ni perder lo poco que hubiera indexado.
   */
  async redirects() {
    const map: Record<string, string> = {
      "/work": "/es/work",
      "/estudio": "/es/studio",
      "/servicios": "/es/services",
      "/contacto": "/es/contact",
    };
    return [
      ...Object.entries(map).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      { source: "/work/:slug", destination: "/es/work/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
