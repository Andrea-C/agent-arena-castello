# Avventura nel Castello refactor

I want to refactor the code of the game "Avventura nel Castello" to make it possible to be played through API calls in a client server architecture.

## Original code and web porting
The original code was a Windows terminal application. 
The original code has been ported to a web interface: The web game URL is https://avventuranelcastello-js.it/play/
Almost all the files of the web version has been downloaded in the folder "original"

The game is an interactive story game where the player can choose between different options to progress the story.
The user interaction is only with text.
This web version of the game is played through a web interface, that emulate a terminal session.

In the web porting, game sessions:
- are managed in memory by the browser
- saved games are saved locally in the client browser computer

The web server can manage multiple connection but all the game sessions are managed by the client. The server just send the game files over https.

No registration is required to play the game.



## Refactor to Client Server architecture

We want to refactor the code to make it possible to be played through API calls in a client server architecture.

The app is just for teaching purpose, so it must be simple and easy to understand.
No extra code for security, performance or production ready features.

In the refactored version, the server will:
- require a registration to play the game, with a simple player name, without any authentication
- manage game sessions
- save games to a local SQLite database
- manage a web dashboard to monitor to display the the sessions are going on in real time with:
    - the input received the the player clients
    - the output sent to the player clients
    - the game state for each player
- let the player clients connect to the server and play the game through API calls

The main endpoint of the server will be /play endpoint, that will be called by the player clients to play the game.
The /play endpoint accept a JSON object with the player input and return a JSON object with the game output.
The input JSON object will contain:
- the player name
- the player input --> a string of text with action commmands and other text like object names

The output JSON object will contain:
- the game output
- the game state


So we will distingue between:
- input that require a server action, like start a game, save or load a game
- input that are a game action for the game logic and the user


Then there will be all the service endpoints to manage all the server features, like:
- registration
- menu items:
    - (1) Iniziare una nuova avventura
    - (2) Riprendere una situazione salvata
    - (3) Cancellare tutti i salvataggi
    - (4) Ripassare le istruzioni
    - (5) Smettere prima ancora di cominciare


This is the original game instructions for the player:

		instructions: [
			`Il tuo obbiettivo principale è uscire vivo dal castello.`,
			`Per farcela dovrai affrontare molti pericoli e risolvere problemi che metteranno a dura prova la tua astuzia.`,
			`In questa avventura, io sarò il tuo alter ego, i tuoi occhi e le tue orecchie, ma tu dovrai prendere le decisioni (e subirne le conseguenze).`,
			`Per muoverti usa:`,
			`- NORD, SUD, EST, OVEST, ALTO, BASSO oppure soltanto:`,
			`- N, S, E, O, A, B`,
			`Io ti darò la descrizione completa di ogni luogo la prima volta che vi entri, poi darò solo una descrizione breve. Se vuoi la descrizione completa dimmi:`,
			`- GUARDA o`,
			`- GUARDA LA STANZA`,
			`Azioni fondamentali sono:`,
			`- PRENDI qualcosa`,
			`- LASCIA qualcosa`,
			`- GUARDA qualcosa, ad esempio GUARDA LO SCALONE.`,
			`Io non sono molto furbo, per cui usa frasi come APRI LA PORTA o SALTA e non frasi elaborate come GUARDA DIETRO IL DIVANO o avverbi (GUARDA ATTENTAMENTE), che sono al di là della mia comprensione.`,
			`Per agire su un oggetto, di solito è necessario possederlo. Inoltre, ricorda che un'azione che non ha effetto in un posto (es. CERCA) può averne da qualche altra parte.`,
			`Altri comandi importanti:`,
			`- DOVE ti ricorda dove ti trovi,`,
			`- COSA elenca gli oggetti che possiedi,`,
			`- MOSSE ti dice da quanto giochi,`,
			`- PUNTI quanto sei riuscito a scoprire,`,
			`- SAVE serve a registrare la situazione su disco,`,
			`- LOAD ripristina la situazione su disco,`,
			`- BASTA termina il gioco,`,
			`- ISTRUZIONI ti ripete questa descrizione.`,
			`Buona Fortuna! (ne avrai bisogno)`

		],

	To the original commands add an endpoint to register a player
	All the API calls for this player need to contain the player name

	The server app shoul contain an API documentation page to document the API calls

## Clarifications
Server actions are commands that are not part of the game itself (e.g., registration, save, load, quit). Game actions are all commands sent while playing.

Session lifecycle and concurrency:
- One active session per player.
- No concurrent play: if another client uses the same player name, return a clear error.
- Session auto-creates on first /play.
- SAVE stores a named snapshot; LOAD restores the latest or named snapshot.
- QUIT marks the session inactive.

Dashboard updates:
- Every client interaction updates the dashboard.
- The dashboard also exposes a refresh button.

## API Behavior (Short)
- All API calls include `playerName`.
- `/register`: create a player by name (no auth).
- `/play`: if no active session exists for `playerName`, create one; otherwise resume it.
- If the same `playerName` is used concurrently, return a clear error and reject the request.
- `SAVE <name>`: store a named snapshot for the player.
- `LOAD [name]`: restore the latest snapshot, or the named one if provided.
- `QUIT`: mark the session inactive.
- `/dashboard`: shows real-time session activity and includes a manual refresh action.










    

