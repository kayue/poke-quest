import { useEffect } from 'react'
import { useMachine } from '@xstate/react'
import type { SnapshotFrom } from 'xstate'
import { gameMachine, type GameEvent } from './machine'
import { DIFFICULTIES, ENEMIES, MODES, STAGES } from './data'
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
      {state.matches('modeSelect') && <ModeSelect send={send} />}
      {state.matches('difficultySelect') && <DifficultySelect send={send} />}
      {state.matches('journeySelect') && <JourneySelect send={send} />}
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

function ModeSelect({ send }: { send: Send }) {
  return (
    <div className="screen select-screen">
      <SelectHeader title="What shall we practise?" onBack={() => send({ type: 'BACK' })} />
      <div className="card-grid">
        {MODES.map((m) => (
          <button
            key={m.id}
            className="card"
            onClick={() => send({ type: 'SELECT_MODE', mode: m.id })}
          >
            <span className="emoji">{m.emoji}</span>
            <span className="card-name">{m.label}</span>
            <span className="card-desc">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DifficultySelect({ send }: { send: Send }) {
  return (
    <div className="screen select-screen">
      <SelectHeader title="How tricky?" onBack={() => send({ type: 'BACK' })} />
      <div className="card-grid">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            className="card full-span"
            onClick={() => send({ type: 'SELECT_DIFFICULTY', difficulty: d.id })}
          >
            <span className="emoji">{d.emoji}</span>
            <span className="card-name">{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function JourneySelect({ send }: { send: Send }) {
  return (
    <div className="screen select-screen">
      <SelectHeader title="Choose an adventure" onBack={() => send({ type: 'BACK' })} />
      <button
        className="card practice-card full-span stage-card"
        onClick={() => send({ type: 'START_PRACTICE' })}
      >
        <span className="stage-num">🎈</span>
        <div className="stage-info">
          <div className="stage-name">Practice Mode</div>
          <div className="stage-enemies">No pressure — just play and learn!</div>
        </div>
      </button>
      <div className="card-grid">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            className="card stage-card full-span"
            onClick={() => send({ type: 'START_ADVENTURE', stageIndex: i })}
          >
            <span className="stage-num">{s.id}</span>
            <div className="stage-info">
              <div className="stage-name">{s.name}</div>
              <div className="stage-enemies">
                {s.enemies.map((e) => ENEMIES[e]?.name).join(' · ')}
              </div>
            </div>
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
