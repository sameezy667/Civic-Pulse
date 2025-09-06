import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { AlertTriangle, Map, FileText, Home, Bell, User, Settings, MapPin } from 'lucide-react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// Keyframes for neon glows and animations, matching the DALL-E reference
const neonGlow = (color: string) => keyframes`
  0%, 100% {
    box-shadow: 0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color};
  }
  50% {
    box-shadow: 0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color};
  }
`;

const subtlePulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Main container with a dark, deep background
const HeroContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #000000 0%, #0a0a1a 50%, #1a1a2e 100%);
  position: relative;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Header section for the title
const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
`;

const Title = styled(motion.h1)`
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3);
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  margin-top: 0.5rem;
`;

// Main content area holding the cards, car, and map
const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  width: 100%;
  max-width: 1400px;
  position: relative;
  gap: 2rem;
`;

const ActionCardsGrid = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 2rem;
  z-index: 10;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionCard = styled(motion.div)<{ color: string }>`
  background: rgba(20, 20, 40, 0.6);
  backdrop-filter: blur(15px);
  border: 1px solid ${props => props.color};
  border-radius: 16px;
  padding: 1.5rem;
  width: 220px;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  animation: ${props => neonGlow(props.color)} 3s ease-in-out infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  }
`;

const ActionIcon = styled.div`
  margin-bottom: 1rem;
  svg {
    width: 32px;
    height: 32px;
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
`;

const ActionDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
`;

const CarCanvasContainer = styled(motion.div)`
  width: 100%;
  height: 400px;
  position: relative;
  z-index: 5;
`;

const MapPanel = styled(motion.div)`
  position: absolute;
  right: 2rem;
  top: 10rem;
  width: 300px;
  height: 500px;
  background: rgba(10, 10, 20, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  z-index: 20;

  @media (max-width: 1200px) {
    display: none;
  }
`;

const NotificationToast = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 165, 0, 0.8);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ffffff;
  font-size: 0.9rem;
  box-shadow: 0 0 15px rgba(255, 165, 0, 0.4);
`;

const MapContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 1rem;
  border-radius: 12px;
  background: linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
`;

const MapPinIcon = styled.div`
  position: absolute;
  color: #ff9900;
  animation: ${subtlePulse} 2s ease-in-out infinite;
  svg {
    filter: drop-shadow(0 0 5px #ff9900);
  }
`;

const BottomNav = styled(motion.nav)`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 40, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  display: flex;
  gap: 1.5rem;
  z-index: 100;
`;

const NavButton = styled.button<{ active?: boolean }>`
  background: none;
  border: none;
  color: ${props => (props.active ? '#00ffff' : 'rgba(255, 255, 255, 0.7)')};
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
  padding: 0.5rem;
  
  &:hover {
    color: #ffffff;
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
    filter: ${props => (props.active ? 'drop-shadow(0 0 5px #00ffff)' : 'none')};
  }
`;

// 3D Model Component with corrected lighting
const MiataModel: React.FC = () => {
  const gltf = useLoader(GLTFLoader, '/models/miata.glb');
  const modelRef = useRef<THREE.Group>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const potholeRef = useRef<THREE.Mesh>(null);

  // Set up materials for glassy reflections
  useEffect(() => {
    gltf.scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material.metalness = 0.8;
        child.material.roughness = 0.2;
      }
    });
  }, [gltf]);

  useFrame((state) => {
    const { clock } = state;
    if (modelRef.current) {
      // Subtle floating animation
      modelRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.1 - 0.5;
    }
    if (potholeRef.current) {
      // Pulsing glow for the pothole
      const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.05;
      potholeRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* The Car Model */}
      <primitive ref={modelRef} object={gltf.scene} scale={2.5} position={[0, -0.5, 0]} />

      {/* Civic Context: Glowing Pothole */}
      <mesh ref={potholeRef} position={[-2.5, -0.95, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.8, 32]} />
        <meshBasicMaterial color="#ff4500" toneMapped={false} />
      </mesh>

      {/* Civic Context: Traffic Cone */}
      <mesh ref={coneRef} position={[2.5, -0.5, 0]}>
        <coneGeometry args={[0.3, 0.8, 16]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={0.5} />
      </mesh>

      {/* --- LIGHTING SETUP --- */}
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Environment for realistic reflections */}
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      {/* Key light from above */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
      />
      
      {/* Blue neon fill light */}
      <pointLight position={[-5, 2, 5]} intensity={1.5} color="#00ffff" />
      
      {/* Orange neon rim light */}
      <pointLight position={[5, 2, 5]} intensity={1.5} color="#ff4500" />
    </group>
  );
};

const HeroComponent: React.FC = () => {
  const actionCards = [
    {
      icon: AlertTriangle,
      title: 'Report Issue',
      description: 'Found a problem? Help your city.',
      color: '#ff4500',
    },
    {
      icon: Map,
      title: 'View Live Map',
      description: 'See reported incidents in real time.',
      color: '#00ffff',
    },
    {
      icon: FileText,
      title: 'My Reports',
      description: 'Track your submissions and get updates.',
      color: '#8a2be2',
    },
  ];

  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Bell, label: 'Notifications' },
    { icon: User, label: 'Account' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <HeroContainer>
      <Header>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          CIVIC PULSE
        </Title>
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          See, report, and resolve urban vehicle issues in real time.
        </Subtitle>
      </Header>

      <MainContent>
        <ActionCardsGrid
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, staggerChildren: 0.2 }}
        >
          {actionCards.map((card, index) => (
            <ActionCard
              key={index}
              color={card.color}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
            >
              <ActionIcon>
                <card.icon color={card.color} />
              </ActionIcon>
              <ActionTitle>{card.title}</ActionTitle>
              <ActionDescription>{card.description}</ActionDescription>
            </ActionCard>
          ))}
        </ActionCardsGrid>

        <CarCanvasContainer
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
            <MiataModel />
          </Canvas>
        </CarCanvasContainer>
      </MainContent>

      <MapPanel
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <NotificationToast>
          <MapPin color="#ff9900" size={20} />
          Pothole reported on Main St!
        </NotificationToast>
        <MapContainer>
          <MapPinIcon style={{ top: '40%', left: '50%' }}>
            <MapPin size={24} />
          </MapPinIcon>
        </MapContainer>
      </MapPanel>

      <BottomNav
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        {navItems.map((item, index) => (
          <NavButton key={index} active={item.active}>
            <item.icon />
          </NavButton>
        ))}
      </BottomNav>
    </HeroContainer>
  );
};

export default HeroComponent;
