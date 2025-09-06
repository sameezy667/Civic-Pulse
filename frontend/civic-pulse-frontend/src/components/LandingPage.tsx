import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Map, 
  FileText, 
  MessageSquare,
  ArrowRight,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useRef } from 'react';
import Auth from './Auth';

interface LandingPageProps {
  onLogin: () => void;
}

// Miata 3D Model Component with auto-rotation
const MiataModel = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Always call useGLTF at the top level
  const gltf = useGLTF('/models/miata.glb');
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3; // Slow auto-rotation
    }
  });

  // Handle potential loading errors gracefully
  if (!gltf || !gltf.scene) {
    return null;
  }

  return (
    <primitive 
      ref={meshRef}
      object={gltf.scene} 
      scale={[1.8, 1.8, 1.8]} 
      position={[0, -1, 0]}
    />
  );
};

// Error boundary for 3D model
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// PNG Fallback for the 3D model
const MiataPNGFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <img 
      src="/models/civic-miata-fallback.png"
      alt="Civic Pulse Vehicle"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))'
      }}
      onError={(e) => {
        // If PNG also fails, show a styled placeholder
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1rem;
              color: #666;
              text-align: center;
            ">
              <div style="font-size: 4rem;">🚗</div>
              <div style="font-size: 1.2rem; font-weight: 600;">Civic Pulse Platform</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Smart Vehicle Monitoring System</div>
            </div>
          `;
        }
      }}
    />
  </div>
);

// Fallback for 3D model loading (Three.js compatible)
const MiataFallback = () => (
  <mesh>
    <boxGeometry args={[2, 1, 3]} />
    <meshStandardMaterial 
      color="#666" 
      transparent 
      opacity={0.3}
      wireframe
    />
  </mesh>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'client' | 'admin'>('client');

  const handleGetStarted = () => {
    setAuthMode('client');
    setShowAuth(true);
  };

  const handleAdminLogin = () => {
    setAuthMode('admin');
    setShowAuth(true);
  };

  if (showAuth) {
    return (
      <AuthWrapper>
        <AuthContainer>
          <AuthHeader>
            <Logo onClick={() => setShowAuth(false)}>civic pulse</Logo>
            <LoginTypeIndicator>
              {authMode === 'admin' ? (
                <>
                  <Shield size={20} />
                  Administrator Login
                </>
              ) : (
                <>
                  <User size={20} />
                  Citizen Login
                </>
              )}
            </LoginTypeIndicator>
          </AuthHeader>
          <Auth 
            mode={authMode}
            onSuccess={onLogin}
            onBack={() => setShowAuth(false)}
          />
          <AuthFooter>
            {authMode === 'client' ? (
              <SwitchModeText>
                Are you an administrator? 
                <SwitchModeLink onClick={handleAdminLogin}>
                  Login as Admin
                </SwitchModeLink>
              </SwitchModeText>
            ) : (
              <SwitchModeText>
                Are you a citizen? 
                <SwitchModeLink onClick={handleGetStarted}>
                  Citizen Login
                </SwitchModeLink>
              </SwitchModeText>
            )}
          </AuthFooter>
        </AuthContainer>
      </AuthWrapper>
    );
  }

  return (
    <LandingContainer>
      {/* Hero Section */}
      <HeroSection>
        <Navigation>
          <Logo>civic pulse</Logo>
          <NavActions>
            <LoginButton onClick={handleAdminLogin} variant="admin">
              <Shield size={16} />
              Admin
            </LoginButton>
            <LoginButton onClick={handleGetStarted} variant="primary">
              <User size={16} />
              Get Started
            </LoginButton>
          </NavActions>
        </Navigation>
        
        <HeroContent>
          <HeroLeft>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HeroTitle>
                Real-time civic issue tracking for smarter cities
              </HeroTitle>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <HeroSubtitle>
                Report issues, track progress, and collaborate with your local government to build better communities together.
              </HeroSubtitle>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <HeroActions>
                <PrimaryButton onClick={handleGetStarted}>
                  Get Started
                  <ArrowRight size={20} />
                </PrimaryButton>
                <SecondaryButton onClick={handleAdminLogin}>
                  <Shield size={18} />
                  Admin Portal
                </SecondaryButton>
              </HeroActions>
            </motion.div>
            
            <OrangeAccent
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            />
          </HeroLeft>
          
          <HeroRight>
            <CarContainer>
              <ModelErrorBoundary fallback={<MiataPNGFallback />}>
                <Canvas
                  camera={{
                    position: [0, 0, 8],
                    fov: 50,
                    near: 0.1,
                    far: 1000
                  }}
                  dpr={[1, 2]}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                  />
                  <pointLight position={[-10, -10, -10]} intensity={0.3} />
                  
                  <Suspense fallback={<MiataFallback />}>
                    <MiataModel />
                  </Suspense>

                  <OrbitControls 
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={false}
                    autoRotate={false}
                  />
                  <Environment preset="studio" />
                </Canvas>
              </ModelErrorBoundary>
            </CarContainer>
          </HeroRight>
        </HeroContent>

        <ScrollIndicator
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <span>Explore Features</span>
          <ChevronDown size={20} />
        </ScrollIndicator>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionTitle
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Empowering Communities Through Technology
        </SectionTitle>
        
        <FeatureGrid>
          <FeatureCard
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ 
              scale: 1.02,
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
          >
            <FeatureIcon>
              <MessageSquare size={28} />
            </FeatureIcon>
            <FeatureTitle>Community Reports</FeatureTitle>
            <FeatureDescription>
              Submit and track civic issues in your neighborhood. Real-time collaboration with local authorities.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ 
              scale: 1.02,
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
          >
            <FeatureIcon>
              <Map size={28} />
            </FeatureIcon>
            <FeatureTitle>Live Issue Map</FeatureTitle>
            <FeatureDescription>
              Interactive city map showing real-time civic issues, emergency situations, and resolution status.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ 
              scale: 1.02,
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
          >
            <FeatureIcon>
              <FileText size={28} />
            </FeatureIcon>
            <FeatureTitle>Progress Tracking</FeatureTitle>
            <FeatureDescription>
              Track your submitted reports, view resolution progress, and receive updates on civic improvements.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>

        <CTASection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <CTATitle>Ready to make a difference?</CTATitle>
          <CTASubtitle>
            Join thousands of citizens working together to improve their communities
          </CTASubtitle>
          <CTAButtons>
            <PrimaryButton onClick={handleGetStarted}>
              Start Reporting Issues
              <ArrowRight size={20} />
            </PrimaryButton>
            <TertiaryButton onClick={handleAdminLogin}>
              Administrator Access
            </TertiaryButton>
          </CTAButtons>
        </CTASection>
      </FeaturesSection>
    </LandingContainer>
  );
};

// Styled Components
const LandingContainer = styled.div`
  background: #0a0a0a;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  position: relative;
  overflow-x: hidden;
`;

const AuthWrapper = styled.div`
  background: #0a0a0a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const AuthContainer = styled.div`
  width: 100%;
  max-width: 500px;
  position: relative;
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LoginTypeIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #FF4800;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
`;

const AuthFooter = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const SwitchModeText = styled.p`
  color: #888888;
  font-size: 0.9rem;
  margin: 0;
`;

const SwitchModeLink = styled.button`
  background: none;
  border: none;
  color: #FF4800;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  text-decoration: underline;
  font-family: inherit;
  
  &:hover {
    color: #FF6A00;
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 4rem;
  font-size: 1.1rem;
  font-weight: 500;
  position: relative;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
  }
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
`;

const NavActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const LoginButton = styled.button<{ variant: 'primary' | 'admin' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
    border: none;
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 72, 0, 0.3);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }
  `}
`;

const HeroContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 4rem;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    gap: 2rem;
  }
`;

const HeroLeft = styled.div`
  @media (max-width: 1200px) {
    order: 2;
  }
`;

const HeroRight = styled.div`
  @media (max-width: 1200px) {
    order: 1;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  color: #888888;
  margin: 0 0 2.5rem 0;
  max-width: 600px;
`;

const HeroActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  border: none;
  border-radius: 12px;
  color: white;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(255, 72, 0, 0.4);
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const TertiaryButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 12px;
  color: #FF4800;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 72, 0, 0.1);
    border-color: #FF4800;
    transform: translateY(-2px);
  }
`;

const OrangeAccent = styled(motion.div)`
  height: 4px;
  background: linear-gradient(90deg, #FF4800 0%, #FF8A00 100%);
  border-radius: 2px;
  margin-top: 2rem;
`;

const CarContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #888888;
  font-size: 0.9rem;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 4rem;
  background: linear-gradient(180deg, #0a0a0a 0%, #121212 100%);
  
  @media (max-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 4rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 3rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 6rem auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 4rem;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 72, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #ffffff;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #888888;
  margin: 0;
`;

const CTASection = styled(motion.div)`
  text-align: center;
  background: rgba(255, 72, 0, 0.05);
  border: 1px solid rgba(255, 72, 0, 0.1);
  border-radius: 20px;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h3`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #ffffff;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTASubtitle = styled.p`
  font-size: 1.2rem;
  color: #888888;
  margin: 0 0 2.5rem 0;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export default LandingPage;