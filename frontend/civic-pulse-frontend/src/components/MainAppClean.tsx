import React, { useState, Suspense, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Home, 
  Map, 
  FileText, 
  Settings,
  MessageSquare,
  User,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import CommunityPosts from './CommunityPosts';
import AccountProfile from './AccountProfile';
import Login from './Login';

// Types
type ActiveSection = 'dashboard' | 'community' | 'map' | 'reports' | 'account' | 'settings';

// Miata 3D Model Component with auto-rotation
const MiataModel = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3; // Slow auto-rotation
    }
  });

  try {
    const { scene } = useGLTF('/models/miata.glb');
    return (
      <primitive 
        ref={meshRef}
        object={scene} 
        scale={[1.8, 1.8, 1.8]} 
        position={[0, -0.8, 0]} 
        rotation={[0, 0, 0]}
      />
    );
  } catch (error) {
    console.log('3D model failed to load, using PNG fallback');
    return null;
  }
};

// PNG Fallback Component
const MiataPNGFallback = () => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent'
  }}>
    <img 
      src="/images/miata_hero_render.png" 
      alt="Mazda Miata Civic Platform"
      style={{
        maxWidth: '90%',
        maxHeight: '90%',
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

// Fallback for 3D model loading
const MiataFallback = () => (
  <MiataPNGFallback />
);

const MainApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock login logic
    setIsLoggedIn(true);
    setCurrentUser(email);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveSection('dashboard');
  };

  const handleAccountClick = () => {
    if (isLoggedIn) {
      setActiveSection('account');
    } else {
      setShowLogin(true);
    }
  };

  const renderDashboard = () => (
    <>
      <Navigation>
        <Logo>civic pulse</Logo>
        <NavLinks>
          <a href="#" onClick={() => setActiveSection('dashboard')}>dashboard</a>
          <a href="#" onClick={() => setActiveSection('community')}>community</a>
          <a href="#" onClick={() => setActiveSection('map')}>live map</a>
          <a href="#" onClick={() => setActiveSection('reports')}>my reports</a>
          <a href="#" onClick={handleAccountClick}>
            {isLoggedIn ? 'account' : 'login'}
          </a>
        </NavLinks>
      </Navigation>
      
      <MainHero>
        <HeroContent>
          <HeroTitle>
            Real-time civic issue tracking for smarter cities
          </HeroTitle>
          <HeroSubtitle>
            Report issues, track progress, and collaborate with your local government to build better communities together.
          </HeroSubtitle>
          <OrangeAccent />
        </HeroContent>
        
        <HeroImageContainer>
          <CarContainer>
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
          </CarContainer>
        </HeroImageContainer>
      </MainHero>

      <FeatureGrid style={{ padding: '0 6vw 6vw 6vw' }}>
        <FeatureCard
          as={motion.div}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => setActiveSection('community')}
        >
          <FeatureIcon>
            <MessageSquare size={28} />
          </FeatureIcon>
          <FeatureTitle>Community Reports</FeatureTitle>
          <FeatureDescription>
            Submit and track civic issues in your neighborhood. Real-time collaboration with local authorities.
          </FeatureDescription>
          <FeatureLink>
            Explore reports <ArrowRight size={16} />
          </FeatureLink>
        </FeatureCard>

        <FeatureCard
          as={motion.div}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => setActiveSection('map')}
        >
          <FeatureIcon>
            <Map size={28} />
          </FeatureIcon>
          <FeatureTitle>Live Issue Map</FeatureTitle>
          <FeatureDescription>
            Interactive city map showing real-time civic issues, emergency situations, and resolution status.
          </FeatureDescription>
          <FeatureLink>
            View map <ArrowRight size={16} />
          </FeatureLink>
        </FeatureCard>

        <FeatureCard
          as={motion.div}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => setActiveSection('reports')}
        >
          <FeatureIcon>
            <FileText size={28} />
          </FeatureIcon>
          <FeatureTitle>My Reports</FeatureTitle>
          <FeatureDescription>
            Track your submitted reports, view resolution progress, and receive updates on civic improvements.
          </FeatureDescription>
          <FeatureLink>
            My dashboard <ArrowRight size={16} />
          </FeatureLink>
        </FeatureCard>
      </FeatureGrid>
    </>
  );

  const renderSecondaryPage = (title: string, description: string, comingSoon: boolean = true) => {
    return (
      <SecondaryPage>
        <Navigation>
          <Logo>civic pulse</Logo>
          <NavLinks>
            <a href="#" onClick={() => setActiveSection('dashboard')}>dashboard</a>
            <a href="#" onClick={() => setActiveSection('community')}>community</a>
            <a href="#" onClick={() => setActiveSection('map')}>live map</a>
            <a href="#" onClick={() => setActiveSection('reports')}>my reports</a>
            <a href="#" onClick={handleAccountClick}>
              {isLoggedIn ? 'account' : 'login'}
            </a>
          </NavLinks>
        </Navigation>
        
        <PageTitle>{title}</PageTitle>
        <PageContent>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            {description}
          </p>

          {comingSoon && (
            <div style={{
              background: 'rgba(255, 72, 0, 0.1)',
              border: '1px solid rgba(255, 72, 0, 0.2)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: '#FF4800'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚧</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Coming Soon</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.8, marginTop: '0.5rem' }}>
                This feature is currently under development
              </div>
            </div>
          )}
        </PageContent>
      </SecondaryPage>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'community':
        return (
          <>
            <Navigation>
              <Logo>civic pulse</Logo>
              <NavLinks>
                <a href="#" onClick={() => setActiveSection('dashboard')}>dashboard</a>
                <a href="#" onClick={() => setActiveSection('community')}>community</a>
                <a href="#" onClick={() => setActiveSection('map')}>live map</a>
                <a href="#" onClick={() => setActiveSection('reports')}>my reports</a>
                <a href="#" onClick={handleAccountClick}>
                  {isLoggedIn ? 'account' : 'login'}
                </a>
              </NavLinks>
            </Navigation>
            <div style={{ padding: '2rem 4rem' }}>
              <CommunityPosts />
            </div>
          </>
        );
      case 'map':
        return renderSecondaryPage(
          'live map',
          'Interactive city map with real-time issue tracking and visualization'
        );
      case 'reports':
        return renderSecondaryPage(
          'my reports',
          'Track your submitted reports and their resolution status'
        );
      case 'account':
        return isLoggedIn ? (
          <>
            <Navigation>
              <Logo>civic pulse</Logo>
              <NavLinks>
                <a href="#" onClick={() => setActiveSection('dashboard')}>dashboard</a>
                <a href="#" onClick={() => setActiveSection('community')}>community</a>
                <a href="#" onClick={() => setActiveSection('map')}>live map</a>
                <a href="#" onClick={() => setActiveSection('reports')}>my reports</a>
                <a href="#" onClick={handleAccountClick}>account</a>
              </NavLinks>
            </Navigation>
            <div style={{ padding: '2rem 4rem' }}>
              <AccountProfile />
            </div>
          </>
        ) : renderDashboard();
      case 'settings':
        return renderSecondaryPage(
          'settings',
          'Customize your Civic Pulse experience and notification preferences'
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <AppContainer>
      <ContentArea>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </ContentArea>
      
      {showLogin && (
        <Login 
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
    </AppContainer>
  );
};

// Styled Components following the minimalist design
const AppContainer = styled.div`
  background: #FAFAFA;
  color: #181818;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  position: relative;
  
  /* Subtle background texture and vignette */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 72, 0, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 72, 0, 0.02) 0%, transparent 50%),
      radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.02) 100%);
    background-size: 400px 400px, 600px 600px, 100% 100%;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Subtle dot texture */
  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(255, 72, 0, 0.01) 1px, transparent 1px);
    background-size: 40px 40px, 60px 60px;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Ensure content is above background */
  > * {
    position: relative;
    z-index: 1;
  }
`;

const ContentArea = styled.div`
  position: relative;
  z-index: 1;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 4rem;
  font-size: 1.1rem;
  font-weight: 500;
`;

const Logo = styled.span`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -2px;
  color: #181818;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: #181818;
    text-decoration: none;
    font-weight: 400;
    transition: color 0.3s ease;
    
    &:hover {
      color: #FF4800;
    }
  }
`;

const MainHero = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 2fr;
  align-items: center;
  width: 100vw;
  min-height: 70vh;
  padding: 3vw 6vw;
  gap: 3vw;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  color: #181818;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 2rem;
  max-width: 90%;
`;

const OrangeAccent = styled.div`
  position: absolute;
  top: 20%;
  right: -10%;
  width: 120px;
  height: 8px;
  background: #FF4800;
  border-radius: 4px;
  z-index: 3;
  transform: translateX(50%);
`;

const HeroImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const CarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  
  /* Seamlessly integrated into background */
  background: transparent;
  
  /* Soft drop shadow beneath the car */
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 20px;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
  }
  
  canvas {
    width: 100% !important;
    height: 100% !important;
    filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.08));
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
`;

const FeatureCard = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 2rem;
  text-align: left;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #FF4800;
    box-shadow: 0 10px 40px rgba(255, 72, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  color: #FF4800;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #181818;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FeatureLink = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #FF4800;
  font-weight: 500;
  font-size: 0.95rem;
`;

const SecondaryPage = styled.div`
  min-height: 100vh;
  background: #FAFAFA;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #181818;
  text-align: center;
  margin: 2rem 0;
  letter-spacing: -0.02em;
`;

const PageContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

export default MainApp;
