import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BallProps {
  position: THREE.Vector3
}

export default function Ball({ position }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Points>(null)
  const trailPositions = useRef<number[]>(new Array(90).fill(0))
  const trailIndex = useRef(0)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.copy(position)
      meshRef.current.rotation.x += 0.1
      meshRef.current.rotation.z += 0.05

      // Glitch effect - occasional position jitter
      if (Math.random() > 0.95) {
        meshRef.current.position.x += (Math.random() - 0.5) * 0.05
        meshRef.current.position.z += (Math.random() - 0.5) * 0.05
      }
    }

    if (glowRef.current) {
      glowRef.current.position.copy(position)
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.2 + 1
      glowRef.current.scale.setScalar(pulse)
    }

    // Update trail
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array
      const idx = trailIndex.current % 30
      positions[idx * 3] = position.x
      positions[idx * 3 + 1] = position.y
      positions[idx * 3 + 2] = position.z
      trailIndex.current++
      trailRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={30}
            array={new Float32Array(90)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#00ffff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Main ball */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
          envMapIntensity={2}
        />
      </mesh>

      {/* Inner core */}
      <mesh position={position.toArray()}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>
    </group>
  )
}
