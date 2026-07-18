// Hong Kong names (香港譯名) of every Generation-1 (Kanto) Pokémon, used for the
// Traditional Chinese stroke-order writing practice.
//
// These are the classic Hong Kong / Cantonese names, NOT the newer unified names
// (e.g. 比卡超 not 皮卡丘, 伊貝 not 伊布, 背背龍 not 拉普拉斯, 車厘龜 not 傑尼龜).
//
// Difficulty is derived automatically (see difficultyOf) from the "learning load":
// the total strokes of the DISTINCT characters in the name. This rewards short and
// repeated/common names — e.g. 波波, 皮皮, 九尾, 蛋蛋 land in Easy — while long,
// stroke-heavy names fall into Hard.
import { charStrokes } from './strokeData'

export type WriteDifficulty = 'easy' | 'medium' | 'hard'

export interface WritingPokemon {
  id: string
  sprite: string // filename in /assets/pokemon
  nameZh: string // Hong Kong name in Traditional script
  english: string
}

export const WRITING_POKEMON: WritingPokemon[] = [
  { id: 'bulbasaur', sprite: 'bulbasaur.png', nameZh: '奇異種子', english: "Bulbasaur" },
  { id: 'ivysaur', sprite: 'ivysaur.png', nameZh: '奇異草', english: "Ivysaur" },
  { id: 'venusaur', sprite: 'venusaur.png', nameZh: '奇異花', english: "Venusaur" },
  { id: 'charmander', sprite: 'charmander.png', nameZh: '小火龍', english: "Charmander" },
  { id: 'charmeleon', sprite: 'charmeleon.png', nameZh: '火恐龍', english: "Charmeleon" },
  { id: 'charizard', sprite: 'charizard.png', nameZh: '噴火龍', english: "Charizard" },
  { id: 'squirtle', sprite: 'squirtle.png', nameZh: '車厘龜', english: "Squirtle" },
  { id: 'wartortle', sprite: 'wartortle.png', nameZh: '卡美龜', english: "Wartortle" },
  { id: 'blastoise', sprite: 'blastoise.png', nameZh: '水箭龜', english: "Blastoise" },
  { id: 'caterpie', sprite: 'caterpie.png', nameZh: '綠毛蟲', english: "Caterpie" },
  { id: 'metapod', sprite: 'metapod.png', nameZh: '鐵甲蟲', english: "Metapod" },
  { id: 'butterfree', sprite: 'butterfree.png', nameZh: '巴他蝶', english: "Butterfree" },
  { id: 'weedle', sprite: 'weedle.png', nameZh: '獨角蟲', english: "Weedle" },
  { id: 'kakuna', sprite: 'kakuna.png', nameZh: '鐵殼蛹', english: "Kakuna" },
  { id: 'beedrill', sprite: 'beedrill.png', nameZh: '大針蜂', english: "Beedrill" },
  { id: 'pidgey', sprite: 'pidgey.png', nameZh: '波波', english: "Pidgey" },
  { id: 'pidgeotto', sprite: 'pidgeotto.png', nameZh: '比比鳥', english: "Pidgeotto" },
  { id: 'pidgeot', sprite: 'pidgeot.png', nameZh: '大比鳥', english: "Pidgeot" },
  { id: 'rattata', sprite: 'rattata.png', nameZh: '小哥達', english: "Rattata" },
  { id: 'raticate', sprite: 'raticate.png', nameZh: '哥達', english: "Raticate" },
  { id: 'spearow', sprite: 'spearow.png', nameZh: '鬼雀', english: "Spearow" },
  { id: 'fearow', sprite: 'fearow.png', nameZh: '魔雀', english: "Fearow" },
  { id: 'ekans', sprite: 'ekans.png', nameZh: '阿柏蛇', english: "Ekans" },
  { id: 'arbok', sprite: 'arbok.png', nameZh: '阿柏怪', english: "Arbok" },
  { id: 'pikachu', sprite: 'pikachu.png', nameZh: '比卡超', english: "Pikachu" },
  { id: 'raichu', sprite: 'raichu.png', nameZh: '雷超', english: "Raichu" },
  { id: 'sandshrew', sprite: 'sandshrew.png', nameZh: '穿山鼠', english: "Sandshrew" },
  { id: 'sandslash', sprite: 'sandslash.png', nameZh: '穿山王', english: "Sandslash" },
  { id: 'nidoran-f', sprite: 'nidoran-f.png', nameZh: '尼美蘭', english: "Nidoran ♀" },
  { id: 'nidorina', sprite: 'nidorina.png', nameZh: '尼美羅', english: "Nidorina" },
  { id: 'nidoqueen', sprite: 'nidoqueen.png', nameZh: '尼美后', english: "Nidoqueen" },
  { id: 'nidoran-m', sprite: 'nidoran-m.png', nameZh: '尼多郎', english: "Nidoran ♂" },
  { id: 'nidorino', sprite: 'nidorino.png', nameZh: '尼多利', english: "Nidorino" },
  { id: 'nidoking', sprite: 'nidoking.png', nameZh: '尼多王', english: "Nidoking" },
  { id: 'clefairy', sprite: 'clefairy.png', nameZh: '皮皮', english: "Clefairy" },
  { id: 'clefable', sprite: 'clefable.png', nameZh: '皮可斯', english: "Clefable" },
  { id: 'vulpix', sprite: 'vulpix.png', nameZh: '六尾', english: "Vulpix" },
  { id: 'ninetales', sprite: 'ninetales.png', nameZh: '九尾', english: "Ninetales" },
  { id: 'jigglypuff', sprite: 'jigglypuff.png', nameZh: '波波球', english: "Jigglypuff" },
  { id: 'wigglytuff', sprite: 'wigglytuff.png', nameZh: '肥波球', english: "Wigglytuff" },
  { id: 'zubat', sprite: 'zubat.png', nameZh: '波音蝠', english: "Zubat" },
  { id: 'golbat', sprite: 'golbat.png', nameZh: '大口蝠', english: "Golbat" },
  { id: 'oddish', sprite: 'oddish.png', nameZh: '行路草', english: "Oddish" },
  { id: 'gloom', sprite: 'gloom.png', nameZh: '怪味花', english: "Gloom" },
  { id: 'vileplume', sprite: 'vileplume.png', nameZh: '霸王花', english: "Vileplume" },
  { id: 'paras', sprite: 'paras.png', nameZh: '蘑菇蟲', english: "Paras" },
  { id: 'parasect', sprite: 'parasect.png', nameZh: '巨菇蟲', english: "Parasect" },
  { id: 'venonat', sprite: 'venonat.png', nameZh: '毛毛蟲', english: "Venonat" },
  { id: 'venomoth', sprite: 'venomoth.png', nameZh: '魔魯風', english: "Venomoth" },
  { id: 'diglett', sprite: 'diglett.png', nameZh: '地鼠', english: "Diglett" },
  { id: 'dugtrio', sprite: 'dugtrio.png', nameZh: '三頭地鼠', english: "Dugtrio" },
  { id: 'meowth', sprite: 'meowth.png', nameZh: '喵喵怪', english: "Meowth" },
  { id: 'persian', sprite: 'persian.png', nameZh: '高竇貓', english: "Persian" },
  { id: 'psyduck', sprite: 'psyduck.png', nameZh: '傻鴨', english: "Psyduck" },
  { id: 'golduck', sprite: 'golduck.png', nameZh: '高超鴨', english: "Golduck" },
  { id: 'mankey', sprite: 'mankey.png', nameZh: '猴怪', english: "Mankey" },
  { id: 'primeape', sprite: 'primeape.png', nameZh: '火爆猴', english: "Primeape" },
  { id: 'growlithe', sprite: 'growlithe.png', nameZh: '護主犬', english: "Growlithe" },
  { id: 'arcanine', sprite: 'arcanine.png', nameZh: '奉神犬', english: "Arcanine" },
  { id: 'poliwag', sprite: 'poliwag.png', nameZh: '蚊香蝌蚪', english: "Poliwag" },
  { id: 'poliwhirl', sprite: 'poliwhirl.png', nameZh: '蚊香蛙', english: "Poliwhirl" },
  { id: 'poliwrath', sprite: 'poliwrath.png', nameZh: '大力蛙', english: "Poliwrath" },
  { id: 'abra', sprite: 'abra.png', nameZh: '卡斯', english: "Abra" },
  { id: 'kadabra', sprite: 'kadabra.png', nameZh: '尤基納', english: "Kadabra" },
  { id: 'alakazam', sprite: 'alakazam.png', nameZh: '富迪', english: "Alakazam" },
  { id: 'machop', sprite: 'machop.png', nameZh: '鐵腕', english: "Machop" },
  { id: 'machoke', sprite: 'machoke.png', nameZh: '大力', english: "Machoke" },
  { id: 'machamp', sprite: 'machamp.png', nameZh: '怪力', english: "Machamp" },
  { id: 'bellsprout', sprite: 'bellsprout.png', nameZh: '喇叭芽', english: "Bellsprout" },
  { id: 'weepinbell', sprite: 'weepinbell.png', nameZh: '口呆花', english: "Weepinbell" },
  { id: 'victreebel', sprite: 'victreebel.png', nameZh: '大食花', english: "Victreebel" },
  { id: 'tentacool', sprite: 'tentacool.png', nameZh: '大眼水母', english: "Tentacool" },
  { id: 'tentacruel', sprite: 'tentacruel.png', nameZh: '多腳水母', english: "Tentacruel" },
  { id: 'geodude', sprite: 'geodude.png', nameZh: '小拳石', english: "Geodude" },
  { id: 'graveler', sprite: 'graveler.png', nameZh: '滾動石', english: "Graveler" },
  { id: 'golem', sprite: 'golem.png', nameZh: '滾動岩', english: "Golem" },
  { id: 'ponyta', sprite: 'ponyta.png', nameZh: '小火馬', english: "Ponyta" },
  { id: 'rapidash', sprite: 'rapidash.png', nameZh: '烈焰馬', english: "Rapidash" },
  { id: 'slowpoke', sprite: 'slowpoke.png', nameZh: '小呆獸', english: "Slowpoke" },
  { id: 'slowbro', sprite: 'slowbro.png', nameZh: '大呆獸', english: "Slowbro" },
  { id: 'magnemite', sprite: 'magnemite.png', nameZh: '小磁怪', english: "Magnemite" },
  { id: 'magneton', sprite: 'magneton.png', nameZh: '三合一磁怪', english: "Magneton" },
  { id: 'farfetchd', sprite: 'farfetchd.png', nameZh: '火蔥鴨', english: "Farfetch'd" },
  { id: 'doduo', sprite: 'doduo.png', nameZh: '多多', english: "Doduo" },
  { id: 'dodrio', sprite: 'dodrio.png', nameZh: '多多利', english: "Dodrio" },
  { id: 'seel', sprite: 'seel.png', nameZh: '小海獅', english: "Seel" },
  { id: 'dewgong', sprite: 'dewgong.png', nameZh: '白海獅', english: "Dewgong" },
  { id: 'grimer', sprite: 'grimer.png', nameZh: '爛泥怪', english: "Grimer" },
  { id: 'muk', sprite: 'muk.png', nameZh: '爛泥獸', english: "Muk" },
  { id: 'shellder', sprite: 'shellder.png', nameZh: '貝殼怪', english: "Shellder" },
  { id: 'cloyster', sprite: 'cloyster.png', nameZh: '鐵甲貝', english: "Cloyster" },
  { id: 'gastly', sprite: 'gastly.png', nameZh: '鬼斯', english: "Gastly" },
  { id: 'haunter', sprite: 'haunter.png', nameZh: '鬼斯通', english: "Haunter" },
  { id: 'gengar', sprite: 'gengar.png', nameZh: '耿鬼', english: "Gengar" },
  { id: 'onix', sprite: 'onix.png', nameZh: '大岩蛇', english: "Onix" },
  { id: 'drowzee', sprite: 'drowzee.png', nameZh: '食夢獸', english: "Drowzee" },
  { id: 'hypno', sprite: 'hypno.png', nameZh: '催眠獸', english: "Hypno" },
  { id: 'krabby', sprite: 'krabby.png', nameZh: '大鉗蟹', english: "Krabby" },
  { id: 'kingler', sprite: 'kingler.png', nameZh: '巨鉗蟹', english: "Kingler" },
  { id: 'voltorb', sprite: 'voltorb.png', nameZh: '霹靂彈', english: "Voltorb" },
  { id: 'electrode', sprite: 'electrode.png', nameZh: '雷霆彈', english: "Electrode" },
  { id: 'exeggcute', sprite: 'exeggcute.png', nameZh: '蛋蛋', english: "Exeggcute" },
  { id: 'exeggutor', sprite: 'exeggutor.png', nameZh: '椰樹獸', english: "Exeggutor" },
  { id: 'cubone', sprite: 'cubone.png', nameZh: '卡拉卡拉', english: "Cubone" },
  { id: 'marowak', sprite: 'marowak.png', nameZh: '格拉格拉', english: "Marowak" },
  { id: 'hitmonlee', sprite: 'hitmonlee.png', nameZh: '沙古拉', english: "Hitmonlee" },
  { id: 'hitmonchan', sprite: 'hitmonchan.png', nameZh: '比華拉', english: "Hitmonchan" },
  { id: 'lickitung', sprite: 'lickitung.png', nameZh: '大舌頭', english: "Lickitung" },
  { id: 'koffing', sprite: 'koffing.png', nameZh: '毒氣丸', english: "Koffing" },
  { id: 'weezing', sprite: 'weezing.png', nameZh: '毒氣雙子', english: "Weezing" },
  { id: 'rhyhorn', sprite: 'rhyhorn.png', nameZh: '鐵甲犀牛', english: "Rhyhorn" },
  { id: 'rhydon', sprite: 'rhydon.png', nameZh: '鐵甲暴龍', english: "Rhydon" },
  { id: 'chansey', sprite: 'chansey.png', nameZh: '吉利蛋', english: "Chansey" },
  { id: 'tangela', sprite: 'tangela.png', nameZh: '長藤怪', english: "Tangela" },
  { id: 'kangaskhan', sprite: 'kangaskhan.png', nameZh: '袋獸', english: "Kangaskhan" },
  { id: 'horsea', sprite: 'horsea.png', nameZh: '噴墨海馬', english: "Horsea" },
  { id: 'seadra', sprite: 'seadra.png', nameZh: '飛刺海馬', english: "Seadra" },
  { id: 'goldeen', sprite: 'goldeen.png', nameZh: '獨角金魚', english: "Goldeen" },
  { id: 'seaking', sprite: 'seaking.png', nameZh: '金魚王', english: "Seaking" },
  { id: 'staryu', sprite: 'staryu.png', nameZh: '海星星', english: "Staryu" },
  { id: 'starmie', sprite: 'starmie.png', nameZh: '寶石海星', english: "Starmie" },
  { id: 'mr-mime', sprite: 'mr-mime.png', nameZh: '吸盤小丑', english: "Mr. Mime" },
  { id: 'scyther', sprite: 'scyther.png', nameZh: '飛天螳螂', english: "Scyther" },
  { id: 'jynx', sprite: 'jynx.png', nameZh: '紅唇娃', english: "Jynx" },
  { id: 'electabuzz', sprite: 'electabuzz.png', nameZh: '電擊獸', english: "Electabuzz" },
  { id: 'magmar', sprite: 'magmar.png', nameZh: '鴨嘴火龍', english: "Magmar" },
  { id: 'pinsir', sprite: 'pinsir.png', nameZh: '鉗刀甲蟲', english: "Pinsir" },
  { id: 'tauros', sprite: 'tauros.png', nameZh: '大隻牛', english: "Tauros" },
  { id: 'magikarp', sprite: 'magikarp.png', nameZh: '鯉魚王', english: "Magikarp" },
  { id: 'gyarados', sprite: 'gyarados.png', nameZh: '鯉魚龍', english: "Gyarados" },
  { id: 'lapras', sprite: 'lapras.png', nameZh: '背背龍', english: "Lapras" },
  { id: 'ditto', sprite: 'ditto.png', nameZh: '百變怪', english: "Ditto" },
  { id: 'eevee', sprite: 'eevee.png', nameZh: '伊貝', english: "Eevee" },
  { id: 'vaporeon', sprite: 'vaporeon.png', nameZh: '水伊貝', english: "Vaporeon" },
  { id: 'jolteon', sprite: 'jolteon.png', nameZh: '雷伊貝', english: "Jolteon" },
  { id: 'flareon', sprite: 'flareon.png', nameZh: '火伊貝', english: "Flareon" },
  { id: 'porygon', sprite: 'porygon.png', nameZh: '立方獸', english: "Porygon" },
  { id: 'omanyte', sprite: 'omanyte.png', nameZh: '菊石獸', english: "Omanyte" },
  { id: 'omastar', sprite: 'omastar.png', nameZh: '多刺菊石獸', english: "Omastar" },
  { id: 'kabuto', sprite: 'kabuto.png', nameZh: '萬年蟲', english: "Kabuto" },
  { id: 'kabutops', sprite: 'kabutops.png', nameZh: '鐮刀蟲', english: "Kabutops" },
  { id: 'aerodactyl', sprite: 'aerodactyl.png', nameZh: '化石飛龍', english: "Aerodactyl" },
  { id: 'snorlax', sprite: 'snorlax.png', nameZh: '卡比獸', english: "Snorlax" },
  { id: 'articuno', sprite: 'articuno.png', nameZh: '急凍鳥', english: "Articuno" },
  { id: 'zapdos', sprite: 'zapdos.png', nameZh: '雷鳥', english: "Zapdos" },
  { id: 'moltres', sprite: 'moltres.png', nameZh: '火鳥', english: "Moltres" },
  { id: 'dratini', sprite: 'dratini.png', nameZh: '迷你龍', english: "Dratini" },
  { id: 'dragonair', sprite: 'dragonair.png', nameZh: '哈古龍', english: "Dragonair" },
  { id: 'dragonite', sprite: 'dragonite.png', nameZh: '啟暴龍', english: "Dragonite" },
  { id: 'mewtwo', sprite: 'mewtwo.png', nameZh: '超夢夢', english: "Mewtwo" },
  { id: 'mew', sprite: 'mew.png', nameZh: '夢夢', english: "Mew" },
]

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
