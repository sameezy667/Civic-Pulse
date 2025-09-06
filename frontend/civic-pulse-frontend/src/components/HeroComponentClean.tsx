import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, useSpring } from 'framer-motion';
import { AlertTriangle, MapPin, FileText, Radio } from 'lucide-react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

/**
 * CIVIC PULSE - Clean Glassmorphic Dashboard
 * 
 * Design Philosophy:
 * - Deep midnight background with subtle city lights
 * - Clean glassmorphic panels with minimal neon accents
 * - Professional 3D Miata with realistic lighting
 * - Civic context objects anchored to transparent road surface
 * - Minimal map design with thin neon lines
 * - Clear typography hierarchy with Inter font
 */

// Refined animations for clean aesthetic
const subtleGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2), 0 0 40px rgba(0, 255, 255, 0.1); 
  }
  50% { 
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.15); 
  }
`;

const underglow = keyframes`
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const livePulse = keyframes`
  0%, 100% { 
    background: rgba(255, 0, 128, 0.8);
    box-shadow: 0 0 10px rgba(255, 0, 128, 0.4);
  }
  50% { 
    background: rgba(255, 0, 128, 1);
    box-shadow: 0 0 20px rgba(255, 0, 128, 0.6);
  }
`;

const cityLights = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
`;

// Clean container with deep midnight background
const HeroContainer = styled.div`
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(0, 20, 40, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 30, 60, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, 
      #000000 0%, 
      #0a0a1a 25%, 
      #1a1a2e 50%, 
      #0a0a1a 75%, 
      #000000 100%
    );
  position: relative;
  padding: 4rem 2rem 2rem 2rem;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  
  /* Subtle city lights background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(1px 1px at 15% 25%, rgba(0, 255, 255, 0.4), transparent),
      radial-gradient(1px 1px at 35% 75%, rgba(255, 69, 0, 0.3), transparent),
      radial-gradient(1px 1px at 65% 15%, rgba(255, 0, 128, 0.3), transparent),
      radial-gradient(1px 1px at 85% 85%, rgba(0, 255, 255, 0.2), transparent);
    background-size: 400px 400px, 300px 300px, 500px 500px, 350px 350px;
    animation: ${cityLights} 6s ease-in-out infinite alternate;
    pointer-events: none;
    opacity: 0.8;
  }
`;

// Bold, glowing title
const Title = styled(motion.h1)`
  font-size: clamp(3.5rem, 10vw, 7rem);
  font-weight: 900;
  margin: 0 0 1rem 0;
  text-align: center;
  color: #ffffff;
  position: relative;
  z-index: 10;
  letter-spacing: -0.02em;
  
  text-shadow: 
    0 0 20px rgba(0, 255, 255, 0.4),
    0 0 40px rgba(0, 255, 255, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.3);
  
  /* Subtle neon glow effect */
  &::after {
    content: 'CIVIC PULSE';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: transparent;
    background: linear-gradient(135deg, #00ffff 0%, #ffffff 50%, #00ffff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    filter: blur(1px);
    z-index: -1;
    opacity: 0.3;
  }
`;

// Clean subtitle with professional spacing
const Subtitle = styled(motion.p)`
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 4rem 0;
  font-weight: 300;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 10;
  line-height: 1.4;
`;

// Main content grid with proper spacing
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto 4rem auto;
  position: relative;
  z-index: 5;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// Enhanced 3D car card with professional styling
const CarCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.02) 100%
    );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 2rem;
  height: 450px;
  position: relative;
  overflow: hidden;
  cursor: none;
  
  /* Transparent road surface for civic context */
  &::before {
    content: '';
    position: absolute;
    bottom: 80px;
    left: 10%;
    right: 10%;
    height: 4px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.3) 20%, 
      rgba(255, 255, 255, 0.4) 50%, 
      rgba(255, 255, 255, 0.3) 80%, 
      transparent 100%
    );
    border-radius: 2px;
    z-index: 1;
  }
  
  /* Subtle neon border glow */
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(45deg, 
      rgba(0, 255, 255, 0.2) 0%, 
      transparent 25%,
      transparent 75%,
      rgba(0, 255, 255, 0.2) 100%
    );
    border-radius: 25px;
    z-index: -1;
    animation: ${subtleGlow} 4s ease-in-out infinite;
  }
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 255, 255, 0.3);
  }
`;

// Underglow effect for the car
const CarUnderglow = styled.div`
  position: absolute;
  bottom: 70px;
  left: 30%;
  right: 30%;
  height: 20px;
  background: 
    radial-gradient(ellipse, 
      rgba(0, 255, 255, 0.6) 0%,
      rgba(0, 255, 255, 0.3) 40%,
      transparent 80%
    );
  border-radius: 50%;
  animation: ${underglow} 3s ease-in-out infinite;
  z-index: 2;
  filter: blur(8px);
`;

// Clean map card
const MapCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.08) 0%, 
      rgba(255, 255, 255, 0.04) 100%
    );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 2rem;
  height: 450px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(45deg, 
      rgba(255, 69, 0, 0.15) 0%, 
      transparent 50%,
      rgba(255, 69, 0, 0.15) 100%
    );
    border-radius: 25px;
    z-index: -1;
    opacity: 0.7;
  }
