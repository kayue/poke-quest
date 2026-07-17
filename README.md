# Poké Math Quest ⚔️

A simple, attractive maths battle game for Year 1–2 children (ages ~5–7).
Inspired by the game **S.U.M.**, but the Heroes and Monsters are replaced with
**Pokémon**. Solve maths, power up your Pokémon, and beat every wild foe!

## What it practises

- **Addition** — e.g. `3 + 4 = ?`
- **Subtraction** — e.g. `9 − 5 = ?` (never goes negative)
- **Times Tables** — the 2, 5 and 10 tables plus other small multiplications
- **Mixed** — a bit of everything

Three difficulty levels (Easy / Medium / Hard) grow the number ranges, and
harder levels occasionally ask for a **missing number** (`5 + ? = 8`) as well as
the answer.

## How to play

1. Pick your buddy Pokémon (Pikachu, Charmander, Squirtle, …).
2. Choose what to practise and how tricky.
3. Choose an **Adventure** (6 themed stages ending in a boss) or **Practice
   Mode** (endless, no lives lost — just learning).
4. In battle a wild Pokémon shows a sum. Tap the number tile that solves it:
   - **Correct** → your Pokémon attacks and the foe loses HP.
   - **Wrong** → you lose a heart (and the correct tile is revealed so you learn).
5. Clear every foe in the stage to **win**. Lose all 5 hearts and it's game over.

## Tech

- **Vite** + **React** + **TypeScript**
- **XState v5** — the whole game flow (title → hero → mode → difficulty →
  journey → battle → victory/defeat) is one state machine in
  `src/game/machine.ts`. Battle animations are driven by the machine's timed
  substates (`intro`, `answering`, `correct`, `wrong`, `enemyFaint`).
- Pure CSS keyframe animations (idle bob, enemy hit/faint, attack sprite-sheet
  effects, floating text, confetti).

## Assets

- **Pokémon sprites**: [`pokesprite`](https://github.com/msikma/pokesprite) box
  icons (`public/assets/pokemon/`).
- **Backgrounds & attack effects**: from the bundled `references/assets` pack.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Project layout

```
src/
  game/
    data.ts        # heroes, enemies, stages, modes, difficulties
    problems.ts    # maths problem + answer-tile generation
    machine.ts     # XState v5 game machine
  Battle.tsx       # the battle screen (reads machine substates for animation)
  App.tsx          # router + title / selection / result screens
  styles.css       # all styling & animations
```
