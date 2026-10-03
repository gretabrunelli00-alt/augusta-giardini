"use client";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Pic } from "./Pic";
import { Latin } from "./Latin";
import { plantSvg } from "@/lib/plantArt";
import { ContactBlock } from "./ContactBlock";
import type { PlantEntry, ProjectCard } from "@/lib/types";
import type { Site } from "@/lib/schema";

/** <dialog> nativo: focus trap, Esc e ripristino del focus gratis. */
function useModal(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const h = () => onClose();
    d.addEventListener("close", h);
    return () => d.removeEventListener("close", h);
  }, [onClose]);
  const onBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );
  return { ref, onBackdrop };
}

function CloseBtn({ onClose, label = "Chiudi" }: { onClose: () => void; label?: string }) {
  return (
    <button type="button" className="dlg-x" onClick={onClose} aria-label={label}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ piante */
export function PlantDialog({
  plant, onClose, onGoTo,
}: {
  plant: PlantEntry | null;
  onClose: () => void;
  onGoTo: (slug: string) => void;
}) {
  const last = useRef<PlantEntry | null>(null);
  if (plant) last.current = plant;
  const p = plant ?? last.current;
  const { ref, onBackdrop } = useModal(!!plant, onClose);
  return (
    <dialog ref={ref} className="dlg dlg-plant" aria-labelledby="plant-title" onClick={onBackdrop}>
      {p && (
        <div className="dlg-body">
          <CloseBtn onClose={onClose} />
          {p.art && (
            <figure className="plant-art" aria-hidden="true">
              <div dangerouslySetInnerHTML={{ __html: plantSvg(p.art, p.id) }} />
            </figure>
          )}
          <p className="dlg-kicker">Scheda botanica{p.genus && p.genus !== "—" ? ` · genere ${p.genus}` : ""}</p>
          <h2 id="plant-title" className={p.latin ? "plant-h" : "plant-h is-common"}>
            {p.latin ? <Latin name={p.latin} /> : p.commonName}
          </h2>
          {p.latin && p.commonName && <p className="plant-h-common">{p.commonName}</p>}

          {(p.family || p.plantType || p.foliage || p.bloom || p.exposure) && (
            <>
              <h3 className="dlg-sub">Caratteristiche</h3>
              <dl className="plant-facts">
                {([["Famiglia", p.family], ["Tipo", p.plantType], ["Foglia", p.foliage], ["Fioritura", p.bloom], ["Esposizione", p.exposure]] as const)
                  .filter(([, v]) => v && v !== "—")
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>
              <p className="plant-disclaimer">Scheda indicativa e disegno schematico, da verificare con Augusta.</p>
            </>
          )}

          <h3 className="dlg-sub">
            Dove l’ho usata <span>{p.uses.length}</span>
          </h3>
          <ul className="plant-uses">
            {p.uses.map((u) => (
              <li key={u.slug}>
                <button type="button" onClick={() => onGoTo(u.slug)}>
                  <span className="pu-title">{u.title}</span>
                  <span className="pu-meta">
                    {[u.cultivar && `cv. ${u.cultivar}`, u.variant, u.source === "text" ? "citata nel testo" : null].filter(Boolean).join(" · ")}
                  </span>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <h3 className="dlg-sub">Nota di Augusta</h3>
          {p.note ? (
            <p className="plant-note">{p.note}</p>
          ) : (
            <div className="note-ph" aria-label="Nota di Augusta: spazio ancora vuoto">
              <span>Spazio per una breve nota di Augusta.</span>
            </div>
          )}

          <div className="rv rv-box">
            <b>Da confermare ad Augusta.</b>
            {p.reviewNote && <p>{p.reviewNote}</p>}
            <p>Scritto sul sito: {Array.from(new Set(p.uses.map((u) => `«${u.original}»`))).join(", ")}</p>
          </div>
        </div>
      )}
    </dialog>
  );
}

/* ---------------------------------------------------------------- contatti */
export function ContactDialog({ open, onClose, site }: { open: boolean; onClose: () => void; site: Site }) {
  const { ref, onBackdrop } = useModal(open, onClose);
  return (
    <dialog ref={ref} className="dlg dlg-contact" aria-labelledby="contact-title" onClick={onBackdrop}>
      <div className="dlg-body">
        <CloseBtn onClose={onClose} />
        <p className="dlg-kicker">{site.name}</p>
        <h2 id="contact-title" className="dlg-h">Contatti</h2>
        <p className="dlg-lead">Studio a {site.contact.address.city}. Lavoro soprattutto sul Lago d’Iseo (Basso Sebino) e a Bergamo.</p>
        <ContactBlock site={site} />
      </div>
    </dialog>
  );
}

/* ---------------------------------------------------------------- lightbox */
export function Lightbox({
  card, index, onIndex, onClose,
}: {
  card: ProjectCard | null;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const last = useRef<ProjectCard | null>(null);
  if (card) last.current = card;
  const c = card ?? last.current;
  const { ref, onBackdrop } = useModal(!!card, onClose);
  const n = c?.images.length ?? 0;
  const go = useCallback((d: number) => n && onIndex((index + d + n) % n), [index, n, onIndex]);

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, go]);

  // swipe
  const start = useRef<{ x: number; y: number } | null>(null);
  const im = c?.images[index];
  return (
    <dialog ref={ref} className="dlg dlg-light" aria-label={c ? `Fotografie: ${c.title}` : "Fotografie"} onClick={onBackdrop}>
      {c && im && (
        <div
          className="lb"
          onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={(e) => {
            const s = start.current; start.current = null;
            if (!s) return;
            const dx = e.clientX - s.x, dy = e.clientY - s.y;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
          }}
        >
          <CloseBtn onClose={onClose} label="Chiudi la galleria" />
          <figure className="lb-fig">
            <Pic key={im.id} img={im} sizes="100vw" focal={false} className="lb-img" priority />
            <figcaption>
              <span className="lb-count">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
              <span className="lb-alt">{im.alt}</span>
            </figcaption>
          </figure>
          {n > 1 && (
            <>
              <button type="button" className="lb-nav is-prev" onClick={() => go(-1)} aria-label="Foto precedente">
                <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d="M14 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
              </button>
              <button type="button" className="lb-nav is-next" onClick={() => go(1)} aria-label="Foto successiva">
                <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}

export type { ReactNode };
