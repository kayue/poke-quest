// Age-based maths problem generation, following a Reception → Year-6 curriculum
// (ages 5–10).
//
// Each *skill* is a tiny generator tagged with the domain it practises and the
// age at which that skill is introduced. When the player picks an age we build
// a weighted pool of skills:
//   • 50% of problems come from skills introduced *at* the chosen age,
//   • 20% from the previous age (revision), and
//   • 30% from the next age (a stretch).
// Missing neighbours — there is no age 4, nor an age 11 in this curriculum —
// fold their share back into the current age, so age 5 is 70% current / 30%
// stretch and age 10 is 80% current / 20% revision.
//
// Every skill must resolve to a single numeric answer, because the child answers
// by tapping a number tile. Domains that need pictures (Data & Statistics,
// most of Geometry) are therefore not represented here.

export type Domain =
  | 'Addition & Subtraction'
  | 'Multiplication & Division'
  | 'Counting & Cardinality'
  | 'Number Representation & Place Value'
  | 'Fractions'
  | 'Algebra'
  | 'Ratio & Proportion'

// A single token in the rendered question row. Exactly one 'blank' per question
// — the slot the child fills by tapping a tile.
export type Part =
  | { t: 'num'; v: number } // a number literal
  | { t: 'op'; v: string } // an operator: + − × ÷
  | { t: 'eq' } // the '=' sign (styled apart from operators)
  | { t: 'txt'; v: string } // a free-text label, e.g. "½ of", "10% of"
  | { t: 'blank' } // the answer slot

export interface Problem {
  parts: Part[]
  answer: number
  tiles: number[] // candidate answers to display in the grid
  domain: Domain
  skill: string // skill id (handy for debugging / future telemetry)
}

