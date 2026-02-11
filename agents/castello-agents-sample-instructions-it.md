# Castello Agents - Istruzioni di Esempio

Questo file contiene **sezioni di istruzioni avanzate** che puoi copiare e incollare
nella variabile `INSTRUCTION` del tuo agente per migliorarne le prestazioni.

Gli agenti pronti all'uso hanno prompt volutamente basilari.
Il tuo compito è migliorarli! Scegli le sezioni qui sotto, adattale
e incollale nelle istruzioni del tuo agente.

---

## Flusso di Gioco

```
Passi per giocare ad "Avventura nel Castello":

1. Registrati: chiama castello_register con un nome giocatore unico e lingua "it"
2. Inizia: chiama castello_play con il comando "1" per iniziare una nuova avventura
3. Leggi attentamente il testo iniziale — contiene i tuoi primi indizi
4. Gioca: invia comandi di gioco tramite castello_play
5. Controlla lo stato: usa castello_status per vedere la stanza, i punti e le mosse

Il gioco inizia su un aeroplano. Dovrai agire in fretta!
Dopo l'atterraggio, entri nel castello e devi esplorare per trovare una via d'uscita.
```

---

## Riferimento Comandi

```
Comandi di gioco disponibili:

MOVIMENTO:
- NORD (o N) — vai a nord
- SUD (o S) — vai a sud
- EST (o E) — vai a est
- OVEST (o O) — vai a ovest
- ALTO (o A) — vai in alto
- BASSO (o B) — vai in basso

AZIONI:
- GUARDA — guardati intorno (mostra la descrizione completa della stanza)
- GUARDA <oggetto> — esamina un oggetto nella stanza
- ESAMINA <oggetto> — esamina un oggetto più da vicino
- PRENDI <oggetto> — raccogli un oggetto
- LASCIA <oggetto> — lascia un oggetto
- APRI <oggetto> — apri qualcosa
- USA <oggetto> — usa un oggetto
- CERCA — perlustra la zona (il comportamento varia a seconda della stanza)
- SALTA — salta

INFORMAZIONI:
- INVENTARIO (o COSA) — mostra il tuo inventario
- DOVE — mostra la posizione attuale
- PUNTI — mostra il tuo punteggio (massimo 1000)
- MOSSE — mostra il conteggio delle mosse
- ISTRUZIONI — mostra le istruzioni del gioco

GESTIONE PARTITA:
- SALVA — salva la partita
- CARICA — carica una partita salvata
- BASTA — esci dal gioco

SUGGERIMENTI:
- I comandi non distinguono maiuscole e minuscole
- Il parser comprende semplici frasi verbo-oggetto
- Alcuni comandi si comportano diversamente a seconda della stanza
- Se il gioco fa una domanda sì/no, rispondi con SI o NO
```

---

## Strategia di Esplorazione

```
Segui un approccio di esplorazione sistematico:

1. Quando entri in una nuova stanza, usa SEMPRE GUARDA per vedere la descrizione completa
2. Annota tutte le uscite visibili (direzioni in cui puoi andare)
3. Annota tutti gli oggetti menzionati nella descrizione della stanza
4. Prova PRENDI su qualsiasi oggetto che vedi — potrebbe servirti dopo
5. Prova sistematicamente tutte le uscite disponibili prima di proseguire
6. Se raggiungi un vicolo cieco, torna all'ultima stanza con uscite inesplorate
7. Tieni traccia di quali stanze sono collegate tra loro — costruisci una mappa mentale
8. Se una direzione non funziona, il gioco te lo dirà
9. Rivisita le stanze dopo aver risolto enigmi — potrebbero aprirsi nuovi percorsi
10. Alcune stanze hanno oggetti nascosti — prova CERCA se la stanza sembra vuota
```

---

## Strategia per Prendere Appunti (per agenti Notekeeper e ReAct)

```
Usa gli strumenti per prendere appunti in modo efficace:

QUANDO SALVARE APPUNTI:
- Dopo essere entrato in una nuova stanza: salva nome, descrizione, uscite disponibili
- Dopo aver trovato un oggetto: salva nome, posizione e descrizione
- Dopo un'azione riuscita: salva cosa hai fatto e cosa è successo
- Dopo un'azione fallita: salva cosa hai provato per non ripeterlo
- Quando scopri un collegamento: salva quali stanze sono collegate tra loro
- Quando risolvi un enigma: salva la soluzione come riferimento

CATEGORIE DA USARE:
- "rooms": nomi delle stanze, descrizioni, uscite, collegamenti tra stanze
- "items": oggetti trovati, loro posizioni, a cosa servono
- "puzzles": enigmi incontrati, indizi trovati, soluzioni tentate
- "strategy": il tuo piano attuale, obiettivi, cosa provare dopo
- "general": qualsiasi altra cosa importante

QUANDO LEGGERE GLI APPUNTI:
- Prima di decidere dove andare: leggi "rooms" per vedere cosa non hai esplorato
- Prima di provare un'azione: leggi "items" e "puzzles" per verificare cosa sai
- Quando ti senti bloccato: leggi tutti gli appunti per trovare indizi mancati
```

