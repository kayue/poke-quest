import { useEffect, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import { writingMachine, type WritingEvent } from './machine'
import {
  DIFFICULTY_META,
  chineseChars,
  pokemonByDifficulty,
  type WriteDifficulty,
  type WritingPokemon,
} from './data'
import { charStrokes } from './strokeData'
import { HanziQuiz, type HanziQuizHandle } from './HanziQuiz'
import { pokemonSrc } from '../../shared/assets'

type Send = (event: WritingEvent) => void
const TIERS: WriteDifficulty[] = ['easy', 'medium', 'hard']

/** The Chinese Writing activity. Runs its own state machine. */
export function WritingGame({ onExit }: { onExit: () => void }) {
  const [state, send] = useMachine(writingMachine)
  const { difficulty, pos, charIndex, nameMistakes, learned } = state.context

  if (state.matches('difficultySelect')) {
    return <DifficultySelect learned={learned} send={send} onExit={onExit} />
  }

  const list = pokemonByDifficulty(difficulty)
  const pokemon = list[pos]

  if (state.matches('practicing')) {
    return (
      <Practice
        pokemon={pokemon}
        charIndex={charIndex}
        posLabel={`${pos + 1}/${list.length}`}
        send={send}
      />
    )
  }
  // celebrating
  return (
    <Celebrate
      pokemon={pokemon}
      nameMistakes={nameMistakes}
      hasNext={pos + 1 < list.length}
      send={send}
    />
  )
}

function DifficultySelect({
  learned,
  send,
  onExit,
}: {
  learned: string[]
  send: Send
  onExit: () => void
}) {
  return (
    <div className="screen select-screen">
      <div className="select-header">
        <button className="btn btn-ghost" onClick={onExit}>
          ‹ Back
        </button>
        <span className="select-title">揀難度 · Pick a level</span>
      </div>
      <p className="write-intro">
        Trace Pokémon names in Traditional Chinese, stroke by stroke! ✏️
      </p>
      {TIERS.map((tier) => {
        const meta = DIFFICULTY_META[tier]
        const list = pokemonByDifficulty(tier)
        const doneCount = list.filter((p) => learned.includes(p.id)).length
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
            <span className="diff-progress">
              {doneCount}/{list.length} ⭐
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Practice({
  pokemon,
  charIndex,
  posLabel,
  send,
}: {
  pokemon: WritingPokemon
  charIndex: number
  posLabel: string
  send: Send
}) {
  const chars = chineseChars(pokemon.nameZh)
  const char = chars[charIndex]
  const quizRef = useRef<HanziQuizHandle>(null)

  const [caption, setCaption] = useState('跟著筆順寫一寫')
  const [shakeKey, setShakeKey] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [done, setDone] = useState(false)
  const advanceTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setCaption('跟著筆順寫一寫')
    setShaking(false)
    setDone(false)
    return () => window.clearTimeout(advanceTimer.current)
  }, [charIndex, pokemon.id])

  const handleComplete = (mistakes: number) => {
    setDone(true)
    setCaption('好棒！')
    advanceTimer.current = window.setTimeout(() => {
      send({ type: 'NEXT_CHAR', mistakes })
    }, 1000)
  }

  const handleMistake = () => {
    setCaption('哎呀，再試一次！')
    setShakeKey((k) => k + 1)
    setShaking(true)
    window.setTimeout(() => setShaking(false), 450)
  }

  const handleCorrectStroke = () => {
    if (!done) setCaption('很好，繼續！')
  }

  return (
    <div className="screen write-screen">
      <div className="write-topbar">
        <button className="btn btn-ghost" onClick={() => send({ type: 'BACK' })}>
          ‹ 難度
        </button>
        <div className="write-progress">
          {chars.map((c, i) => (
            <span
              key={i}
              className={
                'char-chip ' +
                (i < charIndex ? 'chip-done' : i === charIndex ? 'chip-active' : 'chip-todo')
              }
            >
              {c}
            </span>
          ))}
        </div>
        <span className="tier-pos">{posLabel}</span>
      </div>

      <div className="write-poke">
        <img className="write-sprite" src={pokemonSrc(pokemon.sprite)} alt={pokemon.english} />
        <div className="write-names">
          <div className="write-zh">{pokemon.nameZh}</div>
          <div className="write-en">{pokemon.english}</div>
        </div>
      </div>

      <div className={`caption ${done ? 'good' : ''}`}>
        {caption} <span className="stroke-count">「{char}」{charStrokes(char)} 劃</span>
      </div>

      <div className={`hanzi-stage ${shaking ? 'shake' : ''}`} key={shakeKey}>
        <HanziQuiz
          key={`${pokemon.id}-${charIndex}`}
          ref={quizRef}
          char={char}
          size={300}
          onComplete={handleComplete}
          onMistake={handleMistake}
          onCorrectStroke={handleCorrectStroke}
          onLoadError={() => setCaption('這個字載入失敗，可以跳過')}
        />
      </div>

      <div className="write-controls">
        <button className="btn btn-ghost" onClick={() => quizRef.current?.animate()}>
          👀 看示範
        </button>
        <button className="btn btn-ghost" onClick={() => quizRef.current?.reset()}>
          ↻ 重寫
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => send({ type: 'NEXT_CHAR', mistakes: 0 })}
        >
          跳過 ›
        </button>
      </div>
    </div>
  )
}

function Celebrate({
  pokemon,
  nameMistakes,
  hasNext,
  send,
}: {
  pokemon: WritingPokemon
  nameMistakes: number
  hasNext: boolean
  send: Send
}) {
  return (
    <div className="screen result-screen">
      {Array.from({ length: 14 }).map((_, i) => (
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
      <h1 className="result-title win">學會了！</h1>
      <img className="result-hero win" src={pokemonSrc(pokemon.sprite)} alt={pokemon.english} />
      <div className="celebrate-name">{pokemon.nameZh}</div>
      <div className="write-en big">{pokemon.english}</div>
      <p className="tagline">
        {nameMistakes === 0
          ? '完美！一個錯都沒有 ⭐ Perfect stroke order!'
          : 'Great writing! Keep practising ✏️'}
      </p>
      <div className="result-actions">
        <button className="btn" onClick={() => send({ type: 'CONTINUE' })}>
          🏠 難度
        </button>
        {hasNext && (
          <button className="btn btn-primary" onClick={() => send({ type: 'NEXT_POKEMON' })}>
            下一隻 ›
          </button>
        )}
      </div>
    </div>
  )
}
