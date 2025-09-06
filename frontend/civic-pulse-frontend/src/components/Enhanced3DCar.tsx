import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import * as THREE from 'three';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Float,
  Sparkles
} from '@react-three/drei';
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration
} from '@react-three/postprocessing';

const CarCanvasContainer = styled(motion.div)`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(124, 77, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.2),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
`;

// Enhanced Mazda Miata 3D Model Component using procedural geometry
const MazdaMiata: React.FC<{ mousePosition: { x: number; y: number } }> = ({ mousePosition }) => {
  const carRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  // Create car geometry
  const carGeometry = useMemo(() => {
    return {
      body: new THREE.BoxGeometry(4.2, 1.3, 2.2),
      hood: new THREE.BoxGeometry(1.8, 0.2, 2.0),
      roof: new THREE.BoxGeometry(2.8, 0.6, 1.8),
      windshield: new THREE.BoxGeometry(2.6, 0.8, 0.1),
      wheel: new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16),
      headlight: new THREE.SphereGeometry(0.3, 16, 16),
    };
  }, []);
  
  // Define safe zones for UI interaction
  const isSafeZone = useCallback((x: number, y: number): boolean => {
    // Top-left card (Report Issue)
    const topLeftCard = { x: 20, y: 80, width: 220, height: 130 };
    // Top-right card (View Live Map)
    const topRightCard = { x: window.innerWidth - 300, y: 120, width: 220, height: 130 };
    // Bottom-left card (My Reports)
    const bottomLeftCard = { x: 60, y: window.innerHeight - 230, width: 220, height: 130 };
    // Bottom navigation
    const bottomNav = { x: 0, y: window.innerHeight - 80, width: window.innerWidth, height: 80 };
    
    // Check if cursor is in any safe zone
    return (
      (x >= topLeftCard.x && x <= topLeftCard.x + topLeftCard.width && 
       y >= topLeftCard.y && y <= topLeftCard.y + topLeftCard.height) ||
      (x >= topRightCard.x && x <= topRightCard.x + topRightCard.width && 
       y >= topRightCard.y && y <= topRightCard.y + topRightCard.height) ||
      (x >= bottomLeftCard.x && x <= bottomLeftCard.x + bottomLeftCard.width && 
       y >= bottomLeftCard.y && y <= bottomLeftCard.y + bottomLeftCard.height) ||
      (x >= bottomNav.x && x <= bottomNav.x + bottomNav.width && 
       y >= bottomNav.y && y <= bottomNav.y + bottomNav.height)
    );
  }, []);
  
  useFrame((state) => {
    if (carRef.current) {
      // Only apply movement if not in a safe zone
      if (!isSafeZone(mousePosition.x, mousePosition.y)) {
        // Smooth cursor-driven parallax (limited range to avoid overlap)
        const targetRotationY = (mousePosition.x / window.innerWidth - 0.5) * 0.3;
        const targetRotationX = -(mousePosition.y / window.innerHeight - 0.5) * 0.15;
        
        // Forward/backward movement based on vertical mouse position
        const targetPositionZ = (mousePosition.y / window.innerHeight - 0.5) * 1.0;
        
        // Horizontal movement based on mouse position
        const targetPositionX = (mousePosition.x / window.innerWidth - 0.5) * 0.5;
        
        // Smooth interpolation for natural movement
        carRef.current.rotation.y = THREE.MathUtils.lerp(carRef.current.rotation.y, targetRotationY, 0.03);
        carRef.current.rotation.x = THREE.MathUtils.lerp(carRef.current.rotation.x, targetRotationX, 0.03);
        carRef.current.position.z = THREE.MathUtils.lerp(carRef.current.position.z, targetPositionZ, 0.02);
        carRef.current.position.x = THREE.MathUtils.lerp(carRef.current.position.x, targetPositionX, 0.02);
      }
      
      // Subtle floating animation (always applied)
      carRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // We're not applying materials to the model since we're using the fallback model
  // The original code that enhanced materials has been removed to prevent TypeScript errors

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
      <group ref={carRef} position={[0, -1, 0]} scale={[1.2, 1.2, 1.2]}>
        
        {/* Car Body with Neon Shader */}
        <mesh position={[0, 0.5, 0]} geometry={carGeometry.body}>
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
            emissive="#00d4ff"
            emissiveIntensity={0.1}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Hood */}
        <mesh position={[1.2, 0.75, 0]} geometry={carGeometry.hood}>
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.2}
            emissive="#00d4ff"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Convertible Roof */}
        <mesh position={[-0.3, 1.3, 0]} geometry={carGeometry.roof}>
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Windshield with Glass Effect */}
        <mesh position={[0.6, 1.1, 0]} rotation={[0, 0, -0.1]} geometry={carGeometry.windshield}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0}
            roughness={0}
            transmission={0.9}
            transparent={true}
            opacity={0.3}
            reflectivity={0.9}
            ior={1.5}
            thickness={0.1}
          />
        </mesh>

        {/* Headlights */}
        <mesh position={[2.1, 0.6, 0.7]} geometry={carGeometry.headlight}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#00d4ff"
            emissiveIntensity={0.8}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        <mesh position={[2.1, 0.6, -0.7]} geometry={carGeometry.headlight}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#00d4ff"
            emissiveIntensity={0.8}
            transparent={true}
            opacity={0.9}
          />
        </mesh>

        {/* Wheels with Rim Details */}
        {[
          [-1.6, -0.2, 1.1],
          [1.6, -0.2, 1.1],
          [-1.6, -0.2, -1.1],
          [1.6, -0.2, -1.1],
        ].map((position, index) => (
          <group key={index} position={position as [number, number, number]}>
            {/* Tire */}
            <mesh rotation={[Math.PI / 2, 0, 0]} geometry={carGeometry.wheel}>
              <meshStandardMaterial
                color="#1a1a1a"
                metalness={0.3}
                roughness={0.8}
              />
            </mesh>
            {/* Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
              <meshStandardMaterial
                color="silver"
                metalness={0.9}
                roughness={0.1}
                emissive="#00d4ff"
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        ))}
        
        {/* Add headlights */}
        {[
          [1.8, 0.3, 1.0],
          [1.8, 0.3, -1.0],
        ].map((position, index) => (
          <pointLight
            key={`headlight-${index}`}
            position={position as [number, number, number]}
            color="#00d4ff"
            intensity={2}
            distance={8}
            decay={2}
          />
        ))}
        
        {/* Add taillights */}
        {[
          [-1.9, 0.3, 0.8],
          [-1.9, 0.3, -0.8],
        ].map((position, index) => (
          <pointLight
            key={`taillight-${index}`}
            position={position as [number, number, number]}
            color="#ff1744"
            intensity={1}
            distance={4}
            decay={2}
          />
        ))}
        
        {/* Underglow effect */}
        <group position={[0, -0.8, 0]}>
          {[
            [0, 0, 0],
            [1.5, 0, 0],
            [-1.5, 0, 0],
            [0, 0, 1],
            [0, 0, -1],
          ].map((pos, index) => (
            <pointLight
              key={`underglow-${index}`}
              position={pos as [number, number, number]}
              color="#00d4ff"
              intensity={0.5}
              distance={3}
              decay={2}
            />
          ))}
        </group>
        
        {/* Particle Effects around the car */}
        <Sparkles
          count={50}
          scale={[8, 2, 8]}
          size={2}
          speed={0.3}
          color="#00d4ff"
        />
      </group>
    </Float>
  );
};

// Preload the model is moved inside the component

// Enhanced Car Scene with City Background
const EnhancedCarScene: React.FC<{ mousePosition: { x: number; y: number } }> = ({ mousePosition }) => {
  // Create memoized building positions to prevent re-randomization on each render
  const buildingHeights = useMemo(() => 
    Array.from({ length: 12 }, () => Math.random() * 6 + 2),
  []);
  
  const buildingPositions = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => [i * 4 - 24, Math.random() * 3 + 1, 0]),
  []);
  
  return (
    <>
      {/* City Silhouette Background */}
      <group position={[0, -2, -20]}>
        {/* Buildings silhouette */}
        {buildingPositions.map((position, i) => (
          <mesh key={i} position={position as [number, number, number]}>
            <boxGeometry args={[2, buildingHeights[i], 1]} />
            <meshStandardMaterial
              color="#0a0a0a"
              emissive="#1a1a2e"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
        
        {/* City lights */}
        {Array.from({ length: 20 }, (_, i) => (
          <pointLight
            key={`city-light-${i}`}
            position={[
              (Math.random() - 0.5) * 50,
              Math.random() * 5,
              Math.random() * 5 - 2
            ]}
            color={['#ffab00', '#00d4ff', '#ff6b35'][Math.floor(Math.random() * 3)]}
            intensity={0.3}
            distance={10}
            decay={2}
          />
        ))}
      </group>

      {/* Enhanced Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial 
          color="#1a1a2e"
          metalness={0.1}
          roughness={0.8}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Main Car Model */}
      <MazdaMiata mousePosition={mousePosition} />
    </>
  );
};

interface Enhanced3DCarProps {
  className?: string;
}

// Main Enhanced 3D Car Component
const Enhanced3DCar: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch devices on component mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: (event.touches[0].clientX - rect.left) / rect.width,
        y: (event.touches[0].clientY - rect.top) / rect.height,
      });
    }
  };

  // We're not preloading the model since we know it's just a placeholder text file
  // This prevents unnecessary errors in the console

  return (
    <CarCanvasContainer
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      whileHover={{ scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Canvas
        camera={{ position: [5, 2, 8], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        shadows
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[5, 2, 8]} />
        
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.2} color="#4a90e2" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Rim lights for dramatic effect */}
        <directionalLight
          position={[-10, 5, -10]}
          intensity={0.5}
          color="#ff6b35"
        />
        <directionalLight
          position={[0, -5, 10]}
          intensity={0.3}
          color="#7c4dff"
        />
        
        {/* Environment for reflections */}
        <Environment preset="night" />
        
        {/* Car Scene with all enhancements */}
        <MazdaMiata mousePosition={mousePosition} />
        
        {/* Post-processing effects for glow and bloom */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={512}
            opacity={1}
          />
          <ChromaticAberration
            offset={[0.0005, 0.0005]}
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
        
        {/* Disable orbit controls for parallax effect */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
        
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#0a0a0a', 15, 50]} />
      </Canvas>
      
      {/* Glass overlay effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 40%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(255, 107, 53, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(124, 77, 255, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
    </CarCanvasContainer>
  );
};

export default Enhanced3DCar;
