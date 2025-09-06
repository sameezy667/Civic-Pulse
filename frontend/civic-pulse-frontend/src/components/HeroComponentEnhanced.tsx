import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, useSpring } from 'framer-motion';
import { AlertTriangle, MapPin, FileText, Bell, Calendar, MessageSquare, Cone, Radio, Zap } from 'lucide-react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Enhanced keyframes for premium animations
const neonPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2), 0 0 60px rgba(0, 255, 255, 0.1); }
  50% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3), 0 0 90px rgba(0, 255, 255, 0.15); }
`;

const cityLightFlicker = keyframes`
  0%, 100% { opacity: 0.3; }
  25% { opacity: 0.5; }
  50% { opacity: 0.4; }
  75% { opacity: 0.6; }
`;

const underglow = keyframes`
  0%, 100% { 
    box-shadow: 
      0 8px 25px rgba(0, 255, 255, 0.4),
      0 15px 50px rgba(0, 255, 255, 0.2),
      0 25px 100px rgba(0, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 10px 30px rgba(0, 255, 255, 0.6),
      0 20px 60px rgba(0, 255, 255, 0.3),
      0 35px 120px rgba(0, 255, 255, 0.15);
  }
`;

const livePulse = keyframes`
  0%, 100% { 
    background: rgba(255, 0, 128, 0.9);
    box-shadow: 0 0 15px rgba(255, 0, 128, 0.5);
  }
  50% { 
    background: rgba(255, 0, 128, 1);
    box-shadow: 0 0 25px rgba(255, 0, 128, 0.8);
  }
`;

// Enhanced container with richer background
const HeroContainer = styled.div`
  min-height: 100vh;
  background: 
    radial-gradient(circle at 15% 25%, rgba(255, 0, 128, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 85% 75%, rgba(0, 255, 255, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(255, 69, 0, 0.04) 0%, transparent 60%),
    linear-gradient(135deg, 
      #000000 0%, 
      #0a0a0f 15%, 
      #1a1a2e 35%, 
      #16213e 55%, 
      #0f1419 75%, 
      #000000 100%
    );
  position: relative;
  padding: 6rem 2rem 4rem 2rem;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  
  /* Enhanced city lights background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(2px 2px at 20% 30%, rgba(0, 255, 255, 0.4), transparent),
      radial-gradient(2px 2px at 40% 70%, rgba(255, 69, 0, 0.3), transparent),
      radial-gradient(1px 1px at 60% 15%, rgba(255, 0, 128, 0.4), transparent),
      radial-gradient(1px 1px at 80% 85%, rgba(0, 255, 255, 0.3), transparent),
      radial-gradient(2px 2px at 10% 90%, rgba(255, 69, 0, 0.2), transparent);
    background-size: 300px 300px, 400px 400px, 200px 200px, 350px 350px, 250px 250px;
    animation: ${cityLightFlicker} 4s ease-in-out infinite alternate;
    pointer-events: none;
    opacity: 0.6;
  }
  
  /* Tech grid overlay - more subtle */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 1;
  }
`;

// Enhanced title with better glow and positioning
const Title = styled(motion.h1)`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  margin: 0 0 1rem 0;
  text-align: center;
  background: linear-gradient(135deg, 
    #ffffff 0%, 
    #00ffff 30%, 
    #ffffff 60%, 
    #ff4500 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 10;
  letter-spacing: -0.02em;
  
  text-shadow: 
    0 0 30px rgba(0, 255, 255, 0.5),
    0 0 60px rgba(0, 255, 255, 0.3),
    0 0 90px rgba(0, 255, 255, 0.1);
  
  &::before {
    content: 'CIVIC PULSE';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #00ffff 0%, #ff4500 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: blur(2px);
    z-index: -1;
    opacity: 0.7;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0 0 4rem 0;
  font-weight: 300;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 10;
  line-height: 1.6;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 5;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// Enhanced 3D car card with better sizing and effects
const CarCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.08) 0%, 
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0.02) 100%
    );
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 3rem;
  height: 500px;
  position: relative;
  overflow: hidden;
  cursor: none;
  
  /* Enhanced neon border glow */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      rgba(0, 255, 255, 0.3) 0%, 
      rgba(255, 69, 0, 0.2) 25%,
      rgba(255, 0, 128, 0.3) 50%,
      rgba(0, 255, 255, 0.2) 75%,
      rgba(255, 69, 0, 0.3) 100%
    );
    border-radius: 26px;
    z-index: -1;
    animation: ${neonPulse} 3s ease-in-out infinite;
  }
  
  /* Underglow shadow */
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 20%;
    right: 20%;
    height: 40px;
    background: 
      radial-gradient(ellipse, 
        rgba(0, 255, 255, 0.4) 0%,
        rgba(0, 255, 255, 0.2) 40%,
        transparent 80%
      );
    border-radius: 50%;
    animation: ${underglow} 2s ease-in-out infinite;
    z-index: -1;
  }
  
  &:hover {
    transform: translateY(-5px);
    
    &::before {
      animation-duration: 1.5s;
    }
  }
