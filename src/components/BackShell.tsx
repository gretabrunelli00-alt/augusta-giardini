"use client";
import type { ReactNode } from "react";
import { pad2 } from "@/lib/types";

type Props = {
  title: string;
  number?: number;
  total?: number;
  onFlip: () => void;
  onNext: () => void;
  nextTitle: string;
  children: ReactNode;
};

/** Contenitore del retro: testata fissa + area scorrevole (scroll verticale interno) + chiusura. */
export function BackShell({ title, number, total, onFlip, onNext, nextTitle, children }: Props) {
  return (
    <div className="back-scroll" tabIndex={-1} role="region" aria-label={`Scheda: ${title}`}>
      <header className="b-bar">
        {number ? <span className="b-bar-num">N° {pad2(number)}</span> : null}
        <span className="b-bar-title">{title}</span>
        <button type="button" className="b-close" onClick={onFlip}>
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path d="M10.5 3.5 6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Copertina
        </button>
      </header>
      <div className="b-body">
        {children}
        <footer className="b-end">
          <span className="b-end-count">{number && total ? `${pad2(number)} / ${pad2(total)}` : ""}</span>
          <button type="button" className="b-next" onClick={onNext}>
            <span className="b-next-label">Prosegui</span>
            <span className="b-next-title">{nextTitle}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
}
