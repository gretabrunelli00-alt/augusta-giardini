/**
 * Illustrazioni botaniche schematiche in SVG, senza sfondo (tratto sottile + campiture tenui).
 * Sono disegnate per "archetipo" (rosetta, albero, spiga, graminacea…) con i colori propri della pianta:
 * non sono ritratti scientifici. Da sostituire con tavole di Augusta (campo `art` in plants.json).
 */
export type PlantArt = {
  kind: string;
  leaf?: string;
  flower?: string;
  shape?: string;
};

const PAL: Record<string, string> = {
  green: "#5f7d57", sage: "#8ea083", blue: "#7fa09a", olive: "#9a9d62", dark: "#3c5a44", silver: "#a9b5a0",
  bronze: "#7b5a47", red: "#c4503a", wine: "#8c3a4a", orange: "#e08c3e", yellow: "#e6c44c", cream: "#efe6c8",
  white: "#fcfbf5", pink: "#e0a1b0", rose: "#cf6d8a", violet: "#8f7cb8", lilac: "#b7a5d6", azure: "#86a4d6", brown: "#8a6b4f",
};
const col = (k?: string) => (k ? PAL[k] ?? k : PAL.green);

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => n.toFixed(1);
const rad = (d: number) => (d * Math.PI) / 180;

