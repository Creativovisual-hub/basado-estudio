import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { formats: ["image/avif", "image/webp"] },

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
