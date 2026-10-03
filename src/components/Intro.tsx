"use client";
import Link from "next/link";
import { forwardRef } from "react";
import { pad2 } from "@/lib/types";
import type { EditorialCard } from "@/lib/types";

type Props = {
  filosofia: EditorialCard;
  chiSono: EditorialCard;
  comeLavoro: EditorialCard;
  projectsCount: number;
  plantsCount: number;
  onProjects: () => void;
};

const sub = (v: string, n: number) => v.replace("{projects}", String(n));

/** Apertura: tre sezioni estese (sunto con dati chiave) e link alle pagine di approfondimento. */
export const Intro = forwardRef<HTMLDivElement, Props>(function Intro({ filosofia, chiSono, comeLavoro, projectsCount, plantsCount, onProjects }, ref) {
  const fs = filosofia.summary!, cs = chiSono.summary!, ws = comeLavoro.summary!;
  return (
    <div className="intro">
      <div className="intro-scroll" ref={ref}>
        <div className="intro-inner">
          <div className="intro-top">
            <p className="intro-kicker">Augusta Mara Bertoni · garden designer</p>
            <h1 className="intro-title">
              Il cielo{" "}
              <br />
              in una stanza
            </h1>
          </div>

          <div className="intro-cols">
            <section className="isec" aria-labelledby="i-fil">
              <h2 id="i-fil" className="isec-h"><span>01</span>La mia filosofia</h2>
              {fs.paragraphs.map((p, i) => <p key={i} className="isec-p">{p}</p>)}
              {fs.keywords && (
                <ul className="isec-kw" aria-label="Elementi del giardino">
                  {fs.keywords.map((k) => <li key={k}>{k}</li>)}
                </ul>
              )}
              <dl className="isec-kpis">
                {fs.kpis.map((k) => (
                  <div key={k.label}><dd>{sub(k.value, projectsCount)}</dd><dt>{k.label}</dt></div>
                ))}
              </dl>
              <Link href="/filosofia" className="isec-more">Approfondisci<i aria-hidden="true" /></Link>
            </section>

            <section className="isec" aria-labelledby="i-chi">
              <h2 id="i-chi" className="isec-h"><span>02</span>Chi sono</h2>
              {cs.paragraphs.map((p, i) => <p key={i} className="isec-p">{p}</p>)}
              <dl className="isec-kpis">
                {cs.kpis.map((k) => (
                  <div key={k.label}><dd>{sub(k.value, projectsCount)}</dd><dt>{k.label}</dt></div>
                ))}
              </dl>
              <Link href="/chi-sono" className="isec-more">Approfondisci<i aria-hidden="true" /></Link>
            </section>

            <section className="isec" aria-labelledby="i-work">
              <h2 id="i-work" className="isec-h"><span>03</span>Come lavoro</h2>
              <ol className="isec-phases">
                {comeLavoro.phases!.map((p, i) => (
                  <li key={p.title}>
                    <span className="ph-n">{pad2(i + 1)}</span>
                    <span className="ph-t">{p.title}</span>
                    <span className="ph-q">{p.quote.length > 70 ? p.quote.slice(0, p.quote.indexOf(",") > 0 ? p.quote.indexOf(",") : 70).replace(/[.,;]$/, "") + "…" : p.quote}</span>
                  </li>
                ))}
              </ol>
              <dl className="isec-kpis">
                {ws.kpis.map((k) => (
                  <div key={k.label}><dd>{sub(k.value, projectsCount)}</dd><dt>{k.label}</dt></div>
                ))}
              </dl>
              <Link href="/come-lavoro" className="isec-more">Approfondisci<i aria-hidden="true" /></Link>
            </section>
          </div>

          <div className="intro-foot">
            <p className="intro-stats">
              <b>{pad2(projectsCount)}</b> progetti · <b>{plantsCount}</b> piante · Lago d’Iseo e Bergamo
            </p>
            <button type="button" className="intro-cue" onClick={onProjects}>
              <span>Scorri: i progetti</span>
              <i aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
