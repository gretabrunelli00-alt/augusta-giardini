"use client";
import { useEffect } from "react";

/**
 * Animazioni legate allo scroll, rese fluide da un'interpolazione per elemento (nessun
 * "scroll-jacking": lo scroll resta quello nativo).
 *  - data-fx="rise": la card sale dal basso, si raddrizza (rotateX) e si assesta con un leggero rimbalzo d'ombra.
 *  - data-fx="hero": la card si allontana in profondità mentre si esce dalla hero.
 *  - parallax: --par (−1…1) sposta le foto dentro le card.
 * Ogni elemento ha un proprio "lag" (ms) per un effetto a cascata.
 */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function useScrollFx() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]"));
    if (reduce) {
      nodes.forEach((n) => { n.style.opacity = "1"; n.style.transform = "none"; });
      return;
    }
    const st = nodes.map((el) => ({
      el,
      host: el.parentElement as HTMLElement,
      kind: el.dataset.fx as string,
      lag: Number(el.dataset.lag ?? 200),
      dist: Number(el.dataset.dist ?? 90),
      cur: 0,
    }));
    let raf = 0, last = performance.now(), lastScroll = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      const vh = innerHeight;
      let busy = false;
      for (const s of st) {
        const r = s.host.getBoundingClientRect();
        if (r.bottom < -vh * 0.6 || r.top > vh * 1.8) {
          // lontano: nessun lavoro, ma lo stato resta coerente
          if (s.kind === "rise") s.cur = r.top > vh ? 0 : 1;
          continue;
        }
        const target = s.kind === "rise" ? clamp((vh * 1.02 - r.top) / (vh * 0.62), 0, 1) : clamp(1 - (-r.top) / (vh * 0.9), 0, 1);
        s.cur += (target - s.cur) * (1 - Math.exp(-dt / s.lag));
        if (Math.abs(target - s.cur) > 0.0015) busy = true; else s.cur = target;
        const e = easeOut(s.cur);
        const par = clamp(((r.top + r.height / 2) - vh / 2) / vh, -1, 1);
        s.el.style.setProperty("--par", par.toFixed(3));
        s.el.style.setProperty("--e", e.toFixed(3));
        if (s.kind === "rise") {
          if (e > 0.998) { s.el.style.transform = "none"; s.el.style.opacity = "1"; }
          else {
            s.el.style.opacity = String(clamp(e * 1.7, 0, 1));
            s.el.style.transform = `translate3d(0,${((1 - e) * s.dist).toFixed(1)}px,0) rotateX(${((1 - e) * 11).toFixed(2)}deg) scale(${(0.93 + 0.07 * e).toFixed(4)})`;
          }
        } else {
          const o = 1 - e; // 0 = in vista, 1 = uscita
          s.el.style.opacity = "1";
          s.el.style.transform = o < 0.002 ? "none" : `translate3d(0,${(o * -34).toFixed(1)}px,0) scale(${(1 - o * 0.07).toFixed(4)})`;
        }
      }
      if (busy || t - lastScroll < 260) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const kick = () => { lastScroll = performance.now(); if (!raf) { last = lastScroll; raf = requestAnimationFrame(loop); } };
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);
    kick();
    return () => { removeEventListener("scroll", kick); removeEventListener("resize", kick); cancelAnimationFrame(raf); };
  }, []);
}
