/**
 * Previsualización del relieve de BaseSection, con la misma matemática que
 * components/TerrainCanvas.tsx, volcada a SVG para poder mirarla fuera del
 * navegador. No forma parte del sitio: es una herramienta de revisión.
 *
 *   node scripts/preview-terrain.mjs > preview-terreno.svg
 */

const W = 1440;
const H = 900;
const ROWS = 64;
const COLS = 150;

function makeNoise(seed) {
  const hash = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  };
  const fade = (t) => t * t * (3 - 2 * t);
  const value = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = fade(x - xi), yf = fade(y - yi);
    const a = hash(xi, yi), b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
  };
  return (x, y) => {
    let amp = 1, freq = 1, sum = 0, norm = 0;
    for (let o = 0; o < 4; o++) {
      sum += value(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.05;
    }
    return sum / norm;
  };
}

const noise = makeNoise(17.3);
const horizon = H * 0.34;
const depth = H - horizon;
const parts = [];

for (let r = 0; r < ROWS; r++) {
  const p = r / (ROWS - 1);
  const persp = p * p;
  const y0 = horizon + depth * persp;
  const amplitude = H * (0.05 + 0.34 * persp);
  const spread = 0.5 + 1.6 * persp;

  const pts = [];
  for (let c = 0; c <= COLS; c++) {
    const u = c / COLS;
    const x = W * (0.5 + (u - 0.5) * spread);
    const n = noise(u * 5.2 * spread + 4, p * 3.1);
    const ridge = Math.pow(Math.abs(n - 0.5) * 2, 1.35);
    pts.push([x.toFixed(1), (y0 - ridge * amplitude).toFixed(1)]);
  }

  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const shade = 5 + 30 * persp;
  const fill = `rgb(${Math.round(shade + persp * 4)},${Math.round(shade + persp * 2)},${Math.round(shade)})`;
  const left = (W * (0.5 - 0.5 * spread)).toFixed(1);
  const right = (W * (0.5 + 0.5 * spread)).toFixed(1);

  parts.push(`<path d="${line} L${right} ${H} L${left} ${H} Z" fill="${fill}"/>`);
  parts.push(
    `<path d="${line}" fill="none" stroke="rgb(236,231,222)" stroke-opacity="${(0.06 + 0.5 * persp).toFixed(3)}" stroke-width="${(0.7 + persp * 0.7).toFixed(2)}"/>`
  );
}

console.log(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#0a0a09"/>
${parts.join("\n")}
<linearGradient id="f" x1="0" y1="${horizon - H * 0.1}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#0a0a09"/><stop offset="0.28" stop-color="#0a0a09" stop-opacity="0"/>
<stop offset="0.86" stop-color="#0a0a09" stop-opacity="0"/><stop offset="1" stop-color="#0a0a09" stop-opacity="0.95"/>
</linearGradient>
<rect width="${W}" height="${H}" fill="url(#f)"/>
<text x="60" y="230" font-family="Inter Tight,Helvetica,Arial" font-size="92" font-weight="600" letter-spacing="-3.7" fill="#edece8">Tu marca necesita más</text>
<text x="60" y="322" font-family="Inter Tight,Helvetica,Arial" font-size="92" font-weight="600" letter-spacing="-3.7" fill="#edece8">que un <tspan fill="#b9ada0">logo.</tspan></text>
<rect x="60" y="392" width="1" height="40" fill="#edece8" fill-opacity="0.4"/>
<text x="60" y="470" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8">NECESITA UNA <tspan fill="#b9ada0">BASE</tspan></text>
<text x="60" y="493" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8">QUE LA SOSTENGA.</text>
<line x1="60" y1="800" x2="1380" y2="800" stroke="#edece8" stroke-opacity="0.15"/>
<text x="60" y="832" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8" fill-opacity="0.7">BRANDING</text>
<text x="300" y="832" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8" fill-opacity="0.7">/</text>
<text x="420" y="832" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8" fill-opacity="0.7">IDENTIDAD VISUAL</text>
<text x="700" y="832" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8" fill-opacity="0.7">/</text>
<text x="820" y="832" font-family="Inter Tight,Helvetica,Arial" font-size="12" font-weight="500" letter-spacing="0.9" fill="#edece8" fill-opacity="0.7">ESTRATEGIA</text>
</svg>`);