/** foglia a lente da (x,y) con angolo (gradi, 0 = destra, -90 = su) */
function leaf(x: number, y: number, ang: number, len: number, wid: number, fill: string, vein = true) {
  const a = rad(ang), tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len;
  const mx = (x + tx) / 2, my = (y + ty) / 2, px = -Math.sin(a) * wid, py = Math.cos(a) * wid;
  const d = `M${f(x)} ${f(y)}Q${f(mx + px)} ${f(my + py)} ${f(tx)} ${f(ty)}Q${f(mx - px)} ${f(my - py)} ${f(x)} ${f(y)}Z`;
  const v = vein ? `<path d="M${f(x)} ${f(y)}L${f(x + Math.cos(a) * len * 0.92)} ${f(y + Math.sin(a) * len * 0.92)}" opacity=".45"/>` : "";
  return `<path d="${d}" fill="${fill}"/>${v}`;
}
/** foglia arcuata (curva) */
function arch(x: number, y: number, ang: number, len: number, bend: number, wid: number, fill: string) {
  const a = rad(ang), tx = x + Math.cos(a) * len + bend, ty = y + Math.sin(a) * len;
  const cx = x + Math.cos(a) * len * 0.5 + bend * 0.2, cy = y + Math.sin(a) * len * 0.62;
  return `<path d="M${f(x - wid)} ${f(y)}Q${f(cx - wid)} ${f(cy)} ${f(tx)} ${f(ty)}Q${f(cx + wid)} ${f(cy + 4)} ${f(x + wid)} ${f(y)}Z" fill="${fill}"/>`;
}
const dot = (x: number, y: number, r: number, fill: string) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`;
function flower5(x: number, y: number, r: number, fill: string, center = PAL.yellow) {
  let s = "";
  for (let i = 0; i < 5; i++) { const a = -90 + i * 72; s += `<ellipse cx="${f(x + Math.cos(rad(a)) * r * 0.62)}" cy="${f(y + Math.sin(rad(a)) * r * 0.62)}" rx="${f(r * 0.5)}" ry="${f(r * 0.38)}" transform="rotate(${a} ${f(x + Math.cos(rad(a)) * r * 0.62)} ${f(y + Math.sin(rad(a)) * r * 0.62)})" fill="${fill}"/>`; }
  return s + dot(x, y, r * 0.2, center);
}
function daisy(x: number, y: number, r: number, fill: string, n = 12, center = PAL.yellow) {
  let s = "";
  for (let i = 0; i < n; i++) { const a = (360 / n) * i; s += `<ellipse cx="${f(x + Math.cos(rad(a)) * r * 0.62)}" cy="${f(y + Math.sin(rad(a)) * r * 0.62)}" rx="${f(r * 0.4)}" ry="${f(r * 0.13)}" transform="rotate(${a} ${f(x + Math.cos(rad(a)) * r * 0.62)} ${f(y + Math.sin(rad(a)) * r * 0.62)})" fill="${fill}"/>`; }
  return s + dot(x, y, r * 0.22, center);
}

const drawers: Record<string, (p: PlantArt, r: () => number) => string> = {
  rosette(p, r) {
    const L = col(p.leaf ?? "blue");
    let s = "";
    for (const [n, len, wid, spread, y] of [[9, 100, 14, 78, 178], [7, 82, 12, 52, 176], [5, 60, 9, 26, 174]] as const) {
      for (let i = 0; i < n; i++) { const t = i / (n - 1) - 0.5; s += leaf(100, y, -90 + t * spread * 2 + (r() - 0.5) * 4, len * (0.9 + r() * 0.15), wid, L); }
    }
    return s + `<path d="M84 196h32" />`;
  },
  fan(p, r) {
    const L = col(p.leaf ?? "green");
    let s = "";
    for (let i = 0; i < 11; i++) { const t = i / 10 - 0.5; s += arch(100 + t * 18, 206, -90 + t * 80, 125 + r() * 22, t * 70, 5, L); }
    if (p.flower) {
      s += `<path d="M104 206C106 150 112 100 116 46" />`;
      for (let i = 0; i < 7; i++) s += `<path d="M${f(115 - i * 0.4)} ${f(48 + i * 9)}l${f(7 + (i % 2) * 3)} ${f(-3)}" stroke="${col(p.flower)}" stroke-width="3" stroke-linecap="round"/>`;
    }
    return s;
  },
  cycas(p, r) {
    const L = col(p.leaf ?? "dark");
    let s = `<path d="M88 214c-2-30 0-60 4-78h16c4 18 6 48 4 78z" fill="${PAL.brown}" fill-opacity=".6"/>`;
    for (let i = 0; i < 15; i++) {
      const a = -170 + i * (160 / 14), ex = 100 + Math.cos(rad(a)) * 86, ey = 134 + Math.sin(rad(a)) * 70 + (i % 3) * 3;
      s += `<path d="M100 134Q${f((100 + ex) / 2)} ${f(Math.min(134, ey) - 14)} ${f(ex)} ${f(ey + (Math.abs(Math.cos(rad(a))) > 0.7 ? 22 : 0))}"/>`;
      for (let k = 1; k < 9; k++) { const t = k / 9; const px = 100 + (ex - 100) * t, py = 134 + (ey - 134) * t - Math.sin(t * Math.PI) * 14; s += `<path d="M${f(px)} ${f(py)}l${f(-Math.sin(rad(a)) * 8)} ${f(Math.cos(rad(a)) * 8)}M${f(px)} ${f(py)}l${f(Math.sin(rad(a)) * 8)} ${f(-Math.cos(rad(a)) * 8)}" stroke="${L}" stroke-width="2.2"/>`; }
    }
    return s;
  },
  yucca(p, r) {
    const L = col(p.leaf ?? "blue");
    let s = `<path d="M94 218c-1-40 0-70 3-100h6c3 30 4 60 3 100z" fill="${PAL.brown}" fill-opacity=".55"/>`;
    for (let i = 0; i < 22; i++) { const a = -165 + i * (150 / 21); s += leaf(100, 120, a, 56 + r() * 12, 3.2, L, false); }
    if (p.flower) for (let i = 0; i < 18; i++) s += dot(100 + (r() - 0.5) * 26 * (1 - i / 22), 52 + i * 3.2, 4.4 - i * 0.12, col(p.flower));
    return s + (p.flower ? `<path d="M100 120V56"/>` : "");
  },
  tree(p, r) {
    const L = col(p.leaf ?? "green"), shape = p.shape ?? "round";
    const cx = 100, cy = shape === "spread" ? 100 : 92, R = shape === "small" ? 46 : shape === "spread" ? 78 : 62;
    let s = `<path d="M92 226C95 196 96 168 95 138L104 138C104 168 105 196 108 226Z" fill="${PAL.brown}" fill-opacity=".5"/><path d="M99 150L78 112M101 146L124 108M100 140L100 96" stroke="${PAL.brown}" stroke-width="2.6"/>`;
    const blobs = shape === "spread" ? 7 : 6;
    for (let i = 0; i < blobs; i++) { const a = (i / blobs) * 6.283; const bx = cx + Math.cos(a) * R * 0.5 * (shape === "spread" ? 1.35 : 1), by = cy + Math.sin(a) * R * 0.42; s += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(R * 0.52)}" fill="${L}" fill-opacity=".55"/>`; }
    s += `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.55)}" fill="${L}" fill-opacity=".6" stroke="none"/>`;
    for (let i = 0; i < 46; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * R * 0.95; const x = cx + Math.cos(a) * d * (shape === "spread" ? 1.3 : 1), y = cy + Math.sin(a) * d * 0.8; s += p.shape === "narrow" ? leaf(x, y, -70 + r() * 140 - 70, 9, 1.6, L, false) : leaf(x, y, r() * 360, 7, 2.6, L, false); }
    if (p.flower) for (let i = 0; i < 20; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * R * 0.95; s += dot(cx + Math.cos(a) * d * (shape === "spread" ? 1.3 : 1), cy + Math.sin(a) * d * 0.8, 2.6 + r() * 1.5, col(p.flower)); }
    return s;
  },
  column(p, r) {
    const L = col(p.leaf ?? "dark"), w = p.shape === "wide" ? 34 : 20;
    let s = `<path d="M100 226v-14" stroke-width="3"/><path d="M${100} 16C${100 + w * 1.5} 60 ${100 + w * 1.4} 170 ${100 + w * 0.6} 214H${100 - w * 0.6}C${100 - w * 1.4} 170 ${100 - w * 1.5} 60 100 16Z" fill="${L}" fill-opacity=".6"/>`;
    for (let i = 0; i < 26; i++) { const y = 34 + i * 7, ww = Math.min(w * 1.15, 6 + (i / 26) * w * 1.1); s += `<path d="M${f(100 - ww)} ${f(y + 6)}l${f(ww)} ${f(-6)}l${f(ww)} ${f(6)}" opacity=".5"/>`; }
    return s;
  },
  shrub(p, r) {
    const L = col(p.leaf ?? "green"), cx = 100, cy = 150, R = 58;
    let s = `<path d="M86 214l14-30 14 30" fill="none" opacity=".5"/>`;
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; s += `<circle cx="${f(cx + Math.cos(a) * R * 0.8)}" cy="${f(cy + Math.sin(a) * R * 0.5 + 12)}" r="${f(R * 0.42)}" fill="${L}" fill-opacity=".5"/>`; }
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${f(R * 0.78)}" fill="${L}" fill-opacity=".55" stroke="none"/>`;
    for (let i = 0; i < 60; i++) { const a = r() * 6.283, d = Math.sqrt(r()); s += leaf(cx + Math.cos(a) * d * R * 0.95, cy + Math.sin(a) * d * R * 0.7, r() * 360, p.shape === "big" ? 12 : 8, p.shape === "big" ? 4.5 : 2.8, L, false); }
    if (p.flower) {
      if (p.shape === "globe") for (const [x, y, rr] of [[78, 138, 19], [112, 126, 21], [96, 160, 18], [128, 158, 16]]) { s += dot(x, y, rr, col(p.flower)).replace("/>", ` fill-opacity=".92"/>`); for (let k = 0; k < 14; k++) s += dot(x + (r() - 0.5) * rr * 1.5, y + (r() - 0.5) * rr * 1.5, 3, PAL.white); }
      else for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = Math.sqrt(r()); s += flower5(cx + Math.cos(a) * d * R * 0.9, cy + Math.sin(a) * d * R * 0.65, 6 + r() * 2, col(p.flower)); }
    }
    return s;
  },
  spike(p, r) {
    const L = col(p.leaf ?? "silver"), F = col(p.flower ?? "violet");
    let s = "";
    for (let i = 0; i < 5; i++) { const t = i / 4 - 0.5, tx = 100 + t * 90, top = 36 + Math.abs(t) * 40 + r() * 14; s += `<path d="M100 214C${f(100 + t * 20)} 150 ${f(tx)} 110 ${f(tx)} ${f(top)}"/>`; for (let k = 0; k < 9; k++) { const y = top + 4 + k * 8; s += `<ellipse cx="${f(tx - 3.5)}" cy="${f(y)}" rx="3.4" ry="2.2" fill="${F}"/><ellipse cx="${f(tx + 3.5)}" cy="${f(y + 3)}" rx="3.4" ry="2.2" fill="${F}"/>`; } }
    for (let i = 0; i < 12; i++) { const t = i / 11 - 0.5; s += leaf(100, 214, -90 + t * 150, 40 + r() * 28, 2.6, L, false); }
    return s;
  },
  umbel(p, r) {
    const L = col(p.leaf ?? "green"), F = col(p.flower ?? "azure");
    let s = "";
    for (let i = 0; i < 9; i++) { const t = i / 8 - 0.5; s += arch(100 + t * 22, 214, -90 + t * 120, 92 + r() * 20, t * 50, 5, L); }
    for (const [x, top] of [[84, 48], [118, 30]] as const) {
      s += `<path d="M100 212C${x} 160 ${x} 100 ${x} ${top + 14}"/>`;
      for (let i = 0; i < 16; i++) { const a = -180 + (i / 15) * 180, ex = x + Math.cos(rad(a)) * 26, ey = top + 12 + Math.sin(rad(a)) * 20; s += `<path d="M${x} ${top + 14}L${f(ex)} ${f(ey)}" opacity=".5"/><ellipse cx="${f(ex)}" cy="${f(ey)}" rx="4.2" ry="6" transform="rotate(${f(a + 90)} ${f(ex)} ${f(ey)})" fill="${F}"/>`; }
    }
    return s;
  },
  daisy(p, r) {
    const L = col(p.leaf ?? "green"), F = col(p.flower ?? "white");
    let s = "";
    const stems: [number, number][] = [[62, 74], [104, 44], [140, 92]];
    for (const [x, y] of stems) { s += `<path d="M100 216C${f(100 + (x - 100) * 0.3)} 170 ${x} 130 ${x} ${y + 8}"/>`; s += leaf(x, y + 60, -150, 22, 4, L) + leaf(x, y + 84, -30, 24, 4, L); }
    for (let i = 0; i < 6; i++) s += leaf(100, 216, -90 + (i - 2.5) * 38, 36, 4, L, false);
    for (const [x, y] of stems) s += daisy(x, y, 20, F, p.shape === "anemone" ? 6 : 12, col(p.shape === "anemone" ? "yellow" : "yellow"));
    return s;
  },
  grass(p, r) {
    const L = col(p.leaf ?? "olive"), F = col(p.flower ?? "cream");
    let s = "";
    for (let i = 0; i < 46; i++) { const t = i / 45 - 0.5, tx = 100 + t * 150 + (r() - 0.5) * 14, ty = 70 + Math.abs(t) * 90 + r() * 40; s += `<path d="M${f(100 + t * 24)} 216Q${f(100 + t * 70)} ${f(ty + 70)} ${f(tx)} ${f(ty)}" stroke="${L}" stroke-width="1.2"/>`; }
    for (let i = 0; i < 6; i++) { const x = 70 + i * 12, top = 26 + (i % 3) * 14; s += `<path d="M${x} 180Q${x + 6} 100 ${x + (i - 2.5) * 6} ${top}" stroke="${F}" stroke-width="2.2"/>`; for (let k = 0; k < 10; k++) s += `<path d="M${f(x + (i - 2.5) * 6 * (k / 10))} ${f(top + k * 5)}l${f(6 + k)} ${f(-4)}" stroke="${F}" stroke-width="1" opacity=".9"/>`; }
    return s;
  },
  palm(p, r) {
    const L = col(p.leaf ?? "dark");
    let s = `<path d="M92 226c0-30 2-56 4-84h8c2 28 4 54 4 84z" fill="${PAL.brown}" fill-opacity=".55"/>`;
    if (p.shape === "hairy") for (let i = 0; i < 12; i++) s += `<path d="M${95 + (i % 2) * 4} ${150 + i * 6}l${i % 2 ? 6 : -6} 3" opacity=".5"/>`;
    const n = 15;
    for (let i = 0; i < n; i++) { const a = -175 + (i / (n - 1)) * 170, len = 78 + (i % 2) * 6; const ex = 100 + Math.cos(rad(a)) * len, ey = 138 + Math.sin(rad(a)) * len * 0.9; s += `<path d="M100 138L${f(ex)} ${f(ey)}" /><path d="M100 138Q${f(100 + Math.cos(rad(a - 6)) * len * 0.8)} ${f(138 + Math.sin(rad(a - 6)) * len * 0.75)} ${f(ex)} ${f(ey)}Q${f(100 + Math.cos(rad(a + 6)) * len * 0.8)} ${f(138 + Math.sin(rad(a + 6)) * len * 0.75)} 100 138Z" fill="${L}" fill-opacity=".6"/>`; }
    return s;
  },
  pad(p, r) {
    const L = col(p.leaf ?? "green");
    let s = "";
    const pads: [number, number, number, number, number][] = [[100, 190, 38, 30, 0], [84, 138, 34, 27, -12], [122, 128, 32, 26, 14], [96, 82, 28, 23, 4], [140, 76, 24, 20, 20]];
    for (const [x, y, rx, ry, rot] of pads) {
      s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${L}" fill-opacity=".7"/>`;
      for (let i = 0; i < 9; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 0.75; s += `<path d="M${f(x + Math.cos(a) * rx * d)} ${f(y + Math.sin(a) * ry * d)}l2.4-3M${f(x + Math.cos(a) * rx * d)} ${f(y + Math.sin(a) * ry * d)}l-2.4-3" opacity=".6"/>`; }
    }
    return s + (p.flower ? daisy(140, 52, 12, col(p.flower), 8, PAL.orange) + daisy(84, 60, 10, col(p.flower), 8, PAL.orange) : "");
  },
  vine(p, r) {
    const L = col(p.leaf ?? "green");
    let s = `<path d="M40 224C60 170 130 190 120 130S60 100 96 40" fill="none"/>`;
    const pts: [number, number][] = [[52, 200], [78, 186], [112, 176], [124, 150], [112, 122], [84, 112], [64, 98], [78, 70], [96, 50], [110, 36]];
    pts.forEach(([x, y], i) => {
      const side = i % 2 ? 1 : -1;
      if (p.shape === "needle") for (let k = 0; k < 7; k++) s += `<path d="M${x} ${y}l${f(side * (6 + k * 4))} ${f(-10 + k * 4)}" stroke="${L}" stroke-width="1.1"/>`;
      else if (p.shape === "palmate") for (let k = 0; k < 5; k++) s += leaf(x + side * 10, y, -90 + side * 40 + (k - 2) * 32, 22, 4, L);
      else s += leaf(x, y, side > 0 ? -20 : -160, 26, 8, L);
    });
    if (p.flower) pts.forEach(([x, y], i) => { if (i % 2 === 0) s += flower5(x + 14, y - 12, 7, col(p.flower), PAL.cream); });
    return s;
  },
  ground(p, r) {
    const L = col(p.leaf ?? "dark");
    let s = "";
    for (const [x, y] of [[62, 190], [100, 180], [140, 192], [80, 150], [120, 146]] as const) for (let i = 0; i < 8; i++) s += leaf(x, y, -180 + i * 45, 24, 7, L, false).replace(/<path d="M[^"]*" opacity[^>]*>/g, "");
    if (p.flower) for (const x of [88, 112]) { s += `<path d="M${x} 150V100"/>`; for (let k = 0; k < 8; k++) s += dot(x + (k % 2 ? 3 : -3), 104 + k * 5, 2.6, col(p.flower)); }
    return s;
  },
  herbs(p, r) {
    const L = col(p.leaf ?? "sage");
    let s = "";
    for (const [x, kind] of [[56, 0], [100, 1], [146, 2]] as const) {
      s += `<path d="M${x} 216C${x + 6} 160 ${x - 4} 110 ${x} 52"/>`;
      for (let k = 0; k < 8; k++) { const y = 70 + k * 18; s += kind === 0 ? leaf(x, y, -160, 16, 5, L, false) + leaf(x, y, -20, 16, 5, L, false) : kind === 1 ? leaf(x, y, -140, 18, 2, L, false) + leaf(x, y, -40, 18, 2, L, false) : `<ellipse cx="${x - 7}" cy="${y}" rx="8" ry="5.5" fill="${L}"/><ellipse cx="${x + 7}" cy="${y + 7}" rx="8" ry="5.5" fill="${L}"/>`; }
    }
    return s;
  },
};

/** Restituisce una stringa <svg> senza sfondo. `id` rende il disegno deterministico. */
export function plantSvg(art: PlantArt, id: string): string {
  const draw = drawers[art.kind] ?? drawers.shrub;
  return `<svg viewBox="0 0 200 240" role="img" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${draw(art, rng(id))}</svg>`;
}
