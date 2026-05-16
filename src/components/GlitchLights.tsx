import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlitchLights() {
  const pointLightsRef = useRef<THREE.Group>(null)
  const scanlineRef = useRef<THREE.Mesh>(null)

  const glitchLightPositions = useMemo(() => [
    [-2, 3, -4],
    [2, 3, -4],
    [0, 4, -2],
    [-2.5, 2, 2],
    [2.5, 2, 2],
  ], [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Glitch effect on lights
    if (pointLightsRef.current) {
      pointLightsRef.current.children.forEach((light, i) => {
        if (light instanceof THREE.PointLight) {
          // Random intensity flickering
          const flicker = Math.random() > 0.98 ? 0 : 1
          const pulse = Math.sin(time * 5 + i) * 0.5 + 1.5
          light.intensity = pulse * flicker * 2

          // Occasional color glitch
          if (Math.random() > 0.995) {
            const colors = ['#ff00ff', '#00ffff', '#ff0066', '#00ff88', '#ffff00']
            light.color.set(colors[Math.floor(Math.random() * colors.length)])
          }
        }
      })
    }

    // Scanline movement
    if (scanlineRef.current) {
      scanlineRef.current.position.z = ((time * 3) % 14) - 7
      const material = scanlineRef.current.material as THREE.MeshBasicMaterial
      material.opacity = Math.random() > 0.9 ? 0.8 : 0.3
    }
  })

  return (
    <group>
      {/* Glitchy point lights */}
      <group ref={pointLightsRef}>
        {glitchLightPositions.map((pos, i) => (
          <pointLight
            key={i}
            position={pos as [number, number, number]}
            intensity={2}
            color={i % 2 === 0 ? '#ff00ff' : '#00ffff'}
            distance={8}
          />
        ))}
      </group>

      {/* Horizontal scanline */}
      <mesh ref={scanlineRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 0.05]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Vertical data streams */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <DataStream key={i} x={x} offset={i * 0.5} />
      ))}

      {/* Ambient particles */}
      <GlitchParticles />
    </group>
  )
}

function DataStream({ x, offset }: { x: number; offset: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + offset
      meshRef.current.position.z = ((time * 2) % 14) - 7
      const material = meshRef.current.material as THREE.MeshBasicMaterial
      material.opacity = Math.random() > 0.7 ? 0.6 : 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={[x, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.02, 0.5]} />
      <meshBasicMaterial color="#ff00ff" transparent opacity={0.3} />
    </mesh>
  )
}

function GlitchParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(300)
    for (let i = 0; i < 100; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = Math.random() * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    return pos
  }, [])

  const colors = useMemo(() => {
    const col = new Float32Array(300)
    const colorOptions = [
      [1, 0, 1],     // magenta
      [0, 1, 1],     // cyan
      [1, 0, 0.4],   // pink
      [0, 1, 0.5],   // green
    ]
    for (let i = 0; i < 100; i++) {
      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      col[i * 3] = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    return col
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < 100; i++) {
        // Glitch teleport effect
        if (Math.random() > 0.995) {
          positions[i * 3] = (Math.random() - 0.5) * 8
          positions[i * 3 + 1] = Math.random() * 5
          positions[i * 3 + 2] = (Math.random() - 0.5) * 16
        }

        // Slow drift upward
        positions[i * 3 + 1] += 0.005
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = 0
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={100}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}
