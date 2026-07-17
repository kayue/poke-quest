import { useEffect, useRef, useState, type ReactNode } from 'react'
import { backgroundSrc, effectSrc, pokemonSrc } from './assets'

// Presentational "battle chrome" shared by every game mode: background, HUD
// (hearts + progress), the enemy Pokémon with its HP bar and hit/faint
// animations, the player's buddy, and the transient attack FX / floating text /
// banner. The game-specific interaction panel is passed as `children`.

export type BattlePhase = 'intro' | 'active' | 'faint'

export interface BattleBanner {
  text: string
  kind: 'good' | 'bad'
}

export interface BattleSceneProps {
  background: string
  enemyName: string
  enemySprite: string
  enemyHp: number
  enemyMaxHp: number
  heroSprite: string
  hearts: number
  maxHearts: number
  streak?: number

  /** Enemy lifecycle: appearing, fighting, or fainting. */
  phase: BattlePhase
  /** Increment on every hit/hurt to (re)play one-shot animations & FX. */
  pulse: number
  pulseKind?: 'hit' | 'hurt' | null
  effect?: string // attack-effect filename, shown on a hit
  floatText?: string
  floatKind?: 'dmg' | 'miss'
  banner?: BattleBanner | null

  /** Custom top-right HUD content; falls back to a trophy + progress bar. */
  hudRight?: ReactNode
  progressCurrent?: number
  progressTotal?: number

  onHome: () => void
  homeLabel?: string
  children: ReactNode
}

export function BattleScene(props: BattleSceneProps) {
  const { phase, pulse, pulseKind } = props

  // `active` gates the one-shot FX for ~600ms after each pulse. Alternating a/b
  // class suffixes force the CSS animation to restart even on rapid repeats.
  const [active, setActive] = useState(false)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setActive(true)
    const t = window.setTimeout(() => setActive(false), 600)
    return () => window.clearTimeout(t)
  }, [pulse])

  const parity = pulse % 2 === 0 ? 'a' : 'b'
  const enemyClass =
    phase === 'intro'
      ? 'appearing'
      : phase === 'faint'
        ? 'faint'
        : active && pulseKind === 'hit'
          ? `hit-${parity}`
          : ''
  const heroClass =
    active && pulseKind === 'hit'
      ? `atk-${parity}`
      : active && pulseKind === 'hurt'
        ? `hurt-${parity}`
        : ''

  const hpPct = props.enemyMaxHp > 0 ? (Math.max(0, props.enemyHp) / props.enemyMaxHp) * 100 : 0
  const progPct =
    props.progressTotal && props.progressTotal > 0
      ? Math.min(100, ((props.progressCurrent ?? 0) / props.progressTotal) * 100)
      : 0

  return (
    <div className="screen battle">
      <img className="battle-bg" src={backgroundSrc(props.background)} alt="" />

      <div className="hud">
        <div className="hearts" aria-label="lives">
          {Array.from({ length: props.maxHearts }).map((_, i) => (
            <span key={i} className={`heart ${i < props.hearts ? '' : 'lost'}`}>
              {i < props.hearts ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
        <div className="hud-right">
          {props.hudRight ?? (
            <>
              <span className="progress-label">
                🏆 {props.progressCurrent ?? 0}/{props.progressTotal ?? 0}
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progPct}%` }} />
              </div>
            </>
          )}
        </div>
      </div>

      <button className="btn btn-ghost home-btn" onClick={props.onHome}>
        {props.homeLabel ?? '⏸ Menu'}
      </button>

      <div className="arena">
        <div className="enemy-name">{props.enemyName}</div>
        <div className="enemy-hp">
          <div className="enemy-hp-fill" style={{ width: `${hpPct}%` }} />
        </div>
        <div className={`enemy-wrap ${enemyClass}`}>
          <div className="enemy-shadow" />
          <img className="enemy-sprite" src={pokemonSrc(props.enemySprite)} alt={props.enemyName} />
          {active && pulseKind === 'hit' && props.effect && (
            <div
              key={`fx-${pulse}`}
              className="attack-fx"
              style={{ backgroundImage: `url(${effectSrc(props.effect)})` }}
            />
          )}
          {active && props.floatText && (
            <div key={`ft-${pulse}`} className={`float-text ${props.floatKind === 'miss' ? 'miss' : 'dmg'}`}>
              {props.floatText}
            </div>
          )}
        </div>

        {active && props.banner && (
          <div key={`banner-${pulse}`} className={`battle-banner ${props.banner.kind}`}>
            {props.banner.text}
          </div>
        )}

        <div className={`hero-corner in-arena ${heroClass}`}>
          <img className="hero-battle-sprite" src={pokemonSrc(props.heroSprite)} alt="buddy" />
          {(props.streak ?? 0) >= 2 && <span className="streak-badge">🔥 {props.streak}</span>}
        </div>
      </div>

      <div className="battle-panel">{props.children}</div>
    </div>
  )
}
