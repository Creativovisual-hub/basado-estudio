import type { Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

/*
 * El tema guardado se aplica ANTES del primer pintado. Como efecto de React
 * llegaría tarde: la página se vería un instante en claro antes de pasar a
 * oscuro, el parpadeo blanco clásico.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("tema");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // El idioma real lo fija app/[lang]/layout.tsx.
    <html suppressHydrationWarning className={display.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Sin JavaScript el contenido se muestra igual, sin animación. */}
        <noscript>
          <style>{".rv,.rv-line>*,.rv-img{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
