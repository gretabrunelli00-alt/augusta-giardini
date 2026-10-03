# Augusta Architettura Giardini — archivio visivo

Sito Next.js 16 (App Router) + TypeScript + Zod.

**Struttura**: apertura essenziale (logo, «Il cielo in una stanza» e una riga di filosofia) su uno sfondo fotografico animato → scrollando in giù la camera scende nel prato (l'erba diventa lo sfondo) e il carosello dei progetti arriva "sul tavolo" e si alza in verticale → carosello orizzontale infinito, ogni progetto è una card che si gira in 3D. Scroll verso l'alto: si torna all'apertura. Approfondimenti con tutti i dati: `/filosofia`, `/chi-sono`, `/come-lavoro` (da progettare graficamente). Progetti indicizzabili: `/progetti/[slug]`.

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
3. Aggiungi lo slug in `content/site.json` → `order` (posizione nel carosello; contiene solo progetti).
4. `npm run dev`: lo schema (`src/lib/schema.ts`) segnala subito errori e riferimenti rotti. Anno: solo se è l'anno di realizzazione.

## Sostituire le foto con gli originali
Sovrascrivi il file in `content/images/<slug>/` **mantenendo il nome** (oppure cambia `file` nel JSON) e rilancia `npm run images` (parte da solo con dev/build): vengono rigenerati AVIF/WebP/JPEG a 640/1280/1920 px e l'immagine OG. Le foto sotto 1600 px sono segnalate come bassa risoluzione in modalità review. Controlla `focal` dopo la sostituzione.

## Come funziona (in breve)
- **Scena e carosello**: `src/lib/useStage.ts` (un solo ciclo di animazione). La scena `t` (0 apertura → 1 carosello) segue rotella/tocco in modo continuo (scrubbing) e si assesta con una molla; scrive `--t/--e/--e2` sul root, che il CSS usa per allontanare l'apertura e alzare il piano delle card. Se l'apertura è più alta dello schermo scorre da sola e solo a fine corsa il gesto successivo muove la scena.
- **Carosello**: Posizione float animata con una molla; si montano solo le card entro ±K dalla posizione (K dipende dalla larghezza), indice mod N: nessun salto anche su schermi larghissimi. Input: rotella/trackpad, drag/swipe, frecce, bottoni, segni sul footer.
- **Gesti**: nel carosello, drag/swipe orizzontale, frecce e trackpad orizzontale spostano le card; rotella/swipe verso l'alto riportano all'apertura; la rotella verso il basso non fa nulla. Card girata → scena e carosello si bloccano e il retro scorre in verticale (`overscroll-behavior: contain`).
- **Flip 3D reale**: `perspective` + `rotateY` su due facce (`backface-visibility`), con sollevamento e ombra; con `prefers-reduced-motion` diventa dissolvenza e il parallax si spegne. La faccia nascosta è `inert` e `aria-hidden`.
- **Tastiera**: ↓/Pag↓ apre il carosello, ↑/Pag↑ torna all'apertura, ← → scorrono, Invio/Spazio girano, Esc torna al fronte (o chiude finestre).
- **SEO**: `/progetti/[slug]` statiche con testo completo nell'HTML, title/description/Open Graph propri, JSON-LD (attività locale con Costa Volpino e aree servite, CreativeWork + breadcrumb), sitemap, robots, fallback senza JavaScript. Redirect 301 dai vecchi URL (`/roof_garden_vista_lago/` → `/progetti/roof-garden-vista-lago`) in `next.config.mjs`. Il dominio si imposta con `NEXT_PUBLIC_SITE_URL`.
- **Review mode**: `?review=1` mostra i punti da confermare (vedi `notes/DA-CONFERMARE.md`).

## Non incluso (fase 2)
Erbario (i dati sono pronti: `plants.json` + `uses`), modalità giorno/sera, inglese, form contatti, CMS.

## Sfondo animato
`src/lib/garden.ts`: un fragment shader WebGL2 (nessuna libreria) lavora tre fotografie reali CC0 (`content/backdrop-src/`, crediti in `notes/CREDITI-IMMAGINI.md`): cielo con due strati di cirri che derivano, velo rosa all'orizzonte, prato piegato dal vento con raffiche e ombre di nuvole. La scena (0 apertura → 1 carosello) sposta la camera nell'erba e scurisce/sfoca appena lo sfondo. Senza WebGL resta un gradiente; con `prefers-reduced-motion` lo sfondo non si anima. Per cambiare le foto: sostituisci i file in `content/backdrop-src/` e lancia `npm run backdrop`.
