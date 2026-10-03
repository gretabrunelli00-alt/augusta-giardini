import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { getCollection, siteUrl } from "@/lib/content";

export function generateMetadata(): Metadata {
  const { site, cards } = getCollection();
  const first = cards[0];
  const og = first.kind === "project" ? `${first.cover.base}-og.jpg` : undefined;
  return {
    title: { absolute: "Augusta Architettura Giardini — progettazione di giardini e terrazze, Lago d’Iseo e Bergamo" },
    description: "Progettazione di giardini, terrazze, balconi e giardini pensili sul Lago d’Iseo (Basso Sebino) e a Bergamo. Un archivio visivo dei progetti di Augusta Mara Bertoni.",
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: siteUrl(), siteName: site.name, locale: site.locale, title: site.name, description: site.description, images: og ? [{ url: og, width: 1200, height: 630 }] : undefined },
  };
}

export default function Home() {
  return <ArchivePage slug={getCollection().cards[0].slug} />;
}
