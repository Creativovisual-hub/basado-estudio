# BASADO ESTUDIO

Sitio del estudio: portfolio editorial, minimalista y premium.
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Postgres · Vercel Blob.

```bash
npm install
npm run dev     # http://localhost:3210
npm run build   # build de producción
npm run assets  # regenera las visuales SVG de la página Estudio
```

> No ejecutes `npm run build` con el servidor de desarrollo encendido: sobrescribe
> los artefactos de `.next` y el dev deja de servir CSS hasta reiniciarlo.

## Idiomas

El sitio es bilingüe. El idioma va en el primer segmento de la ruta:
`/es/work`, `/en/work`. La raíz redirige al español, y las rutas antiguas
(`/estudio`, `/servicios`, `/contacto`) redirigen con 308 a sus equivalentes.

Los segmentos son los mismos en ambos idiomas (`work`, `studio`, `services`,
`contact`) para que el conmutador cambie sólo el prefijo y mantenga al
visitante en la misma página: `/es/work/latin-wok` → `/en/work/latin-wok`.

**Todo el texto de interfaz vive en [`lib/i18n.ts`](lib/i18n.ts)**, en dos
diccionarios con la misma forma; TypeScript avisa si falta una clave en uno de
los dos. El texto de los proyectos se escribe desde el panel, en los dos
idiomas y con los campos emparejados a la vista.

Cada página declara `canonical` y enlaces `hreflang` con `x-default`, y el
sitemap lista las 24 URLs (12 páginas × 2 idiomas).

> Un campo vacío en inglés no rompe la página: se muestra el español. Pero es
> una página coja, no un detalle, y por eso el panel enseña los dos idiomas
> uno al lado del otro.

## Tema claro y oscuro

Tres estados: **claro**, **oscuro** y —por defecto— **el del sistema**. La
elección del visitante se guarda en su navegador y manda sobre la preferencia
del sistema; sin elección, se sigue `prefers-color-scheme`.

Los colores son tokens semánticos, no literales:

| Token | Claro | Oscuro |
|---|---|---|
| `bg` / `fg` | `#f4f3f1` / `#0e0e0e` | `#0d0d0c` / `#edece8` |
| `inv` / `inv-fg` | el par invertido, para los bloques en contraste |
| `line` | borde sutil | borde sutil |
| `shade` | fondo mientras carga una imagen |

Así una misma clase (`bg-bg`, `text-fg`, `bg-inv`) funciona en los dos temas
sin duplicar reglas. Contraste medido: **17,4:1** en claro y **16,5:1** en
oscuro, muy por encima del mínimo AAA.

Un script en línea aplica el tema guardado **antes del primer pintado**: como
efecto de React llegaría tarde y la página parpadearía en blanco antes de
pasar a oscuro.

La sobreimpresión del hover en el grid de proyectos usa negro y blanco fijos,
no los tokens: va sobre fotografía real, donde el contraste debe ser el mismo
en los dos temas.

## Sistema de diseño

Las proporciones salen de un análisis de layout de la referencia de UX indicada
para el proyecto, reinterpretadas con identidad y contenido propios.

| Medida | Valor | Dónde |
|---|---|---|
| Gutter maestro | `--pad`, `clamp(1.125rem, 3vw, 2.75rem)` | `.gutter`, todo el layout |
| Alto del header | `--header-h`, 72px móvil / 80px desktop | fijo, transparente |
| Gutter del grid | `--gutter`, 2px | portfolio y duplas |
| Grid de portfolio | 1 col móvil / 2 col desktop, tiles 1:1, a sangre | `components/ProjectGrid.tsx` |
| Nombre en hover | `clamp(2rem, 6.2vw, 5.625rem)`, peso 600, tracking −0.045em | `.t-project` |
| Case study | láminas a sangre apiladas en orden, textos intercalados | `app/[lang]/work/[slug]` |
| Meta y navegación | 12px, uppercase, tracking 0.075em | `.t-meta` |

Tipografía única: **Inter Tight variable** (100–900) vía `next/font`,
autoalojada. El titular del hero usa los pesos intermedios.
Paleta: hueso `#f4f3f1`, tinta `#0e0e0e`, ceniza `#6f6d69`. Sin degradados,
sin sombras, sin radios salvo la píldora del cursor.

