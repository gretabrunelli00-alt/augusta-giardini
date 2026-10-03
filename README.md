# Augusta Architettura Giardini — archivio visivo

Sito Next.js 16 (App Router) + TypeScript + Zod. Ogni progetto è una card che si gira in 3D; carosello orizzontale infinito; pagine statiche indicizzabili `/progetti/[slug]`.

```bash
npm install
npm run dev        # ottimizza le foto, valida i contenuti, avvia su :3000
npm run build      # idem + build di produzione (deploy su Vercel: import del repo, Root Directory = augusta)
npm run validate -- --warnings   # cose ancora da chiedere ad Augusta
npm run plants-report            # conteggi delle piante
```

## Aggiungere un progetto
1. Crea `content/images/<slug>/` e copia le foto (JPG/PNG, meglio ≥ 2000 px di larghezza).
2. Copia un file di `content/projects/` in `content/projects/<slug>.json` (il nome file = slug) e compila. Solo `slug`, `title`, `seoDescription`, `images`, `cover`, `legacyPath` sono obbligatori; luogo, tipologia, anno, tagline, `signature` (max 3), `pullQuote`, `sections`, `plants`, `video` sono opzionali: se mancano, l'elemento sparisce.
   - `sections[].kind`: `intro` (testo unico), `place` Il luogo, `need` L'esigenza, `idea` L'idea, `materials` Materiali e arredi, `night` Luce e sera.
   - `images[]`: `id`, `file`, `alt` (italiano), `focal` {x,y} da 0 a 1 = punto da tenere nel ritaglio verticale del fronte, `sourceUrl` opzionale. `cover` è l'`id` della foto di copertina.
   - `plants[]`: `plant` = id in `content/plants.json` (aggiungi lì una nuova pianta se manca), `original` = testo come scritto, `source` = `list` o `text`.
3. Aggiungi lo slug in `content/site.json` → `order` (posizione nel carosello).
4. `npm run dev`: lo schema (`src/lib/schema.ts`) segnala subito errori e riferimenti rotti. Anno: solo se è l'anno di realizzazione.

## Sostituire le foto con gli originali
Sovrascrivi il file in `content/images/<slug>/` **mantenendo il nome** (oppure cambia `file` nel JSON) e rilancia `npm run images` (parte da solo con dev/build): vengono rigenerati AVIF/WebP/JPEG a 640/1280/1920 px e l'immagine OG. Le foto sotto 1600 px sono segnalate come bassa risoluzione in modalità review. Controlla `focal` dopo la sostituzione.

## Come funziona (in breve)
- **Carosello**: `src/lib/useCarousel.ts`. Posizione float animata con una molla; si montano solo le card entro ±K dalla posizione (K dipende dalla larghezza), indice mod N: nessun salto anche su schermi larghissimi. Input: rotella/trackpad, drag/swipe, frecce, bottoni, segni sul footer.
- **Scroll interno vs swipe**: card sul fronte → rotella, drag e swipe muovono il carosello. Card girata → il carosello si blocca, il retro scorre in verticale (`overscroll-behavior: contain`), le frecce in basso diventano evidenti e cambiano scheda (che torna al fronte).
- **Flip 3D reale**: `perspective` + `rotateY` su due facce (`backface-visibility`), con sollevamento e ombra; con `prefers-reduced-motion` diventa dissolvenza e il parallax si spegne. La faccia nascosta è `inert` e `aria-hidden`.
- **Tastiera**: ← → scorrono, Invio/Spazio girano, Esc torna al fronte (o chiude finestre).
- **SEO**: `/progetti/[slug]` statiche con testo completo nell'HTML, title/description/Open Graph propri, JSON-LD (attività locale con Costa Volpino e aree servite, CreativeWork + breadcrumb), sitemap, robots, fallback senza JavaScript. Redirect 301 dai vecchi URL (`/roof_garden_vista_lago/` → `/progetti/roof-garden-vista-lago`) in `next.config.mjs`. Il dominio si imposta con `NEXT_PUBLIC_SITE_URL`.
- **Review mode**: `?review=1` mostra i punti da confermare (vedi `notes/DA-CONFERMARE.md`).

## Non incluso (fase 2)
Erbario (i dati sono pronti: `plants.json` + `uses`), modalità giorno/sera, inglese, form contatti, CMS.
