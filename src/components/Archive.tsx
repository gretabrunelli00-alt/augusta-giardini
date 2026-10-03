"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useCarousel } from "@/lib/useCarousel";
import { CardView } from "./CardView";
import { ContactDialog, Lightbox, PlantDialog } from "./Dialogs";
import { cardPath, mod, pad2 } from "@/lib/types";
import type { Card, PlantEntry, ProjectCard } from "@/lib/types";
import type { Site } from "@/lib/schema";

type Props = {
  cards: Card[];
  plants: Record<string, PlantEntry>;
  site: Site;
  initialSlug: string;
};

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const dialogOpen = () => !!document.querySelector("dialog[open]");

export default function Archive({ cards, plants, site, initialSlug }: Props) {
  const N = cards.length;
  const initial = Math.max(0, cards.findIndex((c) => c.slug === initialSlug));
  const stageRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ slug: string; index: number } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const reduced = useReducedMotion();

  const { active, center, K, register, goTo, goBy, goToIndex, wasDrag } = useCarousel({
    count: N, initial, locked: flipped, reduced, stageRef,
  });
  const activeIdx = mod(active, N);
  const shownIdx = mod(center, N);
  const shown = cards[shownIdx];

  const flippedRef = useRef(false);
  flippedRef.current = flipped;
  const restoreFocus = useRef(false);
  const kbNav = useRef(false);
  const mounted = useRef(false);

  // Cambiare card riporta sempre la scheda al fronte
  useEffect(() => { setFlipped(false); }, [active]);

  // L'URL segue la card (nessuna navigazione: solo replaceState) + titolo documento
  useEffect(() => {
    if (!mounted.current) return;
    const c = cards[activeIdx];
    history.replaceState(history.state, "", cardPath(c));
    document.title = `${c.title} — ${site.name}`;
  }, [activeIdx, cards, site.name]);

  // Gestione del focus: retro quando si gira, fronte quando si torna, nuova card dopo la tastiera
  useEffect(() => {
    if (!mounted.current) return;
    const root = stageRef.current;
    if (!root) return;
    if (flipped) {
      requestAnimationFrame(() => root.querySelector<HTMLElement>('[data-active="true"] .back-scroll')?.focus({ preventScroll: true }));
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      requestAnimationFrame(() => root.querySelector<HTMLElement>('[data-active="true"] .flip-hit')?.focus({ preventScroll: true }));
    }
  }, [flipped]);
  useEffect(() => {
    if (!mounted.current || !kbNav.current) return;
    kbNav.current = false;
    const root = stageRef.current;
    requestAnimationFrame(() => root?.querySelector<HTMLElement>('[data-active="true"] .flip-hit')?.focus({ preventScroll: true }));
  }, [active]);
  useEffect(() => { mounted.current = true; }, []);

  const toggleFlip = useCallback(() => {
    if (flippedRef.current) restoreFocus.current = true;
    setFlipped((f) => !f);
  }, []);
  const onNext = useCallback(() => goBy(1), [goBy]);
  const openPhoto = useCallback((slug: string, index: number) => setPhoto({ slug, index }), []);
  const closePhoto = useCallback(() => setPhoto(null), []);
  const closePlant = useCallback(() => setPlantId(null), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const goSlug = useCallback(
    (slug: string) => {
      const i = cards.findIndex((c) => c.slug === slug);
      if (i < 0) return;
      setPlantId(null);
      setPhoto(null);
      setContactOpen(false);
      setFlipped(false);
      goToIndex(i);
    },
    [cards, goToIndex],
  );

  // Tastiera: ← → scorrono, Invio/Spazio girano, Esc torna al fronte
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (dialogOpen()) return;
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (typing) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        kbNav.current = true;
        goBy(e.key === "ArrowRight" ? 1 : -1);
      } else if (e.key === "Escape" && flippedRef.current) {
        e.preventDefault();
        restoreFocus.current = true;
        setFlipped(false);
      } else if ((e.key === "Enter" || e.key === " ") && (t === document.body || t === stageRef.current)) {
        e.preventDefault();
        toggleFlip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBy, toggleFlip]);

  const slots: number[] = [];
  for (let i = center - K; i <= center + K; i++) slots.push(i);

  const openPlantEntry = plantId ? plants[plantId] ?? null : null;
  const photoCard = photo ? (cards.find((c) => c.slug === photo.slug) as ProjectCard | undefined) ?? null : null;

  return (
    <>
      <header className="hdr">
        <a
          className="logo"
          href="/"
          onClick={(e) => { e.preventDefault(); goToIndex(0); }}
          aria-label={`${site.name} — torna alla prima scheda`}
        >
          <span className="logo-a">Augusta</span>
          <span className="logo-b">Architettura Giardini</span>
        </a>
        <nav className="hdr-nav" aria-label="Menu principale">
          <button type="button" className="nav-link" onClick={() => setContactOpen(true)} aria-haspopup="dialog">
            Contatti
          </button>
          <a className="nav-link" href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram<span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
        </nav>
      </header>

      <div
        ref={stageRef}
        className="stage"
        data-flipped={flipped}
        role="region"
        aria-roledescription="carosello"
        aria-label="Progetti di Augusta Architettura Giardini"
      >
        {slots.map((abs) => {
          const idx = mod(abs, N);
          return (
            <CardView
              key={abs}
              card={cards[idx]}
              abs={abs}
              number={idx + 1}
              total={N}
              initialRel={abs - initial}
              isActive={abs === active}
              flipped={abs === active && flipped}
              priority={abs === initial}
              nextTitle={cards[mod(idx + 1, N)].title}
              site={site}
              register={register}
              onPeek={goTo}
              onToggleFlip={toggleFlip}
              onNext={onNext}
              onOpenPlant={setPlantId}
              onOpenPhoto={openPhoto}
              wasDrag={wasDrag}
            />
          );
        })}
      </div>

      <footer className="ftr">
        <div className="ftr-now">
          <span className="count" aria-hidden="true">
            <b>{pad2(shownIdx + 1)}</b> / {pad2(N)}
          </span>
          <span className="now-title" key={shown.slug} aria-hidden="true">{shown.title}</span>
        </div>

        <div className="ticks" role="group" aria-label="Posizione nella collezione">
          {cards.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              className="tick"
              data-on={i === shownIdx}
              data-ed={c.kind === "editorial"}
              aria-label={`${i + 1} di ${N}: ${c.title}`}
              aria-current={i === shownIdx ? "true" : undefined}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>

        <p className="ftr-hint" aria-hidden="true">
          {flipped ? (
            <>Scorri la scheda · Esc per tornare alla copertina</>
          ) : (
            <>
              <span className="hint-touch">Scorri o tocca la scheda per girarla</span>
              <span className="hint-mouse">Scorri, trascina o usa ← → · clicca la scheda per girarla</span>
            </>
          )}
        </p>

        <div className="arrows" data-emph={flipped}>
          <button type="button" onClick={() => goBy(-1)} aria-label="Scheda precedente">
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M14 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
          <button type="button" onClick={() => goBy(1)} aria-label="Scheda successiva">
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
        </div>
      </footer>

      <p className="sr-only" role="status" aria-live="polite">
        {`Scheda ${activeIdx + 1} di ${N}: ${cards[activeIdx].title}${flipped ? ", retro" : ""}`}
      </p>

      <PlantDialog plant={openPlantEntry} onClose={closePlant} onGoTo={goSlug} />
      <Lightbox card={photoCard} index={photo?.index ?? 0} onIndex={(i) => setPhoto((p) => (p ? { ...p, index: i } : p))} onClose={closePhoto} />
      <ContactDialog open={contactOpen} onClose={closeContact} site={site} />
    </>
  );
}
