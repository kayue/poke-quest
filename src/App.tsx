import { useMachine } from '@xstate/react'
import type { SnapshotFrom } from 'xstate'
import { gameMachine, type GameEvent } from './game/machine'
import {
  DIFFICULTIES,
  ENEMIES,
  HEROES,
  MODES,
  STAGES,
  pokemonSrc,
} from './game/data'
import { Battle } from './Battle'

export function App() {
  const [state, send] = useMachine(gameMachine)

  return (
    <div className="game-frame">
      {state.matches('title') && <Title send={send} />}
      {state.matches('heroSelect') && <HeroSelect send={send} />}
      {state.matches('modeSelect') && <ModeSelect send={send} />}
      {state.matches('difficultySelect') && <DifficultySelect send={send} />}
      {state.matches('journeySelect') && <JourneySelect send={send} />}
      {state.matches('battle') && <Battle state={state} send={send} />}
      {state.matches('victory') && (
        <Result kind="win" state={state} send={send} />
      )}
      {state.matches('defeat') && (
        <Result kind="lose" state={state} send={send} />
      )}
    </div>
  )
}

type Send = (event: GameEvent) => void

function Title({ send }: { send: Send }) {
  return (
    <div className="screen title-screen">
      <div className="pokeball" />
      <h1 className="game-title">
        POKÉ
        <br />
        MATH
        <span className="sub">Quest ⚔️</span>
      </h1>
      <p className="tagline">
        Solve maths, power up your Pokémon, and beat every wild foe!
      </p>
      <button className="btn btn-primary" onClick={() => send({ type: 'PLAY' })}>
        ▶ PLAY
      </button>
    </div>
  )
}

function SelectHeader({ title, send }: { title: string; send: Send }) {
  return (
    <div className="select-header">
      <button className="btn btn-ghost" onClick={() => send({ type: 'BACK' })}>
        ‹ Back
      </button>
      <span className="select-title">{title}</span>
    </div>
  )
}

function HeroSelect({ send }: { send: Send }) {
  return (
    <div className="screen select-screen">
      <SelectHeader title="Pick your buddy!" send={send} />
      <div className="card-grid">
        {HEROES.map((h) => (
          <button
            key={h.id}
            className="card"
            onClick={() => send({ type: 'SELECT_HERO', hero: h })}
          >
            <img className="hero-sprite" src={pokemonSrc(h.sprite)} alt={h.name} />
            <span className="card-name">{h.name}</span>
            <span className="card-desc">{h.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ModeSelect({ send }: { send: Send }) {
  return (
    <div className="screen select-screen">
      <SelectHeader title="What shall we practise?" send={send} />
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
      <SelectHeader title="How tricky?" send={send} />
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
      <SelectHeader title="Choose an adventure" send={send} />
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
  const hero = ctx.hero
  return (
    <div className="screen result-screen">
      {kind === 'win' &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${(i * 7 + 4) % 100}%`,
              background: ['#ffd23f', '#ff5d5d', '#58d66a', '#5f9de0', '#b47be0'][i % 5],
              animationDuration: `${2 + (i % 4) * 0.6}s`,
              animationDelay: `${(i % 5) * 0.2}s`,
            }}
          />
        ))}
      <h1 className={`result-title ${kind}`}>
        {kind === 'win' ? 'YOU WIN! 🎉' : 'GAME OVER'}
      </h1>
      {hero && (
        <img
          className={`result-hero ${kind === 'win' ? 'win' : ''}`}
          src={pokemonSrc(hero.sprite)}
          alt={hero.name}
        />
      )}
      <div className="stat-row">
        <div className="stat">
          <b>{ctx.score}</b>
          <span>Score</span>
        </div>
        <div className="stat">
          <b>{ctx.defeated}</b>
          <span>Beaten</span>
        </div>
        <div className="stat">
          <b>{ctx.bestStreak}</b>
          <span>Best 🔥</span>
        </div>
      </div>
      <p className="tagline">
        {kind === 'win'
          ? 'Amazing maths skills! Ready for the next challenge?'
          : 'Good try! Every hero gets stronger with practice.'}
      </p>
      <div className="result-actions">
        <button className="btn" onClick={() => send({ type: 'HOME' })}>
          🏠 Home
        </button>
        <button className="btn btn-primary" onClick={() => send({ type: 'RETRY' })}>
          ↻ Play Again
        </button>
      </div>
    </div>
  )
}
