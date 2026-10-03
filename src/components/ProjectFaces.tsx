"use client";
import { useEffect, useRef } from "react";
import { Pic } from "./Pic";
import { Latin } from "./Latin";
import { BackShell } from "./BackShell";
import { SECTION_LABELS, pad2 } from "@/lib/types";
import type { ProjectCard } from "@/lib/types";

type Common = { card: ProjectCard; number: number; total: number; onFlip: () => void };

export function FlipGlyph() {
  return (
    <svg viewBox="0 0 20 14" width="17" height="12" aria-hidden="true" className="glyph">
      <path d="M2 7a8 5 0 0 1 14-3.2M18 7a8 5 0 0 1-14 3.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M14.2 1.2l2.1 2.8-3.3.7M5.8 12.8l-2.1-2.8 3.3-.7" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/* ------------------------------------------------------------------ FRONTE */
export function ProjectFront({ card, number, onFlip, priority, isActive }: Common & { priority: boolean; isActive: boolean }) {
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (isActive) v.play().catch(() => {});
    else v.pause();
  }, [isActive]);

  const kicker = [card.place?.name, card.type].filter(Boolean).join(" · ");
  return (
    <>
      <div className="f-media">
        <div className="parallax">
          <div className="zoom">
            <Pic img={card.cover} priority={priority} sizes="(max-width: 700px) 900px, 1100px" />
            {card.video && (
              <video ref={vid} className="f-video" src={card.video.src} poster={card.video.poster} muted loop playsInline preload="metadata" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
      <div className="f-scrim" aria-hidden="true" />
      <div className="f-frame" aria-hidden="true" />
      <div className="f-top">
        <span className="f-num">N° {pad2(number)}</span>
        {card.year && <span className="f-year">{card.year}</span>}
      </div>
      <div className="f-bottom">
        {kicker && (
          <p className="f-kicker">
            {kicker}
            {card.place?.status === "alt-text" && <span className="rv"> · luogo da confermare</span>}
          </p>
        )}
        <h2 className="f-title">{card.title}</h2>
        {card.tagline && <p className="f-tagline">{card.tagline}</p>}
        {card.signature.length > 0 && (
          <ul className="f-tags" aria-label="Elementi firma">
            {card.signature.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      <span className="f-hint" aria-hidden="true">
        <FlipGlyph />
        <span className="hint-touch">Tocca per girare</span>
        <span className="hint-mouse">Clicca per girare</span>
      </span>
      <button type="button" className="flip-hit" onClick={onFlip} aria-expanded="false" aria-label={`Gira la scheda: ${card.title}`} />
    </>
  );
}

/* ------------------------------------------------------------------ RETRO */
type BackProps = Common & {
  nextTitle: string;
  onNext: () => void;
  onOpenPlant: (id: string) => void;
  onOpenPhoto: (index: number) => void;
};

export function ProjectBack({ card, number, total, onFlip, onNext, nextTitle, onOpenPlant, onOpenPhoto }: BackProps) {
  const kicker = [card.place?.name, card.type].filter(Boolean).join(" · ");
  const plantCount = new Set(card.plants.map((p) => p.plantId)).size;
  const facts: { value: string; label: string }[] = [];
  if (plantCount) facts.push({ value: String(plantCount), label: plantCount === 1 ? "pianta" : "piante" });
  facts.push({ value: String(card.images.length), label: card.images.length === 1 ? "foto" : "foto" });
  if (card.signature[0]) facts.push({ value: card.signature[0], label: "materiale principale" });

  const intro = card.sections.filter((s) => s.kind === "intro");
  const rest = card.sections.filter((s) => s.kind !== "intro");
  const order = ["place", "need", "idea", "materials", "night"];
  rest.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  const photoFirst = card.images.length <= 4; // schede brevi: più spazio alla fotografia

  return (
    <BackShell title={card.title} number={number} total={total} onFlip={onFlip} onNext={onNext} nextTitle={nextTitle}>
      <div className="b-hero">
        {kicker && <p className="b-kicker">{kicker}</p>}
        <h2 className="b-title">{card.title}</h2>
        {card.year && <p className="b-year">{card.year}</p>}
        {card.titleOriginal && card.titleOriginal !== card.title && <p className="rv rv-block">Titolo originale sul sito: «{card.titleOriginal}»</p>}
      </div>

      {photoFirst && <Gallery card={card} onOpenPhoto={onOpenPhoto} variant="lead" />}

      {card.pullQuote && (
        <blockquote className="b-pull">
          <p>{card.pullQuote}</p>
        </blockquote>
      )}

      <dl className="b-facts">
        {facts.map((f) => (
          <div key={f.label} className={f.value.length > 4 ? "is-text" : undefined}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      {card.signature.length > 0 && (
        <ul className="b-tags" aria-label="Materiali ed elementi firma">
          {card.signature.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      {intro.map((s, i) => (
        <section key={`i${i}`} className="b-sec b-intro">
          {s.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </section>
      ))}

      {rest.map((s, i) => (
        <section key={s.kind} className="b-sec">
          <h3 className="b-label">
            <span className="b-label-n">{pad2(i + 1)}</span>
            {SECTION_LABELS[s.kind]}
          </h3>
          <div className="b-text">
            {s.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {card.placeNote && (
        <p className="rv rv-block">
          Luogo non nominato nel testo: «{card.placeNote}». Da chiedere ad Augusta.
        </p>
      )}

      {card.plants.length > 0 && (
        <section className="b-sec b-plants">
          <h3 className="b-label">
            <span className="b-label-n">{pad2(rest.length + 1)}</span>
            Le piante
          </h3>
          <div className="b-text">
            <ul className="herbarium">
              {card.plants.map((u, i) => (
                <li key={u.plantId + i}>
                  <button type="button" className="plant" onClick={() => onOpenPlant(u.plantId)} aria-haspopup="dialog">
                    <span className="plant-idx">{pad2(i + 1)}</span>
                    <span className={u.latin ? "plant-latin" : "plant-latin is-common"}>{u.latin ? <Latin name={u.latin} /> : u.commonName}</span>
                    {u.latin && u.commonName && <span className="plant-common">{u.commonName}</span>}
                    {(u.cultivar || u.variant) && (
                      <span className="plant-cv">{[u.cultivar && `cv. ${u.cultivar}`, u.variant].filter(Boolean).join(" · ")}</span>
                    )}
                    {u.source === "text" && (
                      <span className="plant-from" title="Citata nel testo di Augusta, non nell’elenco del sito">
                        dal testo
                      </span>
                    )}
                    <span className="rv rv-block plant-orig">sito: «{u.original}»</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="b-hint">Tocca una pianta per vedere dove l’ho usata.</p>
          </div>
        </section>
      )}

      {!photoFirst && <Gallery card={card} onOpenPhoto={onOpenPhoto} variant="strip" />}
      {photoFirst && card.images.length > 0 && <p className="b-hint b-hint-pad">Tocca una fotografia per ingrandirla.</p>}
    </BackShell>
  );
}

function Gallery({ card, onOpenPhoto, variant }: { card: ProjectCard; onOpenPhoto: (i: number) => void; variant: "lead" | "strip" }) {
  return (
    <section className={`b-gallery is-${variant}`} aria-label={`Galleria fotografica, ${card.images.length} foto`}>
      {variant === "strip" && (
        <h3 className="b-label b-label-wide">
          <span className="b-label-n">·</span>Galleria fotografica <span className="b-label-count">{card.images.length}</span>
        </h3>
      )}
      <ul className="strip" data-nodrag>
        {card.images.map((im, i) => (
          <li key={im.id}>
            <button type="button" onClick={() => onOpenPhoto(i)} aria-label={`Ingrandisci foto ${i + 1} di ${card.images.length}`} aria-haspopup="dialog">
              <Pic img={im} sizes={variant === "lead" ? "(max-width: 700px) 70vw, 420px" : "260px"} alt={im.alt} />
              <span className="rv strip-alt">{im.altStatus === "proposed" ? "alt da rivedere" : ""}{im.lowRes ? " · bassa risoluzione" : ""}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
