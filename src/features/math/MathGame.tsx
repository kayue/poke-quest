import { useEffect, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import { gameMachine, type GameEvent } from './machine'
import { AGES } from './data'
import { pokedexEntry } from '../../shared/pokedex'
import { defeatExp, type Buddy } from '../../shared/progress'
import { ResultScreen } from '../../shared/ResultScreen'
import { Battle } from './Battle'

type Send = (event: GameEvent) => void

/** The Maths Quest activity. Runs its own state machine (with the shared
 *  buddy passed in) and calls `onExit` when the player leaves to the home.
 *  Awards EXP to the buddy each time a wild Pokémon is defeated. */
export function MathGame({
  buddy,
  onExp,
  onExit,
}: {
  buddy: Buddy
  onExp: (amount: number) => void
  onExit: () => void
}) {
  const [state, send] = useMachine(gameMachine, {
    input: { hero: { id: buddy.baseId, name: buddy.name, sprite: buddy.sprite, blurb: '' } },
  })

  // Track how many foes we've already paid EXP for, so each defeat rewards once.
  const paidDefeats = useRef(0)
  const [gained, setGained] = useState(0)
  const { defeated, enemyOrder, age } = state.context
  useEffect(() => {
    // A fresh run (RETRY) resets the defeated count — resync without paying.
    if (defeated < paidDefeats.current) {
      paidDefeats.current = defeated
      setGained(0)
      return
    }
    let award = 0
    for (let i = paidDefeats.current; i < defeated; i++) {
      const isBoss = !!pokedexEntry(enemyOrder[i])?.boss
      award += defeatExp(age, isBoss)
    }
    if (award > 0) {
      paidDefeats.current = defeated
      onExp(award)
      setGained((g) => g + award)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defeated])

  // The machine's `exit` state is final; when reached, hand control back.
  useEffect(() => {
    if (state.status === 'done' || state.matches('exit')) onExit()
  }, [state, onExit])

  if (state.matches('exit')) return null

  return (
    <>
      {state.matches('ageSelect') && <AgeSelect send={send} />}
      {state.matches('battle') && <Battle state={state} send={send} buddy={buddy} />}
      {state.matches('victory') && (
        <Result kind="win" buddy={buddy} gained={gained} send={send} />
      )}
      {state.matches('defeat') && (
        <Result kind="lose" buddy={buddy} gained={gained} send={send} />
      )}
    </>
  )
}

function SelectHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="select-header">
      <button className="btn btn-ghost" onClick={onBack}>
        ‹ Back
      </button>
      <span className="select-title">{title}</span>
    </div>
  )
}

function AgeSelect({ send }: { send: Send }) {
  return (
    <div className="screen select-screen">
      <SelectHeader title="How old are you?" onBack={() => send({ type: 'BACK' })} />
      <div className="card-grid">
        {AGES.map((a) => (
          <button
            key={a.age}
            className="card age-card"
            onClick={() => send({ type: 'SELECT_AGE', age: a.age })}
          >
            <span className="emoji">{a.emoji}</span>
            <span className="card-name">Age {a.age}</span>
            <span className="card-desc">{a.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Result({
  kind,
  buddy,
  gained,
  send,
}: {
  kind: 'win' | 'lose'
  buddy: Buddy
  gained: number
  send: Send
}) {
  return (
    <ResultScreen
      kind={kind}
      title={kind === 'win' ? 'YOU WIN! 🎉' : 'GAME OVER'}
      message={
        kind === 'win'
          ? 'Amazing maths skills! Ready for the next challenge?'
          : 'Good try! Every hero gets stronger with practice.'
      }
      heroSprite={buddy.sprite}
      stats={[
        { label: 'EXP gained', value: `+${gained}` },
        { label: 'Level', value: buddy.level },
      ]}
      onHome={() => send({ type: 'HOME' })}
      onRetry={() => send({ type: 'RETRY' })}
    />
  )
}
