import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Users, Search, Navigation, Zap, Construction, Shield } from 'lucide-react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import SimpleLocationFilter from './SimpleLocationFilter';

// Fix Leaflet default marker icons
import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to update map center when user location changes
const MapUpdater: React.FC<{ userLocation?: UserLocation }> = ({ userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);
  
  return null;
};

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const userLocationIcon = createCustomIcon('#FF4800');
const alertIcon = createCustomIcon('#FF0000');
interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

// Types for alerts
interface MapAlert {
  id: string;
  type: 'road_work' | 'accident' | 'emergency' | 'maintenance' | 'traffic';
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  reportedBy: string;
  status: 'active' | 'resolved' | 'investigating';
}

// Mock alert data
const mockAlerts: MapAlert[] = [
  {
    id: '1',
    type: 'road_work',
    title: 'Road Construction on Main Street',
    description: 'Major road construction causing traffic delays. Expected completion in 3 days.',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'Main St & 5th Ave'
    },
    severity: 'medium',
    timestamp: '2h ago',
    reportedBy: 'City Works Dept',
    status: 'active'
  },
  {
    id: '2',
    type: 'accident',
    title: 'Traffic Accident',
    description: 'Multi-vehicle accident blocking two lanes. Emergency services on scene.',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: 'Broadway & 42nd St'
    },
    severity: 'high',
    timestamp: '15m ago',
    reportedBy: 'NYPD Traffic',
    status: 'investigating'
  },
  {
    id: '3',
    type: 'emergency',
    title: 'Water Main Break',
    description: 'Emergency water main break flooding street. Avoid area.',
    location: {
      lat: 40.7831,
      lng: -73.9712,
      address: 'Central Park West & 86th St'
    },
    severity: 'critical',
    timestamp: '45m ago',
    reportedBy: 'NYC Water',
    status: 'active'
  },
  {
    id: '4',
    type: 'maintenance',
    title: 'Street Light Outage',
    description: 'Multiple street lights out on Park Avenue. Repair crew dispatched.',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: 'Park Ave & 23rd St'
    },
    severity: 'low',
    timestamp: '1h ago',
    reportedBy: 'ConEd',
    status: 'investigating'
  },
  {
    id: '5',
    type: 'traffic',
    title: 'Heavy Traffic Congestion',
    description: 'Unusual traffic congestion due to event at Madison Square Garden.',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: 'Penn Station Area'
    },
    severity: 'medium',
    timestamp: '30m ago',
    reportedBy: 'Traffic Control',
    status: 'active'
  }
];

// Helper functions for styling (moved outside component for styled-components)
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#ff1744';
    case 'high':
      return '#FF4800';
    case 'medium':
      return '#ff9800';
    case 'low':
      return '#4caf50';
    default:
      return '#FF4800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#FF4800';
    case 'investigating':
      return '#ff9800';
    case 'resolved':
      return '#4caf50';
    default:
      return '#FF4800';
  }
};

