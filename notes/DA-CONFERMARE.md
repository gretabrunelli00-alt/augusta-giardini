# Da confermare con Augusta

Aggiungendo `?review=1` all'URL del sito (es. `/?review=1`) compaiono i segnali di revisione: nomi originali delle piante, luoghi da confermare, alt text da rivedere, foto a bassa risoluzione. `?review=0` li spegne.

## 1. Nomenclatura botanica (tutte le voci sono "da confermare")
Il registro normalizzato è `content/plants.json` (campo `reviewNote`); il testo originale di ogni progetto è conservato in `content/projects/*.json` (campo `original`). I casi che richiedono una decisione:

| Sul sito | Normalizzato | Dubbio |
|---|---|---|
| Rhycospermum jasminoides | Trachelospermum jasminoides | nome non valido |
| Chamaerops excelsa | Trachycarpus fortunei | sinonimo |
| Asparagus sprengerii / sprengeri | Asparagus densiflorus 'Sprengeri' | sinonimo |
| Agapahanthus / Agapanthus africanus | Agapanthus africanus | in vivaio spesso è A. praecox |
| Cupressuscyaris leylandii | × Cuprocyparis leylandii | refuso/nome antico |
| Hydrangea hannabelle | Hydrangea arborescens 'Annabelle' | interpretato |
| Rosa meiland / white meidiland / iceberg | Rosa (una voce, cultivar per progetto) | 'Meiland' = 'Meidiland'? |
| Phormium variegato (Piccolo giardino escluso) | Phormium sp. | specie non indicata: è P. tenax? |
| Lavanda (Fonteno) | Lavandula sp. | specie non indicata |
| Opuntia | Opuntia sp. | specie non indicata |
| Photinia a spalliera | Photinia sp. | specie non indicata |
| vite del Canada | Parthenocissus sp. | ambiguo (più specie) |
| Erbe aromatiche in varietà | (nessun nome latino) | quali? |
| agavi, erigeron, anemoni, phormium (testo di «Corten e graminacee») | Agave sp., Erigeron sp., Anemone sp., Phormium sp. | citate solo nel testo |
| Gaura lindeimerii / lindheimeri 'Butterfly' / 'Butterflies' | Gaura lindheimeri | cultivar; oggi Oenothera lindheimeri |
| Stipa tenuissima, Perovskia atriplicifolia | invariati | oggi Nassella tenuissima, Salvia yangii |

Inoltre: una **nota breve per ogni pianta** (campo `note` in `plants.json`, oggi vuoto: la modale mostra un segnaposto).

## 2. Luoghi
- **Fonteno** (Giardino privato sul lago d'Iseo) e **Solto Collina** (Giardino in collina) compaiono solo negli alt text e nei nomi dei file delle foto delle pagine, non nel testo. Sono mostrati sulle card con il segno "da confermare" in modalità review: confermare o togliere.
- **Palazzo con corte interna**: «uno dei borghi più belli d'Italia», borgo non nominato. Quale?
- **Piccolo giardino, Loggiato, Terrazzo a pozzetto, Corten e graminacee**: nessun luogo nel testo.
- Indizi dagli alt text della home, **non inseriti**: *Lovere* (terrazza, forse Piccolo giardino o Pozzetto), *Clusane* (render di un roof garden), *Bettoni* (usato per «Corten e graminacee», nome di persona o luogo?), *Evaristo* («Palazzo con corte interna»).

## 3. Anni e tipologie
- **Anno di realizzazione: nessuno disponibile** per nessun progetto (le date WordPress del sito, settembre 2021 e gennaio 2025, sono date di pubblicazione e non sono state usate).
- Tipologie scritte con le parole del testo; "giardino privato" per Piccolo giardino e Collina non è nel testo (mostrati: «giardino», «giardino in collina»).
- Superfici: nessuna indicata, nessuna inventata.

## 4. Foto
- **Alt text**: tutti scritti da noi guardando le foto (campo `altStatus: "proposed"`), da far rivedere.
- **Bassa risoluzione (740 px)**: tutte le foto di Corten e graminacee, Giardino in collina, Palazzo, Terrazza Bergamo, 6 di 8 di Fonteno, 1 di Pozzetto, 2 di Loggiato. Servono gli originali: sostituirli è semplice (vedi README).
- **Due immagini di «Giardino in collina» sembrano render/visualizzazioni** (foto4.4 notturna, foto4.1.1): confermare e, se sì, dichiararlo.
- **Immagini dello slider della home non collegate a progetti** (non inserite nelle card):
  `IMG_6418-1-scaled.jpg` (pergola con agave e rosmarino), `6-fonteno-1-scaled.jpg` (giardino con gelso e vista), `2-lovere-scaled.jpg`, `IMG_6953-2.jpg` (stesso scatto del Roof garden), `8-clusane-scaled.jpg` (render di roof garden con minipiscina), `10-lovere.jpg`, `14-fonteno.jpg`, `17-lovere.jpg`, `1-pozzetto-1.jpg`, `2-loggiato.jpg` (le ultime cinque sono verticali). Alcune sembrano appartenere a progetti già presenti, `8-clusane` forse a un progetto non pubblicato.
  Nota: l'immagine «6-fonteno-1-scaled» è la più bella vista del giardino di Fonteno e potrebbe sostituire la copertina attuale (a bassa risoluzione).
- Ritratto di Augusta (395 px) e foto delle foglie «La mia filosofia» (395 px): servono versioni migliori; confermare l'uso del ritratto.

## 5. Contatti e testi
- **E-mail**: offuscata sul sito, lasciato il segnaposto («E-mail in arrivo»). Compilare `contact.email` in `content/site.json`.
- Corso di Arte dei giardini «tenuto dal prof. Marco Raja allievo del Porcinai»: testo del sito, riportato com'è.
- Refusi corretti: vedi `NOTE-CONTENUTI.md`; i refusi non evidenti sono stati lasciati.
