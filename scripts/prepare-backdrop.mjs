// Prepara le texture dello sfondo animato (prato + cirri) a partire dalle foto in content/backdrop-src/.
// Fonti e licenze: notes/CREDITI-IMMAGINI.md. Output in public/backdrop/ (committato).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "content/backdrop-src", OUT = "public/backdrop";
fs.mkdirSync(OUT, { recursive: true });

// Prato: si tiene dal bordo del bosco in giù, così in cima resta una fascia di alberi che sfuma nell'aria.
const meadow = sharp(path.join(SRC, "meadow.jpg"));
const { width: W, height: H } = await meadow.metadata();
const top = Math.round(H * 0.33);
const crop = meadow.clone().extract({ left: 0, top, width: W, height: H - top });
await crop.clone().resize({ width: 2600 }).webp({ quality: 82 }).toFile(path.join(OUT, "meadow.webp"));
await crop.clone().resize({ width: 1500 }).webp({ quality: 80 }).toFile(path.join(OUT, "meadow-m.webp"));

// Cirri: si ricava una mappa di densità (la nuvola è bianca, il cielo blu) che lo shader ricolora.
async function cloudMap(file, width, out) {
  const { data, info } = await sharp(path.join(SRC, file)).resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const g = Buffer.alloc(info.width * info.height);
  for (let i = 0, j = 0; i < data.length; i += 3, j++) {
    const m = Math.min(data[i], data[i + 1], data[i + 2]) / 255; // bianchezza
    g[j] = Math.round(Math.max(0, Math.min(1, (m - 0.12) / 0.8)) * 255);
  }
  await sharp(g, { raw: { width: info.width, height: info.height, channels: 1 } }).webp({ quality: 86 }).toFile(path.join(OUT, out));
}
await cloudMap("clouds-a.jpg", 2200, "clouds-a.webp");
await cloudMap("clouds-b.jpg", 1100, "clouds-b.webp");
for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + " KB");
