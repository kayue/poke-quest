// Helpers for resolving static asset URLs served from /public/assets.

// Vite serves the app under import.meta.env.BASE_URL (e.g. "/poke-quest/" in
// production, "/" in dev). Prefix asset paths so they resolve under the base.
const BASE = import.meta.env.BASE_URL

export function assetSrc(path: string) {
  return `${BASE}assets/${path}`
}

export function pokemonSrc(sprite: string) {
  return assetSrc(`pokemon/${sprite}`)
}
/** Back sprite (used for the player's buddy in battle). Heroes only. */
export function pokemonBackSrc(sprite: string) {
  return assetSrc(`pokemon/back/${sprite}`)
}
export function backgroundSrc(bg: string) {
  return assetSrc(`backgrounds/${bg}`)
}
export function effectSrc(name: string) {
  return assetSrc(`effects/${name}`)
}
