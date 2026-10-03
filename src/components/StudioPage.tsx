import Link from "next/link";
import { Pic } from "./Pic";
import { ContactBlock } from "./ContactBlock";
import { getCollection, siteUrl } from "@/lib/content";
import { pad2 } from "@/lib/types";

const PAGES = [
  { slug: "filosofia", label: "Filosofia" },
  { slug: "chi-sono", label: "Chi sono" },
  { slug: "come-lavoro", label: "Come lavoro" },
];

/** Seconda pagina di approfondimento (testo completo di Augusta). Server component, nessun JS richiesto. */
export default function StudioPage({ slug }: { slug: "filosofia" | "chi-sono" | "come-lavoro" }) {
  const { editorials, site, cards } = getCollection();
  const e = editorials[slug];
  const portrait = e.images.find((i) => i.id === "portrait");
  const leaves = e.images.find((i) => i.id === "filosofia");
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: e.title,
    description: e.seoDescription,
    url: `${siteUrl()}/${slug}`,
    about: { "@id": `${siteUrl()}/#studio` },
    inLanguage: "it",
  };
  const others = PAGES.filter((p) => p.slug !== slug);
  return (
    <div className="studio">
      <header className="hdr" data-scrolled="true">
        <Link className="logo" href="/" aria-label={`${site.name} — home`}>
          <span className="logo-a">Augusta</span>
          <span className="logo-b">Architettura Giardini</span>
        </Link>
        <nav className="hdr-nav" aria-label="Menu principale">
          <Link className="nav-link" href="/progetti">Progetti</Link>
          <Link className="nav-link" href={`/${others[0].slug}`}>{others[0].label}</Link>
          <Link className="nav-link" href={`/${others[1].slug}`}>{others[1].label}</Link>
        </nav>
      </header>

      <main className="studio-main">
        <Link href="/" className="studio-back"><i aria-hidden="true" />Torna all’apertura</Link>
        <p className="studio-kicker">{slug === "chi-sono" ? "Augusta Mara Bertoni" : slug === "come-lavoro" ? "Le quattro fasi" : "Augusta Architettura Giardini"}</p>
        <h1 className="studio-title">{slug === "filosofia" ? e.front.phrase : e.title}</h1>
        {slug === "filosofia" && <p className="studio-sub">{e.title}</p>}

        <div className="studio-body">
          {portrait && (
            <figure className="studio-fig">
              <Pic img={portrait} sizes="300px" />
            </figure>
          )}
          {leaves && (
            <figure className="studio-fig">
              <Pic img={leaves} sizes="300px" />
            </figure>
          )}
          <div className="studio-text">
            {e.sections?.map((s) => (
              <section key={s.heading} className="studio-sec">
                {slug !== "filosofia" && <h2>{s.heading}</h2>}
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                {s.facts && (
                  <dl className="studio-facts">
                    {s.facts.map((f) => <div key={f.label}><dd>{f.value}</dd><dt>{f.label}</dt></div>)}
                  </dl>
                )}
              </section>
            ))}
            {e.phases && (
              <ol className="studio-phases">
                {e.phases.map((p, i) => (
                  <li key={p.title}>
                    <span className="sp-n">{pad2(i + 1)}</span>
                    <div>
                      <h2>{p.title}</h2>
                      <blockquote>“{p.quote}”</blockquote>
                      <p>{p.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {slug === "come-lavoro" && (
              <section className="studio-sec">
                <h2>Contatti</h2>
                <ContactBlock site={site} />
              </section>
            )}
          </div>
        </div>

        <nav className="studio-next" aria-label="Altre pagine">
          {others.map((p) => <Link key={p.slug} href={`/${p.slug}`}><span>Leggi</span>{p.label}</Link>)}
          <Link href={`/progetti/${cards[0].slug}`} className="is-main"><span>Scopri</span>I progetti</Link>
        </nav>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