const LiveMap: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<MapAlert | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>();

  // Get user's real-time location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Please manually enter your location.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          city: 'Your Location',
          country: ''
        });
        console.log('Location acquired successfully');
      },
      (error) => {
        console.log('Error getting location:', error.message);
        
        // Provide user-friendly error messages
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please enable location permissions in your browser settings to use the "Near Me" filter.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable. Please check your internet connection and try again.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out. Please try again.');
            break;
          default:
            alert('An unknown error occurred while getting your location. Please try again.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Filter alerts based on type and search
  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'road_work':
        return <Construction size={16} />;
      case 'accident':
        return <AlertTriangle size={16} />;
      case 'emergency':
        return <Zap size={16} />;
      case 'maintenance':
        return <Shield size={16} />;
      case 'traffic':
        return <Users size={16} />;
      default:
        return <MapPin size={16} />;
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Live Map</Title>
          <Subtitle>Real-time alerts and incidents in your area</Subtitle>
        </TitleSection>
        
        <Controls>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search alerts or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          
          <FilterContainer>
            <FilterSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Alerts</option>
              <option value="road_work">Road Work</option>
              <option value="accident">Accidents</option>
              <option value="emergency">Emergency</option>
              <option value="maintenance">Maintenance</option>
              <option value="traffic">Traffic</option>
            </FilterSelect>
          </FilterContainer>
        </Controls>
      </Header>

      {/* Location Filter Component */}
      <SimpleLocationFilter
        currentLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : undefined}
        onLocationRequest={getCurrentLocation}
      />

      <MapContainer>
        <LeafletMapContainer
          center={userLocation ? [userLocation.lat, userLocation.lng] : [40.7128, -74.0060]}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapUpdater userLocation={userLocation} />
          
          {/* User location marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={userLocationIcon}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>Your Location</strong>
                  <br />
                  {userLocation.city}
                  <br />
                  <small>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</small>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Alert markers */}
          {filteredAlerts.map((alert) => (
            <Marker
              key={alert.id}
              position={[alert.location.lat, alert.location.lng]}
              icon={alertIcon}
            >
              <Popup>
                <div>
                  <strong>{alert.title}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{alert.description}</small>
                  <br />
                  <small>
                    <strong>Status:</strong> {alert.status}<br />
                    <strong>Severity:</strong> {alert.severity}<br />
                    <strong>Reported:</strong> {alert.timestamp}
                  </small>
                </div>
              </Popup>
            </Marker>
          ))}
        </LeafletMapContainer>

        <AlertsSidebar>
          <SidebarHeader>
            <h3>Active Alerts ({filteredAlerts.length})</h3>
          </SidebarHeader>
          
          <AlertsList>
            {filteredAlerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                isSelected={selectedAlert?.id === alert.id}
                onClick={() => setSelectedAlert(alert)}
                as={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: -4 }}
              >
                <AlertHeader>
                  <AlertTypeIcon severity={alert.severity}>
                    {getAlertIcon(alert.type)}
                  </AlertTypeIcon>
                  <AlertMeta>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertTime>{alert.timestamp}</AlertTime>
                  </AlertMeta>
                  <AlertStatus status={alert.status}>
                    {alert.status}
                  </AlertStatus>
                </AlertHeader>
                
                <AlertDescription>{alert.description}</AlertDescription>
                
                <AlertFooter>
                  <AlertLocation>
                    <MapPin size={14} />
                    {alert.location.address}
                  </AlertLocation>
                  <AlertReporter>by {alert.reportedBy}</AlertReporter>
                </AlertFooter>
              </AlertCard>
            ))}
          </AlertsList>
        </AlertsSidebar>
      </MapContainer>

      {selectedAlert && (
        <AlertModal
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.target === e.currentTarget && setSelectedAlert(null)}
        >
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{selectedAlert.title}</ModalTitle>
              <CloseButton onClick={() => setSelectedAlert(null)}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <AlertDetail>
                <strong>Description:</strong> {selectedAlert.description}
              </AlertDetail>
              <AlertDetail>
                <strong>Location:</strong> {selectedAlert.location.address}
              </AlertDetail>
              <AlertDetail>
                <strong>Severity:</strong> 
                <SeverityBadge severity={selectedAlert.severity}>
                  {selectedAlert.severity.toUpperCase()}
                </SeverityBadge>
              </AlertDetail>
              <AlertDetail>
                <strong>Status:</strong> 
                <StatusBadge status={selectedAlert.status}>
                  {selectedAlert.status.toUpperCase()}
                </StatusBadge>
              </AlertDetail>
              <AlertDetail>
                <strong>Reported by:</strong> {selectedAlert.reportedBy}
              </AlertDetail>
              <AlertDetail>
                <strong>Time:</strong> {selectedAlert.timestamp}
              </AlertDetail>
            </ModalBody>
          </ModalContent>
        </AlertModal>
      )}
    </Container>
  );
};

// Styled Components - Matching Orange & Black Theme
const Container = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #999999;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #999999;
  z-index: 1;
  
  @media (max-width: 768px) {
    left: 0.875rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 480px) {
    left: 0.75rem;
    font-size: 0.8rem;
  }
`;

const SearchInput = styled.input`
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 12px;
  color: #ffffff;
  padding: 0.75rem 1rem 0.75rem 3rem;
  font-size: 0.875rem;
  width: 300px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 3px rgba(255, 72, 0, 0.1);
  }
  
  &::placeholder {
    color: #666666;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.625rem 0.875rem 0.625rem 2.75rem;
    font-size: 0.875rem;
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
    font-size: 0.8rem;
    border-radius: 10px;
  }
`;

const FilterContainer = styled.div``;

const FilterSelect = styled.select`
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 12px;
  color: #ffffff;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
  }
  
  option {
    background: #1a1a1a;
    color: #ffffff;
  }
`;

const MapContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: 70vh;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    height: 60vh;
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    height: 50vh;
    margin: 0 -1rem;
  }
`;

