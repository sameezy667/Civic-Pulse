import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Target, Globe, X, Check } from 'lucide-react';
import { LocationFilter, DISTRICTS, calculateDistance } from '../types/departments';

interface LocationFilterProps {
  currentLocation?: { lat: number; lng: number };
  activeFilter: LocationFilter | null;
  onFilterChange: (filter: LocationFilter | null) => void;
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
  
  @media (max-width: 768px) {
    padding: 0.75rem;
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

const ActiveFilterBadge = styled(motion.div)`
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FilterOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const FilterOption = styled(motion.button)<{ active?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(255, 72, 0, 0.2) 0%, rgba(255, 138, 0, 0.2) 100%)'
    : 'rgba(40, 40, 40, 0.8)'
  };
  border: 1px solid ${props => props.active ? '#FF4800' : 'rgba(80, 80, 80, 0.6)'};
  border-radius: 8px;
  padding: 0.75rem;
  color: ${props => props.active ? '#FF4800' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #FF4800;
    background: rgba(255, 72, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OptionLabel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const OptionTitle = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
`;

const OptionDescription = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
`;

const RadiusControls = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(20, 20, 20, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(80, 80, 80, 0.3);
`;

const RadiusLabel = styled.label`
  color: #cccccc;
  font-size: 0.875rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
`;

const RadiusSlider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(80, 80, 80, 0.6);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FF4800;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FF4800;
    cursor: pointer;
    border: none;
  }
`;

const RadiusValue = styled.span`
  color: #FF4800;
  font-weight: 600;
  font-size: 0.875rem;
`;

const LocationFilterComponent: React.FC<LocationFilterProps> = ({
  currentLocation,
  activeFilter,
  onFilterChange,
  onLocationRequest
}) => {
  const [showRadiusControls, setShowRadiusControls] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(5); // Default 5km

  // Handle current location filter
  const handleCurrentLocationFilter = () => {
    if (!currentLocation) {
      onLocationRequest?.();
      return;
    }
    
    const filter: LocationFilter = {
      type: 'current',
      center: currentLocation,
      radius: selectedRadius,
      name: `Within ${selectedRadius}km of current location`
    };
    onFilterChange(filter);
    setShowRadiusControls(true);
  };

  // Handle district filter
  const handleDistrictFilter = (districtId: string) => {
    const district = DISTRICTS.find(d => d.id === districtId);
    if (!district) return;
    
    const filter: LocationFilter = {
      type: 'district',
      districtId,
      name: district.name
    };
    onFilterChange(filter);
    setShowRadiusControls(false);
  };

  // Handle radius change
  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    if (activeFilter?.type === 'current' && currentLocation) {
      const filter: LocationFilter = {
        type: 'current',
        center: currentLocation,
        radius,
        name: `Within ${radius}km of current location`
      };
      onFilterChange(filter);
    }
  };

  // Clear filter
  const clearFilter = () => {
    onFilterChange(null);
    setShowRadiusControls(false);
  };

  const isCurrentLocationActive = activeFilter?.type === 'current';
  const isDistrictActive = (districtId: string) => 
    activeFilter?.type === 'district' && activeFilter.districtId === districtId;

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <MapPin size={16} />
          Location Filter
        </FilterTitle>
        
        <AnimatePresence>
          {activeFilter && (
            <ActiveFilterBadge
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Check size={12} />
              {activeFilter.name}
              <ClearButton onClick={clearFilter}>
                <X size={12} />
              </ClearButton>
            </ActiveFilterBadge>
          )}
        </AnimatePresence>
      </FilterHeader>

      <FilterOptions>
        {/* Current Location Option */}
        <FilterOption
          active={isCurrentLocationActive}
          onClick={handleCurrentLocationFilter}
          disabled={!currentLocation && !onLocationRequest}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Navigation size={20} />
          <OptionLabel>
            <OptionTitle>Near Me</OptionTitle>
            <OptionDescription>
              {currentLocation ? 'Filter by current location' : 'Enable location access'}
            </OptionDescription>
          </OptionLabel>
        </FilterOption>

        {/* District Options */}
        {DISTRICTS.map(district => (
          <FilterOption
            key={district.id}
            active={isDistrictActive(district.id)}
            onClick={() => handleDistrictFilter(district.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target size={20} />
            <OptionLabel>
              <OptionTitle>{district.name}</OptionTitle>
              <OptionDescription>District area</OptionDescription>
            </OptionLabel>
          </FilterOption>
        ))}

        {/* All Areas Option */}
        <FilterOption
          active={!activeFilter}
          onClick={clearFilter}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Globe size={20} />
          <OptionLabel>
            <OptionTitle>All Areas</OptionTitle>
            <OptionDescription>Show all reports</OptionDescription>
          </OptionLabel>
        </FilterOption>
      </FilterOptions>

      {/* Radius Controls */}
      <AnimatePresence>
        {(showRadiusControls || isCurrentLocationActive) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <RadiusControls>
              <RadiusLabel>
                Search Radius: <RadiusValue>{selectedRadius}km</RadiusValue>
              </RadiusLabel>
              <RadiusSlider
                type="range"
                min="1"
                max="50"
                value={selectedRadius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
              />
            </RadiusControls>
          </motion.div>
        )}
      </AnimatePresence>
    </FilterContainer>
  );
};

export default LocationFilterComponent;
