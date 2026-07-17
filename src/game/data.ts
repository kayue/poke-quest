// Static game data: hero roster, enemy roster, stages, operation modes.

export type Operation = 'add' | 'sub' | 'mul' | 'mixed'

export interface Hero {
  id: string
  name: string
  sprite: string // filename in /assets/pokemon
  blurb: string
}

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

// ---- Playable heroes (kid-friendly starters) ----
export const HEROES: Hero[] = [
  { id: 'pikachu', name: 'Pikachu', sprite: 'pikachu.png', blurb: 'Zappy and brave!' },
  { id: 'charmander', name: 'Charmander', sprite: 'charmander.png', blurb: 'A fiery friend.' },
  { id: 'squirtle', name: 'Squirtle', sprite: 'squirtle.png', blurb: 'Cool and splashy.' },
  { id: 'bulbasaur', name: 'Bulbasaur', sprite: 'bulbasaur.png', blurb: 'Leafy and loyal.' },
  { id: 'eevee', name: 'Eevee', sprite: 'eevee.png', blurb: 'Fluffy and quick.' },
  { id: 'piplup', name: 'Piplup', sprite: 'piplup.png', blurb: 'A proud penguin.' },
]

// ---- Enemy definitions ----
export const ENEMIES: Record<string, EnemyDef> = {
  caterpie: { id: 'caterpie', name: 'Caterpie', sprite: 'caterpie.png', hp: 3 },
  weedle: { id: 'weedle', name: 'Weedle', sprite: 'weedle.png', hp: 3 },
  rattata: { id: 'rattata', name: 'Rattata', sprite: 'rattata.png', hp: 3 },
  pidgey: { id: 'pidgey', name: 'Pidgey', sprite: 'pidgey.png', hp: 3 },
  zubat: { id: 'zubat', name: 'Zubat', sprite: 'zubat.png', hp: 4 },
  diglett: { id: 'diglett', name: 'Diglett', sprite: 'diglett.png', hp: 3 },
  spearow: { id: 'spearow', name: 'Spearow', sprite: 'spearow.png', hp: 4 },
  ekans: { id: 'ekans', name: 'Ekans', sprite: 'ekans.png', hp: 4 },
  sandshrew: { id: 'sandshrew', name: 'Sandshrew', sprite: 'sandshrew.png', hp: 4 },
  geodude: { id: 'geodude', name: 'Geodude', sprite: 'geodude.png', hp: 4 },
  poliwag: { id: 'poliwag', name: 'Poliwag', sprite: 'poliwag.png', hp: 3 },
  oddish: { id: 'oddish', name: 'Oddish', sprite: 'oddish.png', hp: 3 },
  bellsprout: { id: 'bellsprout', name: 'Bellsprout', sprite: 'bellsprout.png', hp: 3 },
  tentacool: { id: 'tentacool', name: 'Tentacool', sprite: 'tentacool.png', hp: 4 },
  krabby: { id: 'krabby', name: 'Krabby', sprite: 'krabby.png', hp: 4 },
  voltorb: { id: 'voltorb', name: 'Voltorb', sprite: 'voltorb.png', hp: 4 },
  koffing: { id: 'koffing', name: 'Koffing', sprite: 'koffing.png', hp: 4 },
  meowth: { id: 'meowth', name: 'Meowth', sprite: 'meowth.png', hp: 4 },
  growlithe: { id: 'growlithe', name: 'Growlithe', sprite: 'growlithe.png', hp: 5 },
  ponyta: { id: 'ponyta', name: 'Ponyta', sprite: 'ponyta.png', hp: 5 },
  magikarp: { id: 'magikarp', name: 'Magikarp', sprite: 'magikarp.png', hp: 2 },
  psyduck: { id: 'psyduck', name: 'Psyduck', sprite: 'psyduck.png', hp: 4 },
  machop: { id: 'machop', name: 'Machop', sprite: 'machop.png', hp: 5 },
  gastly: { id: 'gastly', name: 'Gastly', sprite: 'gastly.png', hp: 4 },
  // Bosses
  onix: { id: 'onix', name: 'Onix', sprite: 'onix.png', hp: 6 },
  arcanine: { id: 'arcanine', name: 'Arcanine', sprite: 'arcanine.png', hp: 7 },
  machamp: { id: 'machamp', name: 'Machamp', sprite: 'machamp.png', hp: 7 },
  golem: { id: 'golem', name: 'Golem', sprite: 'golem.png', hp: 7 },
  lapras: { id: 'lapras', name: 'Lapras', sprite: 'lapras.png', hp: 7 },
  gengar: { id: 'gengar', name: 'Gengar', sprite: 'gengar.png', hp: 8 },
  gyarados: { id: 'gyarados', name: 'Gyarados', sprite: 'gyarados.png', hp: 8 },
  snorlax: { id: 'snorlax', name: 'Snorlax', sprite: 'snorlax.png', hp: 8 },
  dragonite: { id: 'dragonite', name: 'Dragonite', sprite: 'dragonite.png', hp: 9 },
  articuno: { id: 'articuno', name: 'Articuno', sprite: 'articuno.png', hp: 9 },
  zapdos: { id: 'zapdos', name: 'Zapdos', sprite: 'zapdos.png', hp: 9 },
  moltres: { id: 'moltres', name: 'Moltres', sprite: 'moltres.png', hp: 9 },
  charizard: { id: 'charizard', name: 'Charizard', sprite: 'charizard.png', hp: 10 },
  mewtwo: { id: 'mewtwo', name: 'Mewtwo', sprite: 'mewtwo.png', hp: 12 },
}

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

export const PLAYER_MAX_HEARTS = 5

export function pokemonSrc(sprite: string) {
  return `/assets/pokemon/${sprite}`
}
export function backgroundSrc(bg: string) {
  return `/assets/backgrounds/${bg}`
}
export function effectSrc(name: string) {
  return `/assets/effects/${name}`
}
