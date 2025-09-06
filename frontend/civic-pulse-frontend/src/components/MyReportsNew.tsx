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
  CheckCircle, 
  Settings, 
  Trash2, 
  Edit3,
  X,
  RefreshCw,
  MessageSquare,
  Shield,
  Car,
  Construction,
  Lightbulb,
  Trees
} from 'lucide-react';
import { Report, reportAPI, reportUpdatesAPI, ReportUpdate, getCurrentUser, subscribeToReports, supabase } from '../utils/supabase';

// Types matching backend schema
interface NewReport {
  title: string;
  description: string;
  category: 'pothole' | 'streetlight' | 'garbage' | 'vandalism' | 'other';
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  photo?: File;
}

// Categories matching backend
const categories = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️' },
  { id: 'streetlight', label: 'Street Light', icon: '💡' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️' },
  { id: 'vandalism', label: 'Vandalism', icon: '🎨' },
  { id: 'other', label: 'Other', icon: '📝' }
];

const priorities = [
  { id: 'low', label: 'Low', color: '#10B981' },
  { id: 'medium', label: 'Medium', color: '#F59E0B' },
  { id: 'high', label: 'High', color: '#EF4444' },
  { id: 'urgent', label: 'Urgent', color: '#DC2626' }
];

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return '#F59E0B';
    case 'in_progress': return '#3B82F6';
    case 'resolved': return '#10B981';
    case 'closed': return '#6B7280';
    default: return '#6B7280';
  }
};