`;

// Minimal live badge
const LiveBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 0, 128, 0.8);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  animation: ${livePulse} 2.5s ease-in-out infinite;
  z-index: 10;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 128, 0.3);
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

// Minimal map content
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, 
      rgba(0, 20, 40, 0.6) 0%, 
      rgba(0, 30, 60, 0.4) 100%
    );
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.2);
`;

const MapContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 5;
`;

// Minimal map grid with thin neon lines
const MapGrid = styled.div`
  width: 85%;
  height: 75%;
  background: 
    linear-gradient(rgba(0, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.15) 1px, transparent 1px);
  background-size: 30px 30px;
  position: relative;
  border-radius: 8px;
  
  /* Small glowing pins */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 25% 35%, rgba(255, 0, 128, 0.8) 2px, transparent 4px),
      radial-gradient(circle at 75% 65%, rgba(0, 255, 255, 0.8) 2px, transparent 4px),
      radial-gradient(circle at 55% 25%, rgba(255, 69, 0, 0.8) 2px, transparent 4px),
      radial-gradient(circle at 40% 75%, rgba(0, 255, 255, 0.6) 1.5px, transparent 3px);
    border-radius: inherit;
  }
`;

// Action cards in arc layout
const ActionGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 5;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 100%
    );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 255, 255, 0.4);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }
`;

const ActionIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  svg {
    width: 24px;
    height: 24px;
    color: #000000;
  }
  
  ${ActionCard}:hover & {
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
  
  ${ActionCard}:hover & {
    color: #00ffff;
  }
`;

const ActionDescription = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s ease;
  
  ${ActionCard}:hover & {
    color: rgba(255, 255, 255, 0.9);
  }
`;

/**
 * Enhanced 3D Miata Model Component
 * 
 * Features:
 * - Professional lighting with blue/red neon reflections
 * - Civic context objects (cone, pothole warning)
 * - Smooth cursor parallax within card boundaries
 * - Realistic materials and sharp rendering
 */
interface MiataModelProps {
  mousePosition: { x: number; y: number };
}

const MiataModel: React.FC<MiataModelProps> = ({ mousePosition }) => {
  const meshRef = useRef<THREE.Group>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const alertRef = useRef<THREE.Mesh>(null);
  
  // Load the actual Miata GLTF model
  const gltf = useLoader(GLTFLoader, '/models/miata.glb');
  
  // Smooth spring values for professional movement
  const targetRotationX = useSpring(0, { damping: 25, stiffness: 120 });
  const targetRotationY = useSpring(0, { damping: 25, stiffness: 120 });
  const targetPositionZ = useSpring(0, { damping: 20, stiffness: 100 });

  useFrame((state) => {
    if (!meshRef.current) return;

    // Bounded cursor parallax - car moves within card limits
    const moveZ = Math.max(-1, Math.min(1, -mousePosition.y * 1.5));
    const tiltX = Math.max(-0.15, Math.min(0.15, mousePosition.y * 0.1));
    const tiltY = Math.max(-0.2, Math.min(0.2, mousePosition.x * 0.15));

    // Apply smooth transformations
    targetRotationX.set(tiltX);
    targetRotationY.set(tiltY);
    targetPositionZ.set(moveZ);

    meshRef.current.rotation.x = targetRotationX.get();
    meshRef.current.rotation.y = targetRotationY.get();
    meshRef.current.position.z = targetPositionZ.get();
    
    // Subtle breathing animation
    meshRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    
    // Animate civic context objects
    if (coneRef.current) {
      coneRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      coneRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    
    if (alertRef.current) {
      alertRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  // Configure materials for clean, sharp rendering
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enhanced materials for glass-like neon reflections
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.metalness = 0.8;
            material.roughness = 0.2;
            material.envMapIntensity = 1.5;
          }
        }
      });
    }
  }, [gltf]);

  return (
    <group>
      {/* Main Miata model - clean and well-lit */}
      <group ref={meshRef} scale={[2, 2, 2]} position={[0, -0.5, 0]}>
        <primitive object={gltf.scene.clone()} />
      </group>
      
      {/* Civic context: Traffic cone with realistic placement */}
      <mesh ref={coneRef} position={[2, 0.3, 0.8]} scale={[0.6, 0.6, 0.6]}>
        <coneGeometry args={[0.25, 0.8, 8]} />
        <meshPhongMaterial 
          color="#ff4500" 
          emissive="#ff2200" 
          emissiveIntensity={0.2}
          shininess={100}
        />
      </mesh>
      
      {/* Pothole warning indicator */}
      <mesh ref={alertRef} position={[-1.5, 0.02, 0.5]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 16]} />
        <meshBasicMaterial 
          color="#ff0080" 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Professional lighting setup for neon reflections */}
      <pointLight 
        position={[3, 3, 3]} 
        intensity={0.8} 
        color="#00ffff"
        distance={10}
        decay={2}
      />
      <pointLight 
        position={[-3, 2, 2]} 
        intensity={0.6} 
        color="#ff4500"
        distance={8}
        decay={2}
      />
      <spotLight 
        position={[0, 6, 0]} 
        angle={0.4} 
        penumbra={0.3} 
        intensity={1.2} 
        color="#ffffff"
        target-position={[0, -0.5, 0]}
        castShadow
      />
      
      {/* Ambient lighting for overall clarity */}
      <ambientLight intensity={0.3} color="#4080ff" />
      
      {/* Rim lighting for glass-like reflections */}
      <directionalLight
        position={[5, 5, -5]}
        intensity={0.5}
        color="#00ffff"
      />
    </group>
  );
};

