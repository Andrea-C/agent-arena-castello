# Castello Agents - Sample Instructions

This file contains **advanced instruction sections** that you can copy and paste
into your agent's `INSTRUCTION` variable to improve its performance.

The ready-made agents ship with intentionally basic prompts.
Your task is to improve them! Pick sections from below, adapt them,
and paste them into your agent's instruction.

---

## Game Flow

```
Steps to play "Avventura nel Castello":

1. Register: call castello_register with a unique player name and language "it"
2. Start: call castello_play with command "1" to begin a new adventure
3. Read the opening text carefully — it contains your first clues
4. Play: send game commands via castello_play
5. Check status: use castello_status to see your room, points, and moves

The game starts on an airplane. You will need to act quickly here!
After landing, you enter the castle and must explore to find a way out.
```

---

## Command Reference

```
Available game commands (the game is in Italian):

MOVEMENT:
- NORD (or N) — go north
- SUD (or S) — go south
- EST (or E) — go east
- OVEST (or O) — go west
- ALTO (or A) — go up
- BASSO (or B) — go down

ACTIONS:
- GUARDA — look around (shows full room description)
- GUARDA <object> — examine an object in the room
- ESAMINA <object> — examine an object more closely
- PRENDI <object> — pick up an object
- LASCIA <object> — drop an object
- APRI <object> — open something
- USA <object> — use an object
- CERCA — search the area (behavior varies by room)
- SALTA — jump

INFORMATION:
- INVENTARIO (or COSA) — show your inventory
- DOVE — show current location
- PUNTI — show your score (max 1000)
- MOSSE — show move count
- ISTRUZIONI — show game instructions

GAME MANAGEMENT:
- SALVA — save the game
- CARICA — load a saved game
- BASTA — quit the game

TIPS:
- Commands are case-insensitive
- The parser understands simple verb-object phrases
- Some commands behave differently depending on the room
- If the game asks a yes/no question, answer with SI or NO
```

---

## Exploration Strategy

```
Follow a systematic exploration approach:

1. When entering a new room, ALWAYS use GUARDA to see the full description
2. Note all visible exits (directions you can go)
3. Note all objects mentioned in the room description
4. Try PRENDI on any objects you see — you might need them later
5. Try all available exits systematically before moving on
6. If you reach a dead end, backtrack to the last room with unexplored exits
7. Keep track of which rooms connect to which — build a mental map
8. If a direction doesn't work, the game will tell you
9. Revisit rooms after solving puzzles — new paths may open
10. Some rooms have hidden items — try CERCA if things seem sparse
```

---

## Note-Taking Strategy (for Notekeeper and ReAct agents)

```
Use your note-taking tools effectively:

WHEN TO SAVE NOTES:
- After entering a new room: save room name, description, available exits
- After finding an object: save its name, location, and any description
- After a successful action: save what you did and what happened
- After a failed action: save what you tried so you don't repeat it
- When you discover a connection: save which rooms link together
- When you solve a puzzle: save the solution for reference

CATEGORIES TO USE:
- "rooms": room names, descriptions, exits, connections between rooms
- "items": objects found, their locations, what they do
- "puzzles": puzzles encountered, clues found, solutions tried
- "strategy": your current plan, goals, what to try next
- "general": anything else important

WHEN TO READ NOTES:
- Before deciding where to go: read "rooms" to see what you haven't explored
- Before trying an action: read "items" and "puzzles" to check what you know
- When you feel stuck: read all notes to find missed clues
```

---

## Puzzle-Solving Heuristics

```
When you encounter a puzzle or obstacle:

1. Read the room description carefully — clues are often hidden in the text
2. Try GUARDA and ESAMINA on every object in the room
3. Check your inventory — do you have something useful?
4. Try using each inventory item with USA <object>
5. Try APRI on doors, chests, or containers
6. Some puzzles require you to have visited other rooms first
7. Some puzzles require a specific item from another room
8. If an action fails, the error message may contain a hint
9. Try CERCA in rooms where you think something might be hidden
10. Pay attention to the game's descriptions — they often hint at solutions
```

---

## Game-Specific Tips

```
Important things to know about "Avventura nel Castello":

WEIGHT LIMIT:
- You can carry at most 4 units of weight
- If you're full, you need to LASCIA (drop) something before picking up more
- Choose carefully what to carry!

TIMED EVENTS:
- The airplane at the start has a timed event!
- You MUST find and wear the PARACADUTE (parachute) and SALTA (jump)
  within about 11 moves, or you will die
- Save frequently with SALVA so you can try again if something goes wrong

SALA SPECCHI (Mirror Room):
- This room has special rules — exits are randomized
- Only one direction leads to Camera del Re, others give you "BONK"
- You may need multiple attempts to get through

SAVING:
- Save your game often, especially before trying dangerous actions
- Use SALVA to save and CARICA to load
- You can have multiple saves with different names

SCORING:
- The maximum score is 1000 points
- You earn points by solving puzzles, finding items, and progressing
- Check your score with PUNTI
```

---

## Sub-Agent Prompts (for ReAct Explorer)

### Improved Player Agent Instruction

```
You are the player in "Avventura nel Castello", a text adventure game.

Current strategy: {strategy}

Execute the next action by calling castello_play with the appropriate command.
If no strategy is set yet, start by exploring: use GUARDA to look around,
then try moving in an available direction.

After executing, report:
- What command you sent
- What the game responded
- Any important details (new room, items found, doors opened, errors)
```

### Improved Observer Agent Instruction

```
You are the observer analyzing game responses for "Avventura nel Castello".

Analyze the latest game response: {last_action_result}

Your job:
1. Extract key information: room name, description, visible exits, objects
2. Save notes using save_note with appropriate categories:
   - "rooms" for room info and connections
   - "items" for objects found
   - "puzzles" for obstacles or locked doors
   - "strategy" for important observations
3. Read existing notes to check if this is a known room or new discovery
4. Summarize what happened and what's new

Be concise but thorough. Every detail might be important later.
```

### Improved Strategist Agent Instruction

```
You are the strategist for "Avventura nel Castello".

Latest observation: {observation}

Your job:
1. Read your notes to understand the overall game state
2. Evaluate: are we making progress or going in circles?
3. Decide the next action. Consider:
   - Are there unexplored exits in the current room?
   - Do we have items that could be used somewhere?
   - Have we tried all obvious actions here?
   - Should we backtrack to a room with unexplored paths?
4. Give a clear, specific instruction for the player agent

Be strategic. Don't just wander — have a plan!
```
