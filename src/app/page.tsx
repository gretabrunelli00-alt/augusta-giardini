import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { getCollection, siteUrl } from "@/lib/content";

export function generateMetadata(): Metadata {
  const { site, cards } = getCollection();
  const og = `${cards[0].cover.base}-og.jpg`;
  return {
    title: { absolute: "Augusta Architettura Giardini — progettazione di giardini e terrazze, Lago d’Iseo e Bergamo" },
    description: "Progettazione di giardini, terrazze, balconi e giardini pensili sul Lago d’Iseo (Basso Sebino) e a Bergamo. Filosofia, percorso e metodo di Augusta Mara Bertoni, poi l’archivio dei progetti.",
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: siteUrl(), siteName: site.name, locale: site.locale, title: site.name, description: site.description, images: [{ url: og, width: 1200, height: 630 }] },
  };
}

export default function HomeRoute() {
  return <ArchivePage home />;
}
