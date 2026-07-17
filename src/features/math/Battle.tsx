import { useEffect, useState } from 'react'
import type { SnapshotFrom } from 'xstate'
import type { gameMachine, GameEvent } from './machine'
import { PLAYER_MAX_HEARTS, STAGES } from './data'
import { BattleScene, type BattleBanner, type BattlePhase } from '../../shared/BattleScene'

type Snapshot = SnapshotFrom<typeof gameMachine>
type Send = (event: GameEvent) => void

const PRAISE = ['Great!', 'Awesome!', 'Super!', 'Nice one!', 'Boom!', 'Yeah!', 'Wow!']
const ENCOURAGE = ['Try again!', 'Almost!', 'Oops!', "You've got this!"]

function battleSubstate(state: Snapshot): string {
  const v = state.value as { battle?: string }
  return typeof v === 'object' && v.battle ? v.battle : ''
}

interface Fx {
  pulse: number
  kind: 'hit' | 'hurt' | null
  effect: string
  float: string
  floatKind: 'dmg' | 'miss'
  banner: BattleBanner | null
}

export function Battle({ state, send }: { state: Snapshot; send: Send }) {
  const ctx = state.context
  const sub = battleSubstate(state)
  const answered = sub === 'correct' || sub === 'wrong'
  const isCorrect = sub === 'correct'

  // Translate the machine's correct/wrong substates into a one-shot battle FX.
  const [fx, setFx] = useState<Fx>({
    pulse: 0,
    kind: null,
    effect: '',
    float: '',
    floatKind: 'dmg',
    banner: null,
  })
  useEffect(() => {
    if (sub === 'correct') {
      setFx((p) => ({
        pulse: p.pulse + 1,
        kind: 'hit',
        effect: ctx.attackEffect,
        float: '-1',
        floatKind: 'dmg',
        banner: { text: PRAISE[(p.pulse + 1) % PRAISE.length], kind: 'good' },
      }))
    } else if (sub === 'wrong') {
      setFx((p) => ({
        pulse: p.pulse + 1,
        kind: 'hurt',
        effect: '',
        float: 'miss!',
        floatKind: 'miss',
        banner: { text: ENCOURAGE[(p.pulse + 1) % ENCOURAGE.length], kind: 'bad' },
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub])

  const { enemy, problem, hero } = ctx
  if (!hero) return null

  const bgFile = ctx.practice
    ? 'background1.png'
    : STAGES[ctx.stageIndex]?.background ?? 'background1.png'
  const total = ctx.practice ? 0 : STAGES[ctx.stageIndex]?.enemies.length ?? 1
  const phase: BattlePhase =
    sub === 'intro' ? 'intro' : sub === 'enemyFaint' ? 'faint' : 'active'

  return (
    <BattleScene
      background={bgFile}
      enemyName={enemy?.def.name ?? ''}
      enemySprite={enemy?.def.sprite ?? 'pikachu.png'}
      enemyHp={enemy?.hp ?? 0}
      enemyMaxHp={enemy?.maxHp ?? 1}
      heroSprite={hero.sprite}
      hearts={ctx.hearts}
      maxHearts={PLAYER_MAX_HEARTS}
      streak={ctx.streak}
      phase={phase}
      pulse={fx.pulse}
      pulseKind={fx.kind}
      effect={fx.effect}
      floatText={fx.float}
      floatKind={fx.floatKind}
      banner={fx.banner}
      hudRight={
        ctx.practice ? (
          <>
            <span className="progress-label">⭐ {ctx.score}</span>
            <span className="progress-label">Beaten: {ctx.defeated}</span>
          </>
        ) : undefined
      }
      progressCurrent={ctx.defeated}
      progressTotal={total}
      onHome={() => send({ type: 'HOME' })}
    >
      <Equation
        problem={problem}
        answered={answered}
        isCorrect={isCorrect}
        selected={ctx.lastSelected}
      />
      <div className="grid-wrap">
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
    </BattleScene>
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
