import { useEffect, useState, useRef } from 'react'

export default function GlitchOverlay() {
  const [glitchActive, setGlitchActive] = useState(false)
  const [chromaOffset, setChromaOffset] = useState({ r: 0, g: 0, b: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.92) {
        setGlitchActive(true)
        setChromaOffset({
          r: (Math.random() - 0.5) * 8,
          g: (Math.random() - 0.5) * 4,
          b: (Math.random() - 0.5) * 8,
        })
        setTimeout(() => {
          setGlitchActive(false)
          setChromaOffset({ r: 0, g: 0, b: 0 })
        }, 50 + Math.random() * 150)
      }
    }, 100)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <>
      {/* Scanlines */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
          opacity: 0.5,
        }}
      />

      {/* CRT vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 51,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Chromatic aberration overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 52,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: glitchActive ? 0.15 : 0,
          transition: 'opacity 0.05s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 0, 255, 0.3)',
            transform: `translate(${chromaOffset.r}px, ${chromaOffset.g}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 255, 255, 0.3)',
            transform: `translate(${chromaOffset.b}px, ${-chromaOffset.r}px)`,
          }}
        />
      </div>

      {/* Random glitch bars */}
      {glitchActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 53,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: `${2 + Math.random() * 8}px`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(90deg, transparent, ${Math.random() > 0.5 ? '#ff00ff' : '#00ffff'}40, transparent)`,
                transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Flicker overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 54,
          pointerEvents: 'none',
          background: 'transparent',
          animation: 'flicker 0.15s infinite',
        }}
      />

      {/* Noise texture */}
      <svg style={{ position: 'fixed', width: 0, height: 0 }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 49,
          pointerEvents: 'none',
          opacity: 0.03,
          filter: 'url(#noise)',
          mixBlendMode: 'overlay',
        }}
      />
    </>
  )
}
