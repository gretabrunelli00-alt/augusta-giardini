import type { MetadataRoute } from "next";
import { getCollection, siteUrl } from "@/lib/content";
import { cardPath } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const { cards, editorials } = getCollection();
  return [
    { url: siteUrl(), changeFrequency: "monthly", priority: 1 },
    ...Object.values(editorials).map((e) => ({ url: `${siteUrl()}${cardPath(e)}`, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...cards.map((c) => ({ url: `${siteUrl()}${cardPath(c)}`, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
