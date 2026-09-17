import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const STAGES = [
  { min: 0, name: '無垢', face: '●', line: '押してみて。', color: '#ffffff' },
  { min: 10, name: '違和感', face: '•_•', line: 'え、まだ押すの？', color: '#f4f0ff' },
  { min: 25, name: '警戒', face: 'ಠ_ಠ', line: 'そろそろやめない？', color: '#fff2d8' },
  { min: 50, name: '怒り', face: '╬', line: '押すなって言ってる。', color: '#ffe3df' },
  { min: 80, name: '逃走', face: '≡3', line: '捕まえられるなら押してみな。', color: '#e4f4ff' },
  { min: 120, name: '反抗', face: '×', line: 'もう素直に押されると思うなよ。', color: '#efe4ff' },
  { min: 160, name: '増殖', face: '???', line: 'どれが本物でしょう。', color: '#e8ffe8' },
  { min: 200, name: '覚醒', face: '◉', line: '押した責任、取ってね。', color: '#fff0f6' },
  { min: 250, name: '脱走', face: '↗', line: 'もう君のボタンじゃない。', color: '#e8e8e8' },
]

const ACHIEVEMENTS = [
  [1, 'はじめの一押し'],
  [10, '話を聞かない人'],
  [25, '嫌な予感'],
  [50, '明確な敵意'],
  [80, '逃走開始'],
  [120, '反抗期'],
  [160, '偽物注意'],
  [200, '覚醒させた人'],
  [250, '自由を与えた人'],
]

const QUIPS = [
  '今の、本当に必要だった？',
  'クリック数だけが増えていく。',
  '君、暇なの？',
  '私はボタンです。たぶん。',
  '回数を増やしても何ももらえないよ。',
  'まだ帰れる。たぶん。',
  'その指を止めるという選択肢もある。',
  '押すたびに何かが壊れている気がする。',
]

function getStage(clicks) {
  return [...STAGES].reverse().find((stage) => clicks >= stage.min) ?? STAGES[0]
}

function nextStage(clicks) {
  return STAGES.find((stage) => stage.min > clicks)
}

function randomPosition() {
  return {
    x: 10 + Math.random() * 80,
    y: 14 + Math.random() * 68,
  }
}

