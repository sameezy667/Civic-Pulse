import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Navigation, MapPin } from 'lucide-react';

interface SimpleLocationFilterProps {
  currentLocation?: { lat: number; lng: number };
  onLocationRequest?: () => void;
}

const FilterContainer = styled.div`
  position: relative;
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(20px);
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    margin: 0 -1rem 0.5rem -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const FilterTitle = styled.h3`
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NearMeButton = styled(motion.button)<{ active?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(255, 72, 0, 0.2) 0%, rgba(255, 138, 0, 0.2) 100%)'
    : 'rgba(40, 40, 40, 0.8)'
  };
  border: 1px solid ${props => props.active ? '#FF4800' : 'rgba(80, 80, 80, 0.6)'};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: ${props => props.active ? '#FF4800' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  
  &:hover {
    border-color: #FF4800;
    background: rgba(255, 72, 0, 0.1);
    color: #FF4800;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.6rem;
    gap: 0.375rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const LocationStatus = styled.div<{ active?: boolean }>`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.active ? '#4CAF50' : '#999'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SimpleLocationFilter: React.FC<SimpleLocationFilterProps> = ({
  currentLocation,
  onLocationRequest
}) => {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const handleLocationRequest = async () => {
    if (isRequestingLocation) return;
    
    setIsRequestingLocation(true);
    
    try {
      if (onLocationRequest) {
        await onLocationRequest();
      }
    } catch (error) {
      console.error('Location request failed:', error);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <MapPin size={16} />
          Location Filter
        </FilterTitle>
      </FilterHeader>
      
      <NearMeButton
        active={!!currentLocation}
        disabled={isRequestingLocation}
        onClick={handleLocationRequest}
        whileHover={{ scale: isRequestingLocation ? 1 : 1.02 }}
        whileTap={{ scale: isRequestingLocation ? 1 : 0.98 }}
      >
        <Navigation size={16} style={{ 
          animation: isRequestingLocation ? 'spin 1s linear infinite' : 'none' 
        }} />
        <div>
          <div style={{ fontWeight: '600' }}>
            {isRequestingLocation ? 'Detecting...' : 'Near Me'}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            {isRequestingLocation ? 'Getting your location...' : 'Filter by current location'}
          </div>
        </div>
      </NearMeButton>
      
      <LocationStatus active={!!currentLocation}>
        {currentLocation ? (
          <>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: '#4CAF50' 
            }} />
            Location detected: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </>
        ) : (
          <>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: '#999' 
            }} />
            Click "Near Me" to detect your location
          </>
        )}
      </LocationStatus>
    </FilterContainer>
  );
};

export default SimpleLocationFilter;
