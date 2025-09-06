import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Map, FileText, MapPin } from 'lucide-react';
import InteractiveMiata3D from './InteractiveCar3D';
import EnhancedInteractiveMap from './EnhancedInteractiveMap';
import ToastNotification from './ToastNotification';
import { useToasts } from '../utils/toast';
import { theme } from '../styles/GlobalStyles';

const HeroSection = styled.section`
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  background: 
    radial-gradient(circle at 80% 20%, rgba(124, 77, 255, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 60%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #2d1b3d 60%, #16213e 100%);
`;

const MainContent = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

const HeaderSection = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 20;
  text-align: center;
`;

const MainTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff 0%, #7c4dff 50%, #ff6b35 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
  margin: 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin: 1rem 0 0 0;
  max-width: 600px;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const CarContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  margin: 2rem 0;
`;

const ActionCardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  flex-wrap: wrap;
  max-width: 800px;
`;

const ActionCard = styled(motion.div)<{ glowColor: string }>`
  width: 220px;
  height: 160px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px ${props => props.glowColor}30,
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${props => props.glowColor}10, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.6),
      0 0 30px ${props => props.glowColor}50,
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const ActionIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.color}20, ${props => props.color}40);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 0 20px ${props => props.color}30;
  
  svg {
    width: 28px;
    height: 28px;
    color: ${props => props.color};
    filter: drop-shadow(0 0 10px ${props => props.color}50);
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-family: 'Inter', sans-serif;
`;

const ActionDescription = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  font-family: 'Inter', sans-serif;
`;

const MapContainer = styled(motion.div)`
  width: 100%;
  height: 600px;
  border-radius: 25px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(0, 212, 255, 0.1);
  position: relative;
`;

const NotificationContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 30;
`;

const HeroComponent: React.FC = () => {
  const [showMap, setShowMap] = React.useState(false);
  const { toasts, removeToast, showNewIssueToast } = useToasts();

  // Simulate occasional notifications (much less frequent and cleaner)
  useEffect(() => {
    const notifications = [
      { type: 'pothole', location: 'Main Street & 5th Ave' },
    ];

    // Show only one notification after 15 seconds, then no more auto notifications
    const timeout = setTimeout(() => {
      showNewIssueToast(notifications[0].type, notifications[0].location);
    }, 15000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showNewIssueToast]);

  return (
    <>
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} removeToast={removeToast} />

      <HeroSection>
        {/* Header Section */}
        <HeaderSection>
          <MainTitle
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            CIVIC PULSE
          </MainTitle>
          <Subtitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          >
            Smart civic issue reporting with real-time monitoring and AI-powered solutions
          </Subtitle>
        </HeaderSection>

        <MainContent>
          {/* Left Section - Car and Action Cards */}
          <LeftSection>
            {/* 3D Car Container */}
            <CarContainer>
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 1.5, 
                  ease: 'easeOut', 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                style={{ width: '100%', height: '100%' }}
              >
                <InteractiveMiata3D />
              </motion.div>
            </CarContainer>

            {/* Action Cards Below Car */}
            <ActionCardsContainer>
              <ActionCard
                glowColor={theme.colors.neonOrange}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                onClick={() => {
                  console.log('Report Issue clicked');
                }}
              >
                <ActionIcon color={theme.colors.neonOrange}>
                  <AlertTriangle />
                </ActionIcon>
                <ActionTitle>Report Issue</ActionTitle>
                <ActionDescription>Found a pothole or street problem? Report it instantly</ActionDescription>
              </ActionCard>

              <ActionCard
                glowColor={theme.colors.neonBlue}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                onClick={() => {
                  setShowMap(true);
                }}
              >
                <ActionIcon color={theme.colors.neonBlue}>
                  <Map />
                </ActionIcon>
                <ActionTitle>View Live Map</ActionTitle>
                <ActionDescription>See real-time issues and city updates</ActionDescription>
              </ActionCard>

              <ActionCard
                glowColor={theme.colors.neonPurple}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                onClick={() => {
                  console.log('My Reports clicked');
                }}
              >
                <ActionIcon color={theme.colors.neonPurple}>
                  <FileText />
                </ActionIcon>
                <ActionTitle>My Reports</ActionTitle>
                <ActionDescription>Track your submissions and get updates</ActionDescription>
              </ActionCard>
            </ActionCardsContainer>
          </LeftSection>

          {/* Right Section - Interactive Map */}
          <RightSection>
            <MapContainer
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div style={{ 
                padding: '1.5rem',
                background: 'rgba(0, 0, 0, 0.5)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: '#ffffff', 
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Live City Map
                </h3>
                <p style={{ 
                  margin: '0', 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Real-time issues and city updates
                </p>
              </div>
              <div style={{ height: 'calc(100% - 80px)', position: 'relative' }}>
                <EnhancedInteractiveMap />
              </div>
            </MapContainer>
          </RightSection>
        </MainContent>

        {/* Notification Container */}
        <NotificationContainer>
          {toasts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 107, 53, 0.3)',
                color: 'white',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <AlertTriangle size={20} color="#ff6b35" style={{ marginRight: '8px' }} />
                <strong style={{ fontSize: '0.95rem' }}>New Issue Reported</strong>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                {toasts[0]?.message || 'Pothole reported on Main Street'}
              </div>
            </motion.div>
          )}
        </NotificationContainer>

        {/* Full-screen map modal */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setShowMap(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                  width: '90%',
                  height: '90%',
                  maxWidth: '1200px',
                  maxHeight: '800px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <EnhancedInteractiveMap />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </HeroSection>
    </>
  );
};

export default HeroComponent;
