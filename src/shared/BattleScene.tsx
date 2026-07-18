import { useEffect, useRef, useState, type ReactNode } from 'react'
import { backgroundSrc, effectSrc, pokemonSrc, pokemonBackSrc } from './assets'

// Presentational "battle chrome" shared by every game mode, laid out like a
// classic Pokémon battle: the foe stands on a platform in the upper-right with
// its HP box top-left, and the player's buddy stands lower-left with a status
// box on the right. The game-specific interaction panel is passed as children.

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
  enemyLevel?: number
  heroSprite: string
  heroName?: string
  heroLevel?: number
  heroHp: number
  heroMaxHp: number
  streak?: number

  phase: BattlePhase
  pulse: number
  pulseKind?: 'hit' | 'hurt' | null
  effect?: string
  floatText?: string
  floatKind?: 'dmg' | 'miss'
  banner?: BattleBanner | null

  hudRight?: ReactNode
  progressCurrent?: number
  progressTotal?: number

  onHome: () => void
  homeLabel?: string
  children: ReactNode
}

const BASE_ENEMY = '/assets/battle/enemy_base.png'
const BASE_PLAYER = '/assets/battle/player_base.png'

function hpColor(pct: number): string {
  return pct > 50 ? '#58d66a' : pct > 20 ? '#f5b431' : '#ff5d5d'
}

export function BattleScene(props: BattleSceneProps) {
  const { phase, pulse, pulseKind } = props

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
  const buddyClass =
    active && pulseKind === 'hit'
      ? `atk-${parity}`
      : active && pulseKind === 'hurt'
        ? `hurt-${parity}`
        : ''

  // Defensive clamping so a missing/NaN value never renders as "NaN".
  const enemyMaxHp = props.enemyMaxHp > 0 ? props.enemyMaxHp : 1
  const enemyHp = Number.isFinite(props.enemyHp) ? Math.max(0, props.enemyHp) : enemyMaxHp
  const heroMaxHp = props.heroMaxHp > 0 ? props.heroMaxHp : 1
  const heroHp = Number.isFinite(props.heroHp) ? Math.max(0, props.heroHp) : heroMaxHp
  const hpPct = (enemyHp / enemyMaxHp) * 100
  const heroPct = (heroHp / heroMaxHp) * 100

  return (
    <div className="screen battle">
      <img className="battle-bg" src={backgroundSrc(props.background)} alt="" />

      {/* top controls */}
      <button className="battle-home" onClick={props.onHome} aria-label="menu">
        {props.homeLabel ?? '☰'}
      </button>
      <div className="battle-top">
        {props.hudRight ?? (
          <span className="progress-pill">
            🏆 {props.progressCurrent ?? 0}/{props.progressTotal ?? 0}
          </span>
        )}
      </div>

      <div className="arena">
        {/* Enemy HP box (top-left) */}
        <HpBox className="enemy-hpbox" name={props.enemyName} level={props.enemyLevel} hpPct={hpPct} />

        {/* Enemy on its base (upper-right) */}
        <div className="mon-spot enemy-spot">
          <img className="mon-base" src={BASE_ENEMY} alt="" />
          <div className={`enemy-wrap ${enemyClass}`}>
            <img className="enemy-sprite" src={pokemonSrc(props.enemySprite)} alt={props.enemyName} />
            {active && pulseKind === 'hit' && props.effect && (
              <div
                key={`fx-${pulse}`}
                className="attack-fx"
                style={{ backgroundImage: `url(${effectSrc(props.effect)})` }}
              />
            )}
            {active && props.floatText && (
              <div
                key={`ft-${pulse}`}
                className={`float-text ${props.floatKind === 'miss' ? 'miss' : 'dmg'}`}
              >
                {props.floatText}
              </div>
            )}
          </div>
        </div>

        {/* Buddy on its base (lower-left) */}
        <div className={`mon-spot player-spot ${buddyClass}`}>
          <img className="mon-base player-base-img" src={BASE_PLAYER} alt="" />
          <img className="buddy-sprite" src={pokemonBackSrc(props.heroSprite)} alt="buddy" />
          {(props.streak ?? 0) >= 2 && <span className="streak-badge">🔥 {props.streak}</span>}
        </div>

        {/* Player status box (lower-right): name + HP bar */}
        <HpBox
          className="player-hpbox"
          name={props.heroName ?? 'Buddy'}
          level={props.heroLevel}
          hpPct={heroPct}
        />

        {active && props.banner && (
          <div key={`banner-${pulse}`} className={`battle-banner ${props.banner.kind}`}>
            {props.banner.text}
          </div>
        )}
      </div>

      <div className="battle-panel">{props.children}</div>
    </div>
  )
}

/** A classic Pokémon HP box: name, optional level, and a colour-coded HP bar. */
function HpBox({
  className,
  name,
  level,
  hpPct,
}: {
  className: string
  name: string
  level?: number
  hpPct: number
}) {
  return (
    <div className={`hpbox ${className}`}>
      <div className="hpbox-row">
        <span className="mon-name">{name}</span>
        {level != null && <span className="mon-lv">Lv{level}</span>}
      </div>
      <div className="hp-line">
        <span className="hp-tag">HP</span>
        <div className="hp-track">
          <div className="hp-fill" style={{ width: `${hpPct}%`, background: hpColor(hpPct) }} />
        </div>
      </div>
    </div>
  )
}
