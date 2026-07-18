// Static data for the Maths Quest game: enemies, stages, modes.
// (The player's hero/buddy lives in src/shared/heroes.ts — shared by all modes.)
//
// Enemy names and sprites come from the shared Pokédex (src/shared/pokedex.ts);
// this module only adds the maths-specific HP (how many correct answers are
// needed to defeat each one) and arranges them into stages.
import { pokedexEntry } from '../../shared/pokedex'

export type Operation = 'add' | 'sub' | 'mul' | 'mixed'

export interface EnemyDef {
  id: string
  name: string
  sprite: string
  hp: number // number of correct answers needed to defeat
}

export interface Stage {
  id: number
  name: string
  background: string // filename in /assets/backgrounds
  enemies: string[] // enemy ids, last one is the boss
}

export interface ModeDef {
  id: Operation
  label: string
  emoji: string
  desc: string
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

// ---- Stages (dungeons) ----
export const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Viridian Forest',
    background: 'background1.png',
    enemies: ['caterpie', 'weedle', 'rattata', 'onix'],
  },
  {
    id: 2,
    name: 'Rocky Cave',
    background: 'background3.png',
    enemies: ['zubat', 'geodude', 'diglett', 'machop', 'golem'],
  },
  {
    id: 3,
    name: 'Sunny Meadow',
    background: 'background2.png',
    enemies: ['oddish', 'bellsprout', 'ponyta', 'growlithe', 'arcanine'],
  },
  {
    id: 4,
    name: 'Misty Lake',
    background: 'background2.png',
    enemies: ['poliwag', 'tentacool', 'krabby', 'psyduck', 'gyarados'],
  },
  {
    id: 5,
    name: 'Spooky Tower',
    background: 'background3.png',
    enemies: ['gastly', 'koffing', 'voltorb', 'meowth', 'gengar'],
  },
  {
    id: 6,
    name: 'Champion Peak',
    background: 'background1.png',
    enemies: ['snorlax', 'lapras', 'dragonite', 'charizard', 'mewtwo'],
  },
]

export const MODES: ModeDef[] = [
  { id: 'add', label: 'Adding', emoji: '➕', desc: '3 + 4 = ?' },
  { id: 'sub', label: 'Subtracting', emoji: '➖', desc: '9 − 5 = ?' },
  { id: 'mul', label: 'Times Tables', emoji: '✖️', desc: '2 × 5 = ?' },
  { id: 'mixed', label: 'Mixed', emoji: '🎲', desc: 'A bit of everything!' },
]

export type Difficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTIES: { id: Difficulty; label: string; emoji: string }[] = [
  { id: 'easy', label: 'Easy', emoji: '🌱' },
  { id: 'medium', label: 'Medium', emoji: '⭐' },
  { id: 'hard', label: 'Hard', emoji: '🔥' },
]

export const PLAYER_MAX_HP = 100
export const PLAYER_HURT = 20 // HP lost per wrong answer (5 wrong answers = faint)
