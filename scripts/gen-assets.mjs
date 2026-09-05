import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public', 'img');

/* ---------------------------------------------------------------
   Original artwork generator for BASADO ESTUDIO.
   Every visual is drawn from scratch: no external assets.
   Neutral, editorial art direction — one restrained accent per brand.
----------------------------------------------------------------*/

const FONT = "'Inter Tight','Helvetica Neue',Helvetica,Arial,sans-serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/*
 * Ajuste tipografico: aproxima el avance medio de la grotesca en mayusculas
 * (~0.53em con el tracking negativo del sistema) para que ningun logotipo
 * desborde su lienzo, sea cual sea el largo del nombre.
 */
const ADVANCE = 0.53;
const fitSize = (text, maxWidth, cap) =>
  Math.min(cap, maxWidth / (Math.max(String(text).length, 1) * ADVANCE));

/*
 * Grano de papel. El ruido se calcula UNA vez sobre un mosaico de 128px y
 * se repite con <pattern>; aplicar feTurbulence al lienzo completo (1800px)
 * multiplica el coste de rasterizado y bloquea el primer pintado.
 */
const GRAIN_TILE = 128;
const grainDefs = () => `
<filter id="n" x="0" y="0" width="${GRAIN_TILE}" height="${GRAIN_TILE}" filterUnits="userSpaceOnUse">
<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer>
</filter>
<pattern id="grain" width="${GRAIN_TILE}" height="${GRAIN_TILE}" patternUnits="userSpaceOnUse">
<rect width="${GRAIN_TILE}" height="${GRAIN_TILE}" filter="url(#n)"/>
</pattern>`;

const frame = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs>${grainDefs()}</defs>
<rect width="${w}" height="${h}" fill="${bg}"/>
${body}
<rect width="${w}" height="${h}" fill="url(#grain)" opacity=".5" style="mix-blend-mode:multiply"/>
</svg>`;

/* ---------- block designs ---------- */

// Logotype lockup, generous negative space
const lockup = (w, h, p, name, sub) => {
  const size = fitSize(name, w * 0.78, Math.min(w * 0.16, h * 0.26));
  return frame(w, h, `
    <text x="${w / 2}" y="${h / 2 + size * 0.34}" font-family="${FONT}" font-size="${size}"
      font-weight="600" letter-spacing="${-size * 0.045}" fill="${p.ink}" text-anchor="middle">${esc(name)}</text>
    <text x="${w / 2}" y="${h / 2 + size * 1.25}" font-family="${FONT}" font-size="${w * 0.014}"
      font-weight="500" letter-spacing="${w * 0.005}" fill="${p.ink}" opacity=".5" text-anchor="middle">${esc(sub)}</text>`, p.bg);
};

// Monogram — geometric mark built from primitives
const monogram = (w, h, p, seedChar) => {
  const c = Math.min(w, h);
  const r = c * 0.19;
  const cx = w / 2, cy = h / 2;
  return frame(w, h, `
    <g transform="translate(${cx} ${cy})">
      <circle r="${r}" fill="none" stroke="${p.ink}" stroke-width="${c * 0.018}"/>
      <path d="M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z" fill="${p.accent}"/>
      <rect x="${-r}" y="${-c * 0.009}" width="${r * 2}" height="${c * 0.018}" fill="${p.ink}"/>
      <text x="0" y="${r * 2.6}" font-family="${FONT}" font-size="${c * 0.032}" font-weight="500"
        letter-spacing="${c * 0.012}" fill="${p.ink}" opacity=".45" text-anchor="middle">${esc(seedChar)}</text>
    </g>`, p.bg);
};

// Colour system board
const paletteBoard = (w, h, p) => {
  const swatches = [p.ink, p.accent, p.mid, p.bg2, p.bg];
  const pad = w * 0.07;
  const gap = w * 0.018;
  const sw = (w - pad * 2 - gap * (swatches.length - 1)) / swatches.length;
  const top = h * 0.26, sh = h * 0.46;
  const cells = swatches.map((c, i) => {
    const x = pad + i * (sw + gap);
    return `<rect x="${x}" y="${top}" width="${sw}" height="${sh}" fill="${c}" ${c === p.bg ? `stroke="${p.ink}" stroke-opacity=".14"` : ''}/>
      <text x="${x}" y="${top + sh + h * 0.06}" font-family="${FONT}" font-size="${w * 0.0115}" font-weight="500"
        letter-spacing="${w * 0.001}" fill="${p.ink}" opacity=".55">${esc(c.toUpperCase())}</text>`;
  }).join('');
  return frame(w, h, `
    <text x="${pad}" y="${h * 0.15}" font-family="${FONT}" font-size="${w * 0.013}" font-weight="500"
      letter-spacing="${w * 0.004}" fill="${p.ink}" opacity=".5">SISTEMA CROM&#193;TICO</text>
    ${cells}`, p.bg);
};

// Type specimen
const specimen = (w, h, p) => {
  const big = w * 0.2;
  return frame(w, h, `
    <text x="${w * 0.06}" y="${h * 0.13}" font-family="${FONT}" font-size="${w * 0.013}" font-weight="500"
      letter-spacing="${w * 0.004}" fill="${p.ink}" opacity=".5">TIPOGRAF&#205;A</text>
    <text x="${w * 0.055}" y="${h * 0.52}" font-family="${FONT}" font-size="${big}" font-weight="600"
      letter-spacing="${-big * 0.05}" fill="${p.ink}">Aa</text>
    <text x="${w * 0.055}" y="${h * 0.66}" font-family="${FONT}" font-size="${w * 0.032}" font-weight="400"
      letter-spacing="${-w * 0.0008}" fill="${p.ink}" opacity=".8">ABCDEFGHIJKLM</text>
    <text x="${w * 0.055}" y="${h * 0.75}" font-family="${FONT}" font-size="${w * 0.032}" font-weight="400"
      letter-spacing="${-w * 0.0008}" fill="${p.ink}" opacity=".45">nopqrstuvwxyz 0123</text>
    <line x1="${w * 0.055}" y1="${h * 0.86}" x2="${w * 0.945}" y2="${h * 0.86}" stroke="${p.ink}" stroke-opacity=".16"/>`, p.bg);
};

// Editorial poster — asymmetric composition
const poster = (w, h, p, name) => {
  const s = fitSize(name, w * 0.44, w * 0.105);
  return frame(w, h, `
    <rect x="0" y="0" width="${w * 0.42}" height="${h}" fill="${p.bg2}"/>
    <circle cx="${w * 0.42}" cy="${h * 0.5}" r="${h * 0.3}" fill="${p.accent}" opacity=".9"/>
    <text x="${w * 0.5}" y="${h * 0.46}" font-family="${FONT}" font-size="${s}" font-weight="600"
      letter-spacing="${-s * 0.05}" fill="${p.ink}">${esc(name)}</text>
    <text x="${w * 0.5}" y="${h * 0.56}" font-family="${FONT}" font-size="${w * 0.014}" font-weight="500"
      letter-spacing="${w * 0.004}" fill="${p.ink}" opacity=".55">DIRECCI&#211;N DE ARTE</text>`, p.bg);
};

