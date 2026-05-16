import { useState, useEffect, useCallback } from 'react'

interface HUDProps {
  score: number
  balls: number
  multiplier: number
  gameOver: boolean
  onRestart: () => void
}

export default function HUD({ score, balls, multiplier, gameOver, onRestart }: HUDProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [scoreGlitch, setScoreGlitch] = useState(false)

  // Animated score counter
  useEffect(() => {
    if (displayScore < score) {
      const diff = score - displayScore
      const increment = Math.ceil(diff / 10)
      const timer = setTimeout(() => {
        setDisplayScore(prev => Math.min(prev + increment, score))
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [score, displayScore])

  // Score glitch effect
  useEffect(() => {
    if (score > displayScore) {
      setScoreGlitch(true)
      setTimeout(() => setScoreGlitch(false), 200)
    }
  }, [score])

  const formatScore = useCallback((num: number) => {
    return num.toString().padStart(8, '0')
  }, [])

  return (
    <div className="hud-container">
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glitchText {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }

        @keyframes gameOverGlitch {
          0%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0);
          }
          10% {
            clip-path: inset(10% 0 60% 0);
            transform: translate(-5px, 0);
          }
          20% {
            clip-path: inset(40% 0 20% 0);
            transform: translate(5px, 0);
          }
          30% {
            clip-path: inset(70% 0 0% 0);
            transform: translate(-3px, 0);
          }
          40% {
            clip-path: inset(0 0 0 0);
            transform: translate(0);
          }
        }

        .hud-container {
          position: fixed;
          inset: 0;
          z-index: 60;
          pointer-events: none;
          padding: 16px;
          padding-top: calc(16px + env(safe-area-inset-top));
          display: flex;
          flex-direction: column;
        }

        .hud-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          animation: slideIn 0.5s ease-out;
        }

        .score-container {
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,0,50,0.8) 100%);
          border: 1px solid rgba(255,0,255,0.5);
          border-radius: 8px;
          padding: 12px 20px;
          backdrop-filter: blur(10px);
          box-shadow:
            0 0 20px rgba(255,0,255,0.3),
            inset 0 0 20px rgba(255,0,255,0.1);
        }

        .score-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(0,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 4px;
        }

        .score-value {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(24px, 6vw, 36px);
          font-weight: 900;
          color: #fff;
          text-shadow:
            0 0 10px #ff00ff,
            0 0 20px #ff00ff,
            0 0 30px #ff00ff,
            -2px 0 #ff00ff,
            2px 0 #00ffff;
          letter-spacing: 2px;
        }

        .score-value.glitch {
          animation: glitchText 0.2s ease-in-out;
        }

        .stats-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .stat-box {
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,30,50,0.8) 100%);
          border: 1px solid rgba(0,255,255,0.5);
          border-radius: 8px;
          padding: 8px 16px;
          backdrop-filter: blur(10px);
          box-shadow:
            0 0 15px rgba(0,255,255,0.3),
            inset 0 0 15px rgba(0,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(255,0,255,0.8);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #00ffff;
          text-shadow: 0 0 10px #00ffff;
        }

        .balls-display {
          display: flex;
          gap: 6px;
        }

        .ball-icon {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
          box-shadow: 0 0 8px #ff00ff;
        }

        .ball-icon.empty {
          background: rgba(255,255,255,0.2);
          box-shadow: none;
        }

        .multiplier-value {
          color: #00ff88;
          text-shadow: 0 0 10px #00ff88;
        }

        .hud-bottom {
          margin-top: auto;
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
        }

        .controls-hint {
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 12px 20px;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .controls-hint p {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          margin: 4px 0;
          letter-spacing: 1px;
        }

        .controls-hint .key {
          display: inline-block;
          background: rgba(255,0,255,0.3);
          border: 1px solid #ff00ff;
          border-radius: 4px;
          padding: 2px 8px;
          margin: 0 4px;
          color: #ff00ff;
        }

        .game-over-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(5px);
          pointer-events: auto;
        }

        .game-over-text {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(36px, 10vw, 64px);
          font-weight: 900;
          color: #ff0066;
          text-transform: uppercase;
          text-shadow:
            0 0 20px #ff0066,
            0 0 40px #ff0066,
            0 0 60px #ff0066,
            -4px 0 #ff0066,
            4px 0 #00ffff;
          animation: gameOverGlitch 0.5s infinite;
          margin-bottom: 16px;
        }

        .final-score {
          font-family: 'Share Tech Mono', monospace;
          font-size: clamp(18px, 5vw, 28px);
          color: #00ffff;
          text-shadow: 0 0 15px #00ffff;
          margin-bottom: 32px;
        }

        .restart-btn {
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #000;
          background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
          border: none;
          border-radius: 4px;
          padding: 16px 48px;
          cursor: pointer;
          box-shadow:
            0 0 20px rgba(0,255,255,0.5),
            0 0 40px rgba(255,0,255,0.3);
          transition: all 0.2s ease;
          min-height: 54px;
        }

        .restart-btn:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 30px rgba(0,255,255,0.7),
            0 0 60px rgba(255,0,255,0.5);
        }

        .restart-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 480px) {
          .hud-container {
            padding: 12px;
          }

          .score-container {
            padding: 8px 14px;
          }

          .stat-box {
            padding: 6px 12px;
          }

          .controls-hint {
            padding: 10px 16px;
          }

          .controls-hint p {
            font-size: 10px;
          }
        }
      `}</style>

      <div className="hud-top">
        <div className="score-container">
          <div className="score-label">Score</div>
          <div className={`score-value ${scoreGlitch ? 'glitch' : ''}`}>
            {formatScore(displayScore)}
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-box">
            <span className="stat-label">Balls</span>
            <div className="balls-display">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`ball-icon ${i >= balls ? 'empty' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-label">Multi</span>
            <span className="stat-value multiplier-value">x{multiplier.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="controls-hint">
          <p>
            <span className="key">←</span> Left Flipper
            <span className="key">→</span> Right Flipper
          </p>
          <p>
            <span className="key">SPACE</span> Launch Ball (hold to charge)
          </p>
          <p style={{ marginTop: '8px', opacity: 0.5 }}>
            Touch: Left/Right side = Flippers • Center = Launch
          </p>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-text">Game Over</div>
          <div className="final-score">Final Score: {formatScore(score)}</div>
          <button className="restart-btn" onClick={onRestart}>
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
