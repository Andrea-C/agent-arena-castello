# Avventura nel Castello refactor

I want to refactor the code of the game "Avventura nel Castello" to make it possible to be played through API calls in a client server architecture.

## Original code (web porting)
The original code was a MSDOS terminal application. 
The original code has been ported to a web interface: The web game URL is https://avventuranelcastello-js.it/play/
Almost all the files of the web version has been downloaded in the folder "source_app"
From now on we will refer to the web porting as **source_app**

The game is an interactive story game where the player can choose between different options to progress the story.
The user interaction is only with text.
This web version of the game is played through a web interface, that emulate a terminal session.

In the source_app, game sessions:
- are managed in memory by the client browser
- saved games are saved locally in the client browser computer

The web server can manage multiple connection but all the game sessions are managed by the client. The server just send the game files over https.

No registration is required to play the game.



## Refactor to Client-Server architecture

We want to refactor the code to make it possible to be played through API calls in a client-server architecture.

The server side of the refactored version of app will be referenced here as **castello_api_app**
**castello_api_app** must be created in the folder "server-js"

The app is just for teaching purpose, so it must be simple and easy to understand.
No extra code for security, performance or production ready features.

The castello_api_app will:
- require a registration to play the game, with a simple player name
assign a secret token to every registered user, that will be used as a service autenticantion from the clients
- manage game sessions
- save games to a local SQLite database
- manage a web dashboard to monitor to display the the sessions are going on in real time with:
    - the input received the the player clients
    - the output sent to the player clients
    - the game state and points earned by each player
- let the player clients connect to the server and play the game through API calls

Example 1:
- During the game, the players can collect objects. 
- castello_api_app remember which object is in the inventory of each player
- if a player try to use an object that the user doesn't have the server reply that he doesn't have the object

Example 2:
- the castello_api_app rembember in which room the player is 
- if the player move Nord, castello_api_app set the new room accordingly to the room where the move has been made
- i.e. corridoio is a room north to the atrio. If the player is in corridoio and move south, the player will be placed in atrio by castello_api_app

All this game logic is already well written in the source_app. We do not need to rewrite it. We need only to refactor it to be used with API and not from direct input


The main endpoint of the server will be /play endpoint, that will be called by the player clients to play the game.
The /play endpoint accept a JSON object with the player input and return a JSON object with the game output.
The input JSON object will contain:
- the player token: used also for authenticate the API call and recognize the player
- the player name: a text just to easily recognize the source of the API call when we debug, but it's not used by castello_api_app because the player is recognized by the token
- the player input: a string of text with action commmands and other text like object names

The output JSON object will contain:
- the game output
- the game state


## ACTIONS
So we will distinguish between:
- input that require a server action, like start a game, save or load a game
- input that are a game action for the game logic and the user

All the action are alredy coded in the **source_app**
We need to refactor the "destination" of the action

### Example 3
In **source_app** the SAVE action save the game in the client browser computer
In **castello_api_app** the SAVE action save the game in the server database

## Session management
### In the **source_app**
- when a player disconnect, the session is lost, unless the player saved the game before terminating the game. 
- When a player start the app, it always start from the intial menu 
```
    - (1) Iniziare una nuova avventura
    - (2) Riprendere una situazione salvata
    - (3) Cancellare tutti i salvataggi
    - (4) Ripassare le istruzioni
    - (5) Smettere prima ancora di cominciare
```
To continue a previous game, the player must load it from the computer disk selecting "(2) Riprendere una situazione salvata" from the initial menu or CARICA during the game

### In the **castello_api_app**
- Every action performed by the user and every event is saved in the game session in the server database 
- when a player disconnect, the session is not lost but memorized in the server
- When a player start the app, he continue from where it left
- Because of this real time session management, we need to add an ACTION/COMMAND to the **castello_api_app** to eneble the client to query the current game state and player position
- The session is lost only if the player dies of use the command BASTA
- Also the new app permit to save a game with a name to take a snapshot of the current game and restart from that checkpoint

## Database

Use a SQLite database to store the data of the saved game and player sessions and actions


## Copy of the initial game instructions

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

TASK:
1. Read the following game flow
2. Read and understand the full original codebase in **source_app** folder
3. Recognize in the original codebase the game patterns described in the game flow
4. Create a detailed development plan to to port the **source_app** in **castello_api_app** as described in the game flow and in the original codebase

**ATTENTION**: 
 - in the original codebase, the game logic, the memory of the progress, the saved game in the persistent memory, are all managed client side, in the player browser
 - in this project, everything is managed server side

<game_flow>
## Game Flow

- The app is multi-player, in the sense that many player can play in the same time, but each player plays its own game 
- The game status is saved in the server database. The client is stateless. Player takes their own notes about the game state, but these are just personal notes, not part of the code
- If not registered, the player register itself on the server
    - the player register with a choose **player-name**
    - the server check if the **player-name** is available or already used
    - if the **player-name** is alredy used, the server reply "player name not available"
    - if the **player-name** is available the server reply with a **player-key**, a 40 bytes unique token
- The **player-key** will be used in every API call to authenticate the connections
- The player check is STATUS, to see if, for his username, there is an open game or not
- The user can have the following statuses
    - **NOT_PLAYING**: the player is not playing and have access only to the initial game option 
    - **PLAYING**: the player is playing a game
- After the initial registration, the game initial status is **NOT_PLAYING**
- When in status **NOT_PLAYING**, the player can:
    - **START_GAME** - (1) Iniziare una nuova avventura: start a new game from scratch
    - **LOAD_GAME**  - (2) Riprendere una situazione salvata: list all the games saved in the database, load one saved game in server runtime memory, and continue to play from there
    - **DELETE_SAVED_GAME** - (3) Cancellare tutti i salvataggi: delete all saved games: ask for confirmation
    - **GET_HELP** - (4) Ripassare le istruzioni: get the help for the basic instructions
    ```
    - (1) Iniziare una nuova avventura
    - (2) Riprendere una situazione salvata
    - (3) Cancellare tutti i salvataggi
    - (4) Ripassare le istruzioni
    - (5) Smettere prima ancora di cominciare
    ```
- When in status **PLAYING** 
    - The player POST a new action: a string of free text containing an action to interact with the game environment
    - the Sever evaluate the action:
        - If the server recognize the action described in the posted text, 
            - it update the game runtime memory 
            - it update the game persistent memory in the database for that game
            - and reply to the player describing the effect of the action
            - If the action take the player to finish the game, the server reply with the final summary of the game and quit the game, changing the status in **NOT_PLAYING**
        - If the server doesn't recognize the action, it reply accordingly based on its game logic
        - if the Posted action is to quit the game, the status is changed to **NOT_PLAYING**
</game_flow>

## Files and folders to ignore
Ignore the following files and folders because are part of a different porting tentative

<files_and_folders_to_ignore>
- avventura-nel-castello-description-for-Python.md
- avventura-nel-castello-development-plan-python-version.md
- requirements.txt
- server
</files_and_folders_to_ignore>


Make me all the question you need to understand the task
Write the plan in the file avventura-nel-castello-development-plan-javascript-version.md





    

