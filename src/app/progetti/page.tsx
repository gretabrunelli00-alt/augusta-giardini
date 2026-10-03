import type { Metadata } from "next";
import ArchivePage from "@/components/ArchivePage";
import { getCollection } from "@/lib/content";

export const metadata: Metadata = {
  title: "Progetti",
  description: "L’archivio dei progetti di Augusta Architettura Giardini: terrazze, roof garden, giardini privati, loggiati e corti interne sul Lago d’Iseo e a Bergamo.",
  alternates: { canonical: "/progetti" },
};
export default function ProjectsRoute() {
  return <ArchivePage slug={getCollection().cards[0].slug} />;
}
