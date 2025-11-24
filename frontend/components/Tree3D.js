'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

// 3D Tree Component - Professional and compact
function Tree3DModel({ accelX, accelY, accelZ, gyroX, gyroY, gyroZ, isCut, isTilt }) {
  const treeRef = useRef()
  const trunkRef = useRef()
  const [fallAngle, setFallAngle] = useState(0)
  
  // Smooth interpolation for rotation
  const targetRotation = useRef({ x: 0, y: 0, z: 0 })
  const currentRotation = useRef({ x: 0, y: 0, z: 0 })
  const gyroRotation = useRef({ x: 0, y: 0, z: 0 })
  
  // WiFi signal animation refs
  const signalRef1 = useRef()
  const signalRef2 = useRef()
  const signalRef3 = useRef()
  const signalRefs = [signalRef1, signalRef2, signalRef3]
  
  useFrame((state, delta) => {
    if (!treeRef.current || !trunkRef.current) return
    
    // Check if we have real MPU6050 data (non-zero values indicate active sensor)
    const hasRealData = Math.abs(accelX) > 0.01 || Math.abs(accelY) > 0.01 || 
                        Math.abs(gyroX) > 0.01 || Math.abs(gyroY) > 0.01 || Math.abs(gyroZ) > 0.01
    
    if (hasRealData) {
      // Use REAL MPU6050 data for movement
      // Calculate tilt from accelerometer (convert to rotation angles)
      const accelMagnitude = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ)
      if (accelMagnitude > 0.1) {
        // Calculate tilt in degrees from real accelerometer data
        const tiltX = Math.atan2(accelY, Math.sqrt(accelX * accelX + accelZ * accelZ)) * (180 / Math.PI)
        const tiltZ = Math.atan2(accelX, Math.sqrt(accelY * accelY + accelZ * accelZ)) * (180 / Math.PI)
        
        // Set target rotation from real accelerometer (more responsive)
        targetRotation.current.x = tiltX
        targetRotation.current.z = tiltZ
      }
      
      // Apply real gyroscope rotation (cumulative angular velocity)
      gyroRotation.current.x += gyroX * delta * 0.15 // More responsive for real data
      gyroRotation.current.y += gyroY * delta * 0.15
      gyroRotation.current.z += gyroZ * delta * 0.15
      
      // Combine tilt (from accel) and gyro rotation - real data is more important
      targetRotation.current.x = targetRotation.current.x * 0.6 + gyroRotation.current.x * 0.4
      targetRotation.current.z = targetRotation.current.z * 0.6 + gyroRotation.current.z * 0.4
      targetRotation.current.y = gyroRotation.current.y
      
      // More responsive interpolation for real data
      const lerpFactor = 0.25 // Higher = more responsive to real sensor data
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpFactor
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpFactor
      currentRotation.current.z += (targetRotation.current.z - currentRotation.current.z) * lerpFactor
    } else {
      // No real data - use gentle wind animation
      const windSway = Math.sin(state.clock.elapsedTime * 0.8) * 1.5
      const windSwayX = Math.sin(state.clock.elapsedTime * 0.6) * 0.5
      currentRotation.current.y = windSway
      currentRotation.current.x = windSwayX * 0.3
    }
    
    // If tree is cut, make it fall dramatically
    if (isCut) {
      setFallAngle(prev => Math.min(prev + delta * 60, 90))
    } else {
      setFallAngle(prev => Math.max(prev - delta * 15, 0))
    }
    
    // Apply rotations
    const finalX = currentRotation.current.x + fallAngle
    const finalZ = currentRotation.current.z
    
    treeRef.current.rotation.x = THREE.MathUtils.degToRad(finalX)
    treeRef.current.rotation.z = THREE.MathUtils.degToRad(finalZ)
    treeRef.current.rotation.y = THREE.MathUtils.degToRad(currentRotation.current.y)
    
    // WiFi signal animation - expanding rings
    signalRefs.forEach((signalRef, idx) => {
      if (signalRef.current) {
        const time = state.clock.elapsedTime
        const delay = idx * 0.6 // Stagger the signals
        const cycleTime = 2.0 // 2 seconds per cycle
        const progress = ((time + delay) % cycleTime) / cycleTime // 0 to 1
        
        // Expand from 0.2 to 1.0
        const scale = 0.2 + progress * 0.8
        signalRef.current.scale.set(scale, scale, 1)
        
        // Fade out as it expands
        const opacity = (1 - progress) * 0.7
        if (signalRef.current.material) {
          signalRef.current.material.opacity = Math.max(0, opacity)
        }
      }
    })
  })
  
  // Optimized leaf positions - fewer but well-placed
  const leafPositions = [
    // Main crown layers (5 layers)
    [0, 0.3, 0, 0.4, 0.5],
    [0, 0.4, 0, 0.35, 0.4],
    [0, 0.5, 0, 0.28, 0.32],
    [0, 0.6, 0, 0.2, 0.25],
    [0, 0.65, 0, 0.12, 0.18],
    // Side branches (4 main branches)
    [-0.16, 0.15, 0, 0.22, 0.28],
    [0.16, 0.15, 0, 0.22, 0.28],
    [0, 0.2, 0.16, 0.2, 0.26],
    [0, 0.2, -0.16, 0.2, 0.26],
    // Diagonal branches (4 branches)
    [0.1, 0.25, 0.1, 0.18, 0.22],
    [-0.1, 0.25, -0.1, 0.18, 0.22],
    [0.1, 0.25, -0.1, 0.18, 0.22],
    [-0.1, 0.25, 0.1, 0.18, 0.22],
  ]

  return (
    <group ref={treeRef} position={[0, 0, 0]}>
      {/* Main Trunk - Optimized */}
      <mesh ref={trunkRef} position={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.0, 16]} />
        <meshStandardMaterial color="#5D4037" roughness={0.95} metalness={0.02} />
      </mesh>
      
      {/* Sensor Device - Attached to tree trunk (more visible) */}
      <group position={[0.11, -0.25, 0]} rotation={[0, 0, 0.15]}>
        {/* Mounting bracket - attaches to trunk */}
        <mesh position={[-0.01, 0, 0]} castShadow>
          <boxGeometry args={[0.03, 0.04, 0.03]} />
          <meshStandardMaterial color="#7F8C8D" roughness={0.7} />
        </mesh>
        {/* Main sensor box - larger and more visible */}
        <mesh position={[0.02, 0.01, 0]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.06]} />
          <meshStandardMaterial color="#2C3E50" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Sensor screen/display */}
        <mesh position={[0.02, 0.01, 0.032]} castShadow>
          <boxGeometry args={[0.08, 0.05, 0.01]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* LED indicator - more visible */}
        <mesh position={[0.05, 0.01, 0.032]} castShadow>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1.0} />
        </mesh>
        {/* Antenna/wire - more visible */}
        <mesh position={[0.08, 0.05, 0]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
          <meshStandardMaterial color="#34495E" />
        </mesh>
        {/* Small details - screws */}
        <mesh position={[-0.01, 0.02, 0.015]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.01, 6]} />
          <meshStandardMaterial color="#95A5A6" metalness={0.9} />
        </mesh>
        <mesh position={[-0.01, -0.02, 0.015]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.01, 6]} />
          <meshStandardMaterial color="#95A5A6" metalness={0.9} />
        </mesh>
      </group>
      
      {/* WiFi Signal Animation - Expanding rings from sensor */}
      <mesh
        ref={signalRef1}
        position={[0.11, -0.25, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.2, 0.01, 8, 32]} />
        <meshStandardMaterial
          color="#4A90E2"
          emissive="#4A90E2"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        ref={signalRef2}
        position={[0.11, -0.25, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.2, 0.01, 8, 32]} />
        <meshStandardMaterial
          color="#4A90E2"
          emissive="#4A90E2"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        ref={signalRef3}
        position={[0.11, -0.25, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.2, 0.01, 8, 32]} />
        <meshStandardMaterial
          color="#4A90E2"
          emissive="#4A90E2"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Main Crown Layers - Optimized cone layers */}
      {leafPositions.map((pos, idx) => {
        const [x, y, z, radius, height] = pos
        const greenVariations = [
          '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A'
        ]
        const greenColor = greenVariations[Math.min(Math.floor(idx / 3), greenVariations.length - 1)]
        
        return (
          <mesh key={`crown-${idx}`} position={[x, y, z]} castShadow>
            <coneGeometry args={[radius, height, 10]} />
            <meshStandardMaterial 
              color={greenColor} 
              roughness={0.6}
              emissive={greenColor}
              emissiveIntensity={0.04}
            />
          </mesh>
        )
      })}
      
      {/* Additional small leaf clusters for fullness - optimized */}
      {Array.from({ length: 8 }).map((_, idx) => {
        const angle = (idx / 8) * Math.PI * 2
        const radius = 0.12 + (idx % 3) * 0.05
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = 0.25 + (idx % 4) * 0.1
        const size = 0.06 + (idx % 2) * 0.03
        
        const greenShades = ['#388E3C', '#43A047', '#4CAF50']
        const color = greenShades[idx % greenShades.length]
        
        return (
          <mesh 
            key={`leaf-${idx}`} 
            position={[x, y, z]} 
            castShadow
          >
            <sphereGeometry args={[size, 6, 6]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.6}
              emissive={color}
              emissiveIntensity={0.03}
            />
          </mesh>
        )
      })}
      
      {/* Branch structures - visible branches (optimized) */}
      {[
        { pos: [-0.1, 0.1, 0], rot: [0, 0, -0.35], len: 0.18 },
        { pos: [0.1, 0.1, 0], rot: [0, 0, 0.35], len: 0.18 },
        { pos: [0, 0.1, 0.1], rot: [0.35, 0, 0], len: 0.16 },
        { pos: [0, 0.1, -0.1], rot: [-0.35, 0, 0], len: 0.16 },
      ].map((branch, idx) => (
        <group key={`branch-${idx}`} position={branch.pos} rotation={branch.rot}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.025, branch.len, 8]} />
            <meshStandardMaterial color="#6D4C41" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Ground plane - optimized */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#558B2F" roughness={0.85} />
      </mesh>
      
      {/* Grass texture overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.89, 0]} receiveShadow>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#66BB6A" roughness={0.9} opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

// Warning text when tree is cut or tilted
function WarningText({ isCut, isTilt }) {
  if (!isCut && !isTilt) return null
  
  return (
    <Text
      position={[0, 1.2, 0]}
      fontSize={0.12}
      color={isCut ? "#ff0000" : "#ff8800"}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.015}
      outlineColor="#ffffff"
    >
      {isCut ? "⚠️ DARAXT KESILGAN!" : "⚠️ OG'ILGAN"}
    </Text>
  )
}

// Main 3D Tree Visualization Component - Compact and Professional
export default function Tree3D({ 
  accelX = 0, 
  accelY = 0, 
  accelZ = -1, 
  gyroX = 0, 
  gyroY = 0, 
  gyroZ = 0,
  isCut = false,
  isTilt = false 
}) {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-50 to-blue-100 rounded-lg overflow-hidden border-2 border-blue-200 shadow-md">
      <Canvas
        camera={{ position: [2.2, 2.0, 2.2], fov: 55 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Enhanced Lighting for realistic tree */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight
          position={[5, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={10}
          shadow-camera-left={-2}
          shadow-camera-right={2}
          shadow-camera-top={2}
          shadow-camera-bottom={-2}
        />
        <directionalLight
          position={[-3, 4, -2]}
          intensity={0.3}
          color="#fff8e1"
        />
        <pointLight position={[2, 3, 2]} intensity={0.4} color="#e8f5e9" />
        <pointLight position={[-2, 2, -2]} intensity={0.2} color="#fff3e0" />
        <hemisphereLight
          skyColor="#87CEEB"
          groundColor="#8B7355"
          intensity={0.5}
        />
        
        {/* 3D Tree Model */}
        <Tree3DModel
          accelX={accelX}
          accelY={accelY}
          accelZ={accelZ}
          gyroX={gyroX}
          gyroY={gyroY}
          gyroZ={gyroZ}
          isCut={isCut}
          isTilt={isTilt}
        />
        
        {/* Warning Text */}
        <WarningText isCut={isCut} isTilt={isTilt} />
        
        {/* Camera Controls - compact */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.2}
          maxDistance={3}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Status overlay - compact */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center text-[10px] text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200 shadow-sm">
        <span className={`font-bold ${isCut ? "text-red-600" : isTilt ? "text-orange-600" : "text-green-600"}`}>
          {isCut ? "🔴 Kesilgan" : isTilt ? "🟡 Og'ilgan" : "🟢 Normal"}
        </span>
        <span className="text-gray-600 font-mono">
          A:{Math.sqrt(accelX*accelX + accelY*accelY + accelZ*accelZ).toFixed(1)}g
        </span>
      </div>
    </div>
  )
}

