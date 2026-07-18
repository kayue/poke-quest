import { useEffect, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import type { SnapshotFrom } from 'xstate'
import { writingMachine, WRITING_MAX_HP, type WritingEvent } from './machine'
import {
  DIFFICULTY_META,
  chineseChars,
  pokemonByDifficulty,
  pokemonById,
  type WriteDifficulty,
} from './data'
import { charStrokes } from './strokeData'
import { HanziQuiz, type HanziQuizHandle } from './HanziQuiz'
import { BattleScene, type BattleBanner, type BattlePhase } from '../../shared/BattleScene'
import { ResultScreen } from '../../shared/ResultScreen'
import { pokedexEntry } from '../../shared/pokedex'
import { defeatExp, type Buddy } from '../../shared/progress'

type Snapshot = SnapshotFrom<typeof writingMachine>
type Send = (event: WritingEvent) => void
const TIERS: WriteDifficulty[] = ['easy', 'medium', 'hard']
const WRITE_BG = 'background2.png'

// How much of a challenge each tier is, for EXP scaling (harder pays more).
const TIER_CHALLENGE: Record<WriteDifficulty, number> = { easy: 5, medium: 7, hard: 9 }

function battleSubstate(state: Snapshot): string {
  const v = state.value as { battle?: string }
  return typeof v === 'object' && v.battle ? v.battle : ''
}

function pickEffect(): string {
  return `attack${1 + Math.floor(Math.random() * 7)}.png`
}

/** The Chinese Writing activity — a stroke-order battle. Awards EXP to the
 *  shared buddy each time a wild Pokémon is defeated. */
export function WritingGame({
  buddy,
  onExp,
  onExit,
}: {
  buddy: Buddy
  onExp: (amount: number) => void
  onExit: () => void
}) {
  const [state, send] = useMachine(writingMachine)

  // Pay EXP once per defeated foe (see MathGame for the same pattern).
  const paidDefeats = useRef(0)
  const { defeated, order, difficulty } = state.context
  useEffect(() => {
    if (defeated < paidDefeats.current) {
      paidDefeats.current = defeated
      return
    }
    let award = 0
    for (let i = paidDefeats.current; i < defeated; i++) {
      const isBoss = !!pokedexEntry(order[i])?.boss
      award += defeatExp(TIER_CHALLENGE[difficulty], isBoss)
    }
    if (award > 0) {
      paidDefeats.current = defeated
      onExp(award)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defeated])

  useEffect(() => {
    if (state.status === 'done' || state.matches('exit')) onExit()
  }, [state, onExit])
  if (state.matches('exit')) return null

  if (state.matches('difficultySelect')) {
    return <DifficultySelect send={send} onExit={onExit} />
  }
  if (state.matches('victory') || state.matches('defeat')) {
    return <WritingResult state={state} send={send} buddy={buddy} />
  }
  return <WritingBattle state={state} send={send} buddy={buddy} />
}

function DifficultySelect({ send, onExit }: { send: Send; onExit: () => void }) {
  return (
    <div className="screen select-screen">
      <div className="select-header">
        <button className="btn btn-ghost" onClick={onExit}>
          ‹ Back
        </button>
        <span className="select-title">揀難度 · Pick a level</span>
      </div>
      <p className="write-intro">
        Defeat wild Pokémon by writing their names — every stroke is a hit! ✏️
      </p>
      {TIERS.map((tier) => {
        const meta = DIFFICULTY_META[tier]
        const list = pokemonByDifficulty(tier)
        return (
          <button
            key={tier}
            className={`diff-card diff-${tier}`}
            onClick={() => send({ type: 'SELECT_DIFFICULTY', difficulty: tier })}
          >
            <span className="diff-emoji">{meta.emoji}</span>
            <div className="diff-info">
              <div className="diff-label">
                {meta.label} <span className="diff-en">{meta.sub}</span>
              </div>
              <div className="diff-meta">{list.length} Pokémon</div>
            </div>
            <span className="diff-progress">›</span>
          </button>
        )
      })}
    </div>
  )
}

interface Fx {
  pulse: number
  kind: 'hit' | 'hurt' | null
  effect: string
  float: string
  floatKind: 'dmg' | 'miss'
  banner: BattleBanner | null
}

function WritingBattle({ state, send, buddy }: { state: Snapshot; send: Send; buddy: Buddy }) {
  const ctx = state.context
  const sub = battleSubstate(state)
  const pokemon = pokemonById(ctx.order[ctx.pos])
  const chars = chineseChars(pokemon?.nameZh ?? '')
  const char = chars[ctx.charIndex]

  const quizRef = useRef<HanziQuizHandle>(null)
  const [caption, setCaption] = useState('跟著筆順寫一寫')
  const [fx, setFx] = useState<Fx>({
    pulse: 0,
    kind: null,
    effect: '',
    float: '',
    floatKind: 'dmg',
    banner: null,
  })

  // Reset the caption when the character changes.
  useEffect(() => {
    setCaption('跟著筆順寫一寫')
  }, [ctx.charIndex, ctx.pos])

  const phase: BattlePhase =
    sub === 'intro' ? 'intro' : sub === 'enemyFaint' ? 'faint' : 'active'

  const handleCorrectStroke = () => {
    setCaption('很好！')
    setFx((p) => ({
      pulse: p.pulse + 1,
      kind: 'hit',
      effect: pickEffect(),
      float: '-1',
      floatKind: 'dmg',
      banner: null,
    }))
    send({ type: 'STROKE_OK' })
  }

  const handleMistake = (mistakesOnStroke: number) => {
    setCaption('哎呀，再試一次！')
    setFx((p) => ({
      pulse: p.pulse + 1,
      kind: 'hurt',
      effect: '',
      float: 'oops',
      floatKind: 'miss',
      banner: { text: '再試！', kind: 'bad' },
    }))
    // Only hurt on the first miss of a stroke — repeated misses on the same
    // stroke let the player study the hint without draining HP.
    if (mistakesOnStroke <= 1) send({ type: 'STROKE_BAD' })
  }

  const handleComplete = () => {
    send({ type: 'CHAR_DONE' })
  }

  if (!pokemon) return null

  return (
    <BattleScene
      background={WRITE_BG}
      enemyName={pokemon.nameZh}
      enemySprite={pokemon.sprite}
      enemyHp={ctx.enemyHp}
      enemyMaxHp={ctx.enemyMaxHp}
      enemyLevel={ctx.enemyMaxHp}
      heroSprite={buddy.sprite}
      heroName={buddy.name}
      heroLevel={buddy.level}
      heroExpPct={buddy.expPct}
      heroHp={ctx.hp}
      heroMaxHp={WRITING_MAX_HP}
      phase={phase}
      pulse={fx.pulse}
      pulseKind={fx.kind}
      effect={fx.effect}
      floatText={fx.float}
      floatKind={fx.floatKind}
      banner={fx.banner}
      progressCurrent={ctx.defeated}
      progressTotal={ctx.order.length}
      onHome={() => send({ type: 'HOME' })}
    >
      <div className="write-fight">
        <div className="write-progress">
          {chars.map((c, i) => (
            <span
              key={i}
              className={
                'char-chip ' +
                (i < ctx.charIndex ? 'chip-done' : i === ctx.charIndex ? 'chip-active' : 'chip-todo')
              }
            >
              {c}
            </span>
          ))}
        </div>

        {sub === 'writing' && char ? (
          <>
            <div className="caption">
              {caption} <span className="stroke-count">「{char}」{charStrokes(char)} 劃</span>
            </div>
            <div className="hanzi-stage">
              <HanziQuiz
                key={`${pokemon.id}-${ctx.charIndex}`}
                ref={quizRef}
                char={char}
                size={260}
                onComplete={handleComplete}
                onMistake={handleMistake}
                onCorrectStroke={handleCorrectStroke}
                onLoadError={() => setCaption('這個字載入失敗')}
              />
            </div>
            <div className="write-controls">
              <button className="btn btn-ghost" onClick={() => quizRef.current?.animate()}>
                👀 看示範
              </button>
              <button className="btn btn-ghost" onClick={() => quizRef.current?.reset()}>
                ↻ 重寫
              </button>
            </div>
          </>
        ) : (
          <div className="write-standby">
            <div className="hanzi-box" style={{ width: 260, height: 260 }}>
              <div className="hanzi-grid" aria-hidden />
              <div className="hanzi-status">
                {sub === 'faint' || sub === 'enemyFaint' ? '打倒了！ 🎉' : '準備… ✏️'}
              </div>
            </div>
          </div>
        )}
      </div>
    </BattleScene>
  )
}

function WritingResult({ state, send, buddy }: { state: Snapshot; send: Send; buddy: Buddy }) {
  const ctx = state.context
  const win = state.matches('victory')
  return (
    <ResultScreen
      kind={win ? 'win' : 'lose'}
      title={win ? '全部打倒了！ 🎉' : 'GAME OVER'}
      message={
        win
          ? '你學會了好多漢字！ Amazing writing!'
          : '再接再厲！ Every stroke makes you stronger.'
      }
      heroSprite={buddy.sprite}
      stats={[
        { label: '打倒 Beaten', value: ctx.defeated },
        { label: '等級 Level', value: buddy.level },
      ]}
      onHome={() => send({ type: 'HOME' })}
      onRetry={() => send({ type: 'RETRY' })}
      retryLabel="↻ 再玩"
    />
  )
}
