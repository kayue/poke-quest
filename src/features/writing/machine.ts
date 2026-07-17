// XState v5 machine for the Chinese Writing *battle*:
// difficultySelect -> battle{ intro -> writing -> enemyFaint } -> victory / defeat
//
// The wild Pokémon is defeated by writing its name: every correct stroke is a
// hit (enemy HP = total strokes of the name), every mistake hurts the player.
// Finishing the whole name faints it and the next Pokémon appears — no
// celebration screen, just straight into the next foe.
import { setup, assign } from 'xstate'
import {
  chineseChars,
  pokemonByDifficulty,
  totalStrokes,
  type WriteDifficulty,
} from './data'

export const WRITING_MAX_HEARTS = 5

export interface WritingContext {
  difficulty: WriteDifficulty
  pos: number // index into the current difficulty's list
  charIndex: number // which character of the current name
  enemyMaxHp: number // total strokes of the current name
  enemyHp: number // strokes still to write
  hearts: number
  defeated: number
  streak: number
  bestStreak: number
  attackEffect: string
}

export type WritingEvent =
  | { type: 'SELECT_DIFFICULTY'; difficulty: WriteDifficulty }
  | { type: 'STROKE_OK' }
  | { type: 'STROKE_BAD' }
  | { type: 'CHAR_DONE' }
  | { type: 'HOME' }
  | { type: 'RETRY' }

function currentName(ctx: WritingContext): string {
  return pokemonByDifficulty(ctx.difficulty)[ctx.pos]?.nameZh ?? ''
}
function tierLength(ctx: WritingContext): number {
  return pokemonByDifficulty(ctx.difficulty).length
}
function chooseEffect(streak: number): string {
  const max = Math.min(7, 3 + Math.floor(streak / 2))
  return `attack${1 + Math.floor(Math.random() * max)}.png`
}

const initialContext: WritingContext = {
  difficulty: 'easy',
  pos: 0,
  charIndex: 0,
  enemyMaxHp: 1,
  enemyHp: 1,
  hearts: WRITING_MAX_HEARTS,
  defeated: 0,
  streak: 0,
  bestStreak: 0,
  attackEffect: 'attack1.png',
}

const T_INTRO = 800
const T_FAINT = 1000

export const writingMachine = setup({
  types: {
    context: {} as WritingContext,
    events: {} as WritingEvent,
  },
  guards: {
    hasMoreChars: ({ context }) =>
      context.charIndex + 1 < chineseChars(currentName(context)).length,
    hasNextPokemon: ({ context }) => context.pos + 1 < tierLength(context),
    fatal: ({ context }) => context.hearts <= 1,
  },
}).createMachine({
  id: 'writing',
  context: initialContext,
  initial: 'difficultySelect',
  states: {
    exit: { type: 'final' },

    difficultySelect: {
      on: {
        SELECT_DIFFICULTY: {
          target: 'battle',
          actions: assign({
            difficulty: ({ event }) => event.difficulty,
            pos: 0,
            defeated: 0,
            bestStreak: 0,
          }),
        },
      },
    },

    battle: {
      initial: 'intro',
      on: { HOME: 'exit' },
      states: {
        intro: {
          entry: assign(({ context }) => {
            const name = currentName(context)
            const hp = totalStrokes(name)
            return {
              enemyMaxHp: hp,
              enemyHp: hp,
              charIndex: 0,
              hearts: WRITING_MAX_HEARTS,
              streak: 0,
            }
          }),
          after: { [T_INTRO]: 'writing' },
        },

        writing: {
          on: {
            STROKE_OK: {
              actions: assign({
                enemyHp: ({ context }) => Math.max(0, context.enemyHp - 1),
                streak: ({ context }) => context.streak + 1,
                bestStreak: ({ context }) => Math.max(context.bestStreak, context.streak + 1),
                attackEffect: ({ context }) => chooseEffect(context.streak),
              }),
            },
            STROKE_BAD: [
              {
                guard: 'fatal',
                target: '#writing.defeat',
                actions: assign({ hearts: 0, streak: 0 }),
              },
              {
                actions: assign({
                  hearts: ({ context }) => context.hearts - 1,
                  streak: 0,
                }),
              },
            ],
            CHAR_DONE: [
              {
                guard: 'hasMoreChars',
                actions: assign({ charIndex: ({ context }) => context.charIndex + 1 }),
              },
              { target: 'enemyFaint' },
            ],
          },
        },

        enemyFaint: {
          entry: assign({ defeated: ({ context }) => context.defeated + 1 }),
          after: {
            [T_FAINT]: [
              {
                guard: 'hasNextPokemon',
                target: 'intro',
                actions: assign({ pos: ({ context }) => context.pos + 1 }),
              },
              { target: '#writing.victory' },
            ],
          },
        },
      },
    },

    victory: {
      on: { HOME: 'exit', RETRY: 'difficultySelect' },
    },
    defeat: {
      on: { HOME: 'exit', RETRY: 'difficultySelect' },
    },
  },
})
