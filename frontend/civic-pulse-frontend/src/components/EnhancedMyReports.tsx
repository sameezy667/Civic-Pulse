import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Camera, 
  Calendar, 
  Clock, 
  AlertCircle, 
  FileText, 
  CheckCircle, 
  Settings, 
  Trash2, 
  Edit3,
  Construction,
  Lightbulb,
  Shield,
  Car,
  Trees,
  X,
  MessageSquare,
  User,
  Flag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
interface Report {
  id: string;
  title: string;
  description: string;
  category: 'pothole' | 'streetlight' | 'garbage' | 'vandalism' | 'other';
  location: string;
  address?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  updatedAt?: string;
  photo?: string;
  image_url?: string;
  assigned_to?: string;
  latitude?: number;
  longitude?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ReportUpdate {
  id: string;
  report_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  user_name?: string;
}

interface NewReport {
  title: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  photo?: File;
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #0a0a0a;
  min-height: 100vh;
  color: #ffffff;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #FF4800, #FF6B00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: #888;
  font-size: 1.1rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #FF4800;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(135deg, #FF4800, #FF6B00);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(255, 72, 0, 0.3);
    transform: translateY(-2px);
  }
`;

const FormContainer = styled(motion.div)`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 2px rgba(255, 72, 0, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 2px rgba(255, 72, 0, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 2px rgba(255, 72, 0, 0.2);
  }

  option {
    background: #2a2a2a;
    color: #fff;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;

  &::file-selector-button {
    background: #FF4800;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    margin-right: 1rem;
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #FF4800, #FF6B00);
    color: white;
    
    &:hover {
      box-shadow: 0 4px 15px rgba(255, 72, 0, 0.3);
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: #888;
    border: 1px solid #444;
    
    &:hover {
      background: #333;
      color: #fff;
    }
  `}
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const ReportCard = styled(motion.div)`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #FF4800;
    box-shadow: 0 8px 25px rgba(255, 72, 0, 0.1);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const ReportTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  flex: 1;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  
  ${props => {
    switch (props.status) {
      case 'open':
        return 'background: rgba(255, 193, 7, 0.2); color: #FFC107; border: 1px solid #FFC107;';
      case 'in_progress':
        return 'background: rgba(0, 123, 255, 0.2); color: #007BFF; border: 1px solid #007BFF;';
      case 'resolved':
        return 'background: rgba(40, 167, 69, 0.2); color: #28A745; border: 1px solid #28A745;';
      case 'closed':
        return 'background: rgba(108, 117, 125, 0.2); color: #6C757D; border: 1px solid #6C757D;';
      default:
        return 'background: rgba(255, 72, 0, 0.2); color: #FF4800; border: 1px solid #FF4800;';
    }
  }}
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => {
    switch (props.priority) {
      case 'urgent':
        return 'background: rgba(220, 53, 69, 0.2); color: #DC3545; border: 1px solid #DC3545;';
      case 'high':
        return 'background: rgba(255, 72, 0, 0.2); color: #FF4800; border: 1px solid #FF4800;';
      case 'medium':
        return 'background: rgba(255, 193, 7, 0.2); color: #FFC107; border: 1px solid #FFC107;';
      case 'low':
        return 'background: rgba(40, 167, 69, 0.2); color: #28A745; border: 1px solid #28A745;';
      default:
        return 'background: rgba(108, 117, 125, 0.2); color: #6C757D; border: 1px solid #6C757D;';
    }
  }}
`;

const ReportContent = styled.div`
  margin-bottom: 1rem;
`;

const ReportDescription = styled.p`
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const ReportMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #888;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ReportActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)<{ variant?: 'danger' | 'info' }>`
  background: transparent;
  border: 1px solid #444;
  color: #888;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#DC3545' : props.variant === 'info' ? '#007BFF' : '#FF4800'};
    border-color: ${props => props.variant === 'danger' ? '#DC3545' : props.variant === 'info' ? '#007BFF' : '#FF4800'};
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const UpdatesSection = styled(motion.div)`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
`;

const UpdatesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const UpdatesTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  font-size: 0.9rem;
`;

const UpdatesList = styled.div`
  space-y: 0.5rem;
`;

const UpdateItem = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
`;

const UpdateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const UpdateUser = styled.span`
  font-weight: 600;
  color: #FF4800;
  font-size: 0.8rem;
`;

const UpdateTime = styled.span`
  color: #888;
  font-size: 0.7rem;
`;

const UpdateMessage = styled.p`
  color: #ccc;
  font-size: 0.8rem;
  line-height: 1.4;
  margin: 0;
`;

const CategoryIcons = {
  pothole: Construction,
  streetlight: Lightbulb,
  garbage: Trash2,
  vandalism: Shield,
  other: Settings
};

// Main Component
const EnhancedMyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportUpdates, setReportUpdates] = useState<Record<string, ReportUpdate[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());
  const [newReport, setNewReport] = useState<NewReport>({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'medium',
    photo: undefined
  });

  // Mock data for demonstration
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Large pothole on Main Street',
      description: 'Deep pothole causing damage to vehicles near the intersection of Main St and 5th Ave. Water collects here during rain.',
      category: 'pothole',
      location: 'Main St & 5th Ave',
      status: 'in_progress',
      priority: 'high',
      submittedAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    },
    {
      id: '2',
      title: 'Broken streetlight',
      description: 'Streetlight has been out for over a week, creating safety concerns for pedestrians.',
      category: 'streetlight',
      location: 'Oak Avenue near Park',
      status: 'open',
      priority: 'medium',
      submittedAt: '2024-01-14T18:45:00Z'
    },
    {
      id: '3',
      title: 'Overflowing garbage bin',
      description: 'Public garbage bin is overflowing and attracting pests. Needs immediate attention.',
      category: 'garbage',
      location: 'City Park entrance',
      status: 'resolved',
      priority: 'low',
      submittedAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-12T16:30:00Z'
    }
  ];