const MapView = styled.div`
  background: #0a0a0a;
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  
  /* Subtle dark grid background like map apps */
  background-image: 
    /* Fine vertical grid lines */
    linear-gradient(90deg, rgba(60, 60, 60, 0.4) 1px, transparent 1px),
    /* Fine horizontal grid lines */
    linear-gradient(0deg, rgba(60, 60, 60, 0.4) 1px, transparent 1px),
    /* Larger block grid for districts */
    linear-gradient(90deg, rgba(80, 80, 80, 0.6) 1px, transparent 1px),
    linear-gradient(0deg, rgba(80, 80, 80, 0.6) 1px, transparent 1px);
  background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
  background-position: 0 0, 0 0, 0 0, 0 0;
  
  /* Subtle overlay for depth */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(20, 20, 20, 0.3) 0%,
      transparent 50%,
      rgba(15, 15, 15, 0.2) 100%
    );
    pointer-events: none;
    z-index: 1;
  }
  
  /* Map zones and districts for realistic feel */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      /* Subtle district zones */
      radial-gradient(
        ellipse at 25% 30%, 
        rgba(40, 40, 40, 0.3) 0%, 
        transparent 40%
      ),
      radial-gradient(
        ellipse at 75% 60%, 
        rgba(35, 35, 35, 0.2) 0%, 
        transparent 35%
      ),
      radial-gradient(
        ellipse at 50% 80%, 
        rgba(45, 45, 45, 0.25) 0%, 
        transparent 30%
      );
    pointer-events: none;
    z-index: 1;
  }
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  
  /* Street network lines */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      /* Main horizontal streets */
      linear-gradient(90deg, transparent 48%, rgba(120, 120, 120, 0.6) 49%, rgba(140, 140, 140, 0.8) 50%, rgba(120, 120, 120, 0.6) 51%, transparent 52%),
      linear-gradient(90deg, transparent 28%, rgba(100, 100, 100, 0.4) 29%, rgba(120, 120, 120, 0.6) 30%, rgba(100, 100, 100, 0.4) 31%, transparent 32%),
      linear-gradient(90deg, transparent 68%, rgba(100, 100, 100, 0.4) 69%, rgba(120, 120, 120, 0.6) 70%, rgba(100, 100, 100, 0.4) 71%, transparent 72%),
      
      /* Main vertical streets */
      linear-gradient(0deg, transparent 48%, rgba(120, 120, 120, 0.6) 49%, rgba(140, 140, 140, 0.8) 50%, rgba(120, 120, 120, 0.6) 51%, transparent 52%),
      linear-gradient(0deg, transparent 33%, rgba(100, 100, 100, 0.4) 34%, rgba(120, 120, 120, 0.6) 35%, rgba(100, 100, 100, 0.4) 36%, transparent 37%),
      linear-gradient(0deg, transparent 63%, rgba(100, 100, 100, 0.4) 64%, rgba(120, 120, 120, 0.6) 65%, rgba(100, 100, 100, 0.4) 66%, transparent 67%),
      
      /* Diagonal connector streets */
      linear-gradient(45deg, transparent 0%, transparent 40%, rgba(90, 90, 90, 0.3) 45%, rgba(110, 110, 110, 0.5) 50%, rgba(90, 90, 90, 0.3) 55%, transparent 60%, transparent 100%),
      linear-gradient(-45deg, transparent 0%, transparent 35%, rgba(90, 90, 90, 0.3) 40%, rgba(110, 110, 110, 0.5) 45%, rgba(90, 90, 90, 0.3) 50%, transparent 55%, transparent 100%);
    
    background-size: 100% 100%;
    pointer-events: none;
    z-index: 2;
  }
  
  /* Radar sweep animation */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 300deg,
      rgba(255, 72, 0, 0.4) 330deg,
      rgba(255, 72, 0, 0.8) 360deg,
      transparent 360deg
    );
    border-radius: 50%;
    animation: radarSweep 4s linear infinite;
    pointer-events: none;
    z-index: 3;
  }
  
  @keyframes radarSweep {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

const LocationButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #FF4800;
  border: none;
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #e63d00;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #999;
  }
  
  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    min-height: 44px;
    min-width: 44px;
  }
  
  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    border-radius: 10px;
  }
`;

