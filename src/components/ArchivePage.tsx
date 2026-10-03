import Link from "next/link";
import { preload } from "react-dom";
import Home from "./Home";
import { getCollection, siteUrl } from "@/lib/content";
import { cardPath } from "@/lib/types";

/** Pagina server: dati + preload della prima foto + fallback senza JavaScript. */
export default function ArchivePage({ slug, home }: { slug?: string; home?: boolean }) {
  const { cards, editorials, plants, site } = getCollection();
  const current = slug ? cards.find((c) => c.slug === slug) : undefined;
  if (current) {
    const img = current.cover;
    preload(`${img.base}-${img.widths[Math.min(1, img.widths.length - 1)]}.avif`, {
      as: "image", type: "image/avif", fetchPriority: "high",
      imageSrcSet: img.widths.map((x) => `${img.base}-${x}.avif ${x}w`).join(", "),
      imageSizes: "(max-width: 700px) 900px, 1100px",
    });
  }
  const jsonLd = current
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
        {home || !current ? `${site.name} — progettazione di giardini e terrazze sul Lago d’Iseo e a Bergamo` : `${current.title} — ${site.name}`}
      </h1>
      <Home cards={cards} editorials={editorials} plants={plants} site={site} initialSlug={current?.slug} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <Fallback />
    </>
  );
}

/** Contenuto visibile solo senza JavaScript (e leggibile dai crawler). */
function Fallback() {
  const { site, cards, editorials } = getCollection();
  return (
    <div className="nojs">
      <p><strong>{site.name}</strong> — {site.description}</p>
      <h2>Studio</h2>
      <ul>
        {Object.values(editorials).map((e) => (
          <li key={e.slug}><Link href={`/${e.slug}`}>{e.title}</Link></li>
        ))}
      </ul>
      <h2>Progetti</h2>
      <ul>
        {cards.map((c) => (
          <li key={c.slug}>
            <Link href={cardPath(c)}>{c.title}</Link>
            {c.tagline ? ` — ${c.tagline}` : ""}
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