## Motion

- **Scroll suave** con Lenis (`components/SmoothScroll.tsx`).
- **Reveal al entrar al viewport**: fade + translate (`Reveal`) y aparición
  progresiva de texto línea a línea con máscara (`RevealLines`, con las líneas
  escritas a mano).
- **Párrafos línea a línea** (`SplitLines`): mismo revelado, pero midiendo en
  el navegador dónde caen las líneas reales, porque eso depende del ancho, del
  idioma y de la tipografía. Se vuelve a repartir cuando cambia el ancho del
  párrafo —`ResizeObserver` más el evento de ventana—, que es lo que se suele
  olvidar y se nota al girar el teléfono. El servidor manda el párrafo entero:
  sin JavaScript, con `prefers-reduced-motion` o si algo falla, el texto está
  ahí y se lee igual.
- **Imágenes**: revelado con sobre-escalado de 1.07 → 1 (`CaseImage`).
- **Hover de proyecto**: escala 1.035 en 1100ms y el nombre entra desde abajo.
- **Transición entre páginas**: velo de tinta que se retira (`PageTransition`).
- **Cursor contextual**: sólo aparece con la etiqueta "Ver proyecto" sobre
  elementos con `data-cursor`; desactivado en punteros gruesos.
- **Titular del hero**: entra línea a línea desde detrás de su máscara, sin
  efecto de cursor.
- **Pieza generativa del hero** (`HeroField`): curvas de nivel que respiran,
  como la topografía de una piedra, ocupando el aire sobre el titular. Canvas
  2D sin librerías: anillos concéntricos modulados por una suma de senos, y el
  cursor los empuja hacia fuera con caída suave. Se dibuja con `currentColor`,
  así que el tema claro y el oscuro salen solos. **0,23 ms por fotograma**
  medidos, frente a los 16,7 disponibles a 60 fps. Se detiene fuera de
  pantalla, con la pestaña en segundo plano y con `prefers-reduced-motion`
  (ahí queda un fotograma fijo).

- **Vidrio** (`.vidrio`): fondo translúcido con desenfoque de lo que pasa por
  detrás. Sólo en la cabecera al bajar y en el botón de volver arriba, que son
  las dos cosas que flotan sobre el contenido. El aviso de cookies se queda
  opaco a propósito: es un texto legal y ahí manda la legibilidad.

Todo respeta `prefers-reduced-motion`: Lenis no se inicializa, las animaciones
se anulan y la composición se conserva intacta.

## Contenido: el panel

