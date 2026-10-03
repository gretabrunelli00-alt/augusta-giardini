import type { Metadata } from "next";
import { getCollection, siteUrl } from "./content";
import { cardPath } from "./types";

export function cardMetadata(slug: string): Metadata {
  const { cards, editorials, site } = getCollection();
  const c = cards.find((x) => x.slug === slug) ?? editorials[slug];
  if (!c) return {};
  const path = cardPath(c);
  const proj = c.kind === "project";
  const title = proj && c.place ? `${c.title} — ${c.place.name}` : c.title;
  const og = proj ? `${c.cover.base}-og.jpg` : `${cards[0].cover.base}-og.jpg`;
  return {
    title,
    description: c.seoDescription,
    alternates: { canonical: path },
    openGraph: {
      type: proj ? "article" : "website",
      title: `${title} | ${site.name}`,
      description: c.seoDescription,
      url: `${siteUrl()}${path}`,
      siteName: site.name,
      locale: site.locale,
      images: [{ url: og, width: 1200, height: 630, alt: proj ? c.cover.alt : site.name }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description: c.seoDescription, images: [og] },
  };
}
