# Poké Math Quest ⚔️

A simple, attractive maths battle game for primary-school children (ages 5–10).
Inspired by the game **S.U.M.**, but the Heroes and Monsters are replaced with
**Pokémon**. Solve maths, power up your Pokémon, and beat every wild foe!

## What it practises

Instead of picking a topic and a difficulty, the child picks their **age
(5–10)** and the game follows an age-based curriculum. Each age introduces new
skills across several domains:

| Age | New this year |
| --- | --- |
| 5 | Add & take away to 10, halves, counting on |
| 6 | Adding to 20, the 2·5·10 tables, tens & ones |
| 7 | Sums to 100, the 3·4·6·8 tables, unit fractions |
| 8 | Sums to 1000, dividing, tables to 12×12, rounding to 10 |
| 9 | 2-digit ×, simple percentages, rounding to 100 |
| 10 | One-step algebra, %, decimals, order of operations |

The domains covered (from *Addition & Subtraction* through *Place Value*,
*Fractions*, *Algebra* and *Ratio & Proportion*) all resolve to a single number
the child taps — so picture-only domains like *Data & Statistics* aren't
included.

To keep each level in the child's stretch zone, every round mixes ages: **50%**
of problems come from the chosen age, **20%** from the age below (revision) and
**30%** from the age above (a challenge). At the edges the missing neighbour's
share folds back in — age 5 is 70% current / 30% ahead, age 10 is 80% current /
20% behind. See [`src/features/math/problems.ts`](src/features/math/problems.ts).

## How to play

1. Pick your buddy Pokémon (Pikachu, Charmander, Squirtle, …).
2. Choose **how old you are** (5–10).
3. Choose an **Adventure** (6 themed stages ending in a boss) or **Practice
   Mode** (endless, no lives lost — just learning).
4. In battle a wild Pokémon shows a problem. Tap the number tile that solves it:
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
