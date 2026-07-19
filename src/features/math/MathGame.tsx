import { useEffect, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import { gameMachine, type GameEvent } from './machine'
import { AGES } from './data'
import { type Buddy } from '../../shared/progress'
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
  paused = false,
}: {
  buddy: Buddy
  onExp: (amount: number) => void
  onExit: () => void
  paused?: boolean
}) {
  const [state, send] = useMachine(gameMachine, {
    input: { hero: { id: buddy.baseId, name: buddy.name, sprite: buddy.sprite, blurb: '' } },
  })

  // EXP is worth 1 per problem solved, but only paid once a Pokémon is defeated:
  // on each faint we award every problem solved since the last one (i.e. the
  // ones that beat this Pokémon). Problems solved in a fight the player loses
  // are never paid.
  const paidSolved = useRef(0)
  const paidDefeats = useRef(0)
  const [gained, setGained] = useState(0)
  const { solved, defeated } = state.context
  useEffect(() => {
    // A fresh run (RETRY) resets both counters — resync without paying.
    if (defeated < paidDefeats.current || solved < paidSolved.current) {
      paidDefeats.current = defeated
      paidSolved.current = solved
      setGained(0)
      return
    }
    if (defeated > paidDefeats.current) {
      paidDefeats.current = defeated
      const award = solved - paidSolved.current
      paidSolved.current = solved
      if (award > 0) {
        onExp(award)
        setGained((g) => g + award)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defeated, solved])

  // The machine's `exit` state is final; when reached, hand control back.
  useEffect(() => {
    if (state.status === 'done' || state.matches('exit')) onExit()
  }, [state, onExit])

  if (state.matches('exit')) return null

  return (
    <>
      {state.matches('ageSelect') && <AgeSelect send={send} />}
      {state.matches('battle') && (
        <Battle state={state} send={send} buddy={buddy} paused={paused} />
      )}
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