Los proyectos viven en tu propia base de datos y sus imágenes en tu propio
almacén. Se administran desde **[basadoestudio.com/admin](https://basadoestudio.com/admin)**,
con usuario y contraseña.

Hasta septiembre de 2026 el contenido venía de Adobe Portfolio y se leía con
un scraper. Ya no: los ocho proyectos y sus 67 imágenes se trasladaron, y esa
dependencia está cortada. Si aquella cuenta se cierra, aquí no pasa nada.

### Qué se edita desde el panel

| | |
|---|---|
| **Ficha** | Nombre, dirección web, cliente, año, categoría y servicios |
| **Textos** | Introducción y bloques intercalados, cada uno con su posición |
| **Imágenes** | Subir, arrastrar para ordenar, elegir portada y borrar |
| **Formato** | La proporción de las láminas: 16:9 por defecto, como Latin Wok |
| **Buscadores** | Descripción propia y texto alternativo de cada imagen |
| **Estado** | Visible en la web o borrador |

Todo va en español y en inglés, con los campos emparejados a la vista para que
se note enseguida si falta una traducción.

### Cómo llega a la web

Al guardar se refrescan las páginas afectadas —portada, listado y ficha— así
que el cambio se ve **en segundos**, sin reconstruir el sitio ni esperar un
despliegue.

Un proyecto sólo sale si está marcado como visible **y** tiene alguna imagen:
una ficha vacía no llega a publicarse.

### Estructura

- [`lib/esquema.ts`](lib/esquema.ts) — las tablas. PostgreSQL estándar, sin
  nada exclusivo de ningún proveedor. Se pone al día sola al abrir el panel:
  una columna nueva aparece sin que nadie ejecute nada a mano.
- [`lib/proyectos-db.ts`](lib/proyectos-db.ts) — todas las consultas, juntas.
- [`lib/almacen.ts`](lib/almacen.ts) — todo lo que sube, borra o lista
  archivos. Es la pieza que ata el proyecto a un proveedor concreto:
  mantenerla en un solo archivo hace que cambiar de almacén sea reescribir
  tres funciones.
- [`lib/contenido.ts`](lib/contenido.ts) — lo que leen las páginas públicas.

De cada imagen se guardan dos direcciones: la pública de hoy y la ruta interna
en el almacén. La segunda es la que permitiría mudarse de proveedor sin perder
el rastro de los archivos.

### Si la base de datos no responde

La web se queda sin proyectos pero **no se rompe**: las páginas se sirven, la
navegación funciona y el resto del sitio sigue en pie.

## Bloque manifiesto de la home

Sección oscura entre el portfolio y el bloque de estudio, con dirección de
arte propia: es oscura en los dos temas porque su contraste depende de la
imagen que lleva detrás.

**El fondo se elige al construir el sitio.** Si existe `public/img/base/roca.*`
(jpg, webp, png o avif) se usa esa fotografía; si no, se dibuja un relieve
generado por código ([`TerrainCanvas.tsx`](components/TerrainCanvas.tsx),
canvas 2D sin librerías de 3D). Nunca queda una imagen rota.

Con la fotografía puesta, la luz sigue al cursor: dos copias de la misma
imagen, la de abajo en penumbra y la de arriba sobreexpuesta y recortada por
una máscara radial centrada en el puntero. No hace falta preparar ninguna
versión iluminada. Se desactiva en táctil.

## SEO y accesibilidad

`metadata` por ruta con canónicas y Open Graph, `sitemap.xml`, `robots.txt` y
JSON-LD de `Organization`. Un solo `<h1>` por página y jerarquía de encabezados
correcta, enlace de salto al contenido, `aria-current` en la navegación,
`aria-expanded` en el menú móvil, cierre con Escape, foco visible en todo
elemento interactivo e imágenes decorativas con `alt=""` y etiqueta accesible
en el enlace contenedor.

## Configuración

Todo lo que cambia entre "esto es una maqueta" y "esto es la web real" vive en
**un solo archivo**: [`lib/site.ts`](lib/site.ts). Dominio, correo, redes y
ubicación. Los metadatos, el sitemap, el robots.txt, el JSON-LD, el pie, la
cabecera y la página de contacto leen de ahí.

## Analítica

Google Analytics 4 está activo. El interruptor es `analyticsId` en
[`lib/site.ts`](lib/site.ts): vaciarlo lo apaga por completo, sin cargar ningún
script de Google ni poner ninguna cookie.

Hay una segunda condición, además del interruptor: **el visitante tiene que
aceptar las cookies**. Ver *Consentimiento de cookies* al final de esta
sección.

Hay dos interruptores, y son **alternativos**, no complementarios:

| Campo | Formato | Qué hace |
|---|---|---|
| `analyticsId` | `G-XXXXXXXXXX` | Google Analytics 4 directo. Mide desde el minuto uno. |
| `gtmId` | `GTM-XXXXXXX` | Contenedor de Tag Manager. **Por sí solo no mide nada.** |

> Si usas Tag Manager, el contenedor es sólo el envase: hay que entrar en GTM,
> crear una etiqueta *Google Analytics: configuración de GA4* apuntando a un
> ID `G-XXXXXXXXXX`, con activador *Initialization - All Pages*, y **publicar
> el contenedor**. Sin eso no se registra ni una visita.

**Sólo mide en el despliegue de producción.** El trabajo en local y las vistas
previas de rama no envían nada: sin ese corte, cada sesión de desarrollo
ensuciaría las estadísticas con páginas recargadas cien veces y sesiones de
horas. El interruptor es `VERCEL_ENV === "production"` en
`app/[lang]/layout.tsx`; si
algún día el sitio se despliega fuera de Vercel, esa variable no existirá y
habría que ajustar la condición.

Se usa el componente oficial `@next/third-parties/google`, que carga el script
cuando la página ya es interactiva —para que la medición no compita con el
primer pintado— y cuenta las navegaciones internas, que en esta web no recargan
la página y de otro modo no se registrarían.

### Evento de contacto

Los enlaces de correo y redes emiten un evento `contacto` con el canal
(`email`, `instagram`, `behance`), desde `components/ContactLink.tsx`. La
medición automática de Google cuenta los clics a otros dominios pero **no los
`mailto:`**, que en un portfolio son justamente los que importan.

En Analytics conviene marcarlo como **evento clave**: *Administrar → Eventos →
contacto → marcar como evento clave*. Aparece en la lista un día después del
primer clic real.

El mismo clic avisa al píxel de Meta como evento `Contact`, si está encendido.

### Píxel de Meta

Interruptor aparte: `metaPixelId` en [`lib/site.ts`](lib/site.ts), sólo dígitos.
Vive en `components/MetaPixel.tsx` y respeta el mismo corte de producción.

No sustituye a Analytics ni sirve para consultar estadísticas: existe para
**anunciarse en Instagram y Facebook**. Permite mostrar anuncios a quien ya
visitó la web y buscar público parecido. Necesita semanas acumulando visitas
antes de servir de algo, así que se instala antes de la campaña, no el día de.

El fragmento que da Meta cuenta la visita una sola vez, al cargar. Como aquí las
navegaciones internas no recargan nada, el componente avisa a mano en cada
cambio de ruta; sin eso, una sesión entera contaría como una sola vista.

### Consentimiento de cookies

Nada de lo anterior se carga hasta que la persona acepta. El banner
(`components/Cookies.tsx`) no es sólo un aviso: los scripts de medición viven
**dentro** de él, así que mientras no haya un sí no existe forma de que se
cuelen. Antes de responder, el sitio no hace ni una sola petición a Google o a
Meta ni pone ninguna cookie de seguimiento.

La respuesta se guarda en `localStorage` bajo la clave `cookies`, con valor
`si` o `no`. Si no se puede escribir —navegación privada con el
almacenamiento bloqueado— se asume que no hay consentimiento, que es el lado
seguro. Al rechazar se recarga la página: los scripts ya cargados no se pueden
desmontar de verdad, y sus cookies seguirían puestas.

En el pie hay un enlace *Cookies* para cambiar de opinión más tarde, como pide
el RGPD. Los textos están en `lib/i18n.ts`, bloque `cookies`.

> **Por qué está.** En Chile la ley 19.628 no obliga a pedirlo, pero la 21.719
> —que entra en vigor a finales de 2026— sí endurece el criterio, y a quien te
> visite desde Europa le aplica el RGPD desde ya. Con dos herramientas de
> seguimiento instaladas, no llevarlo era el riesgo más caro de los dos.

## Publicar en internet

### 1. Antes de subir

- Poner el dominio real en `lib/site.ts` (`url`, sin barra final), junto con el
  correo y las redes.
- Añadir la imagen de Open Graph: un PNG de 1200×630 en `app/opengraph-image.png`
  (Next lo detecta por el nombre, sin configurar nada).

### 2. Subir el código a GitHub

```bash
git init
git add .
git commit -m "Web de Basado Estudio"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/basado-estudio.git
git push -u origin main
```

### 3. Desplegar en Vercel

Vercel es de los mismos que hacen Next.js, detecta el proyecto sin configurar
nada y el plan gratuito cubre de sobra un sitio de estudio.

1. Entrar en [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. **Add New → Project** e importar el repositorio. No hay que tocar ningún
   ajuste: framework, comando de build y directorio de salida se detectan solos.
3. **Deploy**. En un par de minutos hay una URL `.vercel.app` funcionando.

### 4. Conectar el dominio

1. En el proyecto de Vercel: **Settings → Domains → Add**, y escribir el
   dominio (por ejemplo `basadoestudio.cl` y `www.basadoestudio.cl`).
2. Vercel indica qué registros DNS crear. En el panel del registrador donde se
   compró el dominio:
   - dominio raíz → registro **A** apuntando a la IP que indique Vercel;
   - `www` → registro **CNAME** apuntando a `cname.vercel-dns.com`.
3. La propagación tarda de minutos a unas horas. El certificado HTTPS lo emite
   y renueva Vercel automáticamente.

A partir de ahí, **cada `git push` a `main` republica la web sola**.

