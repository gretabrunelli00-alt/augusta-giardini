"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

/**
 * Palcoscenico: una scena (apertura → carosello) e il carosello orizzontale infinito, nello stesso ciclo di animazione.
 *
 * SCENA  t ∈ [0,1]: 0 = apertura, 1 = carosello. Nessuno scroll di pagina: rotella / swipe verticale spostano t in
 *        modo continuo (scrubbing) e a fine gesto una molla lo porta a 0 o 1. Scrivo --t e --e (ease) sul root.
 *        In apertura, se il contenuto è più alto dello schermo, scorre da solo (.intro-scroll) e solo a fine corsa
 *        il gesto successivo muove la scena. Nel carosello solo "su" riporta all'apertura.
 * CAROSELLO  pos (float) in unità-card; card con indice assoluto i a rel = i - pos; si montano solo le card entro ±K
 *        da round(pos), indice mod N → infinito senza salti. Posizioni scritte sul DOM a ogni frame.
 */
export type SceneMode = "intro" | "moving" | "carousel";

type Opts = {
  count: number;
  initial: number;
  initialScene: 0 | 1;
  rootRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  introRef: RefObject<HTMLElement | null>;
  /** card girata: carosello e scena restano fermi */
  locked: boolean;
  reduced: boolean;
};

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => { const x = clamp(t, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); };

