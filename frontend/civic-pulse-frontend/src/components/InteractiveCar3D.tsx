import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import * as THREE from 'three';

const CarCanvasContainer = styled(motion.div)`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 77, 255, 0.1));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

const CarScene: React.FC<{ mousePosition: { x: number; y: number } }> = ({ mousePosition }) => {
  const carRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (carRef.current) {
      // Calculate rotation based on mouse position
      const targetRotationY = (mousePosition.x / window.innerWidth - 0.5) * 0.5;
      const targetRotationX = -(mousePosition.y / window.innerHeight - 0.5) * 0.2;
      
      // Smooth interpolation for car rotation
      carRef.current.rotation.y = THREE.MathUtils.lerp(carRef.current.rotation.y, targetRotationY, 0.05);
      carRef.current.rotation.x = THREE.MathUtils.lerp(carRef.current.rotation.x, targetRotationX, 0.05);
      
      // Subtle floating animation
      carRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <group ref={carRef} position={[0, -1, 0]} scale={[1.5, 1.5, 1.5]}>
      {/* Car Model - Using a simple car geometry for now */}
      <Car3DModel />
      
      {/* Neon underglow effect */}
      <pointLight
        position={[0, -0.5, 0]}
        color="#00d4ff"
        intensity={1}
        distance={5}
      />
      <pointLight
        position={[2, -0.5, 0]}
        color="#ff6b35"
        intensity={0.8}
        distance={4}
      />
      <pointLight
        position={[-2, -0.5, 0]}
        color="#7c4dff"
        intensity={0.8}
        distance={4}
      />
    </group>
  );
};

const Car3DModel: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing effect
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02);
    }
  });

  return (
    <group>
      {/* Car Body */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 1.3, -0.3]}>
        <boxGeometry args={[3, 0.8, 1.4]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Wheels */}
      {[
        [-1.8, -0.3, 1.2],
        [1.8, -0.3, 1.2],
        [-1.8, -0.3, -1.2],
        [1.8, -0.3, -1.2],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
      
      {/* Headlights */}
      <mesh position={[1.5, 0.3, 2.1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[-1.5, 0.3, 2.1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[1.3, 0.3, -2.1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ff1744"
          emissive="#ff1744"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-1.3, 0.3, -2.1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ff1744"
          emissive="#ff1744"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

interface InteractiveCar3DProps {
  className?: string;
}

const InteractiveCar3D: React.FC<InteractiveCar3DProps> = ({ className }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 8]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} color="#4a90e2" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          color="#ffffff"
          castShadow
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />
        
        {/* Environment */}
        <Environment preset="night" />
        
        {/* Car Scene */}
        <CarScene mousePosition={mousePosition} />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0a', 10, 50]} />
      </Canvas>
      
      {/* Overlay effects */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 212, 255, 0.1) 100%)',
          pointerEvents: 'none',
        }}
      />
    </CarCanvasContainer>
  );
};

export default InteractiveCar3D;