const HeroComponent: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Precise mouse tracking for 3D parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = (e.currentTarget as Element)?.getBoundingClientRect?.();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    
    // Bounded coordinates to prevent layout breaking
    setMousePosition({ 
      x: Math.max(-1, Math.min(1, x)), 
      y: Math.max(-1, Math.min(1, y)) 
    });
  }, []);

  useEffect(() => {
    const container = document.querySelector('#car-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove as any);
      return () => container.removeEventListener('mousemove', handleMouseMove as any);
    }
  }, [handleMouseMove]);

  // Clean action items with professional spacing
  const actionItems = [
    {
      id: 'report',
      icon: AlertTriangle,
      title: 'Report Issue',
      description: 'Submit civic problems with precise location data',
      color: 'linear-gradient(135deg, #ff4500 0%, #ff6b35 100%)',
      delay: 0
    },
    {
      id: 'map',
      icon: MapPin,
      title: 'View Live Map',
      description: 'Monitor real-time city incidents and responses',
      color: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
      delay: 0.1
    },
    {
      id: 'reports',
      icon: FileText,
      title: 'My Reports',
      description: 'Track submission status and resolution updates',
      color: 'linear-gradient(135deg, #ff0080 0%, #ff4080 100%)',
      delay: 0.2
    }
  ];

  return (
    <HeroContainer>
      <Title
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        CIVIC PULSE
      </Title>
      
      <Subtitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        Professional urban vehicle monitoring and civic issue resolution
      </Subtitle>

      <ContentGrid>
        <CarCard
          id="car-container"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <CarUnderglow />
          <Canvas 
            camera={{ position: [0, 1, 6], fov: 40 }}
            shadows
            gl={{ antialias: true, alpha: true }}
          >
            <MiataModel mousePosition={mousePosition} />
          </Canvas>
        </CarCard>

        <MapCard
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          <LiveBadge>
            <Radio />
            LIVE
          </LiveBadge>
          <MapContainer>
            <MapContent>
              <h3 style={{ 
                color: '#ffffff', 
                fontSize: '1.1rem', 
                marginBottom: '1rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                City Monitoring
              </h3>
              <MapGrid />
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.85rem', 
                marginTop: '1rem',
                textAlign: 'center',
                fontWeight: '300'
              }}>
                4 active • 15 resolved today
              </p>
            </MapContent>
          </MapContainer>
        </MapCard>
      </ContentGrid>

      <ActionGrid>
        {actionItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <ActionCard
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 + item.delay,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ActionIcon color={item.color}>
                <IconComponent />
              </ActionIcon>
              <ActionTitle>{item.title}</ActionTitle>
              <ActionDescription>{item.description}</ActionDescription>
            </ActionCard>
          );
        })}
      </ActionGrid>
    </HeroContainer>
  );
};

export default HeroComponent;
