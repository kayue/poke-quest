// The Traditional Chinese stroke-order writing roster.
//
// Names and sprites come from the shared Pokédex (src/shared/pokedex.ts); this
// module only adds the writing-specific grading. A Pokémon joins the roster only
// when the stroke count of EVERY character in its name is known (see strokeData),
// so names containing symbols we can't render — e.g. the Ⅱ in 立方獸Ⅱ — drop out
// automatically.
//
// Difficulty is derived (see difficultyOf) from FAMILIARITY, not raw stroke
// count: characters a young child already recognises (COMMON_CHARS) are "free",
// and a name is graded only by the strokes of the NEW characters it introduces.
// So a name built entirely from familiar characters — 小火龍, 地鼠, 大食花, 鬼雀,
// 穿山鼠 — is Easy even though it has many strokes, because there's nothing new
// to learn; names full of rare characters fall into Hard.
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

// Characters a ~6-year-old Hong Kong child already recognises (numbers, nature,
// common animals, body parts, colours, family words, everyday verbs & objects).
// A name made only of these is "Easy" no matter how many strokes it has, because
// every character is already familiar — you're just writing words you know.
export const COMMON_CHARS = new Set(
  Array.from(
    // numbers & size / quantity
    '一二三六九十大小多少高長巨力半隻' +
      // nature & elements
      '火水山石土天日月星雷電風海地岩太陽光雲冰田' +
      // animals & creatures
      '牛馬羊龍魚鳥貓犬狗鼠蟲蛇象豬鹿熊雀雞鴨兔虎蛙獅獸蝶' +
      // body parts
      '口手頭毛尾角舌眼耳心牙腳拳' +
      // colours
      '白紅黑綠藍黃金銀' +
      // people & family
      '王子弟公主你我他人男女母哥' +
      // everyday verbs & adjectives & feelings
      '食飛怪呆傻穿化打走跑叫笑好新老快慢鬼美卡急凍恐迷護奉超幸福吉合噴喵哈麗神達磁' +
      // everyday objects
      '車球波蛋門花草果米飯貝' +
      // common name / phonetic characters
      '巴古伊利耿',
  ),
)

/** Learning load: total strokes of the DISTINCT *unfamiliar* characters — the
 *  new writing a name asks the child to learn. Familiar characters count as 0. */
export function learningLoad(nameZh: string): number {
  const seen = new Set(chineseChars(nameZh))
  return [...seen]
    .filter((c) => !COMMON_CHARS.has(c))
    .reduce((sum, c) => sum + charStrokes(c), 0)
}

// Difficulty thresholds on the unfamiliar-character load, tuned for a balanced
// spread (easy ~57 / medium ~108 / hard ~85 across the current roster).
const EASY_MAX = 8
const MEDIUM_MAX = 22

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
  easy: { label: '簡單', sub: 'Easy · familiar characters', emoji: '🌱' },
  medium: { label: '普通', sub: 'Medium', emoji: '⭐' },
  hard: { label: '困難', sub: 'Hard · lots of new characters', emoji: '🔥' },
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
