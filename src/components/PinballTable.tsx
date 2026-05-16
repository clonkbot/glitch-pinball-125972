import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PinballTable() {
  const gridRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef(0)

  useFrame((state) => {
    pulseRef.current = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5
  })

  return (
    <group>
      {/* Main table surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 14]} />
        <meshStandardMaterial
          color="#0d001f"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Neon grid overlay */}
      <mesh ref={gridRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 14]} />
        <shaderMaterial
          transparent
          uniforms={{
            time: { value: 0 },
            color1: { value: new THREE.Color('#ff00ff') },
            color2: { value: new THREE.Color('#00ffff') },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;

            void main() {
              vec2 grid = abs(fract(vUv * 20.0) - 0.5);
              float line = min(grid.x, grid.y);
              float alpha = smoothstep(0.0, 0.05, line) * 0.3;
              alpha = 1.0 - alpha;
              alpha *= 0.15;

              vec3 color = mix(color1, color2, vUv.y);
              gl_FragColor = vec4(color, alpha);
            }
          `}
        />
      </mesh>

      {/* Side walls */}
      <Wall position={[-3.3, 0.3, 0]} size={[0.2, 0.6, 14]} color="#ff00ff" />
      <Wall position={[3.3, 0.3, 0]} size={[0.2, 0.6, 14]} color="#00ffff" />
      <Wall position={[0, 0.3, -6.8]} size={[7, 0.6, 0.2]} color="#ff0066" />

      {/* Angled walls at bottom */}
      <group position={[-2.5, 0.3, 5]} rotation={[0, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.6, 2]} />
          <meshStandardMaterial
            color="#8800ff"
            emissive="#8800ff"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>
      <group position={[2.5, 0.3, 5]} rotation={[0, -0.6, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.6, 2]} />
          <meshStandardMaterial
            color="#8800ff"
            emissive="#8800ff"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Launch lane */}
      <Wall position={[3.0, 0.3, 2]} size={[0.1, 0.6, 8]} color="#ff0066" />

      {/* Decorative elements */}
      <DecorativeTriangle position={[0, 0.05, -5]} scale={1.5} />
      <DecorativeHexagon position={[-2, 0.05, 2]} scale={0.8} />
      <DecorativeHexagon position={[2, 0.05, 2]} scale={0.8} />
    </group>
  )
}

function Wall({ position, size, color }: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.9}
        roughness={0.2}
      />
    </mesh>
  )
}

function DecorativeTriangle({ position, scale }: {
  position: [number, number, number]
  scale: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
      <ringGeometry args={[0.8, 1, 3]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={0.5}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function DecorativeHexagon({ position, scale }: {
  position: [number, number, number]
  scale: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = -state.clock.elapsedTime * 0.3
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2 + 1) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
      <ringGeometry args={[0.4, 0.6, 6]} />
      <meshStandardMaterial
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.4}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}