const StreetNetwork = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
  
  /* Main arterial streets */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      /* Primary crossroads through center - Main arteries */
      linear-gradient(90deg, 
        transparent 0%, 
        transparent 15%, 
        rgba(130, 130, 130, 0.3) 20%, 
        rgba(150, 150, 150, 0.5) 30%, 
        rgba(170, 170, 170, 0.7) 45%, 
        rgba(200, 200, 200, 0.9) 49%, 
        #cccccc 50%, 
        rgba(200, 200, 200, 0.9) 51%, 
        rgba(170, 170, 170, 0.7) 55%, 
        rgba(150, 150, 150, 0.5) 70%, 
        rgba(130, 130, 130, 0.3) 80%, 
        transparent 85%, 
        transparent 100%
      ),
      linear-gradient(0deg, 
        transparent 0%, 
        transparent 15%, 
        rgba(130, 130, 130, 0.3) 20%, 
        rgba(150, 150, 150, 0.5) 30%, 
        rgba(170, 170, 170, 0.7) 45%, 
        rgba(200, 200, 200, 0.9) 49%, 
        #cccccc 50%, 
        rgba(200, 200, 200, 0.9) 51%, 
        rgba(170, 170, 170, 0.7) 55%, 
        rgba(150, 150, 150, 0.5) 70%, 
        rgba(130, 130, 130, 0.3) 80%, 
        transparent 85%, 
        transparent 100%
      ),
      
      /* Secondary major streets */
      linear-gradient(90deg, 
        transparent 0%, 
        transparent 20%, 
        rgba(120, 120, 120, 0.4) 25%, 
        rgba(140, 140, 140, 0.6) 35%, 
        transparent 40%, 
        transparent 60%, 
        rgba(140, 140, 140, 0.6) 65%, 
        rgba(120, 120, 120, 0.4) 75%, 
        transparent 80%, 
        transparent 100%
      ),
      linear-gradient(0deg, 
        transparent 0%, 
        transparent 20%, 
        rgba(120, 120, 120, 0.4) 25%, 
        rgba(140, 140, 140, 0.6) 35%, 
        transparent 40%, 
        transparent 60%, 
        rgba(140, 140, 140, 0.6) 65%, 
        rgba(120, 120, 120, 0.4) 75%, 
        transparent 80%, 
        transparent 100%
      );
    
    background-size: 100% 3px, 3px 100%, 100% 2px, 2px 100%;
    background-position: 0 50%, 50% 0, 0 30%, 30% 0;
    background-repeat: no-repeat;
  }
  
  /* Detailed street grid network */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      /* Dense horizontal street grid */
      linear-gradient(90deg, transparent 0%, transparent 10%, rgba(100, 100, 100, 0.3) 15%, rgba(110, 110, 110, 0.4) 20%, transparent 25%, transparent 100%),
      linear-gradient(90deg, transparent 0%, transparent 20%, rgba(100, 100, 100, 0.3) 25%, rgba(110, 110, 110, 0.4) 30%, transparent 35%, transparent 100%),
      linear-gradient(90deg, transparent 0%, transparent 40%, rgba(100, 100, 100, 0.3) 45%, rgba(110, 110, 110, 0.4) 50%, transparent 55%, transparent 100%),
      linear-gradient(90deg, transparent 0%, transparent 60%, rgba(100, 100, 100, 0.3) 65%, rgba(110, 110, 110, 0.4) 70%, transparent 75%, transparent 100%),
      linear-gradient(90deg, transparent 0%, transparent 75%, rgba(100, 100, 100, 0.3) 80%, rgba(110, 110, 110, 0.4) 85%, transparent 90%, transparent 100%),
      
      /* Dense vertical street grid */
      linear-gradient(0deg, transparent 0%, transparent 10%, rgba(100, 100, 100, 0.3) 15%, rgba(110, 110, 110, 0.4) 20%, transparent 25%, transparent 100%),
      linear-gradient(0deg, transparent 0%, transparent 25%, rgba(100, 100, 100, 0.3) 30%, rgba(110, 110, 110, 0.4) 35%, transparent 40%, transparent 100%),
      linear-gradient(0deg, transparent 0%, transparent 55%, rgba(100, 100, 100, 0.3) 60%, rgba(110, 110, 110, 0.4) 65%, transparent 70%, transparent 100%),
      linear-gradient(0deg, transparent 0%, transparent 70%, rgba(100, 100, 100, 0.3) 75%, rgba(110, 110, 110, 0.4) 80%, transparent 85%, transparent 100%),
      linear-gradient(0deg, transparent 0%, transparent 85%, rgba(100, 100, 100, 0.3) 90%, rgba(110, 110, 110, 0.4) 95%, transparent 100%, transparent 100%),
      
      /* Diagonal residential streets */
      linear-gradient(45deg, transparent 0%, transparent 15%, rgba(90, 90, 90, 0.2) 20%, rgba(100, 100, 100, 0.3) 25%, transparent 30%, transparent 100%),
      linear-gradient(-45deg, transparent 0%, transparent 25%, rgba(90, 90, 90, 0.2) 30%, rgba(100, 100, 100, 0.3) 35%, transparent 40%, transparent 100%),
      linear-gradient(45deg, transparent 0%, transparent 60%, rgba(90, 90, 90, 0.2) 65%, rgba(100, 100, 100, 0.3) 70%, transparent 75%, transparent 100%),
      linear-gradient(-45deg, transparent 0%, transparent 70%, rgba(90, 90, 90, 0.2) 75%, rgba(100, 100, 100, 0.3) 80%, transparent 85%, transparent 100%),
      
      /* Small connector streets and alleys */
      linear-gradient(30deg, transparent 0%, transparent 35%, rgba(80, 80, 80, 0.2) 40%, rgba(90, 90, 90, 0.25) 45%, transparent 50%, transparent 100%),
      linear-gradient(-30deg, transparent 0%, transparent 45%, rgba(80, 80, 80, 0.2) 50%, rgba(90, 90, 90, 0.25) 55%, transparent 60%, transparent 100%),
      linear-gradient(60deg, transparent 0%, transparent 20%, rgba(80, 80, 80, 0.2) 25%, rgba(90, 90, 90, 0.25) 30%, transparent 35%, transparent 100%),
      linear-gradient(-60deg, transparent 0%, transparent 65%, rgba(80, 80, 80, 0.2) 70%, rgba(90, 90, 90, 0.25) 75%, transparent 80%, transparent 100%);
    
    background-size: 
      100% 1px, 100% 1px, 100% 1px, 100% 1px, 100% 1px,
      1px 100%, 1px 100%, 1px 100%, 1px 100%, 1px 100%,
      1px 100%, 1px 100%, 1px 100%, 1px 100%,
      1px 100%, 1px 100%, 1px 100%, 1px 100%;
    background-position: 
      0 15%, 0 25%, 0 60%, 0 75%, 0 90%,
      15% 0, 30% 0, 60% 0, 75% 0, 90% 0,
      center, center, center, center,
      center, center, center, center;
    background-repeat: no-repeat;
  }
