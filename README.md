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
3. Each run rolls a random background and a line-up of **5 wild Pokémon** — 4
   grunts and a boss to finish on.
4. In battle a wild Pokémon shows a problem. Tap the number tile that solves it:
   - **Correct** → your Pokémon attacks and the foe loses HP.
   - **Wrong** (or the 10-second timer runs out) → you take a hit (and the
     correct tile is revealed so you learn).
5. Clear all 5 foes to **win**; run out of HP and it's game over.

## Progression: EXP, levels & evolution

Every buddy trains **independently** and its progress is **saved to
`localStorage`** (key `poke-quest:progress:v1`), so it survives a reload.

- **EXP** is earned by **defeating wild Pokémon** — each Pokémon beaten is worth
  1 EXP, regardless of age or boss, so progress is measured purely in Pokémon
  beaten.
- **Levels** cost `5 × current level` Pokémon each: **5** to reach Lv2, **10**
  more for Lv3, **15** more for Lv4, and so on — every level takes a little
  longer. The current level and an EXP bar show on the HeroSelect cards, the
  home buddy pill, and the in-battle HP box.
- **Evolution** happens at each species' Pokédex level, using the official
  main-series levels (16 / 32 / 36); Pikachu→Raichu and Eevee→Vaporeon are Stone
  evolutions in canon (no level), so they use a documented level-16 house rule.
  At 5 Pokémon per level these are a long-haul goal (Lv16 ≈ 600 Pokémon). See
  [`src/shared/pokedex.ts`](src/shared/pokedex.ts) and
  [`src/shared/progress.ts`](src/shared/progress.ts).
- Reaching a new level or evolution plays a full-screen **celebration
  animation** (see [`src/shared/Celebration.tsx`](src/shared/Celebration.tsx)).

## Tech

Built with **Vite** + **React** + **TypeScript**, with **XState v5** driving the
game flow and pure CSS keyframes for the animations.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run typecheck  # type-check without emitting
```

## Testing progression (EXP / levels / evolution)

EXP is just Pokémon-beaten count, so `exp` values below are literally "how many
Pokémon this buddy has defeated" — Lv*N* is reached at `5 × (N-1) × N / 2`.

A **level-up** takes a full run: a fresh buddy reaches Lv2 after beating **5**
Pokémon (one run). **Evolution** needs Lv16 = **600** Pokémon (~120 runs), so
seed the EXP from the browser **DevTools → Console** instead of grinding.

**See an evolution in one battle** — paste this, then start a battle and defeat
one Pokémon:

```js
const K = 'poke-quest:progress:v1'
const s = JSON.parse(localStorage.getItem(K))
s.mons[s.selectedId].exp = 599   // just below Lv16 → next defeat evolves
localStorage.setItem(K, JSON.stringify(s))
location.reload()
```

Handy EXP values (set `s.mons[s.selectedId].exp` to these) — the **next defeat**
crosses the threshold and plays the animation:

| `exp` | Next defeat triggers |
| --- | --- |
| `4` | Level-up to Lv2 |
| `599` | Lv16 + first evolution (e.g. Bulbasaur→Ivysaur, Pikachu→Raichu) |
| `2479` | Lv32 + Ivysaur→Venusaur |
| `3149` | Lv36 + Charmeleon→Charizard, Wartortle→Blastoise |

Make sure the buddy you seed is the one selected on the home screen (the snippet
targets `selectedId`). **Piplup doesn't evolve** (its Gen-4 evolutions aren't in
this Pokédex), so pick another buddy to test evolution.

**Just view evolved sprites** (no animation): set a high `exp` (e.g. `20000`)
and reload — the HeroSelect cards, home pill and battle back-sprite show the
evolved form immediately.

**Reset to a fresh save:**

```js
localStorage.removeItem('poke-quest:progress:v1'); location.reload()
```

## Credits & references

This is a fan/educational project built on top of the following resources.
All credit for the artwork and the original game concept goes to their authors.

### Game concept

- **S.U.M.** — the "fight monsters by solving maths" battle mechanic that this
  game is based on. Heroes and Monsters here are reskinned as Pokémon.

### Pokémon sprites

- **Pokémon HeartGold/SoulSilver sprites** — the battle sprites used for heroes
  and enemies, sourced as individual files from the
  [PokeAPI sprites](https://github.com/PokeAPI/sprites) repository
  (`versions/generation-iv/heartgold-soulsilver`): **front** sprites in
  `public/assets/pokemon/` and **back** sprites (the player's buddy, including
  every reachable evolution) in `public/assets/pokemon/back/`. Pokémon, their
  sprites and names are © Nintendo / Game Freak / The Pokémon Company.
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
