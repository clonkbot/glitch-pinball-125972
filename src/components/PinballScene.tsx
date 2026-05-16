import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import PinballTable from './PinballTable'
import Ball from './Ball'
import Flipper from './Flipper'
import Bumper from './Bumper'
import Ramp from './Ramp'
import GlitchLights from './GlitchLights'

interface PinballSceneProps {
  addScore: (points: number) => void
  loseBall: () => void
  increaseMultiplier: () => void
  gameOver: boolean
  balls: number
}

export default function PinballScene({
  addScore,
  loseBall,
  increaseMultiplier,
  gameOver,
  balls
}: PinballSceneProps) {
  const [ballPosition, setBallPosition] = useState<THREE.Vector3>(new THREE.Vector3(2.8, 0.3, 5))
  const [ballVelocity, setBallVelocity] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const [leftFlipperActive, setLeftFlipperActive] = useState(false)
  const [rightFlipperActive, setRightFlipperActive] = useState(false)
  const [isLaunching, setIsLaunching] = useState(true)
  const [launchPower, setLaunchPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const { size } = useThree()

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLeftFlipperActive(true)
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setRightFlipperActive(true)
      }
      if (e.key === ' ' && isLaunching) {
        setIsCharging(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLeftFlipperActive(false)
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setRightFlipperActive(false)
      }
      if (e.key === ' ' && isLaunching && isCharging) {
        launchBall()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameOver, isLaunching, isCharging, launchPower])

  // Touch controls - using native PointerEvent from R3F
  const handleTouchStart = useCallback((e: { clientX: number }) => {
    if (gameOver) return
    const x = e.clientX / size.width

    if (isLaunching) {
      setIsCharging(true)
    } else if (x < 0.5) {
      setLeftFlipperActive(true)
    } else {
      setRightFlipperActive(true)
    }
  }, [gameOver, isLaunching, size.width])

  const handleTouchEnd = useCallback((e: { clientX: number }) => {
    const x = e.clientX / size.width

    if (isLaunching && isCharging) {
      launchBall()
    } else if (x < 0.5) {
      setLeftFlipperActive(false)
    } else {
      setRightFlipperActive(false)
    }
  }, [isLaunching, isCharging, launchPower, size.width])

  const launchBall = useCallback(() => {
    const power = Math.max(0.3, launchPower)
    setBallVelocity(new THREE.Vector3(-0.1, 0, -power * 0.4))
    setIsLaunching(false)
    setIsCharging(false)
    setLaunchPower(0)
  }, [launchPower])

  // Charge launch power
  useFrame((_, delta) => {
    if (isCharging && isLaunching) {
      setLaunchPower(prev => Math.min(prev + delta * 2, 1))
    }
  })

  // Ball physics
  useFrame((_, delta) => {
    if (gameOver || isLaunching) return

    const gravity = new THREE.Vector3(0, 0, 0.015) // Table tilt
    const friction = 0.995
    const tableWidth = 3
    const tableLength = 6

    let newVelocity = ballVelocity.clone()
    newVelocity.add(gravity)
    newVelocity.multiplyScalar(friction)

    let newPosition = ballPosition.clone()
    newPosition.add(newVelocity)

    // Wall bounces
    if (newPosition.x > tableWidth - 0.2) {
      newPosition.x = tableWidth - 0.2
      newVelocity.x *= -0.8
    }
    if (newPosition.x < -tableWidth + 0.2) {
      newPosition.x = -tableWidth + 0.2
      newVelocity.x *= -0.8
    }
    if (newPosition.z < -tableLength + 0.5) {
      newPosition.z = -tableLength + 0.5
      newVelocity.z *= -0.8
    }

    // Ball lost
    if (newPosition.z > tableLength + 1) {
      loseBall()
      resetBall()
      return
    }

    // Flipper collision
    const leftFlipperPos = new THREE.Vector3(-1.2, 0, 4.5)
    const rightFlipperPos = new THREE.Vector3(1.2, 0, 4.5)

    if (leftFlipperActive) {
      const distToLeftFlipper = newPosition.distanceTo(leftFlipperPos)
      if (distToLeftFlipper < 1.2 && newPosition.z > 4) {
        newVelocity.z = -0.35
        newVelocity.x = 0.15
        addScore(10)
      }
    }

    if (rightFlipperActive) {
      const distToRightFlipper = newPosition.distanceTo(rightFlipperPos)
      if (distToRightFlipper < 1.2 && newPosition.z > 4) {
        newVelocity.z = -0.35
        newVelocity.x = -0.15
        addScore(10)
      }
    }

    setBallPosition(newPosition)
    setBallVelocity(newVelocity)
  })

  const resetBall = useCallback(() => {
    setBallPosition(new THREE.Vector3(2.8, 0.3, 5))
    setBallVelocity(new THREE.Vector3(0, 0, 0))
    setIsLaunching(true)
    setLaunchPower(0)
    setIsCharging(false)
  }, [])

  // Reset when game restarts
  useEffect(() => {
    if (balls === 3 && !gameOver) {
      resetBall()
    }
  }, [balls, gameOver, resetBall])

  const handleBumperHit = useCallback((points: number) => {
    addScore(points)
    // Add some randomness to ball direction
    setBallVelocity(prev => {
      const angle = Math.random() * Math.PI * 2
      return new THREE.Vector3(
        Math.cos(angle) * 0.2,
        0,
        Math.sin(angle) * 0.2 - 0.1
      )
    })
  }, [addScore])

  const handleRampHit = useCallback(() => {
    addScore(500)
    increaseMultiplier()
  }, [addScore, increaseMultiplier])

  return (
    <group
      ref={groupRef}
      rotation={[-0.3, 0, 0]}
      onPointerDown={handleTouchStart}
      onPointerUp={handleTouchEnd}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#6600ff" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        color="#ff00ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 5, -3]} intensity={2} color="#00ffff" />
      <pointLight position={[3, 5, -3]} intensity={2} color="#ff00ff" />

      <GlitchLights />

      {/* Environment */}
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0012', 10, 30]} />

      {/* Table */}
      <PinballTable />

      {/* Ball */}
      {!gameOver && (
        <Ball position={ballPosition} />
      )}

      {/* Flippers */}
      <Flipper position={[-1.2, 0.15, 4.5]} side="left" active={leftFlipperActive} />
      <Flipper position={[1.2, 0.15, 4.5]} side="right" active={rightFlipperActive} />

      {/* Bumpers */}
      <Bumper position={[-1.5, 0.2, -2]} onHit={() => handleBumperHit(100)} ballPosition={ballPosition} />
      <Bumper position={[0, 0.2, -3]} onHit={() => handleBumperHit(100)} ballPosition={ballPosition} />
      <Bumper position={[1.5, 0.2, -2]} onHit={() => handleBumperHit(100)} ballPosition={ballPosition} />
      <Bumper position={[-0.8, 0.2, -0.5]} onHit={() => handleBumperHit(150)} ballPosition={ballPosition} />
      <Bumper position={[0.8, 0.2, -0.5]} onHit={() => handleBumperHit(150)} ballPosition={ballPosition} />

      {/* Ramps */}
      <Ramp position={[-2.2, 0, 1]} rotation={[0, 0.3, 0]} onHit={handleRampHit} ballPosition={ballPosition} />
      <Ramp position={[2.2, 0, 1]} rotation={[0, -0.3, 0]} onHit={handleRampHit} ballPosition={ballPosition} />

      {/* Launch tube */}
      {isLaunching && (
        <mesh position={[2.8, 0.2, 5.5]}>
          <boxGeometry args={[0.4, 0.4, 0.8]} />
          <meshStandardMaterial
            color="#ff0066"
            emissive="#ff0066"
            emissiveIntensity={launchPower}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={15}
        blur={2}
        color="#ff00ff"
      />
    </group>
  )
}
