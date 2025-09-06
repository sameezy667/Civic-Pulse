import React, { useState, Suspense, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Map, 
  FileText, 
  MessageSquare,
  ArrowRight,
  LogOut,
  Plus
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../contexts/AuthContext';
import CommunityPosts from './CommunityPosts';
import AccountProfile from './AccountProfile';
import LandingPage from './LandingPage';
import ReportForm from './ReportForm';
import LiveMap from './LiveMap';
import MyReports from './MyReports';
import AdminDashboard from './AdminDashboard';

// Types
type ActiveSection = 'dashboard' | 'community' | 'map' | 'reports' | 'account' | 'settings' | 'admin' | 'new-report';

// Enhanced Miata 3D Model Component with auto-rotation and grounding shadow
const MiataModel = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Always call useGLTF at the top level
  const gltf = useGLTF('/models/miata.glb');
  
  // Ensure materials are compatible with Three.js v0.179 - must be called before any returns
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            // Ensure material compatibility
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                // Type-safe check for materials with map property
                if ('map' in mat && mat.map) {
                  (mat as any).map.flipY = false;
                }
              });
            } else {
              // Type-safe check for single material with map property
              if ('map' in mesh.material && mesh.material.map) {
                (mesh.material as any).map.flipY = false;
              }
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        }
      });
    }
  }, [gltf.scene]);
  
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
    <group>
      {/* Enhanced grounding shadow for visual depth */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.8, 64]} />
        <meshLambertMaterial 
          color="#000000" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      
      {/* Soft glow effect */}
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 64]} />
        <meshBasicMaterial 
          color="#FF4800" 
          transparent 
          opacity={0.05}
        />
      </mesh>
      
      {/* Main car model */}
      <primitive 
        ref={meshRef}
        object={gltf.scene} 
        scale={[1.8, 1.8, 1.8]} 
        position={[0, -0.8, 0]} 
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// Error Boundary for 3D Model
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log('3D Model Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

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

const MainApp: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasInitialRedirect, setHasInitialRedirect] = useState(false);

  // Check if current user is admin and set appropriate default page (only once after login)
  useEffect(() => {
    if (user && !hasInitialRedirect) {
      const adminStatus = user?.email?.includes('admin') || 
                         user?.user_metadata?.role === 'admin' || 
                         user?.app_metadata?.role === 'admin' || 
                         false;
      setIsAdmin(adminStatus);
      
      // Set default page based on user role - only on first login
      if (adminStatus) {
        setActiveSection('admin'); // Admin users go to admin dashboard
      } else {
        setActiveSection('reports'); // Citizens go to my reports page
      }
      
      setHasInitialRedirect(true); // Mark that initial redirect has happened
      
      console.log('User admin status updated:', adminStatus, {
        email: user.email,
        userMetadata: user.user_metadata,
        appMetadata: user.app_metadata,
        defaultPage: adminStatus ? 'admin' : 'reports'
      });
    } else if (!user) {
      setIsAdmin(false);
      setActiveSection('dashboard'); // Reset to dashboard when logged out
      setHasInitialRedirect(false); // Reset redirect flag when logged out
    }
  }, [user, hasInitialRedirect]);

  // Update URL when section changes
  useEffect(() => {
    if (activeSection === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  }, [activeSection]);

  const handleLogout = async () => {
    try {
      await signOut();
      setActiveSection('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAccountClick = () => {
    setActiveSection('account');
  };

  const handleLogin = () => {
    // This will be called after successful authentication
    // The useAuth context will automatically update the user state
    // The useEffect will set the appropriate default page based on user role
  };

  // Show auth screen if not logged in
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
        color: '#ffffff'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => (
    <>
      <Navigation>
        <Logo>civic pulse</Logo>
        <NavLinks>
          <a href="#" onClick={() => setActiveSection('dashboard')}>dashboard</a>
          <a href="#" onClick={() => setActiveSection('community')}>community</a>
          <a href="#" onClick={() => setActiveSection('map')}>live map</a>
          <a href="#" onClick={() => setActiveSection('reports')}>my reports</a>
          <a href="#" onClick={() => setActiveSection('new-report')}>
            <Plus size={16} style={{ marginRight: '4px' }} />
            new report
          </a>
          <a href="#" onClick={handleAccountClick}>account</a>
          <a href="#" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: '4px' }} />
            logout
          </a>
        </NavLinks>
      </Navigation>
      
      <MainHero>
        <HeroContent>
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
          
          <OrangeAccent
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          />
        </HeroContent>
        
        <HeroImageContainer>
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
                shadows
                gl={{ 
                  antialias: true,
                  alpha: true,
                  preserveDrawingBuffer: true
                }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight 
                  position={[10, 10, 5]} 
                  intensity={0.8}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-camera-far={50}
                  shadow-camera-left={-10}
                  shadow-camera-right={10}
                  shadow-camera-top={10}
                  shadow-camera-bottom={-10}
                />
                <pointLight position={[-10, -10, -10]} intensity={0.3} />
                <spotLight 
                  position={[0, 10, 0]} 
                  angle={0.3} 
                  penumbra={1} 
                  intensity={0.5}
                  castShadow
                />
                
                <Suspense fallback={<MiataFallback />}>
                  <MiataModel />
                </Suspense>

                <OrbitControls 
                  enablePan={false}
                  enableZoom={false}
                  enableRotate={false}
                  autoRotate={false}
                />
                <Environment preset="studio" background={false} />
              </Canvas>
            </ModelErrorBoundary>
          </CarContainer>
        </HeroImageContainer>
      </MainHero>

      <FeatureGrid style={{ padding: '0 6vw 6vw 6vw' }}>
        <FeatureCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ 
            scale: 1.02,
            y: -8,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          whileHover={{ 
            scale: 1.02,
            y: -8,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ 
            scale: 1.02,
            y: -8,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
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
              account
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

  const renderNavigation = () => (
    <Navigation>
      <Logo>civic pulse</Logo>
      <NavLinks>
        <a href="#" onClick={() => setActiveSection('dashboard')}>dashboard</a>
        <a href="#" onClick={() => setActiveSection('community')}>community</a>
        <a href="#" onClick={() => setActiveSection('map')}>live map</a>
        <a href="#" onClick={() => setActiveSection('reports')}>my reports</a>
        <a href="#" onClick={() => setActiveSection('new-report')}>
          <Plus size={16} style={{ marginRight: '4px' }} />
          new report
        </a>
        {isAdmin && (
          <a 
            href="#" 
            onClick={() => setActiveSection('admin')} 
            style={{ color: activeSection === 'admin' ? '#FF4800' : 'inherit' }}
          >
            admin
          </a>
        )}
        <a href="#" onClick={handleAccountClick}>account</a>
        <a href="#" onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: '4px' }} />
          logout
        </a>
      </NavLinks>
    </Navigation>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'community':
        return (
          <>
            {renderNavigation()}
            <div style={{ padding: '2rem 4rem' }}>
              <CommunityPosts />
            </div>
          </>
        );
      case 'new-report':
        return (
          <>
            {renderNavigation()}
            <ReportForm onReportSubmitted={() => setActiveSection('reports')} />
          </>
        );
      case 'map':
        return (
          <>
            {renderNavigation()}
            <LiveMap />
          </>
        );
      case 'reports':
        return (
          <>
            {renderNavigation()}
            <MyReports />
          </>
        );
      case 'account':
        return (
          <>
            {renderNavigation()}
            <div style={{ padding: '2rem 4rem' }}>
              <AccountProfile userRole={isAdmin ? 'admin' : 'citizen'} onLogout={handleLogout} />
            </div>
          </>
        );
      case 'admin':
        return isAdmin ? (
          <AdminDashboard onBackToMain={() => setActiveSection('dashboard')} />
        ) : (
          <>
            {renderNavigation()}
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center', 
              background: '#0a0a0a', 
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
                <h2 style={{ 
                  color: '#f44336', 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Access Denied
                </h2>
                <p style={{ 
                  color: '#cccccc', 
                  fontSize: '1rem', 
                  marginBottom: '2rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  You need administrator privileges to access this page. Please contact your system administrator or log in with an admin account.
                </p>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  style={{
                    background: 'rgba(255, 72, 0, 0.1)',
                    border: '1px solid rgba(255, 72, 0, 0.3)',
                    color: '#FF4800',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 72, 0, 0.2)';
                    e.currentTarget.style.borderColor = '#FF4800';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 72, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 72, 0, 0.3)';
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </>
        );
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
    </AppContainer>
  );
};

// Styled Components following ultra-modern dark theme
const AppContainer = styled.div`
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
  background: #0a0a0a;
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 1rem;
    gap: 1rem;
  }
`;

const Logo = styled.span`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -2.5px;
  color: #FF4800;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
    letter-spacing: -2px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2.5rem;
  
  a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    white-space: nowrap;
    
    &:hover {
      color: #FF4800;
    }
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
    
    a {
      font-size: 0.95rem;
      padding: 0.4rem 0.8rem;
    }
  }
  
  @media (max-width: 600px) {
    gap: 1rem;
    
    a {
      font-size: 0.85rem;
      padding: 0.3rem 0.6rem;
    }
  }
  
  @media (max-width: 480px) {
    gap: 0.8rem;
    grid-template-columns: repeat(3, 1fr);
    display: grid;
    width: 100%;
    
    a {
      font-size: 0.8rem;
      padding: 0.4rem 0.3rem;
      text-align: center;
      justify-content: center;
    }
  }
`;

const MainHero = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 2fr;
  align-items: center;
  width: 100vw;
  min-height: 85vh; /* Increased from 70vh for more spacious feel */
  padding: 4vw 6vw; /* Slightly increased padding */
  gap: 3vw;
  
  /* Enhanced spaciousness on larger screens */
  @media (min-width: 1200px) {
    min-height: 90vh;
    padding: 5vw 8vw;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 4vw;
    min-height: auto;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 2vw;
    gap: 1.5rem;
    min-height: 60vh;
  }
  
  @media (max-width: 360px) {
    padding: 1rem 1vw;
    gap: 1rem;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: 4.2rem;
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  margin-bottom: 1.8rem;
  letter-spacing: -0.02em;
  
  /* Clean, minimal text rendering */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* Responsive font scaling */
  @media (max-width: 768px) {
    font-size: 3rem;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.2rem;
    line-height: 1.25;
    margin-bottom: 1.2rem;
    letter-spacing: -0.01em;
  }
  
  @media (max-width: 360px) {
    font-size: 1.8rem;
    line-height: 1.3;
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: #999999;
  margin-bottom: 2.5rem;
  max-width: 85%;
  font-weight: 400;
  
  /* Clean text rendering */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    max-width: 100%;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 360px) {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
`;

const OrangeAccent = styled(motion.div)`
  position: absolute;
  top: 20%;
  right: -10%;
  width: 120px;
  height: 8px;
  background: linear-gradient(90deg, #FF4800, #FF6B35);
  border-radius: 4px;
  z-index: 3;
  transform: translateX(50%);
  overflow: hidden;
  
  /* Animated underline effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
  
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    width: 100px;
    margin: 1rem auto 0 auto;
  }
  
  @media (max-width: 480px) {
    width: 80px;
    height: 6px;
  }
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
  
  /* Enhanced grounding with soft glow */
  &::before {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 20px;
    background: radial-gradient(ellipse at center, rgba(255, 72, 0, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
  }
  
  canvas {
    width: 100% !important;
    height: 100% !important;
    z-index: 2;
    position: relative;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  }
  
  /* Style for PNG fallback */
  img {
    z-index: 2;
    position: relative;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  }
  
  /* Fallback div styling */
  > div {
    z-index: 2;
    position: relative;
  }
  
  @media (max-width: 768px) {
    height: 300px;
    margin-top: 1rem;
  }
  
  @media (max-width: 480px) {
    height: 250px;
    margin-top: 0.5rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2.5rem;
  margin-top: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 3rem;
    padding: 0 2rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.5rem;
    margin-top: 2rem;
    padding: 0 1rem;
  }
`;

const FeatureCard = styled(motion.div)`
  background: 
    linear-gradient(135deg, 
      rgba(30, 30, 30, 0.95) 0%, 
      rgba(20, 20, 20, 0.9) 100%
    );
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 72, 0, 0.25);
  border-radius: 28px;
  padding: 2.8rem;
  text-align: left;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Enhanced dark theme shadow system with larger radius */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 12px 48px rgba(255, 72, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);

  /* Premium orange gradient border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 28px;
    padding: 1px;
    background: linear-gradient(135deg, 
      rgba(255, 72, 0, 0.7) 0%, 
      rgba(255, 102, 0, 0.4) 30%,
      rgba(255, 72, 0, 0.2) 50%, 
      rgba(255, 72, 0, 0.5) 100%
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(255, 72, 0, 0.7);
    
    /* Enhanced hover glow with smooth orange shadow */
    box-shadow: 
      0 25px 80px rgba(255, 72, 0, 0.35),
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 8px 24px rgba(255, 72, 0, 0.25),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
      
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 2.2rem;
    border-radius: 24px;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    padding: 1.8rem;
    border-radius: 20px;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
`;

const FeatureIcon = styled.div`
  color: #FF4800;
  margin-bottom: 1.5rem;
  transform: scale(1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(255, 72, 0, 0.3));
  
  ${FeatureCard}:hover & {
    transform: scale(1.1);
    filter: drop-shadow(0 6px 12px rgba(255, 72, 0, 0.6));
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.25rem;
  letter-spacing: -0.035em;
  font-feature-settings: 'kern' 1, 'liga' 1, 'ss01' 1;
  transition: color 0.3s ease;
  line-height: 1.25;
  
  /* Enhanced text shadow for depth */
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.4),
    0 2px 6px rgba(255, 72, 0, 0.1);
  
  ${FeatureCard}:hover & {
    color: #FF4800;
    text-shadow: 
      0 1px 3px rgba(0, 0, 0, 0.4),
      0 4px 12px rgba(255, 72, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
`;

const FeatureDescription = styled.p`
  color: #a8a8a8;
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: -0.015em;
  
  /* Enhanced text rendering for sophisticated dark theme */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  ${FeatureCard}:hover & {
    color: #b8b8b8;
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1.2rem;
  }
`;

const FeatureLink = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #FF4800;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(255, 72, 0, 0.3));
  
  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  ${FeatureCard}:hover & {
    gap: 0.8rem;
    
    svg {
      transform: translateX(4px);
    }
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    gap: 0.5rem;
  }
`;

const SecondaryPage = styled.div`
  min-height: 100vh;
  background: #151515;
`;

const PageTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  margin: 3rem 0 2rem 0;
  letter-spacing: -0.03em;
  font-feature-settings: 'kern' 1, 'liga' 1, 'ss01' 1;
  
  /* Enhanced text shadow for dark theme */
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 4px 12px rgba(255, 72, 0, 0.3);
  
  /* Text rendering optimization */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  
  @media (max-width: 768px) {
    font-size: 2.6rem;
    margin: 2rem 0 1.5rem 0;
  }
`;

const PageContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  
  p {
    font-size: 1.2rem;
    color: #cccccc;
    margin-bottom: 2rem;
    line-height: 1.7;
    font-weight: 400;
    letter-spacing: -0.01em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

export default MainApp;
