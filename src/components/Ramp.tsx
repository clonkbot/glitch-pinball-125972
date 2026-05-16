import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RampProps {
  position: [number, number, number]
  rotation: [number, number, number]
  onHit: () => void
  ballPosition: THREE.Vector3
}

export default function Ramp({ position, rotation, onHit, ballPosition }: RampProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isActive, setIsActive] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  // Check collision with ball
  useEffect(() => {
    if (cooldown) return

    const rampPos = new THREE.Vector3(...position)
    const distance = rampPos.distanceTo(ballPosition)

    if (distance < 0.8 && ballPosition.z < position[2] + 1 && ballPosition.z > position[2] - 1) {
      setIsActive(true)
      setCooldown(true)
      onHit()

      setTimeout(() => {
        setIsActive(false)
      }, 500)

      setTimeout(() => {
        setCooldown(false)
      }, 1000)
    }
  }, [ballPosition, position, onHit, cooldown])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Ramp surface */}
      <mesh rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.05, 2]} />
        <meshStandardMaterial
          color={isActive ? '#00ff88' : '#6600ff'}
          emissive={isActive ? '#00ff88' : '#6600ff'}
          emissiveIntensity={isActive ? 2 : 0.5}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Side rails */}
      <mesh position={[-0.35, 0.1, 0]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 2]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.35, 0.1, 0]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 2]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Entry lights */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.02, 0.8 - i * 0.4]}>
          <boxGeometry args={[0.5, 0.02, 0.05]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={isActive ? '#00ff88' : '#ff0066'}
            emissiveIntensity={isActive ? 2 : 0.5 + Math.sin(i) * 0.3}
          />
        </mesh>
      ))}

      {/* Active indicator */}
      {isActive && (
        <pointLight
          position={[0, 0.5, 0]}
          intensity={5}
          color="#00ff88"
          distance={3}
        />
      )}

      {/* "MULTIPLIER" text indicator */}
      <mesh position={[0, 0.15, -0.5]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.4, 0.15]} />
        <meshBasicMaterial
          color={isActive ? '#00ff88' : '#ff0066'}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}
