"use client";
import Link from "next/link";
import Image from "next/image";
import { forwardRef } from "react";

type Props = { title: string; line: string; kicker: string; onProjects: () => void };

/** Apertura: nome dello studio al centro e, sotto, la filosofia. Nient'altro. */
export const Intro = forwardRef<HTMLDivElement, Props>(function Intro({ title, line, kicker, onProjects }, ref) {
  return (
    <div className="intro">
      <div className="intro-scroll" ref={ref}>
        <div className="hero">
          <h1 className="hero-logo">
            <Image src="/brand/augusta-logo.png" alt="Augusta Architettura Giardini" width={1792} height={487} priority sizes="(max-width: 800px) 80vw, 720px" />
          </h1>
          <div className="hero-text">
            <p className="hero-sub">{title}</p>
            <p className="hero-line">{line}</p>
            <Link href="/filosofia" className="hero-more">
              {kicker}
              <i aria-hidden="true" />
            </Link>
          </div>
        </div>
        <button type="button" className="hero-cue" onClick={onProjects}>
          <span>Progetti</span>
          <i aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
