import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FlipperProps {
  position: [number, number, number]
  side: 'left' | 'right'
  active: boolean
}

export default function Flipper({ position, side, active }: FlipperProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const targetRotation = useRef(0)
  const currentRotation = useRef(0)

  const baseRotation = side === 'left' ? 0.3 : -0.3
  const activeRotation = side === 'left' ? -0.5 : 0.5

  useEffect(() => {
    targetRotation.current = active ? activeRotation : baseRotation
  }, [active, activeRotation, baseRotation])

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth rotation interpolation
      currentRotation.current += (targetRotation.current - currentRotation.current) * 0.3
      groupRef.current.rotation.y = currentRotation.current
    }

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = active
        ? 1.5
        : 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        position={[side === 'left' ? 0.4 : -0.4, 0, 0]}
        castShadow
      >
        <boxGeometry args={[1, 0.15, 0.25]} />
        <meshStandardMaterial
          color={active ? '#00ff88' : '#ff0066'}
          emissive={active ? '#00ff88' : '#ff0066'}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Pivot point glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={active ? 2 : 0.5}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Active indicator light */}
      {active && (
        <pointLight
          position={[side === 'left' ? 0.4 : -0.4, 0.3, 0]}
          intensity={3}
          color="#00ff88"
          distance={2}
        />
      )}
    </group>
  )
}
