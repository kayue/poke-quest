import { useState } from 'react'
import { MathGame } from './features/math/MathGame'
import { WritingGame } from './features/writing/WritingGame'
import { HEROES, type Hero } from './shared/heroes'
import { pokemonSrc } from './shared/assets'

type View = 'home' | 'heroSelect' | 'math' | 'writing'

export function App() {
  const [view, setView] = useState<View>('home')
  const [hero, setHero] = useState<Hero>(HEROES[0])
  const goHome = () => setView('home')

  return (
    <div className="game-frame">
      {view === 'home' && (
        <Home hero={hero} onPick={setView} onChangeBuddy={() => setView('heroSelect')} />
      )}
      {view === 'heroSelect' && (
        <HeroSelect
          current={hero}
          onSelect={(h) => {
            setHero(h)
            setView('home')
          }}
          onBack={goHome}
        />
      )}
      {view === 'math' && <MathGame hero={hero} onExit={goHome} />}
      {view === 'writing' && <WritingGame hero={hero} onExit={goHome} />}
    </div>
  )
}

function Home({
  hero,
  onPick,
  onChangeBuddy,
}: {
  hero: Hero
  onPick: (v: View) => void
  onChangeBuddy: () => void
}) {
  return (
    <div className="screen home-screen">
      <div className="pokeball" />
      <h1 className="game-title">
        POKÉ
        <span className="sub">Learn 🎒</span>
      </h1>

      <button className="buddy-pick" onClick={onChangeBuddy}>
        <img className="buddy-pick-sprite" src={pokemonSrc(hero.sprite)} alt={hero.name} />
        <span className="buddy-pick-text">
          <span className="buddy-pick-name">{hero.name}</span>
          <span className="buddy-pick-hint">Tap to change buddy ⇄</span>
        </span>
      </button>

      <div className="home-cards">
        <button className="home-card math" onClick={() => onPick('math')}>
          <span className="home-emoji">⚔️</span>
          <span className="home-card-title">Maths Quest</span>
          <span className="home-card-sub">Battle wild Pokémon with sums!</span>
        </button>
        <button className="home-card writing" onClick={() => onPick('writing')}>
          <span className="home-emoji">✍️</span>
          <span className="home-card-title">漢字 Writing</span>
          <span className="home-card-sub">Trace Pokémon names, stroke by stroke!</span>
        </button>
      </div>
    </div>
  )
}

function HeroSelect({
  current,
  onSelect,
  onBack,
}: {
  current: Hero
  onSelect: (h: Hero) => void
  onBack: () => void
}) {
  return (
    <div className="screen select-screen">
      <div className="select-header">
        <button className="btn btn-ghost" onClick={onBack}>
          ‹ Back
        </button>
        <span className="select-title">Pick your buddy!</span>
      </div>
      <div className="card-grid">
        {HEROES.map((h) => (
          <button
            key={h.id}
            className={`card ${h.id === current.id ? 'card-selected' : ''}`}
            onClick={() => onSelect(h)}
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
