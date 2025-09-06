import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useGLTF, Environment, ContactShadows, PresentationControls, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import styled from 'styled-components';

// Styled container for the 3D scene
const MiataContainer = styled.div`
  width: 100%;
  height: 60vh;
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    height: 50vh;
  }
`;

// Urban environment component to create the civic context
const UrbanEnvironment: React.FC = () => {
  return (
    <group>
      {/* Street surface */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          transparent 
          opacity={0.8}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Street lines */}
      <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 15]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.6}
        />
      </mesh>
      
      {/* Traffic cones for civic context */}
      <mesh position={[-3, -0.8, 2]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial 
          color="#ff4336" 
          emissive="#ff4336"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[3, -0.8, -1]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial 
          color="#ff4336" 
          emissive="#ff4336"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Pothole representation */}
      <mesh position={[2, -1.15, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.8, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      <mesh position={[-2.5, -1.15, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.6, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Neon street lighting effects */}
      <pointLight 
        position={[-5, 3, -5]} 
        color="#ff4336" 
        intensity={1.5}
        distance={10}
        decay={2}
      />
      <pointLight 
        position={[5, 3, 5]} 
        color="#0096ff" 
        intensity={1.2}
        distance={8}
        decay={2}
      />
    </group>
  );
};

// Enhanced Miata model with glowing effects
const MiataModel: React.FC<{ mousePosition: { x: number; y: number } }> = ({ mousePosition }) => {
  const { scene } = useGLTF('/models/miata.glb');
  const modelRef = useRef<THREE.Group>(null);
  
  // Clone the scene to avoid conflicts
  const clonedScene = scene.clone();
  
  useEffect(() => {
    // Apply materials and lighting effects to the cloned scene
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enhanced materials with metallic and emissive properties
        if (child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          
          // Car body - glossy black with red accents
          if (child.name.toLowerCase().includes('body') || 
              child.name.toLowerCase().includes('hood') ||
              child.name.toLowerCase().includes('door')) {
            material.color.setHex(0x0a0a0a);
            material.metalness = 0.9;
            material.roughness = 0.1;
            material.emissive.setHex(0x330000);
            material.emissiveIntensity = 0.1;
          }
          
          // Headlights and taillights - glowing effects
          if (child.name.toLowerCase().includes('light') ||
              child.name.toLowerCase().includes('lamp')) {
            material.emissive.setHex(0xff4336);
            material.emissiveIntensity = 0.8;
            material.transparent = true;
            material.opacity = 0.9;
          }
          
          // Windows - tinted glass effect
          if (child.name.toLowerCase().includes('window') ||
              child.name.toLowerCase().includes('glass')) {
            material.color.setHex(0x000000);
            material.transparent = true;
            material.opacity = 0.3;
            material.metalness = 0.1;
            material.roughness = 0;
          }
          
          // Wheels and tires
          if (child.name.toLowerCase().includes('wheel') ||
              child.name.toLowerCase().includes('tire')) {
            material.color.setHex(0x1a1a1a);
            material.metalness = 0.8;
            material.roughness = 0.3;
          }
        }
      }
    });
  }, [clonedScene]);
  
  // Parallax effect based on mouse position
  useFrame(() => {
    if (modelRef.current) {
      const targetRotationY = (mousePosition.x - 0.5) * 0.3;
      const targetRotationX = (mousePosition.y - 0.5) * 0.1;
      
      modelRef.current.rotation.y += (targetRotationY - modelRef.current.rotation.y) * 0.05;
      modelRef.current.rotation.x += (targetRotationX - modelRef.current.rotation.x) * 0.05;
      
      // Subtle floating animation
      modelRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1 - 0.5;
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
      <PresentationControls
        global
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <primitive 
          ref={modelRef}
          object={clonedScene} 
          scale={[1.5, 1.5, 1.5]}
          position={[0, -0.5, 0]}
        />
      </PresentationControls>
    </Float>
  );
};

// Main Enhanced 3D Miata component
const Enhanced3DMiata: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <MiataContainer>
      <Canvas
        camera={{ 
          position: [0, 2, 8], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        {/* Lighting setup for dramatic urban night scene */}
        <ambientLight intensity={0.2} color="#0096ff" />
        
        {/* Key lights */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Neon accent lighting */}
        <pointLight 
          position={[-3, 2, 3]} 
          color="#ff4336" 
          intensity={2}
          distance={15}
          decay={2}
        />
        <pointLight 
          position={[3, 2, -3]} 
          color="#0096ff" 
          intensity={1.5}
          distance={12}
          decay={2}
        />
        
        {/* Rim lighting */}
        <pointLight 
          position={[0, 5, -5]} 
          color="#ffffff" 
          intensity={0.8}
          distance={20}
          decay={1}
        />
        
        {/* Urban environment */}
        <UrbanEnvironment />
        
        {/* The Miata model */}
        <MiataModel mousePosition={mousePosition} />
        
        {/* Contact shadows for realism */}
        <ContactShadows 
          rotation-x={Math.PI / 2} 
          position={[0, -1.2, 0]} 
          opacity={0.6} 
          width={10} 
          height={10} 
          blur={2} 
          far={10} 
        />
        
        {/* Environment lighting */}
        <Environment preset="night" />
        
        {/* Post-processing effects for glow and neon */}
        <EffectComposer>
          <Bloom 
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
          />
          <ChromaticAberration 
            offset={[0.001, 0.001]} 
          />
        </EffectComposer>
      </Canvas>
    </MiataContainer>
  );
};

// Preload the GLTF model
useGLTF.preload('/models/miata.glb');

export default Enhanced3DMiata;
