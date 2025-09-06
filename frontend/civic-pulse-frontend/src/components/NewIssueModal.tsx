import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  MapPin, 
  Upload,
  Send,
  Building
} from 'lucide-react';
import { DEPARTMENTS, assignDepartment } from '../types/departments';

// Types
interface NewIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: NewIssueData) => void;
}

interface NewIssueData {
  title: string;
  description: string;
  location: string;
  category: string;
  image?: File;
}

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Modal = styled(motion.div)`
  background: rgba(16, 19, 32, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #e5e7eb;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FileUploadArea = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)'};

  &:hover {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.03);
  }
`;

const FileUploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
`;

const FileUploadText = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
`;

const SelectedFile = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  color: #3b82f6;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 12px;
  padding: 0.875rem 2rem;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  background: rgba(16, 19, 32, 0.8);
  border: 1px solid rgba(55, 65, 81, 0.6);
  border-radius: 8px;
  padding: 0.75rem;
  color: #e5e7eb;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  option {
    background: rgba(16, 19, 32, 0.95);
    color: #e5e7eb;
  }
`;

const CategoryOption = styled.option`
  background: rgba(16, 19, 32, 0.95);
  color: #e5e7eb;
  padding: 0.5rem;
`;

const DepartmentInfo = styled.div`
  background: rgba(255, 72, 0, 0.1);
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DepartmentIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DepartmentDetails = styled.div`
  flex: 1;
  
  h4 {
    color: #ffffff;
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  p {
    color: #cccccc;
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
  }
  
  .contact {
    color: #FF4800;
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const NewIssueModal: React.FC<NewIssueFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<NewIssueData>({
    title: '',
    description: '',
    location: '',
    category: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Available categories
  const categories = [
    { id: 'pothole', label: 'Pothole', emoji: '🕳️' },
    { id: 'streetlight', label: 'Street Light', emoji: '💡' },
    { id: 'garbage', label: 'Garbage Collection', emoji: '🗑️' },
    { id: 'vandalism', label: 'Vandalism', emoji: '🎨' },
    { id: 'water', label: 'Water Issue', emoji: '💧' },
    { id: 'road', label: 'Road Damage', emoji: '🛣️' },
    { id: 'other', label: 'Other', emoji: '📝' }
  ];

  // Get assigned department based on selected category
  const assignedDepartment = formData.category ? assignDepartment(formData.category) : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.location && formData.category) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        category: ''
      });
      setSelectedFile(null);
      onClose();
    }
  };

  const isFormValid = formData.title && formData.description && formData.location && formData.category;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <Title>Report New Issue</Title>
            <CloseButton onClick={onClose}>
              <X size={24} />
            </CloseButton>
          </Header>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Issue Title *</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Category *</Label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <CategoryOption value="">Select a category</CategoryOption>
                {categories.map(cat => (
                  <CategoryOption key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </CategoryOption>
                ))}
              </Select>
              
              {assignedDepartment && (
                <DepartmentInfo>
                  <DepartmentIcon color={assignedDepartment.color}>
                    <Building size={20} />
                  </DepartmentIcon>
                  <DepartmentDetails>
                    <h4>Will be assigned to:</h4>
                    <h4>{assignedDepartment.name}</h4>
                    <p>{assignedDepartment.description}</p>
                    <div className="contact">📞 {assignedDepartment.phone}</div>
                  </DepartmentDetails>
                </DepartmentInfo>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Location *</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Street address or landmark"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <MapPin 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#9ca3af' 
                  }} 
                />
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Description *</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about the issue, its impact, and any safety concerns..."
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Photo (Optional)</Label>
              {selectedFile ? (
                <SelectedFile>
                  <Camera size={16} />
                  {selectedFile.name}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFormData(prev => ({ ...prev, image: undefined }));
                    }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer',
                      marginLeft: 'auto'
                    }}
                  >
                    <X size={16} />
                  </button>
                </SelectedFile>
              ) : (
                <FileUploadArea
                  isDragOver={isDragOver}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileUploadContent>
                    <Upload size={24} />
                    <FileUploadText>
                      Drag & drop an image here, or click to select
                    </FileUploadText>
                  </FileUploadContent>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                </FileUploadArea>
              )}
            </FormGroup>

            <SubmitButton
              type="submit"
              disabled={!isFormValid}
              whileHover={{ scale: isFormValid ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid ? 0.98 : 1 }}
            >
              <Send size={16} />
              Submit Report
            </SubmitButton>
          </Form>
        </Modal>
      </Overlay>
    </AnimatePresence>
  );
};

export default NewIssueModal;