  const mockUpdates: Record<string, ReportUpdate[]> = {
    '1': [
      {
        id: 'u1',
        report_id: '1',
        user_id: 'admin1',
        message: 'Report has been assigned to maintenance crew. Work will begin tomorrow.',
        is_internal: false,
        created_at: '2024-01-16T14:20:00Z',
        user_name: 'City Maintenance'
      }
    ],
    '3': [
      {
        id: 'u2',
        report_id: '3',
        user_id: 'admin2',
        message: 'Garbage bin has been emptied and cleaning completed.',
        is_internal: false,
        created_at: '2024-01-12T16:30:00Z',
        user_name: 'Sanitation Dept'
      }
    ]
  };

  useEffect(() => {
    // Initialize with mock data
    setReports(mockReports);
    setReportUpdates(mockUpdates);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReport.title && newReport.description && newReport.category && newReport.location) {
      const report: Report = {
        id: Date.now().toString(),
        title: newReport.title,
        description: newReport.description,
        category: newReport.category as any,
        location: newReport.location,
        priority: newReport.priority as any,
        status: 'open',
        submittedAt: new Date().toISOString()
      };
      
      setReports([report, ...reports]);
      setNewReport({ 
        title: '', 
        description: '', 
        category: '', 
        location: '', 
        priority: 'medium',
        photo: undefined 
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
    const newUpdates = { ...reportUpdates };
    delete newUpdates[id];
    setReportUpdates(newUpdates);
  };

  const toggleUpdates = (reportId: string) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedUpdates(newExpanded);
  };

  const getStatsData = () => {
    const total = reports.length;
    const open = reports.filter(r => r.status === 'open').length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStatsData();

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>My Reports</Title>
          <Subtitle>Track your submitted civic issues and their resolution status</Subtitle>
        </TitleSection>

        {/* Statistics */}
        <StatsContainer>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total Reports</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatNumber>{stats.open}</StatNumber>
            <StatLabel>Open Issues</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatNumber>{stats.inProgress}</StatNumber>
            <StatLabel>In Progress</StatLabel>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatNumber>{stats.resolved}</StatNumber>
            <StatLabel>Resolved</StatLabel>
          </StatCard>
        </StatsContainer>
      </Header>

      {/* Add New Report Button */}
      <AddButton
        onClick={() => setShowAddForm(!showAddForm)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={20} />
        Report New Issue
      </AddButton>

      {/* Add Report Form */}
      <AnimatePresence>
        {showAddForm && (
          <FormContainer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmitReport}>
              <FormGrid>
                <FormGroup>
                  <Label>Issue Title *</Label>
                  <Input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                    placeholder="Briefly describe the issue"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    value={newReport.category}
                    onChange={(e) => setNewReport({...newReport, category: e.target.value})}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="pothole">🕳️ Pothole</option>
                    <option value="streetlight">💡 Street Light</option>
                    <option value="garbage">🗑️ Garbage</option>
                    <option value="vandalism">🎨 Vandalism</option>
                    <option value="other">📝 Other</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Priority Level *</Label>
                  <Select
                    value={newReport.priority}
                    onChange={(e) => setNewReport({...newReport, priority: e.target.value})}
                    required
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="urgent">🔴 Urgent</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Location *</Label>
                  <Input
                    type="text"
                    value={newReport.location}
                    onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                    placeholder="Street address or landmark"
                    required
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label>Description *</Label>
                <TextArea
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  placeholder="Provide detailed information about the issue"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Photo (Optional)</Label>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewReport({...newReport, photo: e.target.files?.[0]})}
                />
              </FormGroup>

              <ButtonGroup>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Report
                </Button>
              </ButtonGroup>
            </form>
          </FormContainer>
        )}
      </AnimatePresence>

      {/* Reports Grid */}
      <ReportsGrid>
        <AnimatePresence>
          {reports.map((report, index) => {
            const IconComponent = CategoryIcons[report.category as keyof typeof CategoryIcons] || Settings;
            const hasUpdates = reportUpdates[report.id] && reportUpdates[report.id].length > 0;
            const isExpanded = expandedUpdates.has(report.id);

            return (
              <ReportCard
                key={report.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReportHeader>
                  <div style={{ flex: 1 }}>
                    <ReportTitle>{report.title}</ReportTitle>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={report.status}>
                        {report.status.replace('_', ' ')}
                      </StatusBadge>
                      <PriorityBadge priority={report.priority}>
                        <Flag size={12} />
                        {report.priority}
                      </PriorityBadge>
                    </div>
                  </div>
                  <IconComponent size={24} color="#FF4800" />
                </ReportHeader>

                <ReportContent>
                  <ReportDescription>{report.description}</ReportDescription>
                  
                  <ReportMeta>
                    <MetaItem>
                      <MapPin />
                      {report.location}
                    </MetaItem>
                    <MetaItem>
                      <Calendar />
                      {formatDate(report.submittedAt)}
                    </MetaItem>
                    <MetaItem>
                      <Clock />
                      {formatTime(report.submittedAt)}
                    </MetaItem>
                  </ReportMeta>
                </ReportContent>

                {/* Updates Section */}
                {hasUpdates && (
                  <UpdatesSection>
                    <UpdatesHeader onClick={() => toggleUpdates(report.id)}>
                      <UpdatesTitle>
                        <MessageSquare size={16} />
                        Updates ({reportUpdates[report.id].length})
                      </UpdatesTitle>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </UpdatesHeader>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <UpdatesList>
                            {reportUpdates[report.id].map((update) => (
                              <UpdateItem key={update.id}>
                                <UpdateHeader>
                                  <UpdateUser>
                                    <User size={12} style={{ marginRight: '0.25rem' }} />
                                    {update.user_name || 'System'}
                                  </UpdateUser>
                                  <UpdateTime>
                                    {formatDate(update.created_at)} at {formatTime(update.created_at)}
                                  </UpdateTime>
                                </UpdateHeader>
                                <UpdateMessage>{update.message}</UpdateMessage>
                              </UpdateItem>
                            ))}
                          </UpdatesList>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </UpdatesSection>
                )}

                <ReportActions>
                  <ActionButton
                    variant="info"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 />
                    Details
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => handleDeleteReport(report.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 />
                    Delete
                  </ActionButton>
                </ReportActions>
              </ReportCard>
            );
          })}
        </AnimatePresence>
      </ReportsGrid>

      {reports.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: '#888'
          }}
        >
          <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '0.5rem', color: '#ccc' }}>No Reports Yet</h3>
          <p>Click "Report New Issue" to submit your first civic issue report.</p>
        </motion.div>
      )}
    </Container>
  );
};

export default EnhancedMyReports;
