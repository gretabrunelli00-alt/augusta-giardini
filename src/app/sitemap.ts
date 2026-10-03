import type { MetadataRoute } from "next";
import { getCollection, siteUrl } from "@/lib/content";
import { cardPath } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const { cards } = getCollection();
  return [{ url: siteUrl(), changeFrequency: "monthly", priority: 1 }, ...cards.map((c) => ({ url: `${siteUrl()}${cardPath(c)}`, changeFrequency: "yearly" as const, priority: c.kind === "project" ? 0.8 : 0.5 }))];
}
