// Calcola da content/ quanti progetti usano ciascuna pianta (voci normalizzate) e anche per genere.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.join(process.cwd(), "content");
const plants = JSON.parse(fs.readFileSync(path.join(ROOT, "plants.json"), "utf8")).plants as any[];
const byId = new Map(plants.map((p) => [p.id, p]));
const uses = new Map<string, Set<string>>();
const genus = new Map<string, Set<string>>();
for (const f of fs.readdirSync(path.join(ROOT, "projects"))) {
  const p = JSON.parse(fs.readFileSync(path.join(ROOT, "projects", f), "utf8"));
  for (const u of p.plants) {
    (uses.get(u.plant) ?? uses.set(u.plant, new Set()).get(u.plant)!).add(p.slug);
    const g = byId.get(u.plant).genus;
    (genus.get(g) ?? genus.set(g, new Set()).get(g)!).add(p.slug);
  }
}
const rows = [...uses].map(([id, s]) => ({ id, label: byId.get(id).latin ?? byId.get(id).commonName, n: s.size })).sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
console.log("# Voci normalizzate (n. progetti)");
for (const r of rows) console.log(`${String(r.n).padStart(2)}  ${r.label}`);
console.log("\n# Per genere (n. progetti)");
for (const [g, s] of [...genus].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))) console.log(`${String(s.size).padStart(2)}  ${g}`);
console.log(`\nVoci totali: ${rows.length}`);
