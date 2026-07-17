import { useState } from 'react'
import { MathGame } from './features/math/MathGame'
import { WritingGame } from './features/writing/WritingGame'

type Activity = 'home' | 'math' | 'writing'

export function App() {
  const [activity, setActivity] = useState<Activity>('home')
  const goHome = () => setActivity('home')

  return (
    <div className="game-frame">
      {activity === 'home' && <Home onPick={setActivity} />}
      {activity === 'math' && <MathGame onExit={goHome} />}
      {activity === 'writing' && <WritingGame onExit={goHome} />}
    </div>
  )
}

function Home({ onPick }: { onPick: (a: Activity) => void }) {
  return (
    <div className="screen home-screen">
      <div className="pokeball" />
      <h1 className="game-title">
        POKÉ
        <span className="sub">Learn 🎒</span>
      </h1>
      <p className="tagline">Play, learn and grow with your Pokémon!</p>

      <div className="home-cards">
        <button className="home-card math" onClick={() => onPick('math')}>
          <span className="home-emoji">⚔️</span>
          <span className="home-card-title">Maths Quest</span>
          <span className="home-card-sub">Battle wild Pokémon with sums!</span>
        </button>
        <button className="home-card writing" onClick={() => onPick('writing')}>
          <span className="home-emoji">✍️</span>
          <span className="home-card-title">
            漢字 Writing
          </span>
          <span className="home-card-sub">Trace Pokémon names, stroke by stroke!</span>
        </button>
      </div>
    </div>
  )
}
