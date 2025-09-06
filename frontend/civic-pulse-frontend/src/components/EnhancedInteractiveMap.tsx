import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, Construction, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

// Enhanced pulsing animation with more dramatic effects
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1) drop-shadow(0 0 15px currentColor);
    box-shadow: 0 0 20px currentColor;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
    filter: brightness(1.4) drop-shadow(0 0 30px currentColor);
    box-shadow: 0 0 40px currentColor, 0 0 60px rgba(255, 255, 255, 0.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1) drop-shadow(0 0 15px currentColor);
    box-shadow: 0 0 20px currentColor;
  }
`;

const flowGlow = keyframes`
  0% {
    stroke-dashoffset: 1000;
    filter: drop-shadow(0 0 8px currentColor);
  }
  25% {
    filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 30px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 25px currentColor) drop-shadow(0 0 35px currentColor);
  }
  75% {
    filter: drop-shadow(0 0 18px currentColor) drop-shadow(0 0 28px currentColor);
  }
  100% {
    stroke-dashoffset: 0;
    filter: drop-shadow(0 0 12px currentColor);
  }
`;

const breathe = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 1;
  }
`;

const MapContainer = styled(motion.div)`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: 
    radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.12) 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M0 0h30v30H0z'/%3E%3Cpath d='M15 0v30M0 15h30'/%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  backdrop-filter: blur(20px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(45deg, 
        transparent 0px, 
        rgba(0, 212, 255, 0.02) 1px, 
        transparent 2px, 
        transparent 50px),
      repeating-linear-gradient(-45deg, 
        transparent 0px, 
        rgba(124, 77, 255, 0.02) 1px, 
        transparent 2px, 
        transparent 50px);
    z-index: 1;
    pointer-events: none;
  }
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 40px 0 rgba(31, 38, 135, 0.4),
    inset 0 0 30px rgba(0, 212, 255, 0.1),
    0 0 50px rgba(0, 212, 255, 0.2);
`;

const CitySkyline = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: 
      polygon(0% 100%, 5% 80%, 12% 70%, 18% 85%, 25% 60%, 32% 75%, 40% 55%, 
               48% 70%, 55% 45%, 63% 65%, 70% 40%, 78% 60%, 85% 35%, 92% 55%, 100% 40%, 100% 100%);
    background-color: rgba(26, 26, 46, 0.8);
    clip-path: polygon(0% 100%, 5% 80%, 12% 70%, 18% 85%, 25% 60%, 32% 75%, 40% 55%, 
                       48% 70%, 55% 45%, 63% 65%, 70% 40%, 78% 60%, 85% 35%, 92% 55%, 100% 40%, 100% 100%);
  }
`;

const MapSvg = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const EnhancedRoad = styled.path<{ color: string; delay?: number; intensity?: number }>`
  fill: none;
  stroke: ${({ color }) => color};
  stroke-width: ${({ intensity }) => (intensity || 1) * 4}px;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20 8;
  stroke-dashoffset: 1000;
  animation: ${flowGlow} ${({ delay }) => 8 + (delay || 0)}s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || 0}s;
  filter: drop-shadow(0 0 12px ${({ color }) => color}) 
          drop-shadow(0 0 25px ${({ color }) => color}80)
          drop-shadow(0 0 40px ${({ color }) => color}40);
  opacity: 0.95;
`;

const GlowingPin = styled(motion.div)<{ 
  x: number; 
  y: number; 
  color: string;
  type: 'pothole' | 'construction' | 'lighting' | 'traffic';
  severity: 'low' | 'medium' | 'high';
}>`
  position: absolute;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  transform: translate(-50%, -50%);
  width: ${({ severity }) => severity === 'high' ? '60px' : severity === 'medium' ? '50px' : '45px'};
  height: ${({ severity }) => severity === 'high' ? '60px' : severity === 'medium' ? '50px' : '45px'};
  border-radius: 50%;
  background: ${({ color }) => `
    radial-gradient(circle at 30% 30%, ${color} 0%, ${color}dd 40%, ${color}88 70%, ${color}22 100%)
  `};
  border: 3px solid ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: ${pulse} ${({ severity }) => severity === 'high' ? '1.2s' : severity === 'medium' ? '1.8s' : '2.5s'} ease-in-out infinite;
  box-shadow: 
    0 0 25px ${({ color }) => color},
    0 0 50px ${({ color }) => color}66,
    0 0 75px ${({ color }) => color}33,
    inset 0 0 15px ${({ color }) => color}44,
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
  z-index: ${({ severity }) => severity === 'high' ? '15' : severity === 'medium' ? '12' : '10'};
  
  &:hover {
    animation-play-state: paused;
    transform: translate(-50%, -50%) scale(1.4);
    z-index: 25;
    box-shadow: 
      0 0 40px ${({ color }) => color},
      0 0 80px ${({ color }) => color}88,
      0 0 120px ${({ color }) => color}44,
      0 0 160px ${({ color }) => color}22,
      inset 0 0 20px ${({ color }) => color}66,
      inset 0 3px 0 rgba(255, 255, 255, 0.5);
  }
  
  svg {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 15px ${({ color }) => color});
    animation: ${breathe} 3s ease-in-out infinite;
  }
