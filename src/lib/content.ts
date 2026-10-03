import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Editorial, PlantsFile, Project, Site } from "./schema";
import { cardPath } from "./types";
import type { Card, Collection, EditorialCard, Img, PlantEntry, PlantUseView, ProjectCard } from "./types";
import manifestJson from "@/generated/media-manifest.json";

const ROOT = path.join(process.cwd(), "content");

function readJson(...p: string[]): unknown {
  return JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));
}
function readDir<T>(dir: string, schema: { parse: (v: unknown) => T }): T[] {
  return fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => schema.parse(readJson(dir, f)));
}

// ---- media -----------------------------------------------------------------
type MediaEntry = { w: number; h: number; widths: number[]; lowRes: boolean; color: string };
const manifest = manifestJson as Record<string, Record<string, MediaEntry>>;

function resolveImages(slug: string, refs: { id: string; alt: string; altStatus: "proposed" | "confirmed"; focal: { x: number; y: number } }[]): Img[] {
  return refs.map((r) => {
    const m = manifest[slug]?.[r.id];
    if (!m) throw new Error(`Immagine non ottimizzata: ${slug}/${r.id} (esegui npm run images)`);
    return { id: r.id, base: `/media/${slug}/${r.id}`, alt: r.alt, altStatus: r.altStatus, focal: r.focal, ...m };
  });
}

export type { Card, Collection, EditorialCard, Img, PlantEntry, ProjectCard } from "./types";

let cache: Collection | null = null;

export function getCollection(): Collection {
  if (cache) return cache;
  const site = Site.parse(readJson("site.json"));
  const plantsFile = PlantsFile.parse(readJson("plants.json"));
  const projects = new Map(readDir("projects", Project).map((p) => [p.slug, p]));
  const editorials = new Map(readDir("editorial", Editorial).map((e) => [e.slug, e]));

  const plantMap: Record<string, PlantEntry> = {};
  for (const p of plantsFile.plants) plantMap[p.id] = { ...p, uses: [] };

  const cards: ProjectCard[] = site.order.map((slug) => {
    const pr = projects.get(slug);
    if (!pr) throw new Error(`site.json: "${slug}" non e' un progetto in content/projects/`);
    const images = resolveImages(pr.slug, pr.images);
    const cover = images.find((i) => i.id === pr.cover);
    if (!cover) throw new Error(`${slug}: cover "${pr.cover}" non trovata`);
    const plants: PlantUseView[] = pr.plants.map((u) => {
      const entry = plantMap[u.plant];
      if (!entry) throw new Error(`${slug}: pianta sconosciuta "${u.plant}"`);
      entry.uses.push({ slug: pr.slug, title: pr.title, cultivar: u.cultivar, variant: u.variant, original: u.original, source: u.source });
      return { plantId: u.plant, latin: entry.latin, commonName: entry.commonName, original: u.original, cultivar: u.cultivar, variant: u.variant, source: u.source };
    });
    return {
      kind: "project",
      slug: pr.slug, title: pr.title, titleOriginal: pr.titleOriginal, place: pr.place, placeNote: pr.placeNote,
      type: pr.type, year: pr.year, tagline: pr.tagline, signature: pr.signature, pullQuote: pr.pullQuote,
      seoDescription: pr.seoDescription, sections: pr.sections, plants, images, cover, video: pr.video, legacyPath: pr.legacyPath,
    } satisfies ProjectCard;
  });
  const editorialCards: Record<string, EditorialCard> = {};
  for (const ed of editorials.values()) {
    editorialCards[ed.slug] = {
      kind: "editorial", slug: ed.slug, title: ed.title, seoDescription: ed.seoDescription, front: ed.front,
      images: resolveImages("_editorial", ed.images), sections: ed.sections, phases: ed.phases, summary: ed.summary,
    };
  }
  for (const k of projects.keys()) if (!site.order.includes(k)) console.warn(`[content] progetto "${k}" non è in site.json → order (non verrà mostrato)`);

  cache = { site, cards, editorials: editorialCards, plants: plantMap };
  return cache;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? getCollection().site.siteUrl).replace(/\/$/, "");
}

export { cardPath };
