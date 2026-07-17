import { pokemonSrc } from './assets'

// Shared win/lose screen used at the end of any battle mode.

export interface ResultStat {
  label: string
  value: string | number
}

export interface ResultScreenProps {
  kind: 'win' | 'lose'
  title: string
  message: string
  heroSprite: string
  stats: ResultStat[]
  onHome: () => void
  onRetry: () => void
  homeLabel?: string
  retryLabel?: string
}

const CONFETTI_COLORS = ['#ffd23f', '#ff5d5d', '#58d66a', '#5f9de0', '#b47be0']

export function ResultScreen(props: ResultScreenProps) {
  const win = props.kind === 'win'
  return (
    <div className="screen result-screen">
      {win &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${(i * 7 + 4) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDuration: `${2 + (i % 4) * 0.6}s`,
              animationDelay: `${(i % 5) * 0.2}s`,
            }}
          />
        ))}
      <h1 className={`result-title ${win ? 'win' : 'lose'}`}>{props.title}</h1>
      <img
        className={`result-hero ${win ? 'win' : ''}`}
        src={pokemonSrc(props.heroSprite)}
        alt="buddy"
      />
      <div className="stat-row">
        {props.stats.map((s) => (
          <div className="stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <p className="tagline">{props.message}</p>
      <div className="result-actions">
        <button className="btn" onClick={props.onHome}>
          {props.homeLabel ?? '🏠 Home'}
        </button>
        <button className="btn btn-primary" onClick={props.onRetry}>
          {props.retryLabel ?? '↻ Play Again'}
        </button>
      </div>
    </div>
  )
}
