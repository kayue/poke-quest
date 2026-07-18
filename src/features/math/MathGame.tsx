import { useEffect } from 'react'
import { useMachine } from '@xstate/react'
import type { SnapshotFrom } from 'xstate'
import { gameMachine, type GameEvent } from './machine'
import { AGES } from './data'
import type { Hero } from '../../shared/heroes'
import { ResultScreen } from '../../shared/ResultScreen'
import { Battle } from './Battle'

type Send = (event: GameEvent) => void

/** The Maths Quest activity. Runs its own state machine (with the shared
 *  buddy passed in) and calls `onExit` when the player leaves to the home. */
export function MathGame({ hero, onExit }: { hero: Hero; onExit: () => void }) {
  const [state, send] = useMachine(gameMachine, { input: { hero } })

  // The machine's `exit` state is final; when reached, hand control back.
  useEffect(() => {
    if (state.status === 'done' || state.matches('exit')) onExit()
  }, [state, onExit])

  if (state.matches('exit')) return null

  return (
    <>
      {state.matches('ageSelect') && <AgeSelect send={send} />}
      {state.matches('battle') && <Battle state={state} send={send} />}
      {state.matches('victory') && <Result kind="win" state={state} send={send} />}
      {state.matches('defeat') && <Result kind="lose" state={state} send={send} />}
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
  state,
  send,
}: {
  kind: 'win' | 'lose'
  state: SnapshotFrom<typeof gameMachine>
  send: Send
}) {
  const ctx = state.context
  return (
    <ResultScreen
      kind={kind}
      title={kind === 'win' ? 'YOU WIN! 🎉' : 'GAME OVER'}
      message={
        kind === 'win'
          ? 'Amazing maths skills! Ready for the next challenge?'
          : 'Good try! Every hero gets stronger with practice.'
      }
      heroSprite={ctx.hero?.sprite ?? 'pikachu.png'}
      stats={[
        { label: 'Score', value: ctx.score },
        { label: 'Beaten', value: ctx.defeated },
      ]}
      onHome={() => send({ type: 'HOME' })}
      onRetry={() => send({ type: 'RETRY' })}
    />
  )
}
