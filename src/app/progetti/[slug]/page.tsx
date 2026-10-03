import { notFound } from "next/navigation";
import ArchivePage from "@/components/ArchivePage";
import { getCollection } from "@/lib/content";
import { cardMetadata } from "@/lib/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCollection().cards.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return cardMetadata((await params).slug);
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getCollection().cards.some((c) => c.slug === slug)) notFound();
  return <ArchivePage slug={slug} />;
}
