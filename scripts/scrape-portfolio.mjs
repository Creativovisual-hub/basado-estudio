/**
 * Lee el portfolio de Adobe (creativovisualchile.myportfolio.com) y escribe
 * lib/portfolio-data.json: por proyecto, el texto y las imágenes con sus
 * variantes responsive y su proporción real.
 *
 * No descarga las imágenes: sólo pide los primeros bytes de cada archivo para
 * leer las dimensiones de la cabecera, porque el HTML de Adobe no las publica
 * y sin la proporción el layout salta al cargar.
 *
 *   node scripts/scrape-portfolio.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://creativovisualchile.myportfolio.com";

/*
 * Adobe sirve el sitio detrás de una CDN con s-maxage de un año, y al publicar
 * no siempre purga: se llegó a recibir el índice con 15 horas de antigüedad,
 * sin el proyecto recién subido. Cada petición lleva un parámetro distinto
 * para no caer en la copia guardada y leer siempre el estado real.
 */
const sello = Date.now();
const traer = (ruta) =>
  fetch(`${ORIGIN}${ruta}${ruta.includes("?") ? "&" : "?"}cb=${sello}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });

/** Páginas del sitio de Adobe que no son proyectos. */
const NOT_A_PROJECT = new Set(["work", "contact", "about", "index"]);

/**
 * Descubre los proyectos publicados leyendo el índice, en el orden en que
 * aparecen ahí. Así, un proyecto nuevo en Adobe entra solo: basta con volver
 * a ejecutar este script.
 */
async function discoverSlugs() {
  const html = await (await traer("/work")).text();
  const slugs = [];
  for (const m of html.matchAll(/<a[^>]+class="[^"]*project-cover[^"]*"[^>]+href="\/([a-z0-9-]+)"/g)) {
    if (!NOT_A_PROJECT.has(m[1]) && !slugs.includes(m[1])) slugs.push(m[1]);
  }
  return slugs;
}

/* ---------- dimensiones desde la cabecera del archivo ---------- */

function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0..SOF15, excluidos DHT (c4), JPG (c8) y DAC (cc)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function gifSize(buf) {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "GIF") return null;
  return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
}

async function imageSize(url) {
  // 32 KB bastan para la cabecera de PNG/GIF y para el SOF de un JPEG progresivo.
  const res = await fetch(url, { headers: { Range: "bytes=0-32767" } });
  const buf = Buffer.from(await res.arrayBuffer());
  return pngSize(buf) ?? gifSize(buf) ?? jpegSize(buf);
}

/* ---------- extracción de la página ---------- */

const stripTags = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;|​|⁠|﻿/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í").replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú").replace(/&ntilde;/g, "ñ")
    .replace(/[ \t]+/g, " ")
    .trim();

async function scrapeProject(slug) {
  const html = await (await traer(`/${slug}`)).text();
  const cut = html.indexOf("project-covers");
  const main = cut > 0 ? html.slice(0, cut) : html;

  const title = stripTags((main.match(/<h1 class="title[^"]*">([\s\S]*?)<\/h1>/) || [])[1] || slug);

  /*
   * Los módulos de texto anidan <div> del editor, así que no se pueden acotar
   * con un cierre </div>: se trocea por el inicio de cada módulo y se toma
   * todo el bloque hasta el siguiente.
   */
  const chunks = main.split(/<div class="project-module /).slice(1);
  const paragraphs = chunks
    .filter((c) => c.startsWith("module text"))
    // Cada trozo empieza por el resto del atributo class: se descarta.
    .map((c) => c.slice(c.indexOf(">") + 1))
    .flatMap((c) => stripTags(c).split("\n"))
    .map((t) => t.trim())
    .filter(
      (t) =>
        t.length > 2 &&
        !t.includes("<") &&
        !/^_{2}/.test(t) &&
        !/otros proyectos|creativo visual|www\.|@creativovisual/i.test(t)
    );

  /*
   * El editor de Adobe guarda saltos de línea del maquetado original, así que
   * una misma frase llega partida en varios trozos. Se vuelven a unir cuando
   * el trozo anterior no cierra con puntuación terminal.
   */
  const reflowed = paragraphs.reduce((acc, line) => {
    const prev = acc[acc.length - 1];
    if (prev && !/[.!?:]$/.test(prev) && /^[a-záéíóúñ(]/.test(line)) {
      acc[acc.length - 1] = `${prev} ${line}`;
    } else {
      acc.push(line);
    }
    return acc;
  }, []).map((t) => t.replace(/\s{2,}/g, " ").trim());

  const hasVideo = chunks.some((c) => c.startsWith("module video"));

  // Imágenes del proyecto, en orden, sin repetir.
  const seen = new Set();
  const images = [];
  for (const m of main.matchAll(/data-src="(https:\/\/cdn\.myportfolio\.com\/[^"]+?)_rw_1920\.([a-z]+)\?h=([a-f0-9]+)"/g)) {
    const [, base, ext] = m;
    if (seen.has(base)) continue;
    seen.add(base);

    // Cada variante lleva su propio hash: se toman del srcset de la página.
    const variants = {};
    for (const v of main.matchAll(
      new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_rw_(\\d+)\\.${ext}\\?h=([a-f0-9]+)`, "g")
    )) {
      variants[v[1]] = `${base}_rw_${v[1]}.${ext}?h=${v[2]}`;
    }

    const widths = Object.keys(variants).map(Number).sort((a, b) => a - b);
    const src = variants[String(widths[widths.length - 1])];
    const size = await imageSize(src);

    images.push({
      src,
      srcSet: widths.map((w) => `${variants[String(w)]} ${w}w`).join(", "),
      width: size?.w ?? null,
      height: size?.h ?? null,
      ratio: size ? +(size.w / size.h).toFixed(4) : null,
    });
  }

  return { slug, title, paragraphs: reflowed, hasVideo, images };
}

