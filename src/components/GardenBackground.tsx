"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { createGarden } from "@/lib/garden";

/** Sfondo fotografico animato (prato, cirri, vento). `sceneRef` porta la scena 0→1 già con easing. */
export function GardenBackground({ sceneRef, reduced }: { sceneRef: MutableRefObject<number>; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const small = window.innerWidth < 800;
    let g: ReturnType<typeof createGarden> | null = null;
    try {
      g = createGarden(c, {
        meadowUrl: small ? "/backdrop/meadow-m.webp" : "/backdrop/meadow.webp",
        cloudAUrl: "/backdrop/clouds-a.webp",
        cloudBUrl: "/backdrop/clouds-b.webp",
        getScene: () => sceneRef.current,
        reduced,
      });
      g.ready.then(() => setReady(true)).catch(() => {});
    } catch {
      /* WebGL non disponibile: resta lo sfondo statico */
    }
    return () => g?.destroy();
  }, [sceneRef, reduced]);
  return (
    <div className="garden" aria-hidden="true">
      <div className="garden-still" />
      <canvas ref={ref} className="garden-canvas" data-ready={ready} />
    </div>
  );
}
