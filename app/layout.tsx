import type { Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

/*
 * Sin lista de pesos: se carga la versión variable de la familia. Además de
 * pesar menos que tres instancias estáticas, permite pesos intermedios, que
 * es lo que usa el efecto del titular.
 */
const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/*
 * Dos cosas que tienen que resolverse ANTES del primer pintado, porque como
 * efecto de React llegarían tarde y se verían como un parpadeo:
 *
 * · el tema guardado, o la página aparecería un instante en claro antes de
 *   pasar a oscuro;
 * · si la pantalla de carga ya se vio en esta sesión, o en la segunda visita
 *   habría un fogonazo negro antes de que React la retire.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("tema");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}try{if(sessionStorage.getItem("precarga")){document.documentElement.classList.add("sin-precarga")}}catch(e){}})()`;

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
        {/*
          Sin JavaScript: el contenido se muestra igual, sin animación, y la
          pantalla de carga ni se dibuja, porque no habría contador que la
          retirase y dejaría la web tapada.
        */}
        <noscript>
          <style>
            {".rv,.rv-line>*,.rv-img{opacity:1!important;transform:none!important}.precarga{display:none!important}"}
          </style>
        </noscript>
      </head>
      <body className="bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