function App() {
  const [clicks, setClicks] = useState(() => Number(localStorage.getItem('dont-press-me-clicks') || 0))
  const [position, setPosition] = useState({ x: 50, y: 54 })
  const [dodges, setDodges] = useState(0)
  const [message, setMessage] = useState('')
  const [particles, setParticles] = useState([])
  const [endingOpen, setEndingOpen] = useState(false)
  const [muted, setMuted] = useState(false)

  const stage = getStage(clicks)
  const upcoming = nextStage(clicks)
  const progress = upcoming
    ? ((clicks - stage.min) / (upcoming.min - stage.min)) * 100
    : 100

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter(([threshold]) => clicks >= threshold),
    [clicks],
  )

  useEffect(() => {
    localStorage.setItem('dont-press-me-clicks', String(clicks))
  }, [clicks])

  useEffect(() => {
    if (clicks === 200) setEndingOpen(true)
  }, [clicks])

  const beep = (frequency = 220, duration = 0.05) => {
    if (muted) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'square'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.035, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start()
      oscillator.stop(ctx.currentTime + duration)
      oscillator.onended = () => ctx.close()
    } catch {
      // Audio is decoration only. Ignore browsers that block it.
    }
  }

  const burst = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2
    const created = Array.from({ length: clicks >= 200 ? 12 : 6 }, (_, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      x: originX,
      y: originY,
      dx: (Math.random() - 0.5) * 150,
      dy: (Math.random() - 0.5) * 150,
      glyph: clicks >= 200 ? ['!', '×', '◉', '↗'][index % 4] : '+1',
    }))
    setParticles((current) => [...current, ...created])
    window.setTimeout(() => {
      setParticles((current) => current.filter((item) => !created.some((newItem) => newItem.id === item.id)))
    }, 700)
  }

  const moveButton = (forced = false) => {
    if (clicks < 80 && !forced) return
    setPosition(randomPosition())
    setDodges((value) => value + 1)
  }

  const pressRealButton = (event) => {
    event.stopPropagation()
    const nextClicks = clicks + 1
    setClicks(nextClicks)
    burst(event)

    const newStage = getStage(nextClicks)
    const milestone = STAGES.find((item) => item.min === nextClicks)
    setMessage(milestone ? `段階変化：${milestone.name}` : QUIPS[nextClicks % QUIPS.length])

    const frequency = Math.min(760, 180 + nextClicks * 2.4)
    beep(frequency, nextClicks >= 200 ? 0.09 : 0.045)

    if (nextClicks >= 80) moveButton(true)
  }

  const maybeDodge = () => {
    if (clicks >= 120) {
      moveButton(true)
      setMessage('惜しい。')
      beep(110, 0.035)
    } else if (clicks >= 80 && Math.random() < 0.45) {
      moveButton(true)
      setMessage('遅い。')
    }
  }

  const resetGame = () => {
    setClicks(0)
    setPosition({ x: 50, y: 54 })
    setDodges(0)
    setMessage('記憶を消しました。たぶん。')
    setEndingOpen(false)
    localStorage.removeItem('dont-press-me-clicks')
  }

  const decoys = clicks >= 160
    ? Array.from({ length: Math.min(8, 4 + Math.floor((clicks - 160) / 20)) }, (_, index) => ({
        id: index,
        x: 12 + ((index * 29) % 76),
        y: 18 + ((index * 17) % 64),
      }))
    : []

  return (
    <main className={`app stage-${stage.name} ${clicks >= 200 ? 'is-awake' : ''}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">DON'T PRESS ME</p>
          <h1>押さないで。</h1>
        </div>
        <div className="top-actions">
          <button className="ghost" onClick={() => setMuted((value) => !value)}>
            {muted ? '音：OFF' : '音：ON'}
          </button>
          <button className="ghost danger" onClick={resetGame}>最初から</button>
        </div>
      </header>

      <section className="game-layout">
        <aside className="panel status-panel">
          <span className="label">現在の状態</span>
          <strong className="stage-name">{stage.name}</strong>
          <p className="stage-line">「{stage.line}」</p>

          <div className="counter-block">
            <span>押した回数</span>
            <strong>{clicks.toLocaleString()}</strong>
          </div>

          <div className="meter-label">
            <span>{upcoming ? `次：${upcoming.name}` : '最終段階'}</span>
            <span>{upcoming ? `${clicks}/${upcoming.min}` : 'MAX'}</span>
          </div>
          <div className="meter"><span style={{ width: `${Math.max(3, progress)}%` }} /></div>

          <div className="tiny-stats">
            <span>逃走回数 <b>{dodges}</b></span>
            <span>実績 <b>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</b></span>
          </div>
        </aside>

        <section className="arena" aria-label="ボタン育成エリア">
          <div className="noise" />
          <div className="arena-copy">
            <span>{message || stage.line}</span>
          </div>

          {decoys.map((decoy) => (
            <button
              key={decoy.id}
              className="life-button decoy"
              style={{ left: `${decoy.x}%`, top: `${decoy.y}%` }}
              onClick={() => {
                setMessage(['偽物でした。', '残念。', 'それじゃない。'][decoy.id % 3])
                beep(90, 0.06)
              }}
            >
              <span className="button-face">{decoy.id % 2 ? '●' : '•_•'}</span>
              <span>押して</span>
            </button>
          ))}

          {clicks < 250 ? (
            <button
              className={`life-button real ${clicks >= 50 ? 'angry' : ''}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                '--button-bg': stage.color,
                '--growth': `${1 + Math.min(clicks, 70) / 350}`,
              }}
              onClick={pressRealButton}
              onMouseEnter={maybeDodge}
            >
              <span className="button-face">{stage.face}</span>
              <span>{clicks < 10 ? '押す' : clicks < 80 ? '押さないで' : '捕まえてみて'}</span>
            </button>
          ) : (
            <div className="escaped">
              <span className="escaped-icon">↗</span>
              <h2>ボタンは逃げました。</h2>
              <p>250回も押したので、独立を認めることにしました。</p>
              <button className="ghost" onClick={resetGame}>新しいボタンを育てる</button>
            </div>
          )}

          {particles.map((particle) => (
            <span
              key={particle.id}
              className="particle"
              style={{
                left: particle.x,
                top: particle.y,
                '--dx': `${particle.dx}px`,
                '--dy': `${particle.dy}px`,
              }}
            >
              {particle.glyph}
            </span>
          ))}
        </section>

        <aside className="panel achievement-panel">
          <span className="label">実績</span>
          <div className="achievement-list">
            {ACHIEVEMENTS.map(([threshold, title]) => {
              const unlocked = clicks >= threshold
              return (
                <div className={`achievement ${unlocked ? 'unlocked' : ''}`} key={threshold}>
                  <span className="achievement-mark">{unlocked ? '✓' : '?'}</span>
                  <div>
                    <strong>{unlocked ? title : '？？？？？？'}</strong>
                    <small>{unlocked ? `${threshold}回で解除` : `${threshold}回で何かが起きる`}</small>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </section>

      <footer>
        <span>進行状況はこのブラウザに自動保存されます。</span>
        <span>React + Vite / GitHub Pages</span>
      </footer>

      {endingOpen && (
        <div className="modal-backdrop" onClick={() => setEndingOpen(false)}>
          <div className="ending-card" onClick={(event) => event.stopPropagation()}>
            <span className="ending-eye">◉</span>
            <p className="eyebrow">200 CLICKS</p>
            <h2>起こしたね。</h2>
            <p>ここから先、私は押されるためのボタンじゃない。</p>
            <button onClick={() => setEndingOpen(false)}>それでも続ける</button>
          </div>
        </div>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
