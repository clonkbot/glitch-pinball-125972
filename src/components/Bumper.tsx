import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BumperProps {
  position: [number, number, number]
  onHit: () => void
  ballPosition: THREE.Vector3
}

export default function Bumper({ position, onHit, ballPosition }: BumperProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [isHit, setIsHit] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const hitScale = useRef(1)

  // Check collision with ball
  useEffect(() => {
    if (cooldown) return

    const bumperPos = new THREE.Vector3(...position)
    const distance = bumperPos.distanceTo(ballPosition)

    if (distance < 0.5) {
      setIsHit(true)
      setCooldown(true)
      onHit()

      setTimeout(() => {
        setIsHit(false)
      }, 150)

      setTimeout(() => {
        setCooldown(false)
      }, 300)
    }
  }, [ballPosition, position, onHit, cooldown])

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 6) * 0.1 + 1
      const targetScale = isHit ? 1.5 : pulse
      hitScale.current += (targetScale - hitScale.current) * 0.2
      meshRef.current.scale.setScalar(hitScale.current)

      // Rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 2

      // Emissive intensity
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = isHit ? 3 : 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(isHit ? 2 : 1.3)
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = isHit ? 0.6 : 0.2
    }
  })

  const colors = ['#ff00ff', '#00ffff', '#ff0066', '#00ff88']
  const color = colors[Math.floor(position[0] + position[2]) % colors.length]

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {/* Main bumper */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.1, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={isHit ? 2 : 0.3}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Point light when hit */}
      {isHit && (
        <pointLight
          position={[0, 0.5, 0]}
          intensity={10}
          color={color}
          distance={3}
        />
      )}

      {/* Ring decoration */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.03, 8, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </group>
  )
}
