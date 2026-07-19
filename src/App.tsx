import { useEffect, useMemo, useRef, useState } from 'react'
import { MathGame } from './features/math/MathGame'
import { WritingGame } from './features/writing/WritingGame'
import { HEROES } from './shared/heroes'
import { pokemonSrc } from './shared/assets'
import { CelebrationOverlay, type Celebration } from './shared/Celebration'
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

  // A queue of level-up / evolution moments waiting to be played, one at a time.
  const [celebrations, setCelebrations] = useState<Array<{ id: number; event: Celebration }>>([])
  const celeId = useRef(0)

  // Mirror `roster` in a ref so awardExp (an event handler) always reads the
  // latest value even across rapid consecutive awards, and can compute the
  // before/after buddy without a stale closure.
  const rosterRef = useRef(roster)

  // Persist whenever progress changes.
  useEffect(() => {
    rosterRef.current = roster
    saveRoster(roster)
  }, [roster])

  // The active buddy, resolved (name/sprite/level/EXP) from its saved EXP.
  const buddy = useMemo(
    () => resolveBuddy(roster.mons[roster.selectedId]),
    [roster],
  )

  // Award EXP to the active buddy (called by a game when a foe faints), and
  // queue any level-up / evolution that the new total triggers.
  const awardExp = (amount: number) => {
    const prev = rosterRef.current
    const mon = prev.mons[prev.selectedId]
    if (!mon || amount <= 0) return

    const before = resolveBuddy(mon)
    const nextMon = { ...mon, exp: mon.exp + amount }
    const after = resolveBuddy(nextMon)

    const next = { ...prev, mons: { ...prev.mons, [mon.baseId]: nextMon } }
    rosterRef.current = next
    setRoster(next)

    const events: Celebration[] = []
    if (after.level > before.level) {
      events.push({
        kind: 'levelup',
        // Use the pre-evolution species: a buddy grows to the new level *as its
        // old form*, then the evolution plays. (Identical to `after` when no
        // evolution happens this award.)
        name: before.name,
        sprite: before.sprite,
        level: after.level,
        fromLevel: before.level,
      })
    }
    // Show the level-up first, then the evolution it unlocked (classic order).
    if (after.speciesId !== before.speciesId) {
      events.push({
        kind: 'evolve',
        fromName: before.name,
        toName: after.name,
        fromSprite: before.sprite,
        toSprite: after.sprite,
        level: after.level,
      })
    }
    if (events.length) {
      setCelebrations((q) => [...q, ...events.map((event) => ({ id: celeId.current++, event }))])
    }
  }

  const selectBuddy = (baseId: string) => {
    setRoster((prev) => ({ ...prev, selectedId: baseId }))
    setView('home')
  }

  // While a celebration is on screen, the game underneath is paused (the Maths
  // answer timer must not tick down behind the overlay).
  const paused = celebrations.length > 0
  const head = celebrations[0]

  return (
    <div className="game-frame">
      {view === 'home' && (
        <Home buddy={buddy} onPick={setView} onChangeBuddy={() => setView('heroSelect')} />
      )}
      {view === 'heroSelect' && (
        <HeroSelect roster={roster} onSelect={selectBuddy} onBack={goHome} />
      )}
      {view === 'math' && (
        <MathGame buddy={buddy} awardExp={awardExp} onExit={goHome} paused={paused} />
      )}
      {view === 'writing' && <WritingGame buddy={buddy} awardExp={awardExp} onExit={goHome} />}

      {head && (
        <CelebrationOverlay
          key={head.id}
          event={head.event}
          onDone={() => setCelebrations((q) => q.slice(1))}
        />
      )}
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
