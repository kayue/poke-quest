// The player's training progress: how much EXP each buddy has earned, which
// buddy is active, and how EXP maps to levels and evolutions. Every buddy in the
// roster levels up independently, so a child can raise several Pokémon at once.
//
// Persisted to localStorage so progress survives a page reload.

import { HEROES } from './heroes'
import { evolvedSpecies, pokedexEntry } from './pokedex'

// ---- Leveling curve ----
// EXP is granted by each game from its own unit of practice (Maths: 1 per
// problem solved; Writing: 1 per stroke written). The amount needed to advance
// grows by 5 each level, so:
//   Lv1 → Lv2: 5 EXP, Lv2 → Lv3: 10, Lv3 → Lv4: 15, … (5 × current level).
// Every level therefore costs a little more than the last.
const EXP_PER_LEVEL_STEP = 5

export function expToNext(level: number): number {
  return EXP_PER_LEVEL_STEP * level
}

export interface LevelInfo {
  level: number
  expIntoLevel: number // EXP earned since reaching `level`
  expForNext: number // EXP required to reach `level + 1`
  totalExp: number
}

/** Convert a buddy's lifetime EXP total into a level + progress toward the next. */
export function levelFromExp(totalExp: number): LevelInfo {
  let level = 1
  let remaining = Math.max(0, Math.floor(totalExp))
  while (remaining >= expToNext(level)) {
    remaining -= expToNext(level)
    level++
  }
  return { level, expIntoLevel: remaining, expForNext: expToNext(level), totalExp }
}

// EXP rewards are defined by each game, not here: the Maths Quest grants 1 EXP
// per problem solved, and the Writing game grants 1 EXP per stroke written. Both
// simply call the awardExp callback with the amount earned.

// ---- Roster & persistence ----
export interface OwnedMon {
  baseId: string // the starter species id — a stable key that never changes
  exp: number // lifetime EXP earned by this buddy
}

export interface RosterState {
  selectedId: string // baseId of the active buddy
  mons: Record<string, OwnedMon> // keyed by baseId
}

const STORAGE_KEY = 'poke-quest:progress:v1'

/** A fresh roster: every hero owned at 0 EXP, the first one selected. */
export function defaultRoster(): RosterState {
  const mons: Record<string, OwnedMon> = {}
  for (const h of HEROES) mons[h.id] = { baseId: h.id, exp: 0 }
  return { selectedId: HEROES[0].id, mons }
}

/** Load saved progress, tolerating missing/corrupt data and roster changes
 *  (new heroes start at 0; unknown saved ids are dropped). */
export function loadRoster(): RosterState {
  const base = defaultRoster()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<RosterState> | null
    const mons = { ...base.mons }
    if (parsed && typeof parsed === 'object' && parsed.mons) {
      for (const h of HEROES) {
        const saved = parsed.mons[h.id]
        if (saved && typeof saved.exp === 'number' && saved.exp >= 0) {
          mons[h.id] = { baseId: h.id, exp: Math.floor(saved.exp) }
        }
      }
    }
    const selectedId =
      typeof parsed?.selectedId === 'string' && mons[parsed.selectedId]
        ? parsed.selectedId
        : base.selectedId
    return { selectedId, mons }
  } catch {
    return base
  }
}

export function saveRoster(state: RosterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode / quota) — progress just won't persist.
  }
}

// ---- Resolved buddy (for display) ----
// A buddy's *current* species depends on its level, so we resolve name, sprite,
// level and EXP progress together into one view object the UI can render.
export interface Buddy {
  baseId: string // stable roster key (the starter species)
  speciesId: string // current species after applying evolutions
  name: string
  sprite: string // front-sprite filename in /assets/pokemon
  exp: number
  level: number
  expIntoLevel: number
  expForNext: number
  expPct: number // 0–100, progress toward the next level
}

export function resolveBuddy(mon: OwnedMon): Buddy {
  const info = levelFromExp(mon.exp)
  const speciesId = evolvedSpecies(mon.baseId, info.level)
  const dex = pokedexEntry(speciesId)
  const hero = HEROES.find((h) => h.id === mon.baseId)
  return {
    baseId: mon.baseId,
    speciesId,
    name: dex?.nameEn ?? hero?.name ?? mon.baseId,
    sprite: dex?.sprite ?? hero?.sprite ?? `${mon.baseId}.png`,
    exp: mon.exp,
    level: info.level,
    expIntoLevel: info.expIntoLevel,
    expForNext: info.expForNext,
    expPct: Math.round((info.expIntoLevel / info.expForNext) * 100),
  }
}
