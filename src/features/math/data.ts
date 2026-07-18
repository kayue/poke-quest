// Static data for the Maths Quest game: enemies, stages, age levels.
// (The player's hero/buddy lives in src/shared/heroes.ts — shared by all games.)
//
// Enemy names and sprites come from the shared Pokédex (src/shared/pokedex.ts);
// this module only adds the maths-specific HP (how many correct answers are
// needed to defeat each one) and arranges them into stages.
import { pokedexEntry } from '../../shared/pokedex'

export interface EnemyDef {
  id: string
  name: string
  sprite: string
  hp: number // number of correct answers needed to defeat
}

// ---- Enemy definitions ----
// Maths-specific HP per enemy id; name + sprite are pulled from the Pokédex.
const ENEMY_HP: Record<string, number> = {
  caterpie: 3, weedle: 3, rattata: 3, pidgey: 3, zubat: 4, diglett: 3,
  spearow: 4, ekans: 4, sandshrew: 4, geodude: 4, poliwag: 3, oddish: 3,
  bellsprout: 3, tentacool: 4, krabby: 4, voltorb: 4, koffing: 4, meowth: 4,
  growlithe: 5, ponyta: 5, magikarp: 2, psyduck: 4, machop: 5, gastly: 4,
  // Bosses
  onix: 6, arcanine: 7, machamp: 7, golem: 7, lapras: 7, gengar: 8,
  gyarados: 8, snorlax: 8, dragonite: 9, articuno: 9, zapdos: 9, moltres: 9,
  charizard: 10, mewtwo: 12,
}

export const ENEMIES: Record<string, EnemyDef> = Object.fromEntries(
  Object.entries(ENEMY_HP).map(([id, hp]) => {
    const dex = pokedexEntry(id)
    if (!dex) throw new Error(`Unknown enemy id not in Pokédex: ${id}`)
    return [id, { id, name: dex.nameEn, sprite: dex.sprite, hp }]
  }),
)

// ---- Random adventures ----
// There's no stage select any more: each run picks a random background and a
// random line-up of 5 Pokémon (4 regular grunts + 1 boss to finish on).
export const BACKGROUNDS = ['background1.png', 'background2.png', 'background3.png']

export const BOSS_IDS = [
  'onix', 'arcanine', 'machamp', 'golem', 'lapras', 'gengar', 'gyarados',
  'snorlax', 'dragonite', 'articuno', 'zapdos', 'moltres', 'charizard', 'mewtwo',
]

export const REGULAR_IDS = Object.keys(ENEMY_HP).filter((id) => !BOSS_IDS.includes(id))

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
