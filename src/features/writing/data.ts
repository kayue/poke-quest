// The Traditional Chinese stroke-order writing roster.
//
// Names and sprites come from the shared Pokédex (src/shared/pokedex.ts); this
// module only adds the writing-specific grading. A Pokémon joins the roster only
// when the stroke count of EVERY character in its name is known (see strokeData),
// so names containing symbols we can't render — e.g. the Ⅱ in 立方獸Ⅱ — drop out
// automatically.
//
// Difficulty is derived (see difficultyOf) from the "learning load": the total
// strokes of the DISTINCT characters in the name. This rewards short and
// repeated/common names — e.g. 波波, 皮皮, 九尾, 蛋蛋 land in Easy — while long,
// stroke-heavy names fall into Hard.
import { charStrokes, STROKES } from './strokeData'
import { POKEDEX, type PokedexEntry } from '../../shared/pokedex'

export type WriteDifficulty = 'easy' | 'medium' | 'hard'

export interface WritingPokemon {
  id: string
  sprite: string // filename in /assets/pokemon
  nameZh: string // Traditional Chinese name
  english: string
}

/** True when every character of the name has a known stroke count. */
function isWritable(entry: PokedexEntry): boolean {
  return Array.from(entry.nameZh).every((c) => c in STROKES)
}

export const WRITING_POKEMON: WritingPokemon[] = POKEDEX.filter(isWritable).map(
  (p) => ({ id: p.id, sprite: p.sprite, nameZh: p.nameZh, english: p.nameEn }),
)

/** Split a name into its individual Chinese characters. */
export function chineseChars(nameZh: string): string[] {
  return Array.from(nameZh)
}

/** Total strokes across the whole name (repeats counted). */
export function totalStrokes(nameZh: string): number {
  return chineseChars(nameZh).reduce((sum, c) => sum + charStrokes(c), 0)
}

/** Learning load: total strokes of the DISTINCT characters in the name. */
export function learningLoad(nameZh: string): number {
  const seen = new Set(chineseChars(nameZh))
  return [...seen].reduce((sum, c) => sum + charStrokes(c), 0)
}

// Difficulty thresholds on learning load, tuned for a balanced spread.
const EASY_MAX = 18
const MEDIUM_MAX = 30

export function difficultyOf(nameZh: string): WriteDifficulty {
  const load = learningLoad(nameZh)
  if (load <= EASY_MAX) return 'easy'
  if (load <= MEDIUM_MAX) return 'medium'
  return 'hard'
}

export const DIFFICULTY_META: Record<
  WriteDifficulty,
  { label: string; sub: string; emoji: string }
> = {
  easy: { label: '簡單', sub: 'Easy · short & common', emoji: '🌱' },
  medium: { label: '普通', sub: 'Medium', emoji: '⭐' },
  hard: { label: '困難', sub: 'Hard · lots of strokes', emoji: '🔥' },
}

/** Pokémon of a given difficulty, easiest (fewest strokes) first. */
export function pokemonByDifficulty(d: WriteDifficulty): WritingPokemon[] {
  return WRITING_POKEMON.filter((p) => difficultyOf(p.nameZh) === d).sort(
    (a, b) => totalStrokes(a.nameZh) - totalStrokes(b.nameZh),
  )
}

/** Look up a Pokémon by its id. */
export function pokemonById(id: string): WritingPokemon | undefined {
  return WRITING_POKEMON.find((p) => p.id === id)
}