`;

const MapCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.06) 0%, 
      rgba(255, 255, 255, 0.03) 100%
    );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  height: 500px;
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
      rgba(0, 255, 255, 0.2) 0%, 
      rgba(255, 69, 0, 0.1) 50%,
      rgba(0, 255, 255, 0.2) 100%
    );
    border-radius: 25px;
    z-index: -1;
    opacity: 0.6;
  }
`;

// Enhanced map with city context
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, 
      rgba(0, 30, 60, 0.8) 0%, 
      rgba(0, 15, 30, 0.9) 100%
    );
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  
  /* City skyline background */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: 
      linear-gradient(to top,
        rgba(0, 0, 0, 0.4) 0%,
        transparent 100%
      ),
      url("data:image/svg+xml,%3Csvg width='200' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60h200V0h-20v40h-15V20h-20v20h-15V15h-25v25h-20V10h-15v30h-20V25h-15v15h-20V30h-15v10h-20V20h-15v20H0z' fill='rgba(0,255,255,0.1)'/%3E%3C/svg%3E") repeat-x;
    background-size: 200px 60px, 200px 60px;
    opacity: 0.6;
    pointer-events: none;
  }
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 0, 128, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${livePulse} 2s ease-in-out infinite;
  z-index: 10;
  
  svg {
    width: 12px;
    height: 12px;
  }
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

const MapGrid = styled.div`
  width: 80%;
  height: 70%;
  background: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  position: relative;
  border-radius: 12px;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 30% 40%, rgba(255, 0, 128, 0.3) 4px, transparent 8px),
      radial-gradient(circle at 70% 60%, rgba(0, 255, 255, 0.4) 3px, transparent 6px),
      radial-gradient(circle at 50% 25%, rgba(255, 69, 0, 0.3) 5px, transparent 10px);
    border-radius: inherit;
  }
`;

// Enhanced action cards with more space and better animations
const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 5;
`;

const ActionCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.08) 0%, 
      rgba(255, 255, 255, 0.04) 100%
    );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
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
    transition: left 0.6s;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(0, 255, 255, 0.4);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(0, 255, 255, 0.2);
    
    &::before {
      left: 100%;
    }
  }
`;

const ActionIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  transition: all 0.3s ease;
  
  svg {
    width: 28px;
    height: 28px;
    color: #000000;
  }
  
  ${ActionCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
  transition: color 0.3s ease;
  
  ${ActionCard}:hover & {
    color: #00ffff;
  }
`;

const ActionDescription = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
  transition: color 0.3s ease;
  
  ${ActionCard}:hover & {
    color: rgba(255, 255, 255, 0.9);
  }
`;

// Enhanced 3D Miata component with civic context
interface MiataModelProps {
  mousePosition: { x: number; y: number };
}

const MiataModel: React.FC<MiataModelProps> = ({ mousePosition }) => {
  const meshRef = useRef<THREE.Group>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  
  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, '/models/miata.glb');
  
  // Smooth spring values
  const targetRotationX = useSpring(0, { damping: 20, stiffness: 100 });
  const targetRotationY = useSpring(0, { damping: 20, stiffness: 100 });
  const targetPositionZ = useSpring(0, { damping: 15, stiffness: 80 });

  useFrame((state) => {
    if (!meshRef.current) return;

    // Enhanced cursor parallax with boundaries
    const moveZ = Math.max(-1.5, Math.min(1.5, -mousePosition.y * 2.5));
    const tiltX = Math.max(-0.2, Math.min(0.2, mousePosition.y * 0.15));
    const tiltY = Math.max(-0.3, Math.min(0.3, mousePosition.x * 0.2));

    // Update spring targets
    targetRotationX.set(tiltX);
    targetRotationY.set(tiltY);
    targetPositionZ.set(moveZ);

    // Apply smooth transformations
    meshRef.current.rotation.x = targetRotationX.get();
    meshRef.current.rotation.y = targetRotationY.get();
    meshRef.current.position.z = targetPositionZ.get();
    
    // Subtle floating animation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    // Animate cone if present
    if (coneRef.current) {
      coneRef.current.rotation.y += 0.01;
      coneRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Enhanced Miata model - larger scale */}
      <group ref={meshRef} scale={[2.2, 2.2, 2.2]} position={[0, -0.8, 0]}>
        <primitive object={gltf.scene.clone()} />
      </group>
      
      {/* Civic context: Traffic cone */}
      <mesh ref={coneRef} position={[2.5, 0.5, 1]} scale={[0.8, 0.8, 0.8]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshPhongMaterial color="#ff4500" emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Digital pothole indicator */}
      <mesh position={[-2, -0.9, 0.5]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 16]} />
        <meshBasicMaterial color="#ff0080" transparent opacity={0.6} />
      </mesh>
      
      {/* Enhanced lighting */}
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#00ffff" />
      <pointLight position={[-5, 3, 3]} intensity={0.8} color="#ff4500" />
      <spotLight 
        position={[0, 8, 0]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={1} 
        color="#ffffff"
        target-position={[0, 0, 0]}
      />
      
      {/* Ambient lighting for general illumination */}
      <ambientLight intensity={0.4} color="#4080ff" />
    </group>
  );
};

const HeroComponent: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [notifications] = useState([
    'Pothole reported on Main St!',
    'Traffic light malfunction at 5th Ave',
    'New community event scheduled'
  ]);

  // Enhanced mouse tracking for 3D parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = (e.currentTarget as Element)?.getBoundingClientRect?.();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    
    setMousePosition({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  }, []);

  useEffect(() => {
    const container = document.querySelector('#car-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove as any);
      return () => container.removeEventListener('mousemove', handleMouseMove as any);
    }
  }, [handleMouseMove]);

  const actionItems = [
    {
      id: 'report',
      icon: AlertTriangle,
      title: 'Report Issue',
      description: 'Found a problem? Help your city respond faster with detailed reports',
      color: 'linear-gradient(135deg, #ff4500 0%, #ff6b35 100%)',
      delay: 0
    },
    {
      id: 'map',
      icon: MapPin,
      title: 'View Live Map',
      description: 'See real-time incidents and city responses in your neighborhood',
      color: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
      delay: 0.1
    },
    {
      id: 'reports',
      icon: FileText,
      title: 'My Reports',
      description: 'Track your submissions and get updates on resolution progress',
      color: 'linear-gradient(135deg, #ff0080 0%, #ff4080 100%)',
      delay: 0.2
    }
  ];

  return (
    <HeroContainer>
      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        CIVIC PULSE
      </Title>
      
      <Subtitle
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        See, report, and resolve urban vehicle issues in real time.
      </Subtitle>

      <ContentGrid>
        <CarCard
          id="car-container"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
            <MiataModel mousePosition={mousePosition} />
          </Canvas>
        </CarCard>

        <MapCard
          initial={{ opacity: 0, x: 100 }}
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
                fontSize: '1.2rem', 
                marginBottom: '1rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                City Status Monitor
              </h3>
              <MapGrid />
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.9rem', 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                3 active reports • 12 resolved today
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
              initial={{ opacity: 0, y: 50 }}
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
