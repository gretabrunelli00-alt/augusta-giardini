# Note sui contenuti

## Fonte
Pagine lette il 3/10/2026: home e 9 pagine progetto di https://augusta-giardini.it/. Testi riportati **verbatim**, spezzati in sezioni; l'ordine delle frasi dentro ogni sezione segue l'originale. Ogni frase è usata una sola volta (retro) più i frammenti delle righe descrittive e delle citazioni.

## Refusi corretti (solo quelli evidenti)
| Dove | Originale | Corretto |
|---|---|---|
| Titolo Piccolo giardino | Piccolo giardini in centro storico | Piccolo giardino in centro storico |
| Titolo Palazzo | «corte  interna» (doppio spazio) | corte interna |
| Piccolo giardino | pachisandra terminalis ,ortensie | pachysandra terminalis, ortensie |
| Roof garden | rilassare nella leggendo un libro | rilassare leggendo un libro |
| Bergamo | commettenti; «alle le fioriture» | committenti; alle fioriture |
| Palazzo | vasi vasi; Asparugus sprengerii; dominate; deckin | vasi; Asparagus sprengeri; dominante; decking |
| Collina | hortensie | ortensie |
| Chi sono | l‘identità (apice sbagliato) | l’identità |
| Come lavoro (idea) | «Il concept :» | «Il concept:» |

Lasciati com'erano (non evidenti o interpretabili): «piantumato un nocciolo contorto» (Corten), «Gaure stipe», «fa da scenografia sfondo» (Bergamo), «il vento dell'acqua» (Chi sono), «cupressuscyparis leylandii» (Collina). Il testo originale dei nomi di pianta è sempre in `plants[].original`.

## Differenze rispetto alla mappa di controllo
- **Fonteno e Solto Collina** non compaiono nel testo: solo negli alt text/nomi file (vedi DA-CONFERMARE).
- **Piccolo giardino**: «giardino privato» non è nel testo.
- **Corten e graminacee**: elenco con 12 voci + 5 piante citate solo nel testo = 17. Cipressi, corbezzolo, fico e nocciolo contorto sono **già nell'elenco** (come Cupessus sempervirens totem, Arbuthus unedo, Ficus carica, Corylus avellana contorta). Le piante davvero solo nel testo sono: agavi, erigeron, anemoni, phormium, vite del Canada. Rose bianche, lavande, oleandri, bossi, gaure/stipe del testo coincidono con voci dell'elenco e non sono duplicate.
- **Palazzo**: elenco 9 voci, ma Phormium atropurpurea e Phormium tenax variegato sono la stessa specie → 8 piante distinte dall'elenco + l'ulivo citato solo nel testo = 9 voci mostrate.
- Conteggi foto ed elenchi piante: confermati (9/12, 9/12, 8/18, 6/3, 4/0, 6/12+5, 4/4, 6/9, 6/9).
- La miniatura della 5ª foto di «Piccolo giardino» ha il nome file `6-fonteno-2.jpg` ma la sua lightbox punta a `IMG_6407.jpg` (usata quest'ultima).

## Ordine delle 11 card
1 Roof garden vista lago → 2 Piccolo giardino → 3 *Chi sono* → 4 Giardino sul lago d'Iseo → 5 Loggiato → 6 Corten e graminacee → 7 Terrazzo a pozzetto → 8 *Come lavoro* → 9 Palazzo → 10 Terrazza Bergamo → 11 Giardino in collina.
Si apre con la foto più forte (lago e montagne), le card editoriali sono distanziate di 5 e 6 posizioni nel giro, e si alternano luce/sera e interni/esterni.

## Piante: conteggi veri (`npm run plants-report`)
Voci normalizzate, n. progetti: Agapanthus africanus 4, Olea europaea 4 (3 da elenco + 1 dal testo), Agave americana 3, Asparagus sprengeri 3, Buxus sempervirens 3, Gaura 3, Nerium oleander 3, Phormium tenax 3, Phormium sp. 3, Rosa 3, Salvia rosmarinus 3; a 2: Acer palmatum, Anemone × hybrida, Corylus avellana, Cupressus sempervirens, Cycas revoluta, Erigeron karvinskianus, Punica granatum, Stipa tenuissima.
Per genere: **Phormium 6**, Agapanthus 4, Agave 4, Olea 4, Anemone 3, Asparagus 3, Buxus 3, Erigeron 3, Gaura 3, Hydrangea 3 (tre specie diverse, una voce ciascuna), Nerium 3, Rosa 3, Salvia 3.
Differenze con la lista di prima lettura: Agapanthus e ulivo (4) superano rosmarino prostrato (3); **Rosa** e **Anemone** non erano nella lista e compaiono a 3; le ortensie sono tre specie distinte con un progetto ciascuna (3 solo per genere); Phormium dipende dal criterio (3 + 3 voci «sp.» = 6 progetti per genere).

## Scelte
- Nomi comuni mostrati solo se il sito li scrive; nessuna descrizione botanica inventata.
- Rosa, Phormium e Anemone: criterio "stessa specie = una voce, specie non indicata = voce separata" (flag in `reviewNote`).
