import { z } from "zod";

/**
 * Schema dei contenuti. Ogni campo opzionale può mancare: l'interfaccia
 * nasconde l'elemento corrispondente e il layout si riequilibra.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: minuscolo, cifre e trattini");

export const Focal = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

export const ImageRef = z.object({
  id: z.string().min(1),
  /** nome del file dentro content/images/<slug>/ (sostituibile con l'originale ad alta risoluzione) */
  file: z.string().min(1),
  /** alt text descrittivo in italiano */
  alt: z.string().min(1),
  /** "proposed" = scritto da noi, da far rivedere ad Augusta */
  altStatus: z.enum(["proposed", "confirmed"]).default("proposed"),
  /** punto focale (0–1) per guidare il ritaglio verticale del fronte */
  focal: Focal.default({ x: 0.5, y: 0.5 }),
  /** URL di origine sul sito attuale */
  sourceUrl: z.string().url().optional(),
});

export const SectionKind = z.enum(["intro", "place", "need", "idea", "materials", "night"]);
export const Section = z.object({
  kind: SectionKind,
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const PlantUse = z.object({
  plant: z.string().min(1),
  /** testo originale del sito, conservato com'è (refusi inclusi) */
  original: z.string().min(1),
  cultivar: z.string().optional(),
  variant: z.string().optional(),
  /** "list" = elenco piante del sito; "text" = citata solo nel testo */
  source: z.enum(["list", "text"]),
});

export const Project = z.object({
  kind: z.literal("project"),
  slug,
  title: z.string().min(1),
  titleOriginal: z.string().optional(),
  place: z.object({ name: z.string(), status: z.enum(["text", "alt-text"]) }).optional(),
  placeNote: z.string().optional(),
  type: z.string().optional(),
  /** anno di realizzazione: SOLO se noto. Le date WordPress NON sono anni di realizzazione. */
  year: z.number().int().optional(),
  tagline: z.string().optional(),
  signature: z.array(z.string()).max(3).default([]),
  pullQuote: z.string().optional(),
  seoDescription: z.string().max(200),
  sections: z.array(Section).default([]),
  plants: z.array(PlantUse).default([]),
  images: z.array(ImageRef).min(1),
  cover: z.string(),
  /** video in loop opzionale per il fronte */
  video: z.object({ src: z.string(), poster: z.string().optional() }).optional(),
  legacyPath: z.string().startsWith("/"),
  sourcePage: z.string().url().optional(),
});
export type Project = z.infer<typeof Project>;

export const Editorial = z.object({
  kind: z.literal("editorial"),
  slug,
  title: z.string(),
  seoDescription: z.string().max(200),
  front: z.object({ kicker: z.string(), phrase: z.string().optional(), caption: z.string().optional() }),
  /** sunto per l'apertura (parole di Augusta, estratte) con dati chiave; "{projects}" = n. progetti */
  summary: z
    .object({
      quote: z.string().optional(),
      paragraphs: z.array(z.string()).default([]),
      keywords: z.array(z.string()).optional(),
      kpis: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    })
    .optional(),
  images: z.array(ImageRef).default([]),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        quote: z.string().optional(),
        paragraphs: z.array(z.string()),
        facts: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      }),
    )
    .optional(),
  phases: z
    .array(z.object({ title: z.string(), quote: z.string(), text: z.string() }))
    .optional(),
});
export type Editorial = z.infer<typeof Editorial>;

export const Plant = z.object({
  id: z.string(),
  latin: z.string().optional(),
  commonName: z.string().optional(),
  genus: z.string(),
  status: z.enum(["da-confermare", "confermata"]).default("da-confermare"),
  reviewNote: z.string().optional(),
  /** caratteristiche generali (indicative, da verificare con Augusta) */
  family: z.string().optional(),
  plantType: z.string().optional(),
  foliage: z.string().optional(),
  bloom: z.string().optional(),
  exposure: z.string().optional(),
  /** illustrazione schematica SVG: archetipo + colori (vedi src/lib/plantArt.ts) */
  art: z.object({ kind: z.string(), leaf: z.string().optional(), flower: z.string().optional(), shape: z.string().optional() }).optional(),
  /** breve nota di Augusta: vuota finché non la scrive */
  note: z.string().default(""),
});
export type Plant = z.infer<typeof Plant>;
export const PlantsFile = z.object({ plants: z.array(Plant) });

export const Site = z.object({
  name: z.string(),
  owner: z.string(),
  siteUrl: z.string().url(),
  locale: z.string(),
  tagline: z.string(),
  description: z.string(),
  instagram: z.string().url(),
  contact: z.object({
    phoneDisplay: z.string(),
    phoneE164: z.string(),
    email: z.string(),
    emailPlaceholder: z.string(),
    address: z.object({
      street: z.string(),
      postalCode: z.string(),
      city: z.string(),
      province: z.string(),
      country: z.string(),
    }),
    vatNumber: z.string(),
  }),
  areaServed: z.array(z.string()),
  /** ordine delle card nel carosello (slug di progetti e di card editoriali) */
  order: z.array(slug).min(1),
});
export type Site = z.infer<typeof Site>;
