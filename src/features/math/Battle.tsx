import { useEffect, useState } from 'react'
import type { SnapshotFrom } from 'xstate'
import type { gameMachine, GameEvent } from './machine'
import { PLAYER_MAX_HEARTS, STAGES } from './data'
import { backgroundSrc, effectSrc, pokemonSrc } from '../../shared/assets'

type Snapshot = SnapshotFrom<typeof gameMachine>
type Send = (event: GameEvent) => void

const PRAISE = ['Great!', 'Awesome!', 'Super!', 'Nice one!', 'Boom!', 'Yeah!', 'Wow!']
const ENCOURAGE = ['Try again!', 'Almost!', 'Oops!', "You've got this!"]

function battleSubstate(state: Snapshot): string {
  const v = state.value as { battle?: string }
  return typeof v === 'object' && v.battle ? v.battle : ''
}

export function Battle({ state, send }: { state: Snapshot; send: Send }) {
  const ctx = state.context
  const sub = battleSubstate(state)
  const answered = sub === 'correct' || sub === 'wrong'
  const isCorrect = sub === 'correct'
  const isWrong = sub === 'wrong'

  // Bump a counter whenever we enter a correct/wrong state so one-shot
  // animations (banner, floating text, attack fx) re-mount and replay.
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (answered) setPulse((p) => p + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub])

  const { enemy, problem, hero } = ctx
  if (!hero) return null

  const bgFile = ctx.practice
    ? 'background1.png'
    : STAGES[ctx.stageIndex]?.background ?? 'background1.png'

  const enemyClass =
    sub === 'intro'
      ? 'appearing'
      : isCorrect
        ? 'hit'
        : sub === 'enemyFaint'
          ? 'faint'
          : ''

  const heroClass = isCorrect ? 'attacking' : isWrong ? 'hurt' : ''

  // Progress
  const total = ctx.practice ? 0 : STAGES[ctx.stageIndex]?.enemies.length ?? 1
  const progressPct = ctx.practice ? 0 : Math.min(100, (ctx.defeated / total) * 100)

  return (
    <div className="screen battle">
      <img className="battle-bg" src={backgroundSrc(bgFile)} alt="" />

      {/* HUD */}
      <div className="hud">
        <div className="hearts" aria-label="lives">
          {Array.from({ length: PLAYER_MAX_HEARTS }).map((_, i) => (
            <span key={i} className={`heart ${i < ctx.hearts ? '' : 'lost'}`}>
              {i < ctx.hearts ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        <div className="hud-right">
          {ctx.practice ? (
            <>
              <span className="progress-label">⭐ {ctx.score}</span>
              <span className="progress-label">Beaten: {ctx.defeated}</span>
            </>
          ) : (
            <>
              <span className="progress-label">
                🏆 {ctx.defeated}/{total}
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </>
          )}
        </div>
      </div>

      <button className="btn btn-ghost home-btn" onClick={() => send({ type: 'HOME' })}>
        ⏸ Menu
      </button>

      {/* Arena */}
      <div className="arena">
        {enemy && (
          <>
            <div className="enemy-name">{enemy.def.name}</div>
            <div className="enemy-hp">
              <div
                className="enemy-hp-fill"
                style={{ width: `${(Math.max(0, enemy.hp) / enemy.maxHp) * 100}%` }}
              />
            </div>
            <div className={`enemy-wrap ${enemyClass}`}>
              <div className="enemy-shadow" />
              <img className="enemy-sprite" src={pokemonSrc(enemy.def.sprite)} alt={enemy.def.name} />
              {isCorrect && (
                <div
                  key={`fx-${pulse}`}
                  className="attack-fx"
                  style={{ backgroundImage: `url(${effectSrc(ctx.attackEffect)})` }}
                />
              )}
              {isCorrect && (
                <div key={`ft-${pulse}`} className="float-text dmg">
                  -1
                </div>
              )}
              {isWrong && (
                <div key={`ft-${pulse}`} className="float-text miss">
                  miss!
                </div>
              )}
            </div>
          </>
        )}

        {answered && (
          <div key={`banner-${pulse}`} className={`battle-banner ${isCorrect ? 'good' : 'bad'}`}>
            {isCorrect ? PRAISE[pulse % PRAISE.length] : ENCOURAGE[pulse % ENCOURAGE.length]}
          </div>
        )}
      </div>

      {/* Equation */}
      <Equation
        problem={problem}
        answered={answered}
        isCorrect={isCorrect}
        selected={ctx.lastSelected}
      />

      {/* Number grid + hero */}
      <div className="grid-wrap">
        <div className={`hero-corner ${heroClass}`}>
          <img className="hero-battle-sprite" src={pokemonSrc(hero.sprite)} alt={hero.name} />
          {ctx.streak >= 2 && <span className="streak-badge">🔥 {ctx.streak}</span>}
        </div>

        <div className="number-grid">
          {problem?.tiles.map((n, i) => {
            let cls = ''
            if (answered) {
              if (n === ctx.lastSelected) cls = isCorrect ? 'correct' : 'wrong'
              else if (n === problem.answer) cls = 'correct'
              else cls = 'dim'
            }
            return (
              <button
                key={`${i}-${n}`}
                className={`num-tile ${cls}`}
                disabled={sub !== 'answering'}
                onClick={() => send({ type: 'ANSWER', value: n })}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Equation({
  problem,
  answered,
  isCorrect,
  selected,
}: {
  problem: import('./problems').Problem | null
  answered: boolean
  isCorrect: boolean
  selected: number | null
}) {
  if (!problem) {
    return <div className="equation">…</div>
  }

  const blankClass =
    'eq-slot blank' + (answered ? (isCorrect ? ' filled-correct' : ' filled-wrong') : '')
  const blankValue = answered && selected !== null ? selected : ''

  if (problem.style === 'result') {
    // a op b = ?
    return (
      <div className="equation">
        <span className="eq-slot">{problem.a}</span>
        <span className="eq-op">{problem.opSymbol}</span>
        <span className="eq-slot">{problem.b}</span>
        <span className="eq-eq">=</span>
        <span className={blankClass}>{blankValue}</span>
      </div>
    )
  }

  // a op ? = result
  return (
    <div className="equation">
      <span className="eq-slot">{problem.a}</span>
      <span className="eq-op">{problem.opSymbol}</span>
      <span className={blankClass}>{blankValue}</span>
      <span className="eq-eq">=</span>
      <span className="eq-slot">{problem.result}</span>
    </div>
  )
}