`;

const MapGrid = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const AlertPin = styled.div<{ severity: string }>`
  position: absolute;
  width: 32px;
  height: 32px;
  background: ${props => getSeverityColor(props.severity)};
  border: 2px solid #0a0a0a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  /* Radar blip effect */
  &::before {
    content: '';
    position: absolute;
    width: 48px;
    height: 48px;
    border: 2px solid ${props => getSeverityColor(props.severity)};
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.4;
    animation: blip 2s ease-out infinite;
  }
  
  &:hover {
    transform: scale(1.3);
    box-shadow: 
      0 0 30px ${props => getSeverityColor(props.severity)},
      0 0 60px rgba(255, 72, 0, 0.3);
    z-index: 20;
    
    &::before {
      animation-duration: 0.5s;
    }
  }
  
  @keyframes blip {
    0% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(0.8);
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.5);
    }
  }
`;

const UserLocationPin = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  
  /* Connecting pathways to center */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background-image:
      /* Diagonal pathways leading to center */
      linear-gradient(45deg, 
        transparent 0%, 
        transparent 30%, 
        rgba(120, 120, 120, 0.3) 40%, 
        rgba(150, 150, 150, 0.6) 48%, 
        #cccccc 50%, 
        rgba(150, 150, 150, 0.6) 52%, 
        rgba(120, 120, 120, 0.3) 60%, 
        transparent 70%, 
        transparent 100%
      ),
      linear-gradient(-45deg, 
        transparent 0%, 
        transparent 30%, 
        rgba(120, 120, 120, 0.3) 40%, 
        rgba(150, 150, 150, 0.6) 48%, 
        #cccccc 50%, 
        rgba(150, 150, 150, 0.6) 52%, 
        rgba(120, 120, 120, 0.3) 60%, 
        transparent 70%, 
        transparent 100%
      ),
      linear-gradient(135deg, 
        transparent 0%, 
        transparent 35%, 
        rgba(100, 100, 100, 0.2) 45%, 
        rgba(130, 130, 130, 0.4) 48%, 
        rgba(160, 160, 160, 0.6) 50%, 
        rgba(130, 130, 130, 0.4) 52%, 
        rgba(100, 100, 100, 0.2) 55%, 
        transparent 65%, 
        transparent 100%
      ),
      linear-gradient(-135deg, 
        transparent 0%, 
        transparent 35%, 
        rgba(100, 100, 100, 0.2) 45%, 
        rgba(130, 130, 130, 0.4) 48%, 
        rgba(160, 160, 160, 0.6) 50%, 
        rgba(130, 130, 130, 0.4) 52%, 
        rgba(100, 100, 100, 0.2) 55%, 
        transparent 65%, 
        transparent 100%
      );
    background-size: 1px 100%, 1px 100%, 1px 100%, 1px 100%;
    background-position: center;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 8;
  }
  
  /* Outer pulse rings */
  .pulse-ring-1 {
    width: 200px;
    height: 200px;
    border: 2px solid rgba(255, 72, 0, 0.6);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-ring 3s ease-out infinite;
  }
  
  .pulse-ring-2 {
    width: 120px;
    height: 120px;
    border: 2px solid rgba(255, 72, 0, 0.8);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-ring 3s ease-out infinite 0.5s;
  }
  
  .pulse-ring-3 {
    width: 80px;
    height: 80px;
    border: 3px solid #FF4800;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-ring 3s ease-out infinite 1s;
  }
  
  /* Central location dot */
  .center-dot {
    width: 20px;
    height: 20px;
    background: #FF4800;
    border: 4px solid #0a0a0a;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 15;
    box-shadow: 
      0 0 20px rgba(255, 72, 0, 0.8),
      inset 0 0 10px rgba(255, 255, 255, 0.3);
  }
  
  /* Coordinate display */
  .coordinates {
    position: absolute;
    top: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 10, 0.9);
    border: 1px solid rgba(255, 72, 0, 0.5);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    backdrop-filter: blur(10px);
    white-space: nowrap;
    
    .location-name {
      color: #FF4800;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .coords {
      color: #cccccc;
      font-size: 0.75rem;
      font-family: 'Courier New', monospace;
    }
  }
  
  @keyframes pulse-ring {
    0% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(0.5);
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
`;

