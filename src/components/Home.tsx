"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useStage } from "@/lib/useStage";
import { CardView } from "./CardView";
import { Intro } from "./Intro";
import { GardenBackground } from "./GardenBackground";
import Link from "next/link";
import Image from "next/image";
import { ContactDialog, Lightbox, PlantDialog } from "./Dialogs";
import { cardPath, mod, pad2 } from "@/lib/types";
import type { EditorialCard, PlantEntry, ProjectCard } from "@/lib/types";
import type { Site } from "@/lib/schema";

type Props = {
  cards: ProjectCard[];
  editorials: Record<string, EditorialCard>;
  plants: Record<string, PlantEntry>;
  site: Site;
  /** slug del progetto da mostrare; se assente si parte dall'apertura */
  initialSlug?: string;
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

export default function Home({ cards, editorials, plants, site, initialSlug }: Props) {
  const N = cards.length;
  const initial = Math.max(0, cards.findIndex((c) => c.slug === initialSlug));
  const initialScene: 0 | 1 = initialSlug ? 1 : 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ slug: string; index: number } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const reduced = useReducedMotion();

  const { active, center, K, mode, eRef, register, goTo, goBy, goToIndex, sceneTo, wasDrag } = useStage({
    count: N, initial, initialScene, rootRef, stageRef, introRef, locked: flipped, reduced,
  });
  const activeIdx = mod(active, N);
  const shownIdx = mod(center, N);
  const shown = cards[shownIdx];
  const inCarousel = mode === "carousel";

  const flippedRef = useRef(false);
  flippedRef.current = flipped;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const restoreFocus = useRef(false);
  const kbNav = useRef(false);
  const mounted = useRef(false);

  useEffect(() => { setFlipped(false); }, [active]);

  // L'URL segue la scena: "/" per l'apertura, /progetti/<slug> per il carosello
  useEffect(() => {
    if (!mounted.current) return;
    if (mode === "intro") { history.replaceState(history.state, "", "/"); document.title = `${site.name} — giardini e terrazze sul Lago d’Iseo e a Bergamo`; }
    if (mode === "carousel") { const c = cards[activeIdx]; history.replaceState(history.state, "", cardPath(c)); document.title = `${c.title} — ${site.name}`; }
  }, [mode, activeIdx, cards, site.name]);

  useEffect(() => {
    if (!mounted.current) return;
    const root = stageRef.current;
    if (!root) return;
    if (flipped) requestAnimationFrame(() => root.querySelector<HTMLElement>('[data-active="true"] .back-scroll')?.focus({ preventScroll: true }));
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      requestAnimationFrame(() => root.querySelector<HTMLElement>('[data-active="true"] .flip-hit')?.focus({ preventScroll: true }));
    }
  }, [flipped]);
  useEffect(() => {
    if (!mounted.current || !kbNav.current) return;
    kbNav.current = false;
    requestAnimationFrame(() => stageRef.current?.querySelector<HTMLElement>('[data-active="true"] .flip-hit')?.focus({ preventScroll: true }));
  }, [active]);
  useEffect(() => { mounted.current = true; }, []);

  const toggleFlip = useCallback(() => {
    if (flippedRef.current) restoreFocus.current = true;
    setFlipped((f) => !f);
  }, []);
  const onNext = useCallback(() => goBy(1), [goBy]);
  const openPhoto = useCallback((slug: string, index: number) => setPhoto({ slug, index }), []);
  const goSlug = useCallback((slug: string) => {
    const i = cards.findIndex((c) => c.slug === slug);
    if (i < 0) return;
    setPlantId(null); setPhoto(null); setContactOpen(false); setFlipped(false);
    sceneTo(1);
    goToIndex(i);
  }, [cards, goToIndex, sceneTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || dialogOpen()) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const m = modeRef.current;
      if (m === "carousel") {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); kbNav.current = true; goBy(e.key === "ArrowRight" ? 1 : -1); }
        else if (e.key === "Escape" && flippedRef.current) { e.preventDefault(); restoreFocus.current = true; setFlipped(false); }
        else if ((e.key === "ArrowUp" || e.key === "PageUp") && !flippedRef.current) { e.preventDefault(); sceneTo(0); }
        else if ((e.key === "Enter" || e.key === " ") && (t === document.body || t === stageRef.current)) { e.preventDefault(); toggleFlip(); }
      } else if (m === "intro" && (e.key === "ArrowDown" || e.key === "PageDown") && !(t && t.closest(".intro-scroll") && t !== document.body && /^(A|BUTTON)$/.test(t.tagName))) {
        const el = introRef.current;
        if (el && el.scrollHeight - el.clientHeight > 48 && el.scrollTop + el.clientHeight < el.scrollHeight - 2) return; // scorre il contenuto
        e.preventDefault(); sceneTo(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBy, sceneTo, toggleFlip]);

  const slots: number[] = [];
  for (let i = center - K; i <= center + K; i++) slots.push(i);
  const openPlant = plantId ? plants[plantId] ?? null : null;
  const photoCard = photo ? cards.find((c) => c.slug === photo.slug) ?? null : null;

  return (
    <div ref={rootRef} className="scene" data-mode={mode} style={{ "--t": initialScene, "--e": initialScene, "--e2": initialScene } as React.CSSProperties}>
      <GardenBackground sceneRef={eRef} reduced={reduced} />

      <header className="hdr">
        <a className="logo" href="/" onClick={(e) => { e.preventDefault(); setFlipped(false); sceneTo(0); }} aria-label={`${site.name} — torna all’apertura`}>
          <Image src="/brand/augusta-logo.png" alt="" width={1792} height={487} sizes="170px" />
        </a>
        <nav className="hdr-nav" aria-label="Menu principale">
          <Link className="nav-link" href="/chi-sono">Chi sono</Link>
          <Link className="nav-link" href="/come-lavoro">Come lavoro</Link>
          <button type="button" className="nav-link" onClick={() => sceneTo(inCarousel ? 0 : 1)} data-current={inCarousel}>
            {inCarousel ? "Home" : "Progetti"}
          </button>
          <button type="button" className="nav-link" onClick={() => setContactOpen(true)} aria-haspopup="dialog">Contatti</button>
          <a className="nav-link nav-ig" href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram<span aria-hidden="true"> ↗</span><span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
        </nav>
      </header>

      <div className="intro-layer" inert={mode === "carousel"} aria-hidden={mode === "carousel"}>
        <Intro
          ref={introRef}
          title="Il cielo in una stanza"
          line="Progettando un giardino lo penso come ad una stanza con il cielo."
          kicker="La mia filosofia"
          onProjects={() => sceneTo(1)}
        />
      </div>

      <div className="table" inert={mode !== "carousel"}>
        <div className="table-plane">
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
                  key={abs} card={cards[idx]} abs={abs} number={idx + 1} total={N} initialRel={abs - initial}
                  isActive={abs === active} flipped={abs === active && flipped} priority={abs === initial}
                  nextTitle={cards[mod(idx + 1, N)].title}
                  register={register} onPeek={goTo} onToggleFlip={toggleFlip} onNext={onNext}
                  onOpenPlant={setPlantId} onOpenPhoto={openPhoto} wasDrag={wasDrag}
                />
              );
            })}
          </div>
        </div>
      </div>

      <footer className="ftr" inert={mode !== "carousel"}>
        <div className="ftr-now">
          <span className="count" aria-hidden="true"><b>{pad2(shownIdx + 1)}</b> / {pad2(N)}</span>
          <span className="now-title" key={shown.slug} aria-hidden="true">{shown.title}</span>
        </div>
        <div className="ticks" role="group" aria-label="Posizione nella collezione">
          {cards.map((c, i) => (
            <button key={c.slug} type="button" className="tick" data-on={i === shownIdx} aria-label={`${i + 1} di ${N}: ${c.title}`} aria-current={i === shownIdx ? "true" : undefined} onClick={() => goToIndex(i)} />
          ))}
        </div>
        <p className="ftr-hint" aria-hidden="true">
          {flipped ? (
            <>Scorri la scheda · Esc per tornare alla copertina</>
          ) : (
            <>
              <span className="hint-touch">Scorri a destra e sinistra · tocca la scheda per girarla</span>
              <span className="hint-mouse">Trascina o usa ← → · scorri in su per tornare all’apertura</span>
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
        {inCarousel ? `Scheda ${activeIdx + 1} di ${N}: ${cards[activeIdx].title}${flipped ? ", retro" : ""}` : ""}
      </p>

      <PlantDialog plant={openPlant} onClose={() => setPlantId(null)} onGoTo={goSlug} />
      <Lightbox card={photoCard} index={photo?.index ?? 0} onIndex={(i) => setPhoto((p) => (p ? { ...p, index: i } : p))} onClose={() => setPhoto(null)} />
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} site={site} />
    </div>
  );
}
