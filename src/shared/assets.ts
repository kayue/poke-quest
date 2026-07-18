// Helpers for resolving static asset URLs served from /public/assets.

export function pokemonSrc(sprite: string) {
  return `/assets/pokemon/${sprite}`
}
/** Back sprite (used for the player's buddy in battle). Heroes only. */
export function pokemonBackSrc(sprite: string) {
  return `/assets/pokemon/back/${sprite}`
}
export function backgroundSrc(bg: string) {
  return `/assets/backgrounds/${bg}`
}
export function effectSrc(name: string) {
  return `/assets/effects/${name}`
}
