import type { Site } from "@/lib/schema";

export function ContactBlock({ site, compact }: { site: Site; compact?: boolean }) {
  const c = site.contact;
  return (
    <address className={`contact-block${compact ? " is-compact" : ""}`}>
      <p className="c-name">{site.owner}</p>
      <p>
        {c.address.street}
        <br />
        {c.address.postalCode} {c.address.city} ({c.address.province})
      </p>
      <p>
        <a href={`tel:${c.phoneE164}`} className="c-tel">
          {c.phoneDisplay}
        </a>
      </p>
      <p className="c-meta">
        P. IVA {c.vatNumber}
        <br />
        {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <span className="c-soon">{c.emailPlaceholder}</span>}
      </p>
      <p className="c-ig">
        <a href={site.instagram} target="_blank" rel="noopener noreferrer">
          Instagram ↗
        </a>
      </p>
    </address>
  );
}
