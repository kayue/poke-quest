// XState v5 machine for the Maths Quest activity:
// hero select -> mode -> difficulty -> journey -> battle -> victory/defeat -> exit
import { setup, assign } from 'xstate'
import {
  ENEMIES,
  STAGES,
  PLAYER_MAX_HP,
  PLAYER_HURT,
  type Difficulty,
  type EnemyDef,
  type Hero,
  type Operation,
} from './data'
import { generateProblem, type Problem } from './problems'

export interface EnemyRuntime {
  def: EnemyDef
  hp: number
  maxHp: number
}

export interface GameContext {
  mode: Operation
  difficulty: Difficulty
  hero: Hero | null
  practice: boolean
  stageIndex: number
  enemyOrder: string[]
  enemyPos: number
  enemy: EnemyRuntime | null
  problem: Problem | null
  hp: number
  score: number
  streak: number
  bestStreak: number
  defeated: number
  lastAnswerCorrect: boolean | null
  lastSelected: number | null
  attackEffect: string
}

export type GameEvent =
  | { type: 'SELECT_HERO'; hero: Hero }
  | { type: 'SELECT_MODE'; mode: Operation }
  | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'START_ADVENTURE'; stageIndex: number }
  | { type: 'START_PRACTICE' }
  | { type: 'ANSWER'; value: number }
  | { type: 'BACK' }
  | { type: 'HOME' }
  | { type: 'RETRY' }

// Enemies that can appear in endless Practice mode (gentle ones).
const PRACTICE_POOL = [
  'caterpie', 'weedle', 'rattata', 'pidgey', 'zubat', 'diglett', 'poliwag',
  'oddish', 'bellsprout', 'psyduck', 'magikarp', 'meowth', 'growlithe',
]

const NUM_EFFECTS = 7

function chooseEffect(streak: number): string {
  // Bigger streaks pull from the flashier effects.
  const max = Math.min(NUM_EFFECTS, 3 + Math.floor(streak / 2))
  const n = 1 + Math.floor(Math.random() * max)
  return `attack${n}.png`
}

function spawnEnemy(ctx: GameContext): EnemyRuntime {
  let id: string
  if (ctx.practice) {
    id = PRACTICE_POOL[Math.floor(Math.random() * PRACTICE_POOL.length)]
  } else {
    id = ctx.enemyOrder[ctx.enemyPos] ?? ctx.enemyOrder[0]
  }
  const def = ENEMIES[id]
  return { def, hp: def.hp, maxHp: def.hp }
}

function freshProblem(ctx: GameContext): Problem {
  return generateProblem(ctx.mode, ctx.difficulty)
}

const initialContext: GameContext = {
  mode: 'add',
  difficulty: 'easy',
  hero: null,
  practice: false,
  stageIndex: 0,
  enemyOrder: [],
  enemyPos: 0,
  enemy: null,
  problem: null,
  hp: PLAYER_MAX_HP,
  score: 0,
  streak: 0,
  bestStreak: 0,
  defeated: 0,
  lastAnswerCorrect: null,
  lastSelected: null,
  attackEffect: 'attack1.png',
}

// Animation / pacing durations (ms)
const T_INTRO = 800
const T_CORRECT = 950
const T_WRONG = 1050
const T_FAINT = 1100

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    isCorrect: ({ context, event }) =>
      event.type === 'ANSWER' && !!context.problem && event.value === context.problem.answer,
    enemyDown: ({ context }) => !!context.enemy && context.enemy.hp <= 0,
    playerDead: ({ context }) => !context.practice && context.hp <= 0,
    wasLastEnemy: ({ context }) =>
      !context.practice && context.enemyPos + 1 >= context.enemyOrder.length,
  },
}).createMachine({
  id: 'game',
  context: initialContext,
  initial: 'heroSelect',
  states: {
    // Reached when the player leaves the Maths Quest entirely. MathGame
    // watches for this and returns to the app home screen.
    exit: {
      type: 'final',
    },

    heroSelect: {
      on: {
        SELECT_HERO: {
          target: 'modeSelect',
          actions: assign({ hero: ({ event }) => event.hero }),
        },
        BACK: 'exit',
      },
    },

    modeSelect: {
      on: {
        SELECT_MODE: {
          target: 'difficultySelect',
          actions: assign({ mode: ({ event }) => event.mode }),
        },
        BACK: 'heroSelect',
      },
    },

    difficultySelect: {
      on: {
        SELECT_DIFFICULTY: {
          target: 'journeySelect',
          actions: assign({ difficulty: ({ event }) => event.difficulty }),
        },
        BACK: 'modeSelect',
      },
    },

    journeySelect: {
      on: {
        START_ADVENTURE: {
          target: 'battle',
          actions: assign(({ event }) => {
            const stageIndex = event.type === 'START_ADVENTURE' ? event.stageIndex : 0
            return {
              practice: false,
              stageIndex,
              enemyOrder: STAGES[stageIndex].enemies,
              enemyPos: 0,
              hp: PLAYER_MAX_HP,
              score: 0,
              streak: 0,
              bestStreak: 0,
              defeated: 0,
              enemy: null,
              problem: null,
              lastAnswerCorrect: null,
              lastSelected: null,
            }
          }),
        },
        START_PRACTICE: {
          target: 'battle',
          actions: assign({
            practice: true,
            enemyOrder: [],
            enemyPos: 0,
            hp: PLAYER_MAX_HP,
            score: 0,
            streak: 0,
            bestStreak: 0,
            defeated: 0,
            enemy: null,
            problem: null,
            lastAnswerCorrect: null,
            lastSelected: null,
          }),
        },
        BACK: 'difficultySelect',
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
          },
        },

        correct: {
          entry: assign({
            lastAnswerCorrect: true,
            lastSelected: ({ event }) => (event.type === 'ANSWER' ? event.value : null),
            enemy: ({ context }) =>
              context.enemy ? { ...context.enemy, hp: context.enemy.hp - 1 } : null,
            score: ({ context }) => context.score + 10 + context.streak * 2,
            streak: ({ context }) => context.streak + 1,
            bestStreak: ({ context }) => Math.max(context.bestStreak, context.streak + 1),
            attackEffect: ({ context }) => chooseEffect(context.streak),
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
            hp: ({ context }) =>
              context.practice ? context.hp : context.hp - PLAYER_HURT,
            streak: 0,
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
        RETRY: 'journeySelect',
      },
    },

    defeat: {
      on: {
        HOME: 'exit',
        RETRY: 'journeySelect',
      },
    },
  },
})