export function useStage({ count, initial, initialScene, rootRef, stageRef, introRef, locked, reduced }: Opts) {
  const [active, setActive] = useState(initial);
  const [center, setCenter] = useState(initial);
  const [K, setK] = useState(2);
  const [mode, setMode] = useState<SceneMode>(initialScene ? "carousel" : "intro");

  // carosello
  const pos = useRef(initial);
  const vel = useRef(0);
  const target = useRef(initial);
  const centerRef = useRef(initial);
  const step = useRef(640);
  const els = useRef(new Map<number, HTMLElement>());
  const dragging = useRef(false);
  const wheelLive = useRef(false);
  const justDragged = useRef(0);
  // scena
  const t = useRef<number>(initialScene);
  const tv = useRef(0);
  const tTarget = useRef<number>(initialScene);
  const sceneLive = useRef(false);
  const sceneK = useRef(3.6);
  const eRef = useRef<number>(initialScene);
  const modeRef = useRef<SceneMode>(initialScene ? "carousel" : "intro");
  // ciclo
  const raf = useRef(0);
  const lastT = useRef(0);
  const lockedRef = useRef(locked);
  const reducedRef = useRef(reduced);
  lockedRef.current = locked;
  reducedRef.current = reduced;

  const paintOne = useCallback((el: HTMLElement, abs: number) => {
    const rel = abs - pos.current;
    const a = Math.abs(rel);
    const rm = reducedRef.current;
    const e = ease(clamp(t.current, 0, 1));
    const scale = 1 - Math.min(a, 2) * (rm ? 0.02 : 0.05);
    const tilt = rm ? 0 : clamp(rel, -1.2, 1.2) * -4.5;
    // "sul tavolo": le card arrivano a cascata (le vicine un po' dopo) e si raddrizzano
    const d = Math.min(0.5, a * 0.14);
    const lay = 1 - ease(clamp((e - d) / (1 - d), 0, 1));
    const rz = rm ? 0 : (((Math.imul(abs, 2654435761) >>> 8) % 1000) / 1000 - 0.5) * 12 * lay;
    el.style.transform = `translate3d(${(rel * step.current).toFixed(2)}px,${(lay * 22).toFixed(1)}px,0) rotateZ(${rz.toFixed(2)}deg) rotateY(${tilt.toFixed(2)}deg) scale(${(scale * (0.92 + 0.08 * (1 - lay))).toFixed(4)})`;
    el.style.setProperty("--rel", clamp(rel, -2, 2).toFixed(3));
    el.style.setProperty("--dim", (Math.min(a, 1) * 0.58).toFixed(3));
    el.style.setProperty("--lay", lay.toFixed(3));
    el.style.zIndex = String(100 - Math.round(a * 10));
  }, []);

  const paint = useCallback(() => {
    els.current.forEach((el, abs) => paintOne(el, abs));
  }, [paintOne]);

  const writeScene = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const e = ease(clamp(t.current, 0, 1));
    eRef.current = e;
    root.style.setProperty("--t", clamp(t.current, 0, 1).toFixed(4));
    root.style.setProperty("--e", e.toFixed(4));
    root.style.setProperty("--e2", ease(clamp((t.current - 0.12) / 0.88, 0, 1)).toFixed(4));
    const m: SceneMode = t.current < 0.002 ? "intro" : t.current > 0.998 ? "carousel" : "moving";
    if (m !== modeRef.current) { modeRef.current = m; setMode(m); }
  }, [rootRef]);

  const tick = useCallback(
    (now: number) => {
      const dt = Math.min(0.05, (now - lastT.current) / 1000 || 0.016);
      lastT.current = now;
      // scena: molla lenta
      if (!sceneLive.current) {
        const k = reducedRef.current ? 400 : 13;
        const c = 2 * Math.sqrt(k);
        for (let i = 0; i < 3; i++) {
          const h = dt / 3;
          tv.current += (k * (tTarget.current - t.current) - c * tv.current) * h;
          t.current += tv.current * h;
        }
        if (Math.abs(tTarget.current - t.current) < 0.0004 && Math.abs(tv.current) < 0.003) { t.current = tTarget.current; tv.current = 0; }
      }
      // carosello: molla critica
      if (!dragging.current && !wheelLive.current) {
        const k = reducedRef.current ? 420 : 58;
        const c = 2 * Math.sqrt(k);
        for (let i = 0; i < 3; i++) {
          const h = dt / 3;
          vel.current += (k * (target.current - pos.current) - c * vel.current) * h;
          pos.current += vel.current * h;
        }
        if (Math.abs(target.current - pos.current) < 0.0006 && Math.abs(vel.current) < 0.004) { pos.current = target.current; vel.current = 0; }
      }
      writeScene();
      paint();
      const r = Math.round(pos.current);
      if (r !== centerRef.current) { centerRef.current = r; setCenter(r); }
      const busy = dragging.current || wheelLive.current || sceneLive.current || pos.current !== target.current || t.current !== tTarget.current;
      raf.current = busy ? requestAnimationFrame(tick) : 0;
    },
    [paint, writeScene],
  );

  const kick = useCallback(() => {
    if (!raf.current) { lastT.current = performance.now(); raf.current = requestAnimationFrame(tick); }
  }, [tick]);

  const register = useCallback(
    (abs: number, el: HTMLElement | null) => {
      if (el) { els.current.set(abs, el); paintOne(el, abs); } else els.current.delete(abs);
    },
    [paintOne],
  );

  const goTo = useCallback((abs: number) => { target.current = abs; setActive(abs); kick(); }, [kick]);
  const goBy = useCallback((d: number) => goTo(Math.round(target.current) + d), [goTo]);
  const goToIndex = useCallback(
    (idx: number) => {
      const cur = Math.round(target.current);
      let d = (((idx - cur) % count) + count) % count;
      if (d > count / 2) d -= count;
      goTo(cur + d);
    },
    [count, goTo],
  );
  const sceneTo = useCallback((v: 0 | 1) => { sceneLive.current = false; sceneK.current = 3.6; tTarget.current = v; kick(); }, [kick]);

  // misure
  useIso(() => {
    const measure = () => {
      const first = els.current.values().next().value as HTMLElement | undefined;
      const w = first ? first.offsetWidth : 640;
      const vw = window.innerWidth;
      const gap = vw <= 640 ? 12 : clamp(vw * 0.04, 28, 64);
      step.current = w + gap;
      setK(clamp(Math.ceil((vw / 2 + w / 2) / step.current) + 1, 2, 9));
      writeScene();
      paint();
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [paint, writeScene]);

  // input
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const vh = () => window.innerHeight;

    /* ---- gesto di scena (rotella / tocco): t segue il gesto, poi si assesta */
    let sceneIdle = 0;
    let dirSum = 0;
    const driveScene = (dt: number, k = 16) => {
      sceneLive.current = true;
      sceneK.current = k;
      tTarget.current = clamp(tTarget.current + dt, 0, 1);
      dirSum = dirSum * 0.7 + dt;
      kick();
    };
    const settleScene = (bias: number) => {
      sceneLive.current = false;
      sceneK.current = 3.6;
      const x = tTarget.current;
      tTarget.current = bias > 0 ? (x > 0.08 ? 1 : 0) : bias < 0 ? (x < 0.92 ? 0 : 1) : x > 0.5 ? 1 : 0;
      dirSum = 0;
      kick();
    };

    /* ---- carosello: drag orizzontale (+ verticale verso il basso per tornare all'apertura) */
    let down: { id: number; x: number; y: number; pos: number; axis: "" | "x" | "y"; s: { x: number; t: number }[] } | null = null;
    const onDown = (e: PointerEvent) => {
      if (lockedRef.current || e.button > 0 || modeRef.current !== "carousel") return;
      if ((e.target as HTMLElement).closest("[data-nodrag]")) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: pos.current, axis: "", s: [{ x: e.clientX, t: e.timeStamp }] };
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.axis) {
        if (Math.hypot(dx, dy) < 8) return;
        down.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        if (down.axis === "x") { dragging.current = true; down.x = e.clientX; down.pos = pos.current; vel.current = 0; }
        else { sceneLive.current = true; }
        try { stage.setPointerCapture(e.pointerId); } catch {}
        stage.dataset.dragging = "true";
        kick();
        return;
      }
      if (down.axis === "x") {
        down.s.push({ x: e.clientX, t: e.timeStamp });
        if (down.s.length > 6) down.s.shift();
        pos.current = down.pos - (e.clientX - down.x) / step.current;
      } else {
        // dito verso il basso = scroll verso l'alto = si torna all'apertura
        sceneK.current = 40;
        tTarget.current = clamp(1 - Math.max(0, dy - 8) / (vh() * 0.6), 0, 1);
      }
    };
    const end = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (down.axis === "x") {
        const s = down.s, a = s[0], b = s[s.length - 1];
        const v = b.t > a.t ? (((b.x - a.x) / (b.t - a.t)) * 1000) / step.current : 0;
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
      } else if (down.axis === "y") {
        delete stage.dataset.dragging;
        justDragged.current = performance.now();
        settleScene(tTarget.current < 0.9 ? -1 : 0);
        try { stage.releasePointerCapture(e.pointerId); } catch {}
      }
      down = null;
    };

    /* ---- rotella / trackpad */
    let idleT = 0, lastW = 0, lastNative = 0, recent = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const tg = e.target as HTMLElement;
      if (tg.closest("dialog")) return;
      if (lockedRef.current) {
        if (!tg.closest(".back-scroll")) e.preventDefault();
        return;
      }
      const unit = e.deltaMode === 1 ? 34 : e.deltaMode === 2 ? 600 : 1;
      const dx = e.deltaX * unit, dy = e.deltaY * unit;
      const now = performance.now();
      const m = modeRef.current;
      if (m === "carousel" && Math.abs(dx) > Math.abs(dy) * 1.2) {
        // trackpad in orizzontale: scorre il carosello
        e.preventDefault();
        wheelLive.current = true;
        vel.current = 0;
        recent = recent * 0.6 + dx;
        pos.current += clamp(dx / step.current, -0.5, 0.5);
        target.current = pos.current;
        kick();
        window.clearTimeout(idleT);
        idleT = window.setTimeout(() => {
          wheelLive.current = false;
          const tgt = Math.round(pos.current + clamp(recent / step.current, -0.5, 0.5) * 0.6);
          recent = 0;
          target.current = tgt;
          setActive(tgt);
          kick();
        }, 130);
        return;
      }
      if (Math.abs(dy) < 1) { e.preventDefault(); return; }
      // l'apertura scorre da sola se è più alta dello schermo
      const intro = introRef.current;
      if (intro && (m === "intro") && tg.closest(".intro-scroll")) {
        const overflow = intro.scrollHeight - intro.clientHeight;
        const canDown = overflow > 48 && intro.scrollTop + intro.clientHeight < intro.scrollHeight - 2;
        const canUp = overflow > 48 && intro.scrollTop > 0;
        if ((dy > 0 && canDown) || (dy < 0 && canUp)) { lastNative = now; return; }
        if (dy > 0 && now - lastNative < 260) { e.preventDefault(); return; }
      }
      if (m === "carousel" && dy > 0) { e.preventDefault(); return; } // nel carosello si va indietro solo scrollando su
      e.preventDefault();
      lastW = now;
      driveScene(dy / (vh() * 0.8));
      window.clearTimeout(sceneIdle);
      sceneIdle = window.setTimeout(() => settleScene(dirSum), 140);
    };

    /* ---- tocco sull'apertura: concatena lo scroll interno con la scena */
    let ty0 = 0, t0 = 0, driving = false;
    const onTS = (e: TouchEvent) => { ty0 = e.touches[0].clientY; t0 = t.current; driving = false; };
    const onTM = (e: TouchEvent) => {
      if (lockedRef.current || modeRef.current === "carousel") return;
      const intro = introRef.current;
      const y = e.touches[0].clientY;
      if (!driving) {
        const atBottom = !intro || intro.scrollHeight - intro.clientHeight <= 48 || intro.scrollTop + intro.clientHeight >= intro.scrollHeight - 2;
        if (y - ty0 < -8 && atBottom) { driving = true; ty0 = y; t0 = tTarget.current; }
        else if (modeRef.current === "intro") return;
        else { driving = true; ty0 = y; t0 = tTarget.current; }
      }
      if (e.cancelable) e.preventDefault();
      sceneLive.current = true;
      sceneK.current = 40;
      tTarget.current = clamp(t0 + (ty0 - y) / (vh() * 0.65), 0, 1);
      kick();
    };
    const onTE = () => { if (driving) { driving = false; settleScene(tTarget.current > t0 ? 1 : tTarget.current < t0 ? -1 : 0); } };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    root.addEventListener("wheel", onWheel, { passive: false });
    const introEl = introRef.current;
    introEl?.addEventListener("touchstart", onTS, { passive: true });
    introEl?.addEventListener("touchmove", onTM, { passive: false });
    introEl?.addEventListener("touchend", onTE);
    introEl?.addEventListener("touchcancel", onTE);
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", end);
      stage.removeEventListener("pointercancel", end);
      root.removeEventListener("wheel", onWheel);
      introEl?.removeEventListener("touchstart", onTS);
      introEl?.removeEventListener("touchmove", onTM);
      introEl?.removeEventListener("touchend", onTE);
      introEl?.removeEventListener("touchcancel", onTE);
      window.clearTimeout(idleT);
      window.clearTimeout(sceneIdle);
    };
  }, [rootRef, stageRef, introRef, kick]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const wasDrag = useCallback(() => performance.now() - justDragged.current < 140, []);

  return { active, center, K, mode, eRef, register, goTo, goBy, goToIndex, sceneTo, wasDrag };
}
