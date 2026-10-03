// Ottimizza le foto sorgente (content/images/**) in AVIF/WebP/JPEG responsive
// dentro public/media/ e scrive src/generated/media-manifest.json.
// Per sostituire una foto con l'originale: sovrascrivi il file in content/images/<slug>/
// (stesso nome) e rilancia `npm run images` (rielabora solo ciò che è cambiato).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content/images");
const OUT = path.join(ROOT, "public/media");
const MANIFEST = path.join(ROOT, "src/generated/media-manifest.json");
const WIDTHS = [640, 1280, 1920];
const LOW_RES_BELOW = 1600; // sotto questa larghezza la foto è segnalata come "da sostituire"

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const jobs = []; // { slug, id, file }
for (const f of fs.readdirSync(path.join(ROOT, "content/projects")).filter((f) => f.endsWith(".json"))) {
  const p = readJson(path.join(ROOT, "content/projects", f));
  for (const im of p.images) jobs.push({ slug: p.slug, id: im.id, file: im.file, cover: im.id === p.cover });
}
for (const f of fs.readdirSync(path.join(ROOT, "content/editorial")).filter((f) => f.endsWith(".json"))) {
  const e = readJson(path.join(ROOT, "content/editorial", f));
  for (const im of e.images ?? []) jobs.push({ slug: "_editorial", id: im.id, file: im.file, cover: false });
}

let old = {};
try { old = readJson(MANIFEST); } catch {}
const manifest = {};
let done = 0, skipped = 0;

for (const j of jobs) {
  const src = path.join(SRC, j.slug, j.file);
  if (!fs.existsSync(src)) throw new Error(`File sorgente mancante: content/images/${j.slug}/${j.file}`);
  const stat = fs.statSync(src);
  const stamp = `${stat.size}-${Math.floor(stat.mtimeMs)}`;
  const prev = old[j.slug]?.[j.id];
  const outDir = path.join(OUT, j.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const expected = prev ? prev.widths.flatMap((w) => ["avif", "webp", "jpg"].map((e) => `${j.id}-${w}.${e}`)) : [];
  if (prev && prev.stamp === stamp && expected.every((f) => fs.existsSync(path.join(outDir, f)))) {
    (manifest[j.slug] ??= {})[j.id] = prev; skipped++; continue;
  }
  const img = sharp(src, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const w = meta.autoOrient?.width ?? meta.width, h = meta.autoOrient?.height ?? meta.height;
  const widths = [...new Set(WIDTHS.map((x) => Math.min(x, w)))].sort((a, b) => a - b);
  // dedupe widths that collapse to the source width
  for (const width of widths) {
    const base = img.clone().resize({ width, withoutEnlargement: true });
    await Promise.all([
      base.clone().avif({ quality: 52, effort: 3 }).toFile(path.join(outDir, `${j.id}-${width}.avif`)),
      base.clone().webp({ quality: 74 }).toFile(path.join(outDir, `${j.id}-${width}.webp`)),
      base.clone().flatten({ background: "#f4f1ea" }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(outDir, `${j.id}-${width}.jpg`)),
    ]);
  }
  const { dominant } = await sharp(src).resize(32, 32, { fit: "inside" }).stats();
  const color = "#" + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  (manifest[j.slug] ??= {})[j.id] = { w, h, widths, lowRes: w < LOW_RES_BELOW, color, stamp };
  done++;
  console.log(`  ${j.slug}/${j.id}  ${w}×${h}${w < LOW_RES_BELOW ? "  (bassa risoluzione)" : ""}`);
}

// Open Graph 1200×630 per le copertine: ritaglio centrato sul punto focale
for (const j of jobs.filter((x) => x.cover)) {
  const p = readJson(path.join(ROOT, "content/projects", `${j.slug}.json`));
  const im = p.images.find((i) => i.id === p.cover);
  const out = path.join(OUT, j.slug, `${j.id}-og.jpg`);
  const src = path.join(SRC, j.slug, j.file);
  const m = manifest[j.slug][j.id];
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(src).mtimeMs && fs.statSync(out).mtimeMs > fs.statSync(path.join(ROOT, "content/projects", `${j.slug}.json`)).mtimeMs) continue;
  let cw2 = m.w, ch2 = Math.round((cw2 * 630) / 1200);
  if (ch2 > m.h) { ch2 = m.h; cw2 = Math.round((ch2 * 1200) / 630); }
  const left = Math.max(0, Math.min(m.w - cw2, Math.round(im.focal.x * m.w - cw2 / 2)));
  const top = Math.max(0, Math.min(m.h - ch2, Math.round(im.focal.y * m.h - ch2 / 2)));
  await sharp(src).rotate().extract({ left, top, width: cw2, height: ch2 }).resize(1200, 630).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`[images] ${done} elaborate, ${skipped} già aggiornate → public/media`);
