// Valida tutti i contenuti con lo schema Zod e controlla i riferimenti incrociati.
// Un errore interrompe il build (prebuild). Le "avvertenze" sono cose da chiedere ad Augusta.
import fs from "node:fs";
import path from "node:path";
import { Editorial, PlantsFile, Project, Site } from "../src/lib/schema";

const ROOT = path.join(process.cwd(), "content");
const read = (...p: string[]) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));
const errors: string[] = [];
const warnings: string[] = [];

function parse<T>(schema: { safeParse: (v: unknown) => any }, file: string, data: unknown): T | null {
  const r = schema.safeParse(data);
  if (r.success) return r.data as T;
  for (const i of r.error.issues) errors.push(`${file}: ${i.path.join(".")} — ${i.message}`);
  return null;
}

const site = parse<ReturnType<typeof Site.parse>>(Site, "site.json", read("site.json"));
const plantsFile = parse<ReturnType<typeof PlantsFile.parse>>(PlantsFile, "plants.json", read("plants.json"));
const plantIds = new Set(plantsFile?.plants.map((p) => p.id));
const slugs = new Set<string>();

for (const f of fs.readdirSync(path.join(ROOT, "projects")).filter((f) => f.endsWith(".json"))) {
  const p = parse<ReturnType<typeof Project.parse>>(Project, `projects/${f}`, read("projects", f));
  if (!p) continue;
  if (f !== `${p.slug}.json`) errors.push(`projects/${f}: il nome file deve essere ${p.slug}.json`);
  if (slugs.has(p.slug)) errors.push(`slug duplicato: ${p.slug}`);
  slugs.add(p.slug);
  const ids = new Set<string>();
  for (const im of p.images) {
    if (ids.has(im.id)) errors.push(`${p.slug}: id immagine duplicato ${im.id}`);
    ids.add(im.id);
    if (!fs.existsSync(path.join(ROOT, "images", p.slug, im.file))) errors.push(`${p.slug}: manca content/images/${p.slug}/${im.file}`);
    if (im.altStatus === "proposed") warnings.push(`${p.slug}/${im.id}: alt text da far rivedere`);
  }
  if (!ids.has(p.cover)) errors.push(`${p.slug}: cover "${p.cover}" non è tra le immagini`);
  for (const u of p.plants) if (!plantIds.has(u.plant)) errors.push(`${p.slug}: pianta "${u.plant}" assente da plants.json`);
  if (!p.year) warnings.push(`${p.slug}: anno non disponibile`);
  if (!p.place) warnings.push(`${p.slug}: luogo non indicato nel sito`);
}
for (const f of fs.readdirSync(path.join(ROOT, "editorial")).filter((f) => f.endsWith(".json"))) {
  const e = parse<ReturnType<typeof Editorial.parse>>(Editorial, `editorial/${f}`, read("editorial", f));
  if (!e) continue;
  if (slugs.has(e.slug)) errors.push(`slug duplicato: ${e.slug}`);
  slugs.add(e.slug);
  for (const im of e.images) if (!fs.existsSync(path.join(ROOT, "images", "_editorial", im.file))) errors.push(`${e.slug}: manca content/images/_editorial/${im.file}`);
}
if (site) for (const s of site.order) if (!slugs.has(s)) errors.push(`site.json order: "${s}" non esiste`);
if (site && new Set(site.order).size !== site.order.length) errors.push("site.json order: slug ripetuti");

if (process.argv.includes("--warnings")) for (const w of warnings) console.warn("  ⚠ " + w);
if (errors.length) {
  console.error("\n[content] ERRORI:\n" + errors.map((e) => "  ✖ " + e).join("\n") + "\n");
  process.exit(1);
}
console.log(`[content] OK — ${slugs.size} schede, ${plantIds.size} piante, ${warnings.length} avvertenze (npm run validate -- --warnings)`);
