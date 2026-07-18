import { useEffect, useState } from 'react'
import { pokemonSrc } from './assets'

// Full-screen celebration overlays that recreate the classic Pokémon moments:
// a level-up flourish and the multi-phase evolution animation (silhouette
// cross-flash → white burst → grand reveal). Rendered above everything by App
// and played one at a time from a queue.

export type Celebration =
  | { kind: 'levelup'; name: string; sprite: string; level: number; fromLevel: number }
  | {
      kind: 'evolve'
      fromName: string
      toName: string
      fromSprite: string
      toSprite: string
      level: number
    }

export function CelebrationOverlay({
  event,
  onDone,
}: {
  event: Celebration
  onDone: () => void
}) {
  return event.kind === 'evolve' ? (
    <EvolveScene event={event} onDone={onDone} />
  ) : (
    <LevelUpScene event={event} onDone={onDone} />
  )
}

// ---- Level up ----
function LevelUpScene({
  event,
  onDone,
}: {
  event: Extract<Celebration, { kind: 'levelup' }>
  onDone: () => void
}) {
  // Snappy and auto-advancing — level-ups are frequent. Tap to skip.
  useEffect(() => {
    const t = window.setTimeout(onDone, 2000)
    return () => window.clearTimeout(t)
  }, [onDone])

  return (
    <div className="cele-overlay levelup" onClick={onDone}>
      <div className="cele-stars" />
      <div className="lvl-rays" />
      <Sparkles count={10} />
      <img className="lvl-mon" src={pokemonSrc(event.sprite)} alt={event.name} />
      <div className="lvl-title">LEVEL UP!</div>
      <div className="lvl-text">
        {event.name} grew to <b>Lv{event.level}</b>!
      </div>
      <div className="cele-hint">Tap to continue ▸</div>
    </div>
  )
}

// ---- Evolution ----
type EvoPhase = 'intro' | 'morph' | 'flash' | 'reveal'

function EvolveScene({
  event,
  onDone,
}: {
  event: Extract<Celebration, { kind: 'evolve' }>
  onDone: () => void
}) {
  const [phase, setPhase] = useState<EvoPhase>('intro')
  const [showNew, setShowNew] = useState(false)

  // intro → morph
  useEffect(() => {
    const t = window.setTimeout(() => setPhase('morph'), 1400)
    return () => window.clearTimeout(t)
  }, [])

  // morph: cross-flash the two silhouettes, accelerating, then a white burst.
  useEffect(() => {
    if (phase !== 'morph') return
    let delay = 320
    let elapsed = 0
    let flip = false
    let id = 0
    const tick = () => {
      flip = !flip
      setShowNew(flip)
      elapsed += delay
      delay = Math.max(70, delay * 0.8)
      if (elapsed >= 2800) {
        setPhase('flash')
        return
      }
      id = window.setTimeout(tick, delay)
    }
    id = window.setTimeout(tick, delay)
    return () => window.clearTimeout(id)
  }, [phase])

  // flash → reveal
  useEffect(() => {
    if (phase !== 'flash') return
    const t = window.setTimeout(() => setPhase('reveal'), 550)
    return () => window.clearTimeout(t)
  }, [phase])

  const revealed = phase === 'reveal'
  const caption = revealed
    ? `${event.fromName} evolved into ${event.toName}!`
    : `What? ${event.fromName} is evolving!`

  return (
    <div
      className={`cele-overlay evolve phase-${phase}`}
      onClick={revealed ? onDone : undefined}
    >
      <div className="cele-stars" />

      <div className="evo-stage">
        {phase === 'intro' && (
          <img className="evo-mon evo-breathe" src={pokemonSrc(event.fromSprite)} alt="" />
        )}

        {phase === 'morph' && (
          <img
            className="evo-mon evo-sil"
            src={pokemonSrc(showNew ? event.toSprite : event.fromSprite)}
            alt=""
          />
        )}

        {phase === 'flash' && <div className="evo-burst" />}

        {revealed && (
          <>
            <div className="evo-rays" />
            <Sparkles count={14} />
            <img className="evo-mon evo-pop" src={pokemonSrc(event.toSprite)} alt={event.toName} />
          </>
        )}
      </div>

      <div className={`cele-caption ${revealed ? 'grand' : ''}`}>
        {revealed && <span className="cele-congrats">Congratulations!</span>}
        {caption}
      </div>
      {revealed && <div className="cele-hint">Tap to continue ▸</div>}
    </div>
  )
}

// A scatter of twinkling sparkles, placed deterministically so it stays stable
// across re-renders (no Math.random needed per frame).
function Sparkles({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 34 + (i % 4) * 12
        const x = 50 + Math.cos(angle) * radius
        const y = 46 + Math.sin(angle) * radius * 0.7
        return (
          <span
            key={i}
            className="cele-spark"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${(i % 5) * 0.12}s`,
              fontSize: `${14 + (i % 3) * 6}px`,
            }}
          >
            ✦
          </span>
        )
      })}
    </>
  )
}
