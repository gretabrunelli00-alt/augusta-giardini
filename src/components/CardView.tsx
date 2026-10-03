"use client";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { ProjectFront, ProjectBack } from "./ProjectFaces";
import { EditorialFront, EditorialBack } from "./EditorialFaces";
import type { Card } from "@/lib/types";
import type { Site } from "@/lib/schema";

type Props = {
  card: Card;
  abs: number;
  number: number;
  total: number;
  initialRel: number;
  isActive: boolean;
  flipped: boolean;
  priority: boolean;
  nextTitle: string;
  site: Site;
  register: (abs: number, el: HTMLElement | null) => void;
  onPeek: (abs: number) => void;
  onToggleFlip: () => void;
  onNext: () => void;
  onOpenPlant: (id: string) => void;
  onOpenPhoto: (slug: string, index: number) => void;
  wasDrag: () => boolean;
};

/**
 * Una card = un oggetto con due facce. La rotazione 3D vive su `.flipper`;
 * `.lift` aggiunge il sollevamento/inclinazione a metà del giro.
 */
export const CardView = memo(function CardView(p: Props) {
  const { card, abs, isActive, flipped } = p;
  const [run, setRun] = useState<"" | "a" | "b">("");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setRun((r) => (r === "a" ? "b" : "a"));
  }, [flipped]);

  const toggle = () => {
    if (p.wasDrag()) return;
    p.onToggleFlip();
  };

  return (
    <div
      className="slot"
      ref={(el) => p.register(abs, el)}
      data-active={isActive}
      style={{ "--rel": p.initialRel } as CSSProperties}
    >
      <div className="card" data-flipped={flipped} data-run={run} inert={!isActive} role="group" aria-roledescription="scheda" aria-label={`${p.number} di ${p.total}: ${card.title}`}>
        <div className="lift">
          <div className="flipper">
            <section className={`face front kind-${card.kind}`} inert={flipped} aria-hidden={flipped}>
              {card.kind === "project" ? (
                <ProjectFront card={card} number={p.number} total={p.total} onFlip={toggle} priority={p.priority} isActive={isActive} />
              ) : (
                <EditorialFront card={card} number={p.number} total={p.total} onFlip={toggle} />
              )}
            </section>
            <section className={`face back kind-${card.kind}`} inert={!flipped} aria-hidden={!flipped}>
              {card.kind === "project" ? (
                <ProjectBack
                  card={card} number={p.number} total={p.total} onFlip={toggle}
                  nextTitle={p.nextTitle} onNext={p.onNext}
                  onOpenPlant={p.onOpenPlant} onOpenPhoto={(i) => p.onOpenPhoto(card.slug, i)}
                />
              ) : (
                <EditorialBack card={card} number={p.number} total={p.total} onFlip={toggle} nextTitle={p.nextTitle} onNext={p.onNext} site={p.site} />
              )}
            </section>
          </div>
        </div>
        <div className="shadow" aria-hidden="true" />
      </div>
      {!isActive && (
        <button type="button" className="peek-hit" tabIndex={-1} aria-hidden="true" onClick={() => !p.wasDrag() && p.onPeek(abs)} />
      )}
    </div>
  );
});
