// Static data for the Maths Quest game: enemies and age levels.
// (The player's hero/buddy lives in src/shared/heroes.ts — shared by all games.)
//
// Enemies are drawn straight from the shared Pokédex (src/shared/pokedex.ts);
// this module only layers on the maths-specific HP (how many correct answers
// are needed to defeat each one). Bosses — flagged in the Pokédex — take twice
// as many correct answers as a regular Pokémon.
import { pokedexEntry, type PokedexEntry } from '../../shared/pokedex'

export interface EnemyDef {
  id: string
  name: string
  sprite: string
  hp: number // number of correct answers needed to defeat
}

// ---- Enemy HP ----
export const REGULAR_HP = 4 // correct answers to defeat a regular Pokémon
export const BOSS_HP = 8 // ...and a boss

function toEnemy(dex: PokedexEntry): EnemyDef {
  return {
    id: dex.id,
    name: dex.nameEn,
    sprite: dex.sprite,
    hp: dex.powerful ? BOSS_HP : REGULAR_HP,
  }
}

/** Build the battle-time enemy for a Pokédex id (throws if unknown). */
export function enemyDef(id: string): EnemyDef {
  const dex = pokedexEntry(id)
  if (!dex) throw new Error(`Unknown enemy id not in Pokédex: ${id}`)
  return toEnemy(dex)
}

// ---- Random adventures ----
// There's no stage select any more: each run picks a random background and a
// random line-up of 5 Pokémon (4 regular grunts + 1 boss to finish on).
export const BACKGROUNDS = ['background1.png', 'background2.png', 'background3.png']

// ---- Age levels ----
// The player picks their age; problem difficulty follows an age-based
// curriculum (see problems.ts). Each level draws 50% from skills introduced at
// that age, 20% from the age below, and 30% from the age above.
export interface AgeDef {
  age: number
  emoji: string
  blurb: string // what's newly introduced at this age
}

export const AGES: AgeDef[] = [
  { age: 5, emoji: '🐣', blurb: 'Add & take away to 10, halves, counting' },
  { age: 6, emoji: '🐥', blurb: 'Adding to 20, 2·5·10 tables, tens & ones' },
  { age: 7, emoji: '🦊', blurb: 'Sums to 100, more tables, fractions' },
  { age: 8, emoji: '🐯', blurb: 'Big sums, dividing, tables to 12, rounding' },
  { age: 9, emoji: '🦉', blurb: '2-digit ×, percentages, rounding to 100' },
  { age: 10, emoji: '🐲', blurb: 'Algebra, %, decimals, order of operations' },
]

export const PLAYER_MAX_HP = 100
export const PLAYER_HURT = 20 // HP lost per wrong answer (5 wrong answers = faint)
