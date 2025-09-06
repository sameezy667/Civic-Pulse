import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { MapPin, Zap, Construction, AlertTriangle } from 'lucide-react';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const flow = keyframes`
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const MapContainer = styled(motion.div)`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

const MapSvg = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const Road = styled.path<{ color: string; delay?: number }>`
  fill: none;
  stroke: ${({ color }) => color};
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 10 5;
  stroke-dashoffset: 1000;
  animation: ${flow} 4s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || 0}s;
  filter: drop-shadow(0 0 8px ${({ color }) => color});
`;

const LocationPin = styled(motion.div)<{ 
  x: number; 
  y: number; 
  color: string;
  type: 'pothole' | 'construction' | 'lighting' | 'traffic';
}>`
  position: absolute;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ color }) => `radial-gradient(circle, ${color}, ${color}aa)`};
  border: 2px solid ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 0 20px ${({ color }) => color};
  
  &:hover {
    animation-play-state: paused;
    transform: translate(-50%, -50%) scale(1.2);
    z-index: 10;
  }
`;

const LocationLabel = styled(motion.div)`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

const GlowOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 30% 40%,
    rgba(0, 212, 255, 0.15) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 70% 60%,
    rgba(255, 107, 53, 0.1) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 50% 80%,
    rgba(124, 77, 255, 0.1) 0%,
    transparent 50%
  );
  pointer-events: none;
`;

const MapTitle = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
`;

const TitleText = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7c4dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const SubtitleText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const StatsPanel = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.8);
`;

const StatValue = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-weight: 600;
`;

interface Issue {
  id: number;
  type: 'pothole' | 'construction' | 'lighting' | 'traffic';
  x: number;
  y: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
}

const InteractiveMap: React.FC = () => {
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [issues] = useState<Issue[]>([
    { id: 1, type: 'pothole', x: 150, y: 200, title: 'Pothole on Main St', severity: 'high' },
    { id: 2, type: 'construction', x: 300, y: 150, title: 'Road Work Zone', severity: 'medium' },
    { id: 3, type: 'lighting', x: 450, y: 250, title: 'Broken Street Light', severity: 'low' },
    { id: 4, type: 'traffic', x: 250, y: 350, title: 'Traffic Signal Issue', severity: 'high' },
    { id: 5, type: 'pothole', x: 400, y: 400, title: 'Large Pothole', severity: 'medium' },
    { id: 6, type: 'construction', x: 180, y: 450, title: 'Construction Site', severity: 'low' },
  ]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'pothole':
        return <AlertTriangle size={20} />;
      case 'construction':
        return <Construction size={20} />;
      case 'lighting':
        return <Zap size={20} />;
      case 'traffic':
        return <MapPin size={20} />;
      default:
        return <AlertTriangle size={20} />;
    }
  };

  const getIssueColor = (type: string, severity: string) => {
    const colors = {
      pothole: severity === 'high' ? '#ff1744' : severity === 'medium' ? '#ff6b35' : '#ffab00',
      construction: '#7c4dff',
      lighting: '#00d4ff',
      traffic: '#ff6b35',
    };
    return colors[type as keyof typeof colors] || '#00d4ff';
  };

  const stats = {
    total: issues.length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  return (
    <MapContainer
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
    >
      <MapSvg viewBox="0 0 600 600">
        {/* Road Network */}
        <Road
          d="M50 100 Q150 80 250 100 T450 120 Q500 130 550 150"
          color="#00d4ff"
          delay={0}
        />
        <Road
          d="M100 50 Q120 150 140 250 T180 450 Q200 500 220 550"
          color="#ff6b35"
          delay={1}
        />
        <Road
          d="M550 200 Q450 220 350 200 T150 180 Q100 170 50 190"
          color="#7c4dff"
          delay={2}
        />
        <Road
          d="M300 50 Q320 150 340 250 T380 450 Q400 500 420 550"
          color="#00d4ff"
          delay={1.5}
        />
        <Road
          d="M500 350 Q400 370 300 350 T100 330 Q50 320 20 340"
          color="#ff1744"
          delay={0.5}
        />
      </MapSvg>

      {/* Issues/Pins */}
      {issues.map((issue) => (
        <LocationPin
          key={issue.id}
          x={issue.x}
          y={issue.y}
          color={getIssueColor(issue.type, issue.severity)}
          type={issue.type}
          onMouseEnter={() => setHoveredIssue(issue)}
          onMouseLeave={() => setHoveredIssue(null)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          {getIssueIcon(issue.type)}
          {hoveredIssue?.id === issue.id && (
            <LocationLabel
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {issue.title}
            </LocationLabel>
          )}
        </LocationPin>
      ))}

      <GlowOverlay />

      <MapTitle>
        <TitleText>Live Issue Map</TitleText>
        <SubtitleText>Real-time civic issue tracking</SubtitleText>
      </MapTitle>

      <StatsPanel>
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
      </StatsPanel>
    </MapContainer>
  );
};

export default InteractiveMap;