const getPriorityColor = (priority: string) => {
  const priorityObj = priorities.find(p => p.id === priority);
  return priorityObj?.color || '#6B7280';
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'pothole':
      return <Construction size={16} />;
    case 'streetlight':
      return <Lightbulb size={16} />;
    case 'garbage':
      return <Trash2 size={16} />;
    case 'vandalism':
      return <Shield size={16} />;
    case 'other':
      return <AlertCircle size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: white;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    margin: 0;
    background: linear-gradient(135deg, #FF4800, #FF8A00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(135deg, #FF4800, #FF8A00);
  border: none;
  border-radius: 12px;
  color: white;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 72, 0, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #FF4800;
    font-size: 2rem;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReportCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: #FF4800;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    flex: 1;
  }
`;

const StatusBadge = styled.div<{ status: string }>`
  background: ${props => getStatusColor(props.status)};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const CategoryTag = styled.div`
  background: rgba(255, 72, 0, 0.1);
  color: #FF4800;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriorityTag = styled.div<{ color: string }>`
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: 1px solid ${props => props.color};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const CardImage = styled.div`
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Modal Components
const DetailModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const DetailContent = styled(motion.div)`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #FF4800;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const DetailBody = styled.div`
  padding: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
  
  h4 {
    margin: 0 0 1rem 0;
    color: #FF4800;
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const DetailRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const UpdatesList = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
`;

const UpdateItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  p {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
  }
  
  span {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const CommentForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  
  textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    padding: 0.75rem;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    &:focus {
      outline: none;
      border-color: #FF4800;
    }
  }
  
  button {
    background: linear-gradient(135deg, #FF4800, #FF8A00);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
    
    &:hover {
      opacity: 0.9;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

// Form Modal Components
const FormModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const FormContent = styled(motion.div)`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #FF4800;
  }
`;

const FormBody = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #FF4800;
    font-weight: 600;
  }
  
  input, textarea, select {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    padding: 0.75rem;
    font-family: inherit;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    &:focus {
      outline: none;
      border-color: #FF4800;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  select {
    cursor: pointer;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  
  button {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    
    &.primary {
      background: linear-gradient(135deg, #FF4800, #FF8A00);
      color: white;
      
      &:hover {
        opacity: 0.9;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  svg {
    animation: spin 1s linear infinite;
    color: #FF4800;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #EF4444;
  color: #EF4444;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  
  h3 {
    margin: 1rem 0;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const MyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reportUpdates, setReportUpdates] = useState<ReportUpdate[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newReport, setNewReport] = useState<NewReport>({
    title: '',
    description: '',
    category: 'pothole',
    location: '',
    priority: 'medium',
  });

  // Load user's reports
  useEffect(() => {
    loadReports();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = subscribeToReports((updatedReports) => {
      // Filter to only show current user's reports
      loadReports();
    });

    return () => {
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      } else {
        try {
          supabase.removeChannel(channel as any);
        } catch (error) {
          console.warn('Error removing channel:', error);
        }
      }
    };
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Please log in to view your reports');
        return;
      }

      const userReports = await reportAPI.getByUser(user.id);
      setReports(userReports);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async () => {
    if (!newReport.title || !newReport.description || !newReport.location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Please log in to submit a report');
        return;
      }

      const reportData = {
        title: newReport.title,
        description: newReport.description,
        category: newReport.category,
        address: newReport.location,
        priority: newReport.priority,
        status: 'open' as const,
        user_id: user.id
      };

      await reportAPI.create(reportData);
      
      // Reset form
      setNewReport({
        title: '',
        description: '',
        category: 'pothole',
        location: '',
        priority: 'medium',
      });
      setShowAddForm(false);
      
      // Reload reports
      await loadReports();
    } catch (err) {
      console.error('Error creating report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportClick = async (report: Report) => {
    setSelectedReport(report);
    
    // Load updates for this report
    try {
      const updates = await reportUpdatesAPI.getByReportId(report.id);
      setReportUpdates(updates);
    } catch (err) {
      console.error('Error loading report updates:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReport) return;

    try {
      setCommentLoading(true);
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Please log in to add a comment');
        return;
      }

      await reportUpdatesAPI.create({
        report_id: selectedReport.id,
        message: newComment.trim(),
        user_id: user.id,
        is_internal: false
      });

      setNewComment('');
      
      // Reload updates
      const updates = await reportUpdatesAPI.getByReportId(selectedReport.id);
      setReportUpdates(updates);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <RefreshCw size={32} />
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>My Reports</h1>
        <AddButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          New Report
        </AddButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Stats */}
      <StatsGrid>
        <StatCard whileHover={{ scale: 1.02 }}>
          <h3>{stats.total}</h3>
          <p>Total Reports</p>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <h3>{stats.open}</h3>
          <p>Open</p>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <h3>{stats.resolved}</h3>
          <p>Resolved</p>
        </StatCard>
      </StatsGrid>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <EmptyState>
          <AlertCircle size={64} />
          <h3>No reports yet</h3>
          <p>Create your first report to get started</p>
        </EmptyState>
      ) : (
        <ReportsGrid>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              layoutId={report.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleReportClick(report)}
            >
              <CardContent>
                <CardHeader>
                  <h3>{report.title}</h3>
                  <StatusBadge status={report.status}>
                    {report.status.replace('_', ' ')}
                  </StatusBadge>
                </CardHeader>

                <CardMeta>
                  <MetaItem>
                    <MapPin size={14} />
                    {report.address || 'Location not specified'}
                  </MetaItem>
                  <MetaItem>
                    <Calendar size={14} />
                    {new Date(report.created_at).toLocaleDateString()}
                  </MetaItem>
                </CardMeta>

                <CardFooter>
                  <CategoryTag>
                    {getCategoryIcon(report.category)} {report.category}
                  </CategoryTag>
                  <PriorityTag color={getPriorityColor(report.priority)}>
                    {report.priority}
                  </PriorityTag>
                </CardFooter>
              </CardContent>

              {report.image_url && (
                <CardImage>
                  <img src={report.image_url} alt="Report" />
                </CardImage>
              )}
            </ReportCard>
          ))}
        </ReportsGrid>
      )}

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <DetailModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
          >
            <DetailContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DetailHeader>
                <h2>{selectedReport.title}</h2>
                <CloseButton onClick={() => setSelectedReport(null)}>
                  <X size={20} />
                </CloseButton>
              </DetailHeader>

              <DetailBody>
                <DetailSection>
                  <h4>Status & Priority</h4>
                  <DetailRow>
                    <StatusBadge status={selectedReport.status}>
                      {selectedReport.status.replace('_', ' ')}
                    </StatusBadge>
                    <PriorityTag color={getPriorityColor(selectedReport.priority)}>
                      {selectedReport.priority} priority
                    </PriorityTag>
                  </DetailRow>
                </DetailSection>

                <DetailSection>
                  <h4>Description</h4>
                  <p>{selectedReport.description}</p>
                </DetailSection>

                <DetailSection>
                  <h4>Location</h4>
                  <p>{selectedReport.address || 'Location not specified'}</p>
                </DetailSection>

                {selectedReport.image_url && (
                  <DetailSection>
                    <h4>Photo</h4>
                    <img src={selectedReport.image_url} alt="Report" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  </DetailSection>
                )}

                <DetailSection>
                  <h4>Updates & Comments</h4>
                  <UpdatesList>
                    {reportUpdates.map((update) => (
                      <UpdateItem key={update.id}>
                        <MessageSquare size={16} />
                        <div>
                          <p>{update.message}</p>
                          <span>{new Date(update.created_at).toLocaleString()}</span>
                        </div>
                      </UpdateItem>
                    ))}
                  </UpdatesList>

                  <CommentForm>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment or update..."
                      rows={3}
                    />
                    <button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || commentLoading}
                    >
                      {commentLoading ? 'Adding...' : 'Add Comment'}
                    </button>
                  </CommentForm>
                </DetailSection>
              </DetailBody>
            </DetailContent>
          </DetailModal>
        )}
      </AnimatePresence>

      {/* Add Report Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <FormModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <FormContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormHeader>
                <h2>Submit New Report</h2>
                <CloseButton onClick={() => setShowAddForm(false)}>
                  <X size={20} />
                </CloseButton>
              </FormHeader>

              <FormBody>
                <FormGroup>
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Category *</label>
                  <select
                    value={newReport.category}
                    onChange={(e) => setNewReport({ ...newReport, category: e.target.value as NewReport['category'] })}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Priority *</label>
                  <select
                    value={newReport.priority}
                    onChange={(e) => setNewReport({ ...newReport, priority: e.target.value as NewReport['priority'] })}
                    required
                  >
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.id}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Location *</label>
                  <input
                    type="text"
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    placeholder="Street address or landmark"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Description *</label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Detailed description of the issue"
                    required
                  />
                </FormGroup>

                <FormActions>
                  <button 
                    type="button" 
                    className="secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="primary"
                    onClick={handleAddReport}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </FormActions>
              </FormBody>
            </FormContent>
          </FormModal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default MyReports;
