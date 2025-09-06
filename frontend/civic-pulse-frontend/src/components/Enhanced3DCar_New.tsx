import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import * as THREE from 'three';
import { 
  OrbitControls, 
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
  height: 100%;
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
    const topLeftCard = { x: 40, y: 60, width: 240, height: 140 };
    // Top-right card (View Live Map)
    const topRightCard = { x: window.innerWidth - 580, y: 100, width: 240, height: 140 };
    // Bottom-left card (My Reports)
    const bottomLeftCard = { x: 80, y: window.innerHeight - 220, width: 240, height: 140 };
    // Bottom navigation
    const bottomNav = { x: 0, y: window.innerHeight - 100, width: window.innerWidth, height: 100 };
    // Map button
    const mapButton = { x: window.innerWidth - 320, y: 20, width: 300, height: 400 };
    
    // Check if cursor is in any safe zone
    return (
      (x >= topLeftCard.x && x <= topLeftCard.x + topLeftCard.width && 
       y >= topLeftCard.y && y <= topLeftCard.y + topLeftCard.height) ||
      (x >= topRightCard.x && x <= topRightCard.x + topRightCard.width && 
       y >= topRightCard.y && y <= topRightCard.y + topRightCard.height) ||
      (x >= bottomLeftCard.x && x <= bottomLeftCard.x + bottomLeftCard.width && 
       y >= bottomLeftCard.y && y <= bottomLeftCard.y + bottomLeftCard.height) ||
      (x >= bottomNav.x && x <= bottomNav.x + bottomNav.width && 
       y >= bottomNav.y && y <= bottomNav.y + bottomNav.height) ||
      (x >= mapButton.x && x <= mapButton.x + mapButton.width && 
       y >= mapButton.y && y <= mapButton.y + mapButton.height)
    );
  }, []);
  
  useFrame((state) => {
    if (carRef.current) {
      // Only apply movement if not in a safe zone
      if (!isSafeZone(mousePosition.x, mousePosition.y)) {
        // Smooth cursor-driven parallax (limited range to avoid overlap)
        const targetRotationY = (mousePosition.x / window.innerWidth - 0.5) * 0.4;
        const targetRotationX = -(mousePosition.y / window.innerHeight - 0.5) * 0.2;
        
        // Forward/backward movement based on vertical mouse position
        const targetPositionZ = (mousePosition.y / window.innerHeight - 0.5) * 1.2;
        
        // Horizontal movement based on mouse position
        const targetPositionX = (mousePosition.x / window.innerWidth - 0.5) * 0.6;
        
        // Smooth interpolation for natural movement
        carRef.current.rotation.y = THREE.MathUtils.lerp(carRef.current.rotation.y, targetRotationY, 0.05);
        carRef.current.rotation.x = THREE.MathUtils.lerp(carRef.current.rotation.x, targetRotationX, 0.05);
        carRef.current.position.z = THREE.MathUtils.lerp(carRef.current.position.z, targetPositionZ, 0.03);
        carRef.current.position.x = THREE.MathUtils.lerp(carRef.current.position.x, targetPositionX, 0.03);
      }
      
      // Subtle floating animation (always applied)
      carRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.15}>
      <group ref={carRef} position={[0, -1, 0]} scale={[1.4, 1.4, 1.4]}>
        
        {/* Car Body with Neon Shader */}
        <mesh position={[0, 0.5, 0]} geometry={carGeometry.body}>
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
            emissive="#00d4ff"
            emissiveIntensity={0.15}
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
            emissiveIntensity={0.08}
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
            emissiveIntensity={1.2}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        <mesh position={[2.1, 0.6, -0.7]} geometry={carGeometry.headlight}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#00d4ff"
            emissiveIntensity={1.2}
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
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        ))}
        
        {/* Add headlight glow */}
        {[
          [2.0, 0.6, 0.7],
          [2.0, 0.6, -0.7],
        ].map((position, index) => (
          <pointLight
            key={`headlight-${index}`}
            position={position as [number, number, number]}
            color="#00d4ff"
            intensity={3}
            distance={12}
            decay={2}
          />
        ))}

        {/* Undercar neon glow */}
        <pointLight
          position={[0, -0.8, 0]}
          color="#ff6b35"
          intensity={2}
          distance={8}
          decay={2}
        />
      </group>
    </Float>
  );
};

// Enhanced Lighting System
const DynamicLighting: React.FC = () => {
  return (
    <>
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.3} color="#ffffff" />
      
      {/* Key light with cyan tint */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        color="#00d4ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light with orange accent */}
      <pointLight
        position={[-8, 5, 3]}
        intensity={1}
        color="#ff6b35"
        distance={20}
        decay={2}
      />
      
      {/* Rim light for edge definition */}
      <pointLight
        position={[0, 8, -10]}
        intensity={0.8}
        color="#7c4dff"
        distance={25}
        decay={2}
      />
    </>
  );
};

// Background Elements Component
const BackgroundElements: React.FC = () => {
  return (
    <>
      {/* Floating sparks around the car */}
      <Sparkles
        count={50}
        scale={[20, 10, 20]}
        size={3}
        speed={0.4}
        color="#00d4ff"
        opacity={0.6}
      />
      
      {/* Floating geometric elements */}
      {Array.from({ length: 8 }, (_, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={0.8}
        >
          <mesh
            position={[
              (Math.random() - 0.5) * 40,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 30,
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color={['#00d4ff', '#ff6b35', '#7c4dff'][Math.floor(Math.random() * 3)]}
              emissive={['#00d4ff', '#ff6b35', '#7c4dff'][Math.floor(Math.random() * 3)]}
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

// Main Enhanced 3D Car Component
const Enhanced3DCar: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <CarCanvasContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [8, 4, 8], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!isHovered}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />

        {/* Environment and Lighting */}
        <Environment preset="night" />
        <DynamicLighting />
        
        {/* Background Elements */}
        <BackgroundElements />
        
        {/* Main 3D Car Model */}
        <MazdaMiata mousePosition={mousePosition} />

        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            offset={[0.0005, 0.0012]}
          />
        </EffectComposer>
      </Canvas>

      {/* Floating info text */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.8rem',
          fontFamily: 'Inter, sans-serif',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        Interactive 3D Model • Move mouse to explore
      </motion.div>
    </CarCanvasContainer>
  );
};

export default Enhanced3DCar;
