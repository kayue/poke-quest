// Helpers for resolving static asset URLs served from /public/assets.

export function pokemonSrc(sprite: string) {
  return `/assets/pokemon/${sprite}`
}
export function backgroundSrc(bg: string) {
  return `/assets/backgrounds/${bg}`
}
export function effectSrc(name: string) {
  return `/assets/effects/${name}`
}
