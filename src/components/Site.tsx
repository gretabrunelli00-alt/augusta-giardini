"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlipCard } from "./FlipCard";
import { ContactBlock } from "./EditorialFaces";
import { ContactDialog, Lightbox, PlantDialog } from "./Dialogs";
import { useScrollFx } from "@/lib/useScrollFx";
import { cardPath, pad2 } from "@/lib/types";
import type { Card, PlantEntry, ProjectCard } from "@/lib/types";
import type { Site as SiteData } from "@/lib/schema";

type Props = { cards: Card[]; plants: Record<string, PlantEntry>; site: SiteData; initialSlug: string };

const dialogOpen = () => !!document.querySelector("dialog[open]");

export default function Site({ cards, plants, site, initialSlug }: Props) {
  const hero = ["chi-sono", "come-lavoro"].map((s) => cards.find((c) => c.slug === s)!).filter(Boolean);
  const projects = cards.filter((c): c is ProjectCard => c.kind === "project");
  const flow: Card[] = [...hero, ...projects];

  const [flipped, setFlipped] = useState<string | null>(null);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ slug: string; index: number } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState(0); // indice (0-based) del progetto più vicino al centro, -1 se fuori sezione

  useScrollFx();

  const rootRef = useRef<HTMLDivElement>(null);
  const flippedRef = useRef<string | null>(null);
  flippedRef.current = flipped;

  const findEl = (slug: string) => rootRef.current?.querySelector<HTMLElement>(`[data-slug="${slug}"]`) ?? null;
  const focusCard = useCallback((slug: string, behavior: ScrollBehavior = "smooth") => {
    findEl(slug)?.scrollIntoView({ behavior, block: "center" });
  }, []);

  // entrata da URL diretto: porta la card al centro
  useEffect(() => {
    if (initialSlug === "chi-sono") return;
    const t = setTimeout(() => focusCard(initialSlug, "instant" as ScrollBehavior), 60);
    return () => clearTimeout(t);
  }, [initialSlug, focusCard]);

  // header + indicatore di posizione
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      setScrolled(scrollY > 12);
      const sec = document.getElementById("progetti");
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      if (r.top > innerHeight * 0.55 || r.bottom < innerHeight * 0.3) { setCurrent(-1); return; }
      let best = 0, bd = 1e9;
      sec.querySelectorAll<HTMLElement>("[data-slug]").forEach((el, i) => {
        const b = el.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - innerHeight / 2);
        if (d < bd) { bd = d; best = i; }
      });
      setCurrent(best);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    on();
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);

  const onToggle = useCallback((slug: string) => {
    const was = flippedRef.current;
    const next = was === slug ? null : slug;
    setFlipped(next);
    const c = cards.find((x) => x.slug === next);
    history.replaceState(history.state, "", c ? cardPath(c) : "/");
    document.title = c ? `${c.title} — ${site.name}` : `${site.name}`;
    if (next) setTimeout(() => focusCard(next), 120);
    requestAnimationFrame(() => {
      const el = findEl(next ?? slug);
      el?.querySelector<HTMLElement>(next ? ".back-scroll" : ".flip-hit")?.focus({ preventScroll: true });
    });
  }, [cards, site.name, focusCard]);

  const onNext = useCallback((slug: string) => {
    const i = flow.findIndex((c) => c.slug === slug);
    const n = flow[(i + 1) % flow.length];
    setFlipped(null);
    history.replaceState(history.state, "", "/");
    setTimeout(() => focusCard(n.slug), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCard]);

  const goSlug = useCallback((slug: string) => {
    setPlantId(null); setPhoto(null); setContactOpen(false); setFlipped(null);
    setTimeout(() => focusCard(slug), 120);
  }, [focusCard]);

  const goProjects = () => document.getElementById("progetti")?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && flippedRef.current && !dialogOpen()) {
        const s = flippedRef.current;
        setFlipped(null);
        history.replaceState(history.state, "", "/");
        requestAnimationFrame(() => findEl(s)?.querySelector<HTMLElement>(".flip-hit")?.focus({ preventScroll: true }));
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const nextTitle = (slug: string) => {
    const i = flow.findIndex((c) => c.slug === slug);
    return flow[(i + 1) % flow.length].title;
  };
  const common = { site, onToggle, onNext, onOpenPlant: setPlantId, onOpenPhoto: (slug: string, index: number) => setPhoto({ slug, index }) };

  const openPlant = plantId ? plants[plantId] ?? null : null;
  const photoCard = photo ? (cards.find((c) => c.slug === photo.slug) as ProjectCard | undefined) ?? null : null;

  return (
    <div ref={rootRef}>
      <header className="hdr" data-scrolled={scrolled}>
        <a className="logo" href="/" onClick={(e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`${site.name} — inizio pagina`}>
          <span className="logo-a">Augusta</span>
          <span className="logo-b">Architettura Giardini</span>
        </a>
        <nav className="hdr-nav" aria-label="Menu principale">
          <button type="button" className="nav-link" onClick={goProjects}>Progetti</button>
          <button type="button" className="nav-link" onClick={() => setContactOpen(true)} aria-haspopup="dialog">Contatti</button>
          <a className="nav-link" href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram<span aria-hidden="true"> ↗</span><span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-label="Chi sono e come lavoro">
          <div className="hero-grid">
            {hero.map((c, i) => (
              <FlipCard key={c.slug} card={c} flipped={flipped === c.slug} nextTitle={nextTitle(c.slug)} className="hcard" fx="hero" lag={i ? 260 : 180} dist={0} {...common} />
            ))}
          </div>
          <button type="button" className="hero-cue" onClick={goProjects}>
            <span>Progetti</span>
            <i aria-hidden="true" />
          </button>
        </section>

        <section id="progetti" className="projects" aria-labelledby="progetti-h">
          <div className="projects-head">
            <h2 id="progetti-h">Progetti</h2>
            <p>{pad2(projects.length)} realizzazioni. Tocca una scheda per girarla.</p>
          </div>
          <div className="pgrid">
            {projects.map((c, i) => (
              <FlipCard
                key={c.slug} card={c} number={i + 1} total={projects.length} flipped={flipped === c.slug}
                nextTitle={nextTitle(c.slug)} className="pcard" fx="rise" lag={150 + (i % 3) * 90} dist={70 + (i % 3) * 36} {...common}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <ContactBlock site={site} />
      </footer>

      <div className="hud" data-on={current >= 0} aria-hidden={current < 0}>
        <span className="hud-count"><b>{pad2(Math.max(current, 0) + 1)}</b> / {pad2(projects.length)}</span>
        <span className="hud-title">{projects[Math.max(current, 0)]?.title}</span>
        <span className="hud-ticks">
          {projects.map((c, i) => (
            <button key={c.slug} type="button" className="tick" data-on={i === current} aria-label={`Vai a: ${c.title}`} onClick={() => focusCard(c.slug)} />
          ))}
        </span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">{flipped ? `Scheda aperta: ${cards.find((c) => c.slug === flipped)?.title}` : ""}</p>

      <PlantDialog plant={openPlant} onClose={() => setPlantId(null)} onGoTo={goSlug} />
      <Lightbox card={photoCard} index={photo?.index ?? 0} onIndex={(i) => setPhoto((p) => (p ? { ...p, index: i } : p))} onClose={() => setPhoto(null)} />
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} site={site} />
    </div>
  );
}
