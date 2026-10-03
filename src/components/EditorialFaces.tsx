"use client";
import { Pic } from "./Pic";
import { BackShell } from "./BackShell";
import { FlipGlyph } from "./ProjectFaces";
import { pad2 } from "@/lib/types";
import type { EditorialCard } from "@/lib/types";
import type { Site } from "@/lib/schema";

type Common = { card: EditorialCard; number: number; total: number; onFlip: () => void };

const isWork = (c: EditorialCard) => !!c.phases;

/* ------------------------------------------------------------------ FRONTE */
export function EditorialFront({ card, number, onFlip }: Common) {
  const portraitless = card.images.find((i) => i.id === "filosofia");
  return (
    <>
      {isWork(card) ? (
        <div className="e-front e-work">
          <div className="f-top">
            <span className="f-num">N° {pad2(number)}</span>
            <span className="f-year">{card.front.kicker}</span>
          </div>
          <ol className="e-phases">
            {card.phases!.map((p, i) => (
              <li key={p.title}>
                <span className="e-phase-n">{pad2(i + 1)}</span>
                <span className="e-phase-t">{p.title}</span>
              </li>
            ))}
          </ol>
          <div className="e-rule" aria-hidden="true" />
        </div>
      ) : (
        <div className="e-front e-self">
          <div className="f-top">
            <span className="f-num">N° {pad2(number)}</span>
            <span className="f-year">{card.front.kicker}</span>
          </div>
          <h2 className="e-phrase">{card.front.phrase}</h2>
          {portraitless && (
            <figure className="e-inset">
              <Pic img={portraitless} sizes="260px" />
              {card.front.caption && <figcaption>{card.front.caption}</figcaption>}
            </figure>
          )}
        </div>
      )}
      <span className="f-hint" aria-hidden="true">
        <FlipGlyph />
        <span className="hint-touch">Tocca per girare</span>
        <span className="hint-mouse">Clicca per girare</span>
      </span>
      {isWork(card) && <h2 className="sr-only">{card.title}</h2>}
      <button type="button" className="flip-hit" onClick={onFlip} aria-expanded="false" aria-label={`Gira la scheda: ${card.title}`} />
    </>
  );
}

/* ------------------------------------------------------------------ RETRO */
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

export function EditorialBack({
  card, number, total, onFlip, onNext, nextTitle, site,
}: Common & { onNext: () => void; nextTitle: string; site: Site }) {
  const portrait = card.images.find((i) => i.id === "portrait");
  return (
    <BackShell title={card.title} number={number} total={total} onFlip={onFlip} onNext={onNext} nextTitle={nextTitle}>
      <div className="b-hero">
        <p className="b-kicker">{isWork(card) ? "Le quattro fasi" : "Augusta Mara Bertoni"}</p>
        <h2 className="b-title">{card.title}</h2>
      </div>

      {!isWork(card) && portrait && (
        <figure className="b-portrait">
          <Pic img={portrait} sizes="220px" />
        </figure>
      )}

      {card.sections?.map((s, i) => (
        <section key={s.heading} className="b-sec">
          <h3 className="b-label">
            <span className="b-label-n">{pad2(i + 1)}</span>
            {s.heading}
          </h3>
          <div className="b-text">
            {s.quote && (
              <blockquote className="b-pull is-inline">
                <p>“{s.quote}”</p>
              </blockquote>
            )}
            {s.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {s.facts && (
              <dl className="b-facts is-inline">
                {s.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      ))}

      {card.phases?.map((p, i) => (
        <section key={p.title} className="b-sec b-phase">
          <h3 className="b-label">
            <span className="b-label-n">{pad2(i + 1)}</span>
            {p.title}
          </h3>
          <div className="b-text">
            <blockquote className="b-pull is-inline">
              <p>“{p.quote}”</p>
            </blockquote>
            <p>{p.text}</p>
          </div>
        </section>
      ))}

      {isWork(card) && (
        <section className="b-sec b-contacts">
          <h3 className="b-label">
            <span className="b-label-n">·</span>Contatti
          </h3>
          <div className="b-text">
            <ContactBlock site={site} />
          </div>
        </section>
      )}
    </BackShell>
  );
}
