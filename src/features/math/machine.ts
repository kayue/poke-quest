// XState v5 machine for the Maths Quest activity:
// age -> battle -> victory/defeat -> exit
// (The buddy hero is chosen on the home screen and passed in as input.)
import { setup, assign } from 'xstate'
import { BACKGROUNDS, enemyDef, PLAYER_MAX_HP, PLAYER_HURT, type EnemyDef } from './data'
import { BOSS_POKEMON, REGULAR_POKEMON } from '../../shared/pokedex'
import type { Hero } from '../../shared/heroes'
import { generateProblem, type Problem } from './problems'

export interface EnemyRuntime {
  def: EnemyDef
  hp: number
  maxHp: number
}

export interface GameContext {
  age: number
  hero: Hero | null
  background: string
  enemyOrder: string[]
  enemyPos: number
  enemy: EnemyRuntime | null
  problem: Problem | null
  hp: number
  score: number
  defeated: number
  solved: number // correct answers this run — the Maths Quest's EXP unit
  lastAnswerCorrect: boolean | null
  lastSelected: number | null
  attackEffect: string
}

export type GameEvent =
  | { type: 'SELECT_AGE'; age: number }
  | { type: 'ANSWER'; value: number }
  | { type: 'TIMEOUT' }
  | { type: 'BACK' }
  | { type: 'HOME' }
  | { type: 'RETRY' }

const NUM_EFFECTS = 7

function chooseEffect(): string {
  return `attack${1 + Math.floor(Math.random() * NUM_EFFECTS)}.png`
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Roll a fresh adventure: a random background and a random line-up of
 *  5 Pokémon — 4 regular grunts followed by a boss to finish on. */
function randomAdventure(): { background: string; enemyOrder: string[] } {
  const grunts = [...REGULAR_POKEMON].sort(() => Math.random() - 0.5).slice(0, 4)
  return {
    background: pick(BACKGROUNDS),
    enemyOrder: [...grunts.map((p) => p.id), pick(BOSS_POKEMON).id],
  }
}

function spawnEnemy(ctx: GameContext): EnemyRuntime {
  const id = ctx.enemyOrder[ctx.enemyPos] ?? ctx.enemyOrder[0]
  const def = enemyDef(id)
  return { def, hp: def.hp, maxHp: def.hp }
}

function freshProblem(ctx: GameContext): Problem {
  return generateProblem(ctx.age)
}

const initialContext: GameContext = {
  age: 5,
  hero: null,
  background: 'background1.png',
  enemyOrder: [],
  enemyPos: 0,
  enemy: null,
  problem: null,
  hp: PLAYER_MAX_HP,
  score: 0,
  defeated: 0,
  solved: 0,
  lastAnswerCorrect: null,
  lastSelected: null,
  attackEffect: 'attack1.png',
}

// Animation / pacing durations (ms)
const T_INTRO = 800
const T_CORRECT = 950
// Linger after a wrong answer so the child can study the highlighted
// correct tile before the next problem appears.
const T_WRONG = 3000
// Brief "Time's up!" beat after the answer timer runs out.
const T_TIMEOUT = 1000
const T_FAINT = 1100

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    input: {} as { hero: Hero },
  },
  guards: {
    isCorrect: ({ context, event }) =>
      event.type === 'ANSWER' && !!context.problem && event.value === context.problem.answer,
    enemyDown: ({ context }) => !!context.enemy && context.enemy.hp <= 0,
    playerDead: ({ context }) => context.hp <= 0,
    wasLastEnemy: ({ context }) =>
      context.enemyPos + 1 >= context.enemyOrder.length,
  },
  actions: {
    // Roll a new random adventure and reset the run's battle state.
    beginAdventure: assign(() => {
      const { background, enemyOrder } = randomAdventure()
      return {
        background,
        enemyOrder,
        enemyPos: 0,
        hp: PLAYER_MAX_HP,
        score: 0,
        defeated: 0,
        solved: 0,
        enemy: null,
        problem: null,
        lastAnswerCorrect: null,
        lastSelected: null,
      }
    }),
  },
}).createMachine({
  id: 'game',
  context: ({ input }) => ({ ...initialContext, hero: input.hero }),
  initial: 'ageSelect',
  states: {
    // Reached when the player leaves the Maths Quest entirely. MathGame
    // watches for this and returns to the app home screen.
    exit: {
      type: 'final',
    },

    ageSelect: {
      on: {
        SELECT_AGE: {
          target: 'battle',
          actions: [assign({ age: ({ event }) => event.age }), 'beginAdventure'],
        },
        BACK: 'exit',
      },
    },

    battle: {
      initial: 'intro',
      on: {
        HOME: 'exit',
      },
      states: {
        intro: {
          entry: assign({
            enemy: ({ context }) => spawnEnemy(context),
            problem: null,
            lastAnswerCorrect: null,
            lastSelected: null,
          }),
          after: {
            [T_INTRO]: 'answering',
          },
        },

        answering: {
          entry: assign({
            problem: ({ context }) => freshProblem(context),
            lastAnswerCorrect: null,
            lastSelected: null,
          }),
          on: {
            ANSWER: [
              { guard: 'isCorrect', target: 'correct' },
              { target: 'wrong' },
            ],
            TIMEOUT: 'timeout',
          },
        },

        // The 10s answer timer expired: take a single hit, then let the
        // player keep working the same problem. The timer does NOT re-arm
        // (answeringLate has no TIMEOUT handler), so damage lands once.
        timeout: {
          entry: assign({
            hp: ({ context }) => context.hp - PLAYER_HURT,
          }),
          after: {
            [T_TIMEOUT]: [
              { guard: 'playerDead', target: '#game.defeat' },
              { target: 'answeringLate' },
            ],
          },
        },

        answeringLate: {
          on: {
            ANSWER: [
              { guard: 'isCorrect', target: 'correct' },
              { target: 'wrong' },
            ],
          },
        },

        correct: {
          entry: assign({
            lastAnswerCorrect: true,
            lastSelected: ({ event }) => (event.type === 'ANSWER' ? event.value : null),
            enemy: ({ context }) =>
              context.enemy ? { ...context.enemy, hp: context.enemy.hp - 1 } : null,
            score: ({ context }) => context.score + 10,
            solved: ({ context }) => context.solved + 1,
            attackEffect: () => chooseEffect(),
          }),
          after: {
            [T_CORRECT]: [
              { guard: 'enemyDown', target: 'enemyFaint' },
              { target: 'answering' },
            ],
          },
        },

        wrong: {
          entry: assign({
            lastAnswerCorrect: false,
            lastSelected: ({ event }) => (event.type === 'ANSWER' ? event.value : null),
            hp: ({ context }) => context.hp - PLAYER_HURT,
          }),
          after: {
            [T_WRONG]: [
              { guard: 'playerDead', target: '#game.defeat' },
              { target: 'answering' },
            ],
          },
        },

        enemyFaint: {
          entry: assign({ defeated: ({ context }) => context.defeated + 1 }),
          after: {
            [T_FAINT]: [
              { guard: 'wasLastEnemy', target: '#game.victory' },
              {
                target: 'intro',
                actions: assign({ enemyPos: ({ context }) => context.enemyPos + 1 }),
              },
            ],
          },
        },
      },
    },

    victory: {
      on: {
        HOME: 'exit',
        RETRY: { target: 'battle', actions: 'beginAdventure' },
      },
    },

    defeat: {
      on: {
        HOME: 'exit',
        RETRY: { target: 'battle', actions: 'beginAdventure' },
      },
    },
  },
})
