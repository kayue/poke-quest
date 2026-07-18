import { useEffect, useMemo, useState } from 'react'
import { MathGame } from './features/math/MathGame'
import { WritingGame } from './features/writing/WritingGame'
import { HEROES } from './shared/heroes'
import { pokemonSrc } from './shared/assets'
import {
  loadRoster,
  resolveBuddy,
  saveRoster,
  type Buddy,
  type RosterState,
} from './shared/progress'

type View = 'home' | 'heroSelect' | 'math' | 'writing'

export function App() {
  const [view, setView] = useState<View>('home')
  const [roster, setRoster] = useState<RosterState>(loadRoster)
  const goHome = () => setView('home')

  // Persist whenever progress changes.
  useEffect(() => {
    saveRoster(roster)
  }, [roster])

  // The active buddy, resolved (name/sprite/level/EXP) from its saved EXP.
  const buddy = useMemo(
    () => resolveBuddy(roster.mons[roster.selectedId]),
    [roster],
  )

  // Award EXP to the active buddy (called by a game when a foe faints).
  const awardExp = (amount: number) => {
    setRoster((prev) => {
      const mon = prev.mons[prev.selectedId]
      if (!mon) return prev
      return {
        ...prev,
        mons: { ...prev.mons, [mon.baseId]: { ...mon, exp: mon.exp + amount } },
      }
    })
  }

  const selectBuddy = (baseId: string) => {
    setRoster((prev) => ({ ...prev, selectedId: baseId }))
    setView('home')
  }

  return (
    <div className="game-frame">
      {view === 'home' && (
        <Home buddy={buddy} onPick={setView} onChangeBuddy={() => setView('heroSelect')} />
      )}
      {view === 'heroSelect' && (
        <HeroSelect roster={roster} onSelect={selectBuddy} onBack={goHome} />
      )}
      {view === 'math' && <MathGame buddy={buddy} onExp={awardExp} onExit={goHome} />}
      {view === 'writing' && <WritingGame buddy={buddy} onExp={awardExp} onExit={goHome} />}
    </div>
  )
}

function Home({
  buddy,
  onPick,
  onChangeBuddy,
}: {
  buddy: Buddy
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
        <img className="buddy-pick-sprite" src={pokemonSrc(buddy.sprite)} alt={buddy.name} />
        <span className="buddy-pick-text">
          <span className="buddy-pick-name">
            {buddy.name} <span className="buddy-pick-lv">Lv{buddy.level}</span>
          </span>
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
  roster,
  onSelect,
  onBack,
}: {
  roster: RosterState
  onSelect: (baseId: string) => void
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
        {HEROES.map((h) => {
          const buddy = resolveBuddy(roster.mons[h.id])
          const selected = h.id === roster.selectedId
          return (
            <button
              key={h.id}
              className={`card ${selected ? 'card-selected' : ''}`}
              onClick={() => onSelect(h.id)}
            >
              <img className="hero-sprite" src={pokemonSrc(buddy.sprite)} alt={buddy.name} />
              <span className="card-name">
                {buddy.name} <span className="card-lv">Lv{buddy.level}</span>
              </span>
              <div className="card-exp">
                <div className="card-exp-track">
                  <div className="card-exp-fill" style={{ width: `${buddy.expPct}%` }} />
                </div>
                <span className="card-exp-text">
                  EXP {buddy.expIntoLevel}/{buddy.expForNext}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