`;

const EnhancedTooltip = styled(motion.div)<{ severity: 'low' | 'medium' | 'high' }>`
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid ${({ severity }) => 
    severity === 'high' ? '#ff1744' : 
    severity === 'medium' ? '#ff6b35' : '#ffab00'
  };
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 20px ${({ severity }) => 
      severity === 'high' ? '#ff1744' : 
      severity === 'medium' ? '#ff6b35' : '#ffab00'
    }44;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 8px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.95);
  }
`;

const StatusBadge = styled.div<{ status: 'reported' | 'in-progress' | 'resolved' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 4px;
  background: ${({ status }) => 
    status === 'resolved' ? 'rgba(76, 175, 80, 0.2)' :
    status === 'in-progress' ? 'rgba(255, 193, 7, 0.2)' :
    'rgba(244, 67, 54, 0.2)'
  };
  color: ${({ status }) => 
    status === 'resolved' ? '#4caf50' :
    status === 'in-progress' ? '#ffc107' :
    '#f44336'
  };
  border: 1px solid ${({ status }) => 
    status === 'resolved' ? '#4caf50' :
    status === 'in-progress' ? '#ffc107' :
    '#f44336'
  };
`;

const GlowOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.12) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(255, 107, 53, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 50% 90%, rgba(124, 77, 255, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 10% 80%, rgba(255, 23, 68, 0.05) 0%, transparent 35%);
  pointer-events: none;
  opacity: 0.8;
`;

const MapTitle = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 15;
`;

const TitleText = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff 0%, #7c4dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
`;

const SubtitleText = styled.p`
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 400;
`;

const EnhancedStatsPanel = styled(motion.div)`
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  min-width: 220px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(0, 212, 255, 0.05);
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const StatValue = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-weight: 700;
  text-shadow: 0 0 10px ${({ color }) => color}66;
`;

interface Issue {
  id: number;
  type: 'pothole' | 'construction' | 'lighting' | 'traffic';
  x: number;
  y: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'in-progress' | 'resolved';
  timestamp: string;
}

const EnhancedInteractiveMap: React.FC = () => {
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [issues] = useState<Issue[]>([
    { 
      id: 1, 
      type: 'pothole', 
      x: 150, 
      y: 200, 
      title: 'Large Pothole on Main St', 
      severity: 'high',
      status: 'reported',
      timestamp: '2 hours ago'
    },
    { 
      id: 2, 
      type: 'construction', 
      x: 320, 
      y: 180, 
      title: 'Road Work - Lane Closure', 
      severity: 'medium',
      status: 'in-progress',
      timestamp: '1 day ago'
    },
    { 
      id: 3, 
      type: 'lighting', 
      x: 470, 
      y: 280, 
      title: 'Broken Street Light', 
      severity: 'low',
      status: 'reported',
      timestamp: '3 hours ago'
    },
    { 
      id: 4, 
      type: 'traffic', 
      x: 280, 
      y: 380, 
      title: 'Traffic Signal Malfunction', 
      severity: 'high',
      status: 'in-progress',
      timestamp: '30 minutes ago'
    },
    { 
      id: 5, 
      type: 'pothole', 
      x: 420, 
      y: 420, 
      title: 'Multiple Potholes', 
      severity: 'medium',
      status: 'reported',
      timestamp: '5 hours ago'
    },
    { 
      id: 6, 
      type: 'construction', 
      x: 200, 
      y: 480, 
      title: 'Water Main Repair', 
      severity: 'low',
      status: 'resolved',
      timestamp: '2 days ago'
    },
  ]);

  const getIssueIcon = (type: string) => {
    const iconProps = { size: 22, strokeWidth: 2.5 };
    switch (type) {
      case 'pothole':
        return <AlertTriangle {...iconProps} />;
      case 'construction':
        return <Construction {...iconProps} />;
      case 'lighting':
        return <Zap {...iconProps} />;
      case 'traffic':
        return <MapPin {...iconProps} />;
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={12} />;
      case 'in-progress':
        return <Clock size={12} />;
      default:
        return <AlertTriangle size={12} />;
    }
  };

  const getIssueColor = (type: string, severity: string) => {
    const baseColors = {
      pothole: severity === 'high' ? '#ff1744' : severity === 'medium' ? '#ff6b35' : '#ffab00',
      construction: '#7c4dff',
      lighting: '#00d4ff',
      traffic: '#ff6b35',
    };
    return baseColors[type as keyof typeof baseColors] || '#00d4ff';
  };

  const stats = {
    total: issues.length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <MapContainer
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
    >
      <MapSvg viewBox="0 0 600 600">
        {/* Enhanced Road Network with Glow */}
        <EnhancedRoad
          d="M50 120 Q150 100 250 120 T450 140 Q500 150 550 170"
          color="#00d4ff"
          delay={0}
          intensity={1.2}
        />
        <EnhancedRoad
          d="M120 50 Q140 150 160 250 T200 450 Q220 500 240 550"
          color="#ff6b35"
          delay={1.5}
          intensity={1}
        />
        <EnhancedRoad
          d="M550 220 Q450 240 350 220 T150 200 Q100 190 50 210"
          color="#7c4dff"
          delay={3}
          intensity={1.1}
        />
        <EnhancedRoad
          d="M320 50 Q340 150 360 250 T400 450 Q420 500 440 550"
          color="#00d4ff"
          delay={2}
          intensity={0.9}
        />
        <EnhancedRoad
          d="M520 370 Q420 390 320 370 T120 350 Q70 340 40 360"
          color="#ff1744"
          delay={1}
          intensity={1.3}
        />
        
        {/* Additional road details */}
        <EnhancedRoad
          d="M100 300 Q200 280 300 300 Q400 320 500 300"
          color="#ffab00"
          delay={2.5}
          intensity={0.8}
        />
      </MapSvg>

      {/* Enhanced Issue Pins with Glow Effects */}
      <AnimatePresence>
        {issues.map((issue) => (
          <GlowingPin
            key={issue.id}
            x={issue.x}
            y={issue.y}
            color={getIssueColor(issue.type, issue.severity)}
            type={issue.type}
            severity={issue.severity}
            onMouseEnter={() => setHoveredIssue(issue)}
            onMouseLeave={() => setHoveredIssue(null)}
            whileHover={{ 
              scale: 1.3,
              zIndex: 20,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: issue.id * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
          >
            {getIssueIcon(issue.type)}
            
            <AnimatePresence>
              {hoveredIssue?.id === issue.id && (
                <EnhancedTooltip
                  severity={issue.severity}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>{issue.title}</div>
                  <StatusBadge status={issue.status}>
                    {getStatusIcon(issue.status)}
                    {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                  </StatusBadge>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>
                    {issue.timestamp}
                  </div>
                </EnhancedTooltip>
              )}
            </AnimatePresence>
          </GlowingPin>
        ))}
      </AnimatePresence>

      <GlowOverlay />
      <CitySkyline />

      <MapTitle>
        <TitleText>Live Issue Map</TitleText>
        <SubtitleText>Real-time civic issue tracking & monitoring</SubtitleText>
      </MapTitle>

      <EnhancedStatsPanel
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <StatItem>
          <StatLabel>Total Issues:</StatLabel>
          <StatValue color="#00d4ff">{stats.total}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>High Priority:</StatLabel>
          <StatValue color="#ff1744">{stats.high}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Medium Priority:</StatLabel>
          <StatValue color="#ff6b35">{stats.medium}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Low Priority:</StatLabel>
          <StatValue color="#ffab00">{stats.low}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Resolved:</StatLabel>
          <StatValue color="#4caf50">{stats.resolved}</StatValue>
        </StatItem>
      </EnhancedStatsPanel>
    </MapContainer>
  );
};

export default EnhancedInteractiveMap;