// Application mockup abstraction (stationery)
const stationery = (w, h, p, name) => {
  const cw = w * 0.46, ch = cw * 0.6;
  const x1 = w * 0.08, y1 = h * 0.14;
  const x2 = w * 0.44, y2 = h * 0.42;
  return frame(w, h, `
    <g>
      <rect x="${x1}" y="${y1}" width="${cw}" height="${ch}" fill="${p.bg2}"/>
      <text x="${x1 + cw * 0.09}" y="${y1 + ch * 0.58}" font-family="${FONT}" font-size="${fitSize(name, cw * 0.82, cw * 0.1)}"
        font-weight="600" letter-spacing="${-cw * 0.005}" fill="${p.ink}">${esc(name)}</text>
    </g>
    <g>
      <rect x="${x2}" y="${y2}" width="${cw}" height="${ch}" fill="${p.ink}"/>
      <circle cx="${x2 + cw * 0.5}" cy="${y2 + ch * 0.5}" r="${ch * 0.22}" fill="none"
        stroke="${p.accent}" stroke-width="${ch * 0.035}"/>
    </g>`, p.bg);
};

// Pattern / graphic system detail
const pattern = (w, h, p) => {
  const step = w / 9;
  let g = '';
  for (let y = 0; y < Math.ceil(h / step); y++) {
    for (let x = 0; x < 9; x++) {
      const cx = x * step + step / 2, cy = y * step + step / 2;
      const k = (x + y) % 4;
      if (k === 0) g += `<circle cx="${cx}" cy="${cy}" r="${step * 0.26}" fill="${p.ink}" opacity=".85"/>`;
      else if (k === 1) g += `<path d="M ${cx - step * 0.26} ${cy + step * 0.26} A ${step * 0.52} ${step * 0.52} 0 0 1 ${cx + step * 0.26} ${cy - step * 0.26}" fill="none" stroke="${p.accent}" stroke-width="${step * 0.1}"/>`;
      else if (k === 2) g += `<rect x="${cx - step * 0.24}" y="${cy - step * 0.03}" width="${step * 0.48}" height="${step * 0.06}" fill="${p.mid}"/>`;
    }
  }
  return frame(w, h, g, p.bg2);
};

// Full-bleed statement, inverted
const statement = (w, h, p, line) => {
  const lines = String(line).split('\n');
  // La línea más larga fija el cuerpo: el bloque siempre llena el ancho útil.
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '');
  const s = Math.min(fitSize(longest, w * 0.88, w * 0.13), (h * 0.8) / lines.length);
  const block = lines.map((t, i) =>
    `<text x="${w * 0.06}" y="${h * 0.5 + (i - (lines.length - 1) / 2) * s * 1.02 + s * 0.34}"
      font-family="${FONT}" font-size="${s}" font-weight="600" letter-spacing="${-s * 0.045}"
      fill="${p.bg}">${esc(t)}</text>`).join('');
  return frame(w, h, block, p.ink);
};

/* ---------- salida ---------- */

const W = 1800;

const write = (slug, file, svg) => {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), svg, 'utf8');
};

/*
 * Sólo se generan las dos piezas ambientales de la página Estudio. Los
 * proyectos usan la obra real alojada en el CDN de Adobe Portfolio; ver
 * scripts/scrape-portfolio.mjs.
 */
const neutral = { bg: '#F2F1EE', bg2: '#E3E1DB', ink: '#111111', mid: '#8F8D87', accent: '#111111' };
write('studio', 'studio-01.svg', statement(W, Math.round(W * 0.5625), neutral, 'TODO PARTE\nDE ALGO.'));
write('studio', 'studio-02.svg', pattern(Math.round(W * 0.8), W, neutral));


console.log('Generadas 2 visuales de la página Estudio en public/img/studio/');