/** Portadas oficiales del índice de Adobe, asociadas a cada proyecto. */
async function scrapeCovers() {
  const html = await (await traer("/work")).text();
  const covers = {};

  for (const m of html.matchAll(
    /<a[^>]+href="\/([a-z0-9-]+)"([\s\S]{0,4000}?)<\/a>/g
  )) {
    const [, slug, block] = m;
    if (covers[slug]) continue;

    // El srcset del índice trae varias anchuras; se toma la mayor, no el
    // marcador de 32px que abre la lista.
    const variants = [...block.matchAll(
      /(https:\/\/cdn\.myportfolio\.com\/[^"\s]+_car[a-z]*_4x3x(\d+)\.[a-z]+\?h=[a-f0-9]+)/g
    )].map((v) => ({ url: v[1], w: Number(v[2]) }));

    if (!variants.length) continue;

    // Se guarda el juego completo: la portada de 5120px no debe servirse
    // nunca como src de un tile de rejilla.
    const sorted = [...new Map(variants.map((v) => [v.w, v])).values()]
      .sort((a, b) => a.w - b.w)
      .filter((v) => v.w >= 320);

    covers[slug] = {
      src: (sorted.find((v) => v.w >= 1200) ?? sorted[sorted.length - 1]).url,
      srcSet: sorted.map((v) => `${v.url} ${v.w}w`).join(", "),
    };
  }
  return covers;
}

const covers = await scrapeCovers();
const SLUGS = await discoverSlugs();

if (!SLUGS.length) {
  console.error(
    "No se encontró ningún proyecto en el índice. ¿Cambió el marcado de Adobe Portfolio, o el sitio está despublicado?"
  );
  process.exit(1);
}

console.log(`Proyectos publicados: ${SLUGS.length}\n`);

const data = [];
for (const slug of SLUGS) {
  process.stdout.write(`· ${slug} `);
  const p = await scrapeProject(slug);
  p.cover = covers[slug] ?? (p.images[0] ? { src: p.images[0].src, srcSet: p.images[0].srcSet } : null);
  const missing = p.images.filter((i) => !i.ratio).length;
  console.log(
    `→ ${p.images.length} imágenes${missing ? ` (${missing} sin proporción)` : ""}, ` +
      `${p.paragraphs.length} textos, portada ${covers[slug] ? "del índice" : "de respaldo"}` +
      `${p.hasVideo ? ", incluye vídeo" : ""}`
  );
  data.push(p);
}

const out = path.join(process.cwd(), "lib", "portfolio-data.json");
fs.writeFileSync(out, JSON.stringify(data, null, 2), "utf8");
console.log(`\nEscrito ${out}`);