const AlertsSidebar = styled.div`
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  overflow-y: auto;
  
  @media (max-width: 1024px) {
    max-height: 400px;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 16px;
    max-height: 350px;
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem;
    border-radius: 12px;
    max-height: 300px;
  }
`;

const SidebarHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    color: #ffffff;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    
    h3 {
      font-size: 1.125rem;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 0.875rem;
    
    h3 {
      font-size: 1rem;
    }
  }
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AlertCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'rgba(255, 72, 0, 0.1)' : 'rgba(30, 30, 30, 0.8)'};
  border: 1px solid ${props => props.isSelected ? '#FF4800' : 'rgba(255, 72, 0, 0.2)'};
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF4800;
    transform: translateX(-4px);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    border-radius: 12px;
    
    &:hover {
      transform: translateX(-2px);
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: 10px;
    
    &:hover {
      transform: translateX(-1px);
    }
  }
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    gap: 0.625rem;
    margin-bottom: 0.625rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

const AlertTypeIcon = styled.div<{ severity: string }>`
  width: 32px;
  height: 32px;
  background: ${props => getSeverityColor(props.severity)};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    font-size: 0.875rem;
  }
  
  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    font-size: 0.75rem;
  }
`;

const AlertMeta = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin: 0 0 0.2rem 0;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    line-height: 1.25;
  }
`;

const AlertTime = styled.span`
  color: #999999;
  font-size: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`;

const AlertStatus = styled.span<{ status: string }>`
  background: ${props => getStatusColor(props.status)};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlertDescription = styled.p`
  color: #cccccc;
  font-size: 0.8rem;
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
`;

const AlertFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
`;

const AlertLocation = styled.div`
  color: #FF4800;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AlertReporter = styled.div`
  color: #999999;
`;

const AlertModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;
    border-radius: 16px;
    max-height: 85vh;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    width: 95%;
    border-radius: 12px;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999999;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #ffffff;
  }
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    padding: 0.25rem;
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    padding: 0.375rem;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AlertDetail = styled.div`
  color: #cccccc;
  line-height: 1.6;
  
  strong {
    color: #ffffff;
    display: inline-block;
    margin-right: 0.5rem;
  }
`;

const SeverityBadge = styled.span<{ severity: string }>`
  background: ${props => getSeverityColor(props.severity)};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  background: ${props => getStatusColor(props.status)};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

export default LiveMap;
