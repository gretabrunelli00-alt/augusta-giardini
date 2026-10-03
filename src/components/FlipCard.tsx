"use client";
import { memo, useEffect, useRef, useState } from "react";
import { ProjectFront, ProjectBack } from "./ProjectFaces";
import { EditorialFront, EditorialBack } from "./EditorialFaces";
import type { Card } from "@/lib/types";
import type { Site } from "@/lib/schema";

type Props = {
  card: Card;
  /** numero progressivo (solo progetti) */
  number?: number;
  total?: number;
  flipped: boolean;
  priority?: boolean;
  nextTitle: string;
  site: Site;
  className: string;
  fx: "rise" | "hero";
  lag: number;
  dist: number;
  onToggle: (slug: string) => void;
  onNext: (slug: string) => void;
  onOpenPlant: (id: string) => void;
  onOpenPhoto: (slug: string, index: number) => void;
};

/** Una card = un oggetto con due facce. La rotazione 3D vive su `.flipper`; `.lift` aggiunge il sollevamento a metà del giro. */
export const FlipCard = memo(function FlipCard(p: Props) {
  const { card, flipped } = p;
  const [run, setRun] = useState<"" | "a" | "b">("");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setRun((r) => (r === "a" ? "b" : "a"));
  }, [flipped]);

  const toggle = () => p.onToggle(card.slug);
  return (
    <article className={`fcard ${p.className}`} data-slug={card.slug} data-flipped={flipped}>
      <div className="reveal">
        <div className="reveal-in" data-fx={p.fx} data-lag={p.lag} data-dist={p.dist}>
          <div className="card" data-flipped={flipped} data-run={run} role="group" aria-roledescription="scheda" aria-label={p.number ? `${p.number} di ${p.total}: ${card.title}` : card.title}>
            <div className="lift">
              <div className="flipper">
                <section className={`face front kind-${card.kind}`} inert={flipped} aria-hidden={flipped}>
                  {card.kind === "project" ? (
                    <ProjectFront card={card} number={p.number ?? 0} total={p.total ?? 0} onFlip={toggle} priority={!!p.priority} isActive />
                  ) : (
                    <EditorialFront card={card} onFlip={toggle} />
                  )}
                </section>
                <section className={`face back kind-${card.kind}`} inert={!flipped} aria-hidden={!flipped}>
                  {card.kind === "project" ? (
                    <ProjectBack
                      card={card} number={p.number ?? 0} total={p.total ?? 0} onFlip={toggle}
                      nextTitle={p.nextTitle} onNext={() => p.onNext(card.slug)}
                      onOpenPlant={p.onOpenPlant} onOpenPhoto={(i) => p.onOpenPhoto(card.slug, i)}
                    />
                  ) : (
                    <EditorialBack card={card} onFlip={toggle} nextTitle={p.nextTitle} onNext={() => p.onNext(card.slug)} site={p.site} />
                  )}
                </section>
              </div>
            </div>
            <div className="shadow" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
});
