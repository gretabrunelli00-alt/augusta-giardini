import Link from "next/link";
import { preload } from "react-dom";
import Archive from "./Archive";
import { getCollection, siteUrl } from "@/lib/content";
import { cardPath } from "@/lib/types";
import type { Card } from "@/lib/types";

/** Pagina server: dati + preload della prima foto + fallback senza JavaScript. */
export default function ArchivePage({ slug }: { slug: string }) {
  const { cards, plants, site } = getCollection();
  const current = cards.find((c) => c.slug === slug)!;
  const img = current.kind === "project" ? current.cover : current.images[0];
  if (img) {
    const w = img.widths[Math.min(1, img.widths.length - 1)];
    preload(`${img.base}-${w}.avif`, {
      as: "image",
      type: "image/avif",
      fetchPriority: "high",
      imageSrcSet: img.widths.map((x) => `${img.base}-${x}.avif ${x}w`).join(", "),
      imageSizes: "(max-width: 700px) 900px, 1100px",
    });
  }
  const jsonLd =
    current.kind === "project"
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              name: current.title,
              description: current.seoDescription,
              url: `${siteUrl()}${cardPath(current)}`,
              image: current.images.map((i) => `${siteUrl()}${i.base}-1280.jpg`),
              creator: { "@id": `${siteUrl()}/#studio` },
              inLanguage: "it",
              ...(current.place?.status === "text" ? { locationCreated: { "@type": "Place", name: current.place.name } } : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: site.name, item: siteUrl() },
                { "@type": "ListItem", position: 2, name: current.title, item: `${siteUrl()}${cardPath(current)}` },
              ],
            },
          ],
        }
      : null;

  return (
    <>
      <h1 className="sr-only">
        {`${current.title} — ${site.name}`}
      </h1>
      <Archive cards={cards} plants={plants} site={site} initialSlug={slug} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <Fallback current={current} cards={cards} />
    </>
  );
}

/** Contenuto visibile solo senza JavaScript (e leggibile dai crawler). */
function Fallback({ current, cards }: { current: Card; cards: Card[] }) {
  const { site } = getCollection();
  return (
    <div className="nojs">
      <p>
        <strong>{site.name}</strong> — {site.description}
      </p>
      <h2>{current.title}</h2>
      {current.kind === "project" && (
        <>
          {current.sections.flatMap((s) => s.paragraphs).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {current.plants.length > 0 && (
            <>
              <h3>Le piante</h3>
              <ul>
                {current.plants.map((p) => (
                  <li key={p.plantId + p.original}>{p.latin ?? p.commonName}{p.cultivar ? ` ${p.cultivar}` : ""}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <h2>Tutti i progetti</h2>
      <ul>
        {cards.map((c) => (
          <li key={c.slug}>
            <Link href={cardPath(c)}>{c.title}</Link>
            {c.kind === "project" && c.tagline ? ` — ${c.tagline}` : ""}
          </li>
        ))}
      </ul>
      <p>
        {site.owner}, {site.contact.address.street}, {site.contact.address.postalCode} {site.contact.address.city} ({site.contact.address.province}) ·{" "}
        <a href={`tel:${site.contact.phoneE164}`}>{site.contact.phoneDisplay}</a> · P. IVA {site.contact.vatNumber}
      </p>
    </div>
  );
}
