"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

/**
 * Carosello orizzontale infinito.
 *
 * - `pos` è la posizione (float, in "card") del carosello; la card con indice assoluto `i`
 *   sta a `rel = i - pos`. Gli indici sono illimitati: la card mostrata è `i mod N`.
 * - Si montano solo le card entro ±K da `round(pos)` (finestratura): nessun salto, qualunque
 *   sia la larghezza dello schermo.
 * - Le posizioni sono scritte direttamente sul DOM a ogni frame (nessun re-render React).
 * - Input: drag/swipe (pointer events), rotella/trackpad, e goTo() dalla tastiera/UI.
 */

type Opts = {
  count: number;
  initial: number;
  /** quando true (card girata) il carosello ignora drag e rotella */
  locked: boolean;
  reduced: boolean;
  stageRef: RefObject<HTMLElement | null>;
};

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function useCarousel({ count, initial, locked, reduced, stageRef }: Opts) {
  const [active, setActive] = useState(initial);
  const [center, setCenter] = useState(initial);
  const [K, setK] = useState(2);

  const pos = useRef(initial);
  const vel = useRef(0);
  const target = useRef(initial);
  const centerRef = useRef(initial);
  const step = useRef(640);
  const els = useRef(new Map<number, HTMLElement>());
  const raf = useRef(0);
  const lastT = useRef(0);
  const lockedRef = useRef(locked);
  const reducedRef = useRef(reduced);
  lockedRef.current = locked;
  reducedRef.current = reduced;
  const dragging = useRef(false);
  const wheelLive = useRef(false);
  const justDragged = useRef(0);

  const paintOne = useCallback((el: HTMLElement, abs: number) => {
    const rel = abs - pos.current;
    const a = Math.abs(rel);
    const rm = reducedRef.current;
    const scale = 1 - Math.min(a, 2) * (rm ? 0.02 : 0.05);
    const tilt = rm ? 0 : clamp(rel, -1.2, 1.2) * -4.5;
    el.style.transform = `translate3d(${(rel * step.current).toFixed(2)}px,0,0) rotateY(${tilt.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    el.style.setProperty("--rel", clamp(rel, -2, 2).toFixed(3));
    el.style.setProperty("--dim", (Math.min(a, 1) * 0.58).toFixed(3));
    el.style.zIndex = String(100 - Math.round(a * 10));
  }, []);

  const paint = useCallback(() => {
    els.current.forEach((el, abs) => paintOne(el, abs));
  }, [paintOne]);

  const tick = useCallback(
    (t: number) => {
      const dt = Math.min(0.05, (t - lastT.current) / 1000 || 0.016);
      lastT.current = t;
      if (!dragging.current && !wheelLive.current) {
        // molla smorzata criticamente: ritmo lento, nessun rimbalzo
        const k = reducedRef.current ? 420 : 58;
        const c = 2 * Math.sqrt(k);
        const sub = 3;
        for (let i = 0; i < sub; i++) {
          const h = dt / sub;
          vel.current += (k * (target.current - pos.current) - c * vel.current) * h;
          pos.current += vel.current * h;
        }
        if (Math.abs(target.current - pos.current) < 0.0006 && Math.abs(vel.current) < 0.004) {
          pos.current = target.current;
          vel.current = 0;
        }
      }
      paint();
      const r = Math.round(pos.current);
      if (r !== centerRef.current) {
        centerRef.current = r;
        setCenter(r);
      }
      if (dragging.current || wheelLive.current || pos.current !== target.current) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = 0;
      }
    },
    [paint],
  );

  const kick = useCallback(() => {
    if (!raf.current) {
      lastT.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  /** registra l'elemento DOM di una card (ref callback) e lo posiziona subito */
  const register = useCallback(
    (abs: number, el: HTMLElement | null) => {
      if (el) {
        els.current.set(abs, el);
        paintOne(el, abs);
      } else {
        els.current.delete(abs);
      }
    },
    [paintOne],
  );

  const goTo = useCallback(
    (abs: number) => {
      target.current = abs;
      setActive(abs);
      kick();
    },
    [kick],
  );
  const goBy = useCallback((d: number) => goTo(Math.round(target.current) + d), [goTo]);

  /** vai alla card con indice (0..N-1) per la via più breve */
  const goToIndex = useCallback(
    (idx: number) => {
      const cur = Math.round(target.current);
      let d = (((idx - cur) % count) + count) % count;
      if (d > count / 2) d -= count;
      goTo(cur + d);
    },
    [count, goTo],
  );

  // misure: larghezza passo e raggio della finestra
  useIso(() => {
    const measure = () => {
      const first = els.current.values().next().value as HTMLElement | undefined;
      const w = first ? first.offsetWidth : 640;
      const vw = window.innerWidth;
      const gap = vw <= 640 ? 12 : clamp(vw * 0.04, 28, 64);
      step.current = w + gap;
      const need = Math.ceil((vw / 2 + w / 2) / step.current) + 1;
      setK(clamp(need, 2, 9));
      paint();
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [paint]);

  // input: drag + rotella
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // ---- drag / swipe
    let down: { id: number; x: number; y: number; pos: number; samples: { x: number; t: number }[] } | null = null;
    const onDown = (e: PointerEvent) => {
      if (lockedRef.current || e.button > 0) return;
      const t = e.target as HTMLElement;
      if (t.closest("[data-nodrag]")) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: pos.current, samples: [{ x: e.clientX, t: e.timeStamp }] };
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (!dragging.current) {
        if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy)) return;
        dragging.current = true;
        down.x = e.clientX;
        down.pos = pos.current;
        vel.current = 0;
        try { stage.setPointerCapture(e.pointerId); } catch {}
        stage.dataset.dragging = "true";
        kick();
        return;
      }
      down.samples.push({ x: e.clientX, t: e.timeStamp });
      if (down.samples.length > 6) down.samples.shift();
      pos.current = down.pos - (e.clientX - down.x) / step.current;
    };
    const end = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (dragging.current) {
        const s = down.samples;
        const a = s[0], b = s[s.length - 1];
        const v = b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 / step.current : 0; // card/s (positivo = trascina a destra)
        dragging.current = false;
        delete stage.dataset.dragging;
        justDragged.current = performance.now();
        const projected = pos.current - clamp(v * 0.2, -1.6, 1.6);
        const from = Math.round(down.pos);
        let tgt = Math.round(projected);
        if (tgt === from && Math.abs(pos.current - from) > 0.12) tgt = from + Math.sign(pos.current - from);
        vel.current = -v * 0.6;
        target.current = tgt;
        setActive(tgt);
        try { stage.releasePointerCapture(e.pointerId); } catch {}
        kick();
      }
      down = null;
    };

    // ---- rotella / trackpad
    let idleT = 0;
    let lastWheel = 0;
    let coolUntil = 0;
    let recent = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const t = e.target as HTMLElement;
      if (lockedRef.current) {
        if (!t.closest(".back-scroll")) e.preventDefault();
        return;
      }
      if (t.closest("[data-nowheel]")) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 34 : e.deltaMode === 2 ? 600 : 1;
      const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
      const now = performance.now();
      const fresh = now - lastWheel > 160;
      lastWheel = now;
      if (now < coolUntil) return;
      // un "colpo" isolato e grande = rotella a scatti → una card per scatto
      if (fresh && !wheelLive.current && Math.abs(d) >= 80) {
        coolUntil = now + 420;
        goBy(d > 0 ? 1 : -1);
        return;
      }
      wheelLive.current = true;
      vel.current = 0;
      recent = recent * 0.6 + d;
      pos.current += clamp(d / step.current, -0.5, 0.5);
      target.current = pos.current;
      kick();
      window.clearTimeout(idleT);
      idleT = window.setTimeout(() => {
        wheelLive.current = false;
        const bias = clamp(recent / step.current, -0.5, 0.5) * 0.6;
        const tgt = Math.round(pos.current + bias);
        recent = 0;
        target.current = tgt;
        setActive(tgt);
        kick();
      }, 130);
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", end);
      stage.removeEventListener("pointercancel", end);
      stage.removeEventListener("wheel", onWheel);
      window.clearTimeout(idleT);
    };
  }, [stageRef, kick, goBy]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /** true se un drag è appena terminato (per ignorare il click successivo) */
  const wasDrag = useCallback(() => performance.now() - justDragged.current < 120, []);

  return { active, center, K, register, goTo, goBy, goToIndex, wasDrag, count };
}
