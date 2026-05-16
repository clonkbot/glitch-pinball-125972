import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback } from 'react'
import PinballScene from './components/PinballScene'
import GlitchOverlay from './components/GlitchOverlay'
import HUD from './components/HUD'
import './styles.css'

export default function App() {
  const [score, setScore] = useState(0)
  const [balls, setBalls] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [multiplier, setMultiplier] = useState(1)

  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points * multiplier)
  }, [multiplier])

  const loseBall = useCallback(() => {
    setBalls(prev => {
      if (prev <= 1) {
        setGameOver(true)
        return 0
      }
      return prev - 1
    })
  }, [])

  const resetGame = useCallback(() => {
    setScore(0)
    setBalls(3)
    setGameOver(false)
    setMultiplier(1)
  }, [])

  const increaseMultiplier = useCallback(() => {
    setMultiplier(prev => Math.min(prev + 0.5, 5))
  }, [])

  return (
    <div className="app-container">
      <GlitchOverlay />

      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 12, 8], fov: 50 }}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <PinballScene
              addScore={addScore}
              loseBall={loseBall}
              increaseMultiplier={increaseMultiplier}
              gameOver={gameOver}
              balls={balls}
            />
          </Suspense>
        </Canvas>
      </div>

      <HUD
        score={score}
        balls={balls}
        multiplier={multiplier}
        gameOver={gameOver}
        onRestart={resetGame}
      />

      <footer className="footer">
        <span className="footer-text">
          Requested by <span className="handle">@x402guy</span> · Built by <span className="handle">@clonkbot</span>
        </span>
      </footer>
    </div>
  )
}
