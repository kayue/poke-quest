// Math problem generation for year 1-2 children.
// Produces a question and a set of answer tiles (one correct + distractors).

import type { Difficulty, Operation } from './data'

export interface Problem {
  a: number
  b: number
  op: Operation // resolved operation (never 'mixed')
  opSymbol: string
  answer: number
  // The prompt shown to the child. `missing` marks which slot is blank.
  // 'result'  -> a op b = ?       (find the answer)
  // 'operand' -> a op ? = result  (find the missing number)
  style: 'result' | 'operand'
  result: number // the value on the right side of '='
  tiles: number[] // candidate answers to display in the grid
}

const OP_SYMBOL: Record<Exclude<Operation, 'mixed'>, string> = {
  add: '+',
  sub: '−',
  mul: '×',
}

function randInt(min: number, max: number): number {
  // inclusive both ends
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

interface Ranges {
  addMax: number
  subMax: number
  mulTables: number[]
  mulMax: number // largest multiplier
  useMissing: boolean // include missing-operand style
}

function rangesFor(difficulty: Difficulty): Ranges {
  switch (difficulty) {
    case 'easy':
      return { addMax: 10, subMax: 10, mulTables: [2, 5, 10], mulMax: 5, useMissing: false }
    case 'medium':
      return { addMax: 20, subMax: 20, mulTables: [2, 3, 5, 10], mulMax: 10, useMissing: true }
    case 'hard':
      return { addMax: 50, subMax: 30, mulTables: [2, 3, 4, 5, 6, 10], mulMax: 12, useMissing: true }
  }
}

function makeAddition(r: Ranges): { a: number; b: number; answer: number } {
  const answer = randInt(2, r.addMax)
  const a = randInt(1, answer - 1)
  const b = answer - a
  return { a, b, answer }
}

function makeSubtraction(r: Ranges): { a: number; b: number; answer: number } {
  const a = randInt(2, r.subMax)
  const b = randInt(1, a) // keep result >= 0
  return { a, b, answer: a - b }
}

function makeMultiplication(r: Ranges): { a: number; b: number; answer: number } {
  const a = pick(r.mulTables)
  const b = randInt(1, r.mulMax)
  return { a, b, answer: a * b }
}

function resolveOp(op: Operation): Exclude<Operation, 'mixed'> {
  if (op === 'mixed') return pick(['add', 'sub', 'mul'] as const)
  return op
}

// Build a set of tiles that includes the correct answer and plausible
// near-miss distractors, all non-negative and distinct.
function buildTiles(answer: number, count: number): number[] {
  const set = new Set<number>([answer])
  const offsets = [1, -1, 2, -2, 3, -3, 4, 5, 10, -5]
  let i = 0
  while (set.size < count && i < offsets.length) {
    const v = answer + offsets[i]
    if (v >= 0) set.add(v)
    i++
  }
  // Top up with random values near the answer if still short.
  let guard = 0
  while (set.size < count && guard < 100) {
    const v = Math.max(0, answer + randInt(-Math.max(3, answer), Math.max(4, answer)))
    set.add(v)
    guard++
  }
  const tiles = Array.from(set)
  // Shuffle (Fisher-Yates)
  for (let j = tiles.length - 1; j > 0; j--) {
    const k = randInt(0, j)
    ;[tiles[j], tiles[k]] = [tiles[k], tiles[j]]
  }
  return tiles.slice(0, count)
}

export function generateProblem(
  op: Operation,
  difficulty: Difficulty,
  tileCount = 6,
): Problem {
  const r = rangesFor(difficulty)
  const resolved = resolveOp(op)

  let base: { a: number; b: number; answer: number }
  switch (resolved) {
    case 'add':
      base = makeAddition(r)
      break
    case 'sub':
      base = makeSubtraction(r)
      break
    case 'mul':
      base = makeMultiplication(r)
      break
  }

  // Decide the question style.
  // 'operand' (missing number) is only used sometimes and never for the youngest.
  const style: Problem['style'] =
    r.useMissing && Math.random() < 0.35 ? 'operand' : 'result'

  let tileAnswer: number
  let result: number
  if (style === 'result') {
    tileAnswer = base.answer
    result = base.answer
  } else {
    // a op ? = result  → the blank is `b`, result is the computed total.
    tileAnswer = base.b
    result = base.answer
  }

  return {
    a: base.a,
    b: base.b,
    op: resolved,
    opSymbol: OP_SYMBOL[resolved],
    answer: tileAnswer,
    style,
    result,
    tiles: buildTiles(tileAnswer, tileCount),
  }
}
