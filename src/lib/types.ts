import type { Editorial, Plant, Site } from "./schema";

/** Modello "card" passato ai componenti client (serializzabile). */
export type Img = {
  id: string;
  base: string; // /media/<slug>/<id>
  alt: string;
  altStatus: "proposed" | "confirmed";
  focal: { x: number; y: number };
  w: number;
  h: number;
  widths: number[];
  lowRes: boolean;
  color: string;
};

export type PlantUseView = {
  plantId: string;
  latin?: string;
  commonName?: string;
  original: string;
  cultivar?: string;
  variant?: string;
  source: "list" | "text";
};
export type SectionView = { kind: string; paragraphs: string[] };

export type ProjectCard = {
  kind: "project";
  slug: string;
  title: string;
  titleOriginal?: string;
  place?: { name: string; status: "text" | "alt-text" };
  placeNote?: string;
  type?: string;
  year?: number;
  tagline?: string;
  signature: string[];
  pullQuote?: string;
  seoDescription: string;
  sections: SectionView[];
  plants: PlantUseView[];
  images: Img[];
  cover: Img;
  video?: { src: string; poster?: string };
  legacyPath: string;
};

export type EditorialCard = {
  kind: "editorial";
  slug: string;
  title: string;
  seoDescription: string;
  front: { kicker: string; phrase?: string; caption?: string };
  images: Img[];
  sections?: Editorial["sections"];
  phases?: Editorial["phases"];
};

export type Card = ProjectCard | EditorialCard;

export type PlantEntry = Plant & {
  uses: { slug: string; title: string; cultivar?: string; variant?: string; original: string; source: "list" | "text" }[];
};

export type Collection = {
  site: Site;
  cards: Card[];
  plants: Record<string, PlantEntry>;
};

export const SECTION_LABELS: Record<string, string> = {
  place: "Il luogo",
  need: "L’esigenza",
  idea: "L’idea",
  materials: "Materiali e arredi",
  night: "Luce e sera",
};

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const mod = (n: number, m: number) => ((n % m) + m) % m;
export const cardPath = (c: { kind: string; slug: string }) => (c.kind === "project" ? `/progetti/${c.slug}` : `/${c.slug}`);