// ---- small RNG helpers ----
function randInt(min: number, max: number): number {
  // inclusive both ends
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// Build a set of tiles that includes the correct answer plus plausible
// near-miss distractors, all non-negative and distinct, laid out on a `step`
// grid (step 1 for whole numbers, 0.1 for tenths, 10/100/1000 for rounding).
function buildTiles(answer: number, count = 6, step = 1): number[] {
  const set = new Set<number>([answer])
  const offsets = [1, -1, 2, -2, 3, -3, 4, 5, -4, 10]
  let i = 0
  while (set.size < count && i < offsets.length) {
    const v = round1(answer + offsets[i] * step)
    if (v >= 0) set.add(v)
    i++
  }
  // Top up with random near values if the fixed offsets weren't enough.
  let guard = 0
  while (set.size < count && guard < 100) {
    const spread = Math.max(3, Math.round(Math.abs(answer) / step) || 3)
    const v = round1(answer + randInt(-spread, spread) * step)
    if (v >= 0) set.add(v)
    guard++
  }
  const tiles = Array.from(set).slice(0, count)
  // Shuffle (Fisher–Yates) so the answer isn't always first.
  for (let j = tiles.length - 1; j > 0; j--) {
    const k = randInt(0, j)
    ;[tiles[j], tiles[k]] = [tiles[k], tiles[j]]
  }
  return tiles
}

// What a skill generator returns. `tiles` is optional — when omitted we build
// whole-number distractors around the answer.
interface Gen {
  parts: Part[]
  answer: number
  tiles?: number[]
}

interface Skill {
  id: string
  domain: Domain
  age: number
  gen: () => Gen
}

// ---- part builders for the two common equation shapes ----

// a op b = ?   (find the answer)
function eqResult(a: number, op: string, b: number, answer: number): Gen {
  const parts: Part[] = [
    { t: 'num', v: a },
    { t: 'op', v: op },
    { t: 'num', v: b },
    { t: 'eq' },
    { t: 'blank' },
  ]
  return { parts, answer }
}

// ============================================================
//  The curriculum: skills grouped by the age they're introduced.
// ============================================================

const SKILLS: Skill[] = [
  // ---- Age 5 (Reception) ----
  {
    id: 'add-to-10',
    domain: 'Addition & Subtraction',
    age: 5,
    gen: () => {
      const answer = randInt(2, 10)
      const a = randInt(1, answer - 1)
      return eqResult(a, '+', answer - a, answer)
    },
  },
  {
    id: 'sub-within-10',
    domain: 'Addition & Subtraction',
    age: 5,
    gen: () => {
      const a = randInt(2, 10)
      const b = randInt(1, a)
      return eqResult(a, '−', b, a - b)
    },
  },
  {
    id: 'one-more-less',
    domain: 'Counting & Cardinality',
    age: 5,
    gen: () => {
      const n = randInt(1, 19)
      const more = Math.random() < 0.5
      const parts: Part[] = [
        { t: 'txt', v: more ? '1 more than' : '1 less than' },
        { t: 'num', v: n },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer: more ? n + 1 : n - 1 }
    },
  },
  {
    id: 'half-of',
    domain: 'Fractions',
    age: 5,
    gen: () => {
      const answer = randInt(1, 5)
      const parts: Part[] = [
        { t: 'txt', v: '½ of' },
        { t: 'num', v: answer * 2 },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer }
    },
  },
  {
    id: 'compose-to-1000',
    domain: 'Number Representation & Place Value',
    age: 5,
    gen: () => {
      const h = randInt(1, 9)
      const t = randInt(0, 9)
      const o = randInt(0, 9)
      const parts: Part[] = [
        { t: 'num', v: h },
        { t: 'txt', v: 'hundreds' },
        { t: 'num', v: t },
        { t: 'txt', v: 'tens' },
        { t: 'num', v: o },
        { t: 'txt', v: 'ones' },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer: h * 100 + t * 10 + o }
    },
  },

  // ---- Age 6 (Year 1) ----
  {
    id: 'add-to-100',
    domain: 'Addition & Subtraction',
    age: 6,
    gen: () => {
      const answer = randInt(5, 100)
      const a = randInt(1, answer - 1)
      return eqResult(a, '+', answer - a, answer)
    },
  },
  {
    id: 'sub-within-100',
    domain: 'Addition & Subtraction',
    age: 6,
    gen: () => {
      const a = randInt(5, 100)
      const b = randInt(1, a)
      return eqResult(a, '−', b, a - b)
    },
  },
  {
    id: 'tables-2-3-5-10',
    domain: 'Multiplication & Division',
    age: 6,
    gen: () => {
      const t = pick([2, 3, 5, 10])
      const b = randInt(1, 10)
      // Show the table either way round for variety (2 × 5 or 5 × 2).
      return Math.random() < 0.5
        ? eqResult(t, '×', b, t * b)
        : eqResult(b, '×', t, t * b)
    },
  },
  {
    id: 'skip-count',
    domain: 'Counting & Cardinality',
    age: 6,
    gen: () => {
      const step = randInt(2, 10)
      const start = step * randInt(1, 5)
      const parts: Part[] = [
        { t: 'num', v: start },
        { t: 'txt', v: ',' },
        { t: 'num', v: start + step },
        { t: 'txt', v: ',' },
        { t: 'num', v: start + 2 * step },
        { t: 'txt', v: ',' },
        { t: 'blank' },
      ]
      return { parts, answer: start + 3 * step }
    },
  },

  // ---- Age 7 (Year 2) ----
  {
    id: 'add-within-100',
    domain: 'Addition & Subtraction',
    age: 7,
    gen: () => {
      const a = randInt(10, 90)
      const b = randInt(10, 90)
      return eqResult(a, '+', b, a + b)
    },
  },
  {
    id: 'sub-within-100',
    domain: 'Addition & Subtraction',
    age: 7,
    gen: () => {
      const a = randInt(20, 99)
      const b = randInt(1, a)
      return eqResult(a, '−', b, a - b)
    },
  },
  {
    id: 'tables-3-4-6-8',
    domain: 'Multiplication & Division',
    age: 7,
    gen: () => {
      const t = pick([3, 4, 6, 8])
      const b = randInt(1, 12)
      return eqResult(t, '×', b, t * b)
    },
  },
  {
    id: 'unit-fraction-of',
    domain: 'Fractions',
    age: 7,
    gen: () => {
      const den = pick([2, 3, 4])
      const answer = randInt(2, 6)
      const label = den === 2 ? '½ of' : den === 3 ? '⅓ of' : '¼ of'
      const parts: Part[] = [
        { t: 'txt', v: label },
        { t: 'num', v: answer * den },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer }
    },
  },

  // ---- Age 8 (Year 3) ----
  {
    id: 'add-within-1000',
    domain: 'Addition & Subtraction',
    age: 8,
    gen: () => {
      const a = randInt(100, 500)
      const b = randInt(100, 499)
      return eqResult(a, '+', b, a + b)
    },
  },
  {
    id: 'sub-within-1000',
    domain: 'Addition & Subtraction',
    age: 8,
    gen: () => {
      const a = randInt(200, 999)
      const b = randInt(50, a)
      return eqResult(a, '−', b, a - b)
    },
  },
  {
    id: 'tables-to-12',
    domain: 'Multiplication & Division',
    age: 8,
    gen: () => {
      const a = randInt(2, 12)
      const b = randInt(2, 12)
      return eqResult(a, '×', b, a * b)
    },
  },
  {
    id: 'division-facts',
    domain: 'Multiplication & Division',
    age: 8,
    gen: () => {
      const b = randInt(2, 12)
      const q = randInt(2, 12)
      return eqResult(b * q, '÷', b, q)
    },
  },
  {
    id: 'round-to-10',
    domain: 'Number Representation & Place Value',
    age: 8,
    gen: () => {
      const n = randInt(11, 99)
      const answer = Math.round(n / 10) * 10
      const parts: Part[] = [
        { t: 'txt', v: 'Round' },
        { t: 'num', v: n },
        { t: 'txt', v: 'to nearest 10' },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer, tiles: buildTiles(answer, 6, 10) }
    },
  },

  // ---- Age 9 (Year 4) ----
  {
    id: 'add-large',
    domain: 'Addition & Subtraction',
    age: 9,
    gen: () => {
      const a = randInt(1000, 4000)
      const b = randInt(1000, 4000)
      return eqResult(a, '+', b, a + b)
    },
  },
  {
    id: 'multiply-2-digit',
    domain: 'Multiplication & Division',
    age: 9,
    gen: () => {
      const a = randInt(11, 30)
      const b = randInt(2, 9)
      return eqResult(a, '×', b, a * b)
    },
  },
  {
    id: 'round-to-100',
    domain: 'Number Representation & Place Value',
    age: 9,
    gen: () => {
      const n = randInt(101, 999)
      const answer = Math.round(n / 100) * 100
      const parts: Part[] = [
        { t: 'txt', v: 'Round' },
        { t: 'num', v: n },
        { t: 'txt', v: 'to nearest 100' },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer, tiles: buildTiles(answer, 6, 100) }
    },
  },
  {
    id: 'simple-percent',
    domain: 'Fractions',
    age: 9,
    gen: () => percentProblem([10, 25, 50]),
  },

  // ---- Age 10 (Year 5) ----
  {
    id: 'one-step-algebra',
    domain: 'Algebra',
    age: 10,
    gen: () => {
      const letter = pick(['a', 'b', 'n', 'x'])
      const answer = randInt(2, 20)
      if (Math.random() < 0.5) {
        const n = randInt(2, 20)
        const parts: Part[] = [
          { t: 'txt', v: `${letter} +` },
          { t: 'num', v: n },
          { t: 'eq' },
          { t: 'num', v: n + answer },
          { t: 'txt', v: `,  ${letter} =` },
          { t: 'blank' },
        ]
        return { parts, answer }
      }
      const n = randInt(2, 9)
      const parts: Part[] = [
        { t: 'num', v: n },
        { t: 'txt', v: `× ${letter} =` },
        { t: 'num', v: n * answer },
        { t: 'txt', v: `,  ${letter} =` },
        { t: 'blank' },
      ]
      return { parts, answer }
    },
  },
  {
    id: 'percent-of',
    domain: 'Ratio & Proportion',
    age: 10,
    gen: () => percentProblem([10, 20, 25, 50, 75]),
  },
  {
    id: 'order-of-operations',
    domain: 'Multiplication & Division',
    age: 10,
    gen: () => {
      const a = randInt(2, 9)
      const b = randInt(2, 6)
      const c = randInt(2, 6)
      const parts: Part[] = [
        { t: 'num', v: a },
        { t: 'op', v: '+' },
        { t: 'num', v: b },
        { t: 'op', v: '×' },
        { t: 'num', v: c },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer: a + b * c }
    },
  },
  {
    id: 'add-decimals',
    domain: 'Addition & Subtraction',
    age: 10,
    gen: () => {
      const a = round1(randInt(1, 20) / 10)
      const b = round1(randInt(1, 20) / 10)
      const answer = round1(a + b)
      return { ...eqResult(a, '+', b, answer), tiles: buildTiles(answer, 6, 0.1) }
    },
  },
  {
    id: 'round-to-1000',
    domain: 'Number Representation & Place Value',
    age: 10,
    gen: () => {
      const n = randInt(1001, 9999)
      const answer = Math.round(n / 1000) * 1000
      const parts: Part[] = [
        { t: 'txt', v: 'Round' },
        { t: 'num', v: n },
        { t: 'txt', v: 'to nearest 1000' },
        { t: 'eq' },
        { t: 'blank' },
      ]
      return { parts, answer, tiles: buildTiles(answer, 6, 1000) }
    },
  },
]

// Shared "p% of n = ?" generator. Picks a percentage and a value that divides
// evenly, so the answer is always a whole number.
function percentProblem(percents: number[]): Gen {
  const p = pick(percents)
  const base = randInt(2, 9)
  let n: number
  let answer: number
  switch (p) {
    case 10: n = base * 10; answer = base; break
    case 20: n = base * 5; answer = base; break
    case 25: n = base * 4; answer = base; break
    case 50: n = base * 2; answer = base; break
    default: n = base * 4; answer = base * 3; break // 75%
  }
  const parts: Part[] = [
    { t: 'txt', v: `${p}% of` },
    { t: 'num', v: n },
    { t: 'eq' },
    { t: 'blank' },
  ]
  return { parts, answer }
}

// ---- age-weighted skill selection ----

function skillsAt(age: number): Skill[] {
  return SKILLS.filter((s) => s.age === age)
}

// Choose a skill for the given age using the 10 / 55 / 35 (prev / current /
// next) split, folding any empty neighbour back into the current age.
function pickSkill(age: number): Skill {
  const current = skillsAt(age)
  const prev = skillsAt(age - 1)
  const next = skillsAt(age + 1)

  const wPrev = prev.length ? 0.1 : 0
  const wNext = next.length ? 0.35 : 0
  const wCurrent = 0.55 + (prev.length ? 0 : 0.1) + (next.length ? 0 : 0.35)

  const buckets = [
    { skills: current, w: wCurrent },
    { skills: prev, w: wPrev },
    { skills: next, w: wNext },
  ].filter((b) => b.skills.length > 0 && b.w > 0)

  const total = buckets.reduce((s, b) => s + b.w, 0)
  let roll = Math.random() * total
  for (const b of buckets) {
    if (roll < b.w) return pick(b.skills)
    roll -= b.w
  }
  return pick(current)
}

export function generateProblem(age: number, tileCount = 6): Problem {
  const skill = pickSkill(age)
  const g = skill.gen()
  return {
    parts: g.parts,
    answer: g.answer,
    tiles: g.tiles ?? buildTiles(g.answer, tileCount),
    domain: skill.domain,
    skill: skill.id,
  }
}
