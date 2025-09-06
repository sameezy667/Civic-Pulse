// Department types and configuration for civic issue routing

export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  categories: string[];
  contactEmail?: string;
  phone?: string;
}

export interface DepartmentAssignment {
  reportId: string;
  departmentId: string;
  assignedAt: string;
  assignedBy: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
  notes?: string;
  estimatedCompletion?: string;
}

export interface AdminDepartmentAssignment {
  adminId: string;
  departmentId: string;
  assignedAt: string;
  assignedBy: string;
  role: 'supervisor' | 'officer' | 'coordinator';
  permissions: string[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  departmentId?: string;
  role: 'super_admin' | 'department_admin' | 'officer';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface LocationFilter {
  type: 'current' | 'radius' | 'polygon' | 'district';
  center?: { lat: number; lng: number };
  radius?: number; // in kilometers
  polygon?: { lat: number; lng: number }[];
  districtId?: string;
  name: string;
}

// Predefined government departments with their categories
export const DEPARTMENTS: Department[] = [
  {
    id: 'public-works',
    name: 'Public Works Department',
    description: 'Roads, sidewalks, infrastructure maintenance',
    color: '#FF4800',
    icon: 'Construction',
    categories: ['pothole', 'road_damage', 'road', 'sidewalk_repair', 'construction', 'drainage', 'street_maintenance'],
    contactEmail: 'publicworks@cityname.gov',
    phone: '1800-111-3333' // PWD Helpline
  },
  {
    id: 'utilities',
    name: 'Utilities Department',
    description: 'Power, water, gas, telecommunications',
    color: '#00BFFF',
    icon: 'Zap',
    categories: ['power_outage', 'water_leak', 'water', 'gas_leak', 'streetlight', 'street_light', 'utility_pole', 'water_pressure'],
    contactEmail: 'utilities@cityname.gov',
    phone: '1912' // Power Helpline
  },
  {
    id: 'environmental',
    name: 'Environmental Services',
    description: 'Waste management, recycling, environmental concerns',
    color: '#32CD32',
    icon: 'Leaf',
    categories: ['trash_collection', 'garbage', 'recycling', 'illegal_dumping', 'air_quality', 'noise_pollution', 'tree_maintenance'],
    contactEmail: 'environment@cityname.gov',
    phone: '1800-111-5555' // Municipal Corporation Helpline
  },
  {
    id: 'public-safety',
    name: 'Public Safety Department',
    description: 'Emergency services, safety hazards, security',
    color: '#DC143C',
    icon: 'Shield',
    categories: ['emergency', 'safety_hazard', 'vandalism', 'suspicious_activity', 'traffic_signal', 'fire_hazard'],
    contactEmail: 'safety@cityname.gov',
    phone: '100' // Police Emergency
  },
  {
    id: 'parks-recreation',
    name: 'Parks & Recreation',
    description: 'Parks, playgrounds, recreational facilities',
    color: '#228B22',
    icon: 'Trees',
    categories: ['park_maintenance', 'playground_damage', 'sports_facility', 'landscaping', 'public_restroom'],
    contactEmail: 'parks@cityname.gov',
    phone: '1800-111-4444' // Municipal Parks Helpline
  },
  {
    id: 'transportation',
    name: 'Transportation Department',
    description: 'Traffic management, public transit, parking',
    color: '#4169E1',
    icon: 'Car',
    categories: ['traffic_management', 'parking_violation', 'bus_stop', 'bike_lane', 'traffic_light', 'road_signs'],
    contactEmail: 'transport@cityname.gov',
    phone: '1800-111-6666' // Transport Department Helpline
  },
  {
    id: 'general-admin',
    name: 'General Administration',
    description: 'Miscellaneous civic issues and general complaints',
    color: '#9370DB',
    icon: 'Building',
    categories: ['other', 'general_complaint', 'documentation', 'civic_services'],
    contactEmail: 'admin@cityname.gov',
    phone: '1800-111-7777' // General Grievance Helpline
  }
];

export const DISTRICTS = [
  { id: 'downtown', name: 'Downtown', bounds: { north: 40.720, south: 40.700, east: -73.980, west: -74.020 } },
  { id: 'midtown', name: 'Midtown', bounds: { north: 40.770, south: 40.720, east: -73.960, west: -74.000 } },
  { id: 'uptown', name: 'Uptown', bounds: { north: 40.820, south: 40.770, east: -73.940, west: -73.980 } },
  { id: 'eastside', name: 'East Side', bounds: { north: 40.780, south: 40.720, east: -73.940, west: -73.970 } },
  { id: 'westside', name: 'West Side', bounds: { north: 40.780, south: 40.720, east: -73.990, west: -74.020 } }
];

/**
 * Automatically assigns a department based on issue category and location
 */
export function assignDepartment(category: string, location?: { lat: number; lng: number }): Department | null {
  // Find department that handles this category
  const department = DEPARTMENTS.find(dept => 
    dept.categories.includes(category.toLowerCase())
  );
  
  return department || null;
}

/**
 * Calculates distance between two coordinates in kilometers
 */
export function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Checks if a coordinate is within a location filter
 */
export function isWithinFilter(
  coordinate: { lat: number; lng: number },
  filter: LocationFilter
): boolean {
  switch (filter.type) {
    case 'current':
    case 'radius':
      if (!filter.center || !filter.radius) return true;
      return calculateDistance(coordinate, filter.center) <= filter.radius;
    
    case 'district':
      if (!filter.districtId) return true;
      const district = DISTRICTS.find(d => d.id === filter.districtId);
      if (!district) return true;
      return (
        coordinate.lat >= district.bounds.south &&
        coordinate.lat <= district.bounds.north &&
        coordinate.lng >= district.bounds.west &&
        coordinate.lng <= district.bounds.east
      );
    
    case 'polygon':
      if (!filter.polygon || filter.polygon.length < 3) return true;
      return isPointInPolygon(coordinate, filter.polygon);
    
    default:
      return true;
  }
}

/**
 * Ray casting algorithm to check if point is inside polygon
 */
function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].lng > point.lng !== polygon[j].lng > point.lng &&
      point.lat < (polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng) / (polygon[j].lng - polygon[i].lng) + polygon[i].lat
    ) {
      inside = !inside;
    }
  }
  return inside;
}

// Mock function to get reports by department for demo purposes
export const getReportsByDepartment = (departmentId: string) => {
  // In a real app, this would fetch from your backend
  return [];
};
