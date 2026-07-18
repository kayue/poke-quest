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

Built with **Vite** + **React** + **TypeScript**, with **XState v5** driving the
game flow and pure CSS keyframes for the animations.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Credits & references

This is a fan/educational project built on top of the following resources.
All credit for the artwork and the original game concept goes to their authors.

### Game concept

- **S.U.M.** — the "fight monsters by solving maths" battle mechanic that this
  game is based on. Heroes and Monsters here are reskinned as Pokémon.

### Pokémon sprites

- **Pokémon HeartGold/SoulSilver front sprites** — the battle sprites used for
  heroes and enemies (`public/assets/pokemon/`), sourced as individual files
  from the [PokeAPI sprites](https://github.com/PokeAPI/sprites) repository
  (`versions/generation-iv/heartgold-soulsilver`). Pokémon, their sprites and
  names are © Nintendo / Game Freak / The Pokémon Company.
- **Battle platforms** (`public/assets/battle/`) are cropped from HGSS/FRLG
  battle-base rips on [The Spriters Resource](https://www.spriters-resource.com/).

### Battle art (backgrounds, creature/attack sprites, tilesets, UI)

- **Monster Pack — Wild Sprites 01 (`mpwsp01`)** by **scarloxy** — the pixel-art
  backgrounds, attack effects, tilesets and UI in `references/assets`.
  - https://scarloxy.itch.io/mpwsp01

### Tech

- [Vite](https://vite.dev/), [React](https://react.dev/),
  [TypeScript](https://www.typescriptlang.org/) and
  [XState](https://stately.ai/docs/xstate) v5.
- Fonts: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) and
  [Baloo 2](https://fonts.google.com/specimen/Baloo+2) via Google Fonts.

> **Note:** Pokémon is a trademark of Nintendo / Game Freak / The Pokémon
> Company. This project is a non-commercial educational fan project and is not
> affiliated with or endorsed by them.