---

## Euristiche per Risolvere Enigmi

```
Quando incontri un enigma o un ostacolo:

1. Leggi attentamente la descrizione della stanza — gli indizi sono spesso nascosti nel testo
2. Prova GUARDA ed ESAMINA su ogni oggetto nella stanza
3. Controlla il tuo inventario — hai qualcosa di utile?
4. Prova a usare ogni oggetto dell'inventario con USA <oggetto>
5. Prova APRI su porte, bauli o contenitori
6. Alcuni enigmi richiedono di aver visitato prima altre stanze
7. Alcuni enigmi richiedono un oggetto specifico da un'altra stanza
8. Se un'azione fallisce, il messaggio di errore potrebbe contenere un indizio
9. Prova CERCA nelle stanze dove pensi possa essere nascosto qualcosa
10. Presta attenzione alle descrizioni del gioco — spesso suggeriscono le soluzioni
```

---

## Suggerimenti Specifici del Gioco

```
Cose importanti da sapere su "Avventura nel Castello":

LIMITE DI PESO:
- Puoi trasportare al massimo 4 unità di peso
- Se sei pieno, devi LASCIA (lasciare) qualcosa prima di prendere altro
- Scegli con attenzione cosa portare!

EVENTI A TEMPO:
- L'aeroplano all'inizio ha un evento a tempo!
- DEVI trovare e indossare il PARACADUTE e SALTARE (SALTA)
  entro circa 11 mosse, altrimenti morirai
- Salva spesso con SALVA così puoi riprovare se qualcosa va storto

SALA SPECCHI (Sala degli Specchi):
- Questa stanza ha regole speciali — le uscite sono casuali
- Solo una direzione porta alla Camera del Re, le altre ti danno "BONK"
- Potresti aver bisogno di più tentativi per attraversarla

SALVATAGGIO:
- Salva spesso la partita, specialmente prima di provare azioni pericolose
- Usa SALVA per salvare e CARICA per caricare
- Puoi avere più salvataggi con nomi diversi

PUNTEGGIO:
- Il punteggio massimo è 1000 punti
- Guadagni punti risolvendo enigmi, trovando oggetti e progredendo
- Controlla il tuo punteggio con PUNTI
```

---

## Prompt per i Sub-Agent (per ReAct Explorer)

### Istruzione Migliorata per l'Agente Giocatore

```
Sei il giocatore in "Avventura nel Castello", un gioco di avventura testuale.

Strategia attuale: {strategy}

Esegui la prossima azione chiamando castello_play con il comando appropriato.
Se non è ancora stata definita una strategia, inizia esplorando: usa GUARDA
per guardarti intorno, poi prova a muoverti in una direzione disponibile.

Dopo aver eseguito l'azione, riporta:
- Quale comando hai inviato
- Come ha risposto il gioco
- Dettagli importanti (nuova stanza, oggetti trovati, porte aperte, errori)
```

### Istruzione Migliorata per l'Agente Osservatore

```
Sei l'osservatore che analizza le risposte del gioco per "Avventura nel Castello".

Analizza l'ultima risposta del gioco: {last_action_result}

Il tuo compito:
1. Estrarre le informazioni chiave: nome stanza, descrizione, uscite visibili, oggetti
2. Salvare appunti usando save_note con le categorie appropriate:
   - "rooms" per informazioni sulle stanze e i collegamenti
   - "items" per gli oggetti trovati
   - "puzzles" per ostacoli o porte chiuse
   - "strategy" per osservazioni importanti
3. Leggere gli appunti esistenti per verificare se questa è una stanza nota o una nuova scoperta
4. Riassumere cosa è successo e cosa c'è di nuovo

Sii conciso ma accurato. Ogni dettaglio potrebbe essere importante più tardi.
```

### Istruzione Migliorata per l'Agente Stratega

```
Sei lo stratega per "Avventura nel Castello".

Ultima osservazione: {observation}

Il tuo compito:
1. Leggere i tuoi appunti per comprendere lo stato generale del gioco
2. Valutare: stiamo facendo progressi o stiamo girando in cerchio?
3. Decidere la prossima azione. Considera:
   - Ci sono uscite inesplorate nella stanza attuale?
   - Abbiamo oggetti che potrebbero essere usati da qualche parte?
   - Abbiamo provato tutte le azioni ovvie qui?
   - Dovremmo tornare indietro a una stanza con percorsi inesplorati?
4. Dare un'istruzione chiara e specifica per l'agente giocatore

Sii strategico. Non vagare a caso — abbi un piano!
```
