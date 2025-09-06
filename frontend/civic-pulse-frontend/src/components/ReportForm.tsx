import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapPin, Camera, Upload, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createReport, uploadImage, Report } from '../lib/supabase';
import { assignDepartment, DEPARTMENTS, Department } from '../types/departments';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Container = styled.div`
  background: rgba(26, 26, 26, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 800px;
  border: 1px solid rgba(255, 72, 0, 0.2);
  
  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #cccccc;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 0.875rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 3px rgba(255, 72, 0, 0.1);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const TextArea = styled.textarea`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 0.875rem;
  color: #ffffff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 3px rgba(255, 72, 0, 0.1);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const Select = styled.select`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 0.875rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 3px rgba(255, 72, 0, 0.1);
  }
  
  option {
    background: #2a2a2a;
    color: #ffffff;
  }
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FileInputLabel = styled.label`
  background: rgba(40, 40, 40, 0.8);
  border: 2px dashed rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF4800;
    background: rgba(255, 72, 0, 0.05);
  }
`;

const MapWrapper = styled.div`
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(80, 80, 80, 0.6);
  
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 72, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DepartmentAssignment = styled.div`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  
  &.assigned {
    border-color: #FF4800;
    background: rgba(255, 72, 0, 0.05);
  }
`;

const DepartmentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const DepartmentTitle = styled.h4`
  color: #FF4800;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
`;

const DepartmentName = styled.div`
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const DepartmentDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.4;
`;

const ContactInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(80, 80, 80, 0.3);
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
`;

const Alert = styled.div<{ type: 'success' | 'error' }>`
  background: ${props => props.type === 'success' 
    ? 'rgba(34, 197, 94, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.type === 'success' 
    ? 'rgba(34, 197, 94, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)'};
  border-radius: 8px;
  padding: 1rem;
  color: ${props => props.type === 'success' ? '#22c55e' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

interface ReportFormProps {
  onReportSubmitted?: (report: Report) => void;
}

interface LocationSelectProps {
  onLocationSelect: (e: any) => void;
}

const LocationSelector: React.FC<LocationSelectProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click: onLocationSelect,
  });
  return null;
};

const ReportForm: React.FC<ReportFormProps> = ({ onReportSubmitted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [assignedDepartment, setAssignedDepartment] = useState<Department | null>(null);

  const categories = [
    { id: 'pothole', label: 'Pothole', emoji: '🕳️' },
    { id: 'streetlight', label: 'Street Light', emoji: '💡' },
    { id: 'garbage', label: 'Garbage Collection', emoji: '🗑️' },
    { id: 'vandalism', label: 'Vandalism', emoji: '🎨' },
    { id: 'water', label: 'Water Issue', emoji: '💧' },
    { id: 'road', label: 'Road Damage', emoji: '🛣️' },
    { id: 'other', label: 'Other', emoji: '📝' }
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          setError('Unable to get your location. Please select manually on the map.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Auto-assign department based on category
  useEffect(() => {
    const department = assignDepartment(category, location || undefined);
    setAssignedDepartment(department);
  }, [category, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = null;
      
      // Upload photo if provided
      if (photo) {
        imageUrl = await uploadImage(photo);
      }

      // Get address if not provided
      let finalAddress = address;
      if (!finalAddress && location) {
        finalAddress = `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`;
      }

      // Create report
      const report = await createReport({
        title,
        description,
        category,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        address: finalAddress,
        image_url: imageUrl
      });

      setSuccess(true);
      setReportId(report.id);
      
      // Call callback if provided
      if (onReportSubmitted) {
        onReportSubmitted(report);
      }
      
      // Clear form
      setTitle('');
      setDescription('');
      setCategory('pothole');
      setPhoto(null);
      setAddress('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (e: any) => {
    const { lat, lng } = e.latlng;
    setLocation({ lat, lng });
  };

  return (
    <Container>
      <Title>Report an Issue</Title>
      
      {success && (
        <Alert type="success">
          <CheckCircle2 size={20} />
          <span>
            Your report has been submitted successfully! Report ID: {reportId}
          </span>
        </Alert>
      )}

      {error && (
        <Alert type="error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="title">
            📝 Issue Title
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Brief description of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="description">
            📄 Detailed Description
          </Label>
          <TextArea
            id="description"
            placeholder="Provide more details about the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="category">
            🏷️ Category
          </Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </Select>
        </InputGroup>

        {/* Department Assignment Display */}
        {assignedDepartment && (
          <DepartmentAssignment className="assigned">
            <DepartmentHeader>
              <Building2 size={16} />
              <DepartmentTitle>Will be assigned to:</DepartmentTitle>
            </DepartmentHeader>
            <DepartmentName>{assignedDepartment.name}</DepartmentName>
            <DepartmentDescription>{assignedDepartment.description}</DepartmentDescription>
            <ContactInfo>
              <ContactItem>
                📧 {assignedDepartment.contactEmail}
              </ContactItem>
              <ContactItem>
                📞 {assignedDepartment.phone}
              </ContactItem>
            </ContactInfo>
          </DepartmentAssignment>
        )}

        <InputGroup>
          <Label>
            <Camera size={16} />
            Photo Evidence (Optional)
          </Label>
          <FileInputWrapper>
            <FileInput
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
            <FileInputLabel>
              <Upload size={24} />
              <span>{photo ? photo.name : 'Click to upload a photo'}</span>
              <small>JPG, PNG, or GIF (Max 10MB)</small>
            </FileInputLabel>
          </FileInputWrapper>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="address">
            <MapPin size={16} />
            Address (Optional)
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter address or select on map"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </InputGroup>

        {location && (
          <InputGroup>
            <Label>📍 Location on Map</Label>
            <MapWrapper>
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationSelector onLocationSelect={handleLocationSelect} />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>
                    Selected location<br />
                    Click anywhere on the map to change
                  </Popup>
                </Marker>
              </MapContainer>
            </MapWrapper>
          </InputGroup>
        )}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Upload size={16} />
              Submit Report
            </>
          )}
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default ReportForm;
