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
  pokemonById,
  totalStrokes,
  type WriteDifficulty,
} from './data'

export const WRITING_MAX_HP = 100
export const WRITING_HURT = 20 // HP lost per mistake (5 mistakes = faint)
export const ROUND_SIZE = 5 // Pokémon to defeat per round

export interface WritingContext {
  difficulty: WriteDifficulty
  order: string[] // shuffled Pokémon ids for this run (random order)
  pos: number // index into `order`
  charIndex: number // which character of the current name
  enemyMaxHp: number // total strokes of the current name
  enemyHp: number // strokes still to write
  hp: number // player HP (refills each enemy)
  defeated: number
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
  return pokemonById(ctx.order[ctx.pos])?.nameZh ?? ''
}
function chooseEffect(): string {
  return `attack${1 + Math.floor(Math.random() * 7)}.png`
}
/** 5 random Pokémon ids from a difficulty tier, in random order — one round. */
function shuffledOrder(difficulty: WriteDifficulty): string[] {
  const ids = pokemonByDifficulty(difficulty).map((p) => p.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, ROUND_SIZE)
}

const initialContext: WritingContext = {
  difficulty: 'easy',
  order: [],
  pos: 0,
  charIndex: 0,
  enemyMaxHp: 1,
  enemyHp: 1,
  hp: WRITING_MAX_HP,
  defeated: 0,
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
    hasNextPokemon: ({ context }) => context.pos + 1 < context.order.length,
    fatal: ({ context }) => context.hp <= WRITING_HURT,
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
            order: ({ event }) => shuffledOrder(event.difficulty),
            pos: 0,
            defeated: 0,
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
            const strokes = totalStrokes(currentName(context))
            return {
              enemyMaxHp: strokes,
              enemyHp: strokes,
              charIndex: 0,
              hp: WRITING_MAX_HP, // refill each enemy
            }
          }),
          after: { [T_INTRO]: 'writing' },
        },

        writing: {
          on: {
            STROKE_OK: {
              actions: assign({
                enemyHp: ({ context }) => Math.max(0, context.enemyHp - 1),
                attackEffect: () => chooseEffect(),
              }),
            },
            STROKE_BAD: [
              {
                guard: 'fatal',
                target: '#writing.defeat',
                actions: assign({ hp: 0 }),
              },
              {
                actions: assign({
                  hp: ({ context }) => context.hp - WRITING_HURT,
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
