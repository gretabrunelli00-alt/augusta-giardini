import type { Metadata } from "next";
import { getCollection, siteUrl } from "./content";
import { cardPath } from "./types";

export function cardMetadata(slug: string): Metadata {
  const { cards, site } = getCollection();
  const c = cards.find((x) => x.slug === slug);
  if (!c) return {};
  const path = cardPath(c);
  const proj = c.kind === "project";
  const where = proj && c.place ? ` — ${c.place.name}` : "";
  const title = proj ? `${c.title}${where}` : c.title;
  const img = proj ? c.cover : null;
  const og = img ? `${img.base}-og.jpg` : undefined;
  return {
    title,
    description: c.seoDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: `${title} | ${site.name}`,
      description: c.seoDescription,
      url: `${siteUrl()}${path}`,
      siteName: site.name,
      locale: site.locale,
      images: og ? [{ url: og, width: 1200, height: 630, alt: img!.alt }] : undefined,
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description: c.seoDescription, images: og ? [og] : undefined },
  };
}
