// XState v5 machine for the Chinese Writing activity:
// difficultySelect -> practicing (write each character of each name) -> celebrating
import { setup, assign } from 'xstate'
import {
  chineseChars,
  pokemonByDifficulty,
  type WriteDifficulty,
} from './data'

export interface WritingContext {
  difficulty: WriteDifficulty
  pos: number // index into the current difficulty's list
  charIndex: number // which character of the current name
  nameMistakes: number // mistakes accumulated across the current name
  learned: string[] // ids of Pokémon whose full name has been written
}

export type WritingEvent =
  | { type: 'SELECT_DIFFICULTY'; difficulty: WriteDifficulty }
  | { type: 'NEXT_CHAR'; mistakes: number }
  | { type: 'BACK' }
  | { type: 'CONTINUE' }
  | { type: 'NEXT_POKEMON' }

function currentName(ctx: WritingContext): string {
  return pokemonByDifficulty(ctx.difficulty)[ctx.pos]?.nameZh ?? ''
}
function tierLength(ctx: WritingContext): number {
  return pokemonByDifficulty(ctx.difficulty).length
}

const initialContext: WritingContext = {
  difficulty: 'easy',
  pos: 0,
  charIndex: 0,
  nameMistakes: 0,
  learned: [],
}

export const writingMachine = setup({
  types: {
    context: {} as WritingContext,
    events: {} as WritingEvent,
  },
  guards: {
    hasMoreChars: ({ context }) =>
      context.charIndex + 1 < chineseChars(currentName(context)).length,
    hasNextPokemon: ({ context }) => context.pos + 1 < tierLength(context),
  },
  actions: {
    markLearned: assign({
      learned: ({ context }) => {
        const id = pokemonByDifficulty(context.difficulty)[context.pos]?.id
        if (!id || context.learned.includes(id)) return context.learned
        return [...context.learned, id]
      },
    }),
  },
}).createMachine({
  id: 'writing',
  context: initialContext,
  initial: 'difficultySelect',
  states: {
    difficultySelect: {
      on: {
        SELECT_DIFFICULTY: {
          target: 'practicing',
          actions: assign({
            difficulty: ({ event }) => event.difficulty,
            pos: 0,
            charIndex: 0,
            nameMistakes: 0,
          }),
        },
      },
    },

    practicing: {
      on: {
        NEXT_CHAR: [
          {
            guard: 'hasMoreChars',
            actions: assign({
              charIndex: ({ context }) => context.charIndex + 1,
              nameMistakes: ({ context, event }) => context.nameMistakes + event.mistakes,
            }),
          },
          {
            target: 'celebrating',
            actions: [
              assign({
                nameMistakes: ({ context, event }) => context.nameMistakes + event.mistakes,
              }),
              'markLearned',
            ],
          },
        ],
        BACK: 'difficultySelect',
      },
    },

    celebrating: {
      on: {
        CONTINUE: 'difficultySelect',
        NEXT_POKEMON: [
          {
            guard: 'hasNextPokemon',
            target: 'practicing',
            actions: assign({
              pos: ({ context }) => context.pos + 1,
              charIndex: 0,
              nameMistakes: 0,
            }),
          },
          { target: 'difficultySelect' },
        ],
      },
    },
  },
})
