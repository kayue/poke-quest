import { useEffect, useRef, useState } from 'react'
import type { SnapshotFrom } from 'xstate'
import type { gameMachine, GameEvent } from './machine'
import { PLAYER_MAX_HP } from './data'
import type { Buddy } from '../../shared/progress'
import { BattleScene, type BattleBanner, type BattlePhase } from '../../shared/BattleScene'

type Snapshot = SnapshotFrom<typeof gameMachine>
type Send = (event: GameEvent) => void

const PRAISE = ['Great!', 'Awesome!', 'Super!', 'Nice one!', 'Boom!', 'Yeah!', 'Wow!']
const ENCOURAGE = ['Try again!', 'Almost!', 'Oops!', "You've got this!"]

// Seconds the player gets to answer before taking one hit.
const ANSWER_SECONDS = 10

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

export function Battle({
  state,
  send,
  buddy,
  paused = false,
}: {
  state: Snapshot
  send: Send
  buddy: Buddy
  paused?: boolean
}) {
  const ctx = state.context
  const sub = battleSubstate(state)
  const answered = sub === 'correct' || sub === 'wrong'
  const isCorrect = sub === 'correct'
  // Tiles are live both on the timed first attempt and the untimed retry.
  const answerable = sub === 'answering' || sub === 'answeringLate'

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
    } else if (sub === 'timeout') {
      setFx((p) => ({
        pulse: p.pulse + 1,
        kind: 'hurt',
        effect: '',
        float: 'time!',
        floatKind: 'miss',
        banner: { text: "Time's up!", kind: 'bad' },
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub])

  const { enemy, problem } = ctx

  const bgFile = ctx.background
  const total = ctx.enemyOrder.length
  const phase: BattlePhase =
    sub === 'intro' ? 'intro' : sub === 'enemyFaint' ? 'faint' : 'active'

  return (
    <BattleScene
      background={bgFile}
      enemyName={enemy?.def.name ?? ''}
      enemySprite={enemy?.def.sprite ?? 'pikachu.png'}
      enemyHp={enemy?.hp ?? 0}
      enemyMaxHp={enemy?.maxHp ?? 1}
      enemyLevel={enemy?.maxHp}
      heroSprite={buddy.sprite}
      heroName={buddy.name}
      heroLevel={buddy.level}
      heroExpPct={buddy.expPct}
      heroHp={ctx.hp}
      heroMaxHp={PLAYER_MAX_HP}
      phase={phase}
      pulse={fx.pulse}
      pulseKind={fx.kind}
      effect={fx.effect}
      floatText={fx.float}
      floatKind={fx.floatKind}
      banner={fx.banner}
      progressCurrent={ctx.defeated}
      progressTotal={total}
      onHome={() => send({ type: 'HOME' })}
    >
      {sub === 'answering' && !paused && (
        <Countdown seconds={ANSWER_SECONDS} onExpire={() => send({ type: 'TIMEOUT' })} />
      )}
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
                disabled={!answerable}
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

/** Headless answer timer (renders nothing). Mounted only during the timed
 *  `answering` state, so it resets on every new problem and fires `onExpire`
 *  exactly once, `seconds` after mount. */
function Countdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    const id = window.setTimeout(() => onExpireRef.current(), seconds * 1000)
    return () => window.clearTimeout(id)
  }, [seconds])

  return null
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

  return (
    <div className="equation">
      {problem.parts.map((part, i) => {
        switch (part.t) {
          case 'num':
            return (
              <span key={i} className="eq-slot">
                {part.v}
              </span>
            )
          case 'op':
            return (
              <span key={i} className="eq-op">
                {part.v}
              </span>
            )
          case 'eq':
            return (
              <span key={i} className="eq-eq">
                =
              </span>
            )
          case 'txt':
            return (
              <span key={i} className="eq-txt">
                {part.v}
              </span>
            )
          case 'blank':
            return (
              <span key={i} className={blankClass}>
                {blankValue}
              </span>
            )
        }
      })}
    </div>
  )
}
