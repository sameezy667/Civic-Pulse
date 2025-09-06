import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  FileText,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Report } from '../utils/supabase';
import { reportAPI, getCurrentUser, subscribeToReports } from '../utils/supabase';

// Helper Functions (must be defined before usage in styled components)
const getStatusColor = (status: Report['status']) => {
  switch (status) {
    case 'open': return '#F59E0B';
    case 'in_progress': return '#3B82F6';
    case 'resolved': return '#10B981';
    case 'closed': return '#6B7280';
    default: return '#6B7280';
  }
};

const getPriorityColor = (priority: Report['priority']) => {
  switch (priority) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'urgent': return '#DC2626';
    default: return '#6B7280';
  }
};

const getCategoryColor = (category: Report['category']) => {
  switch (category) {
    case 'pothole': return '#8B5CF6';
    case 'streetlight': return '#F59E0B';
    case 'garbage': return '#10B981';
    case 'vandalism': return '#EF4444';
    case 'other': return '#6B7280';
    default: return '#6B7280';
  }
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 2rem;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #FF4800, #FF6B35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: white;
  font-size: 0.9rem;
  width: 250px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 2px rgba(255, 72, 0, 0.2);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(135deg, #FF4800, #FF6B35);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 72, 0, 0.3);
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
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const ReportsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const ReportCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 72, 0, 0.3);
    transform: translateY(-2px);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ReportTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: white;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => getStatusColor(props.status as Report['status'])}20;
  color: ${props => getStatusColor(props.status as Report['status'])};
  border: 1px solid ${props => getStatusColor(props.status as Report['status'])}40;
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load user and reports
  useEffect(() => {
    loadUserAndReports();
  }, []);

  const loadUserAndReports = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      if (user) {
        const userReports = await reportAPI.getByUser(user.id);
        setReports(userReports);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search
  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.address && report.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <LoadingSpinner
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading your reports...
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <AlertCircle size={48} style={{ marginBottom: '1rem', color: '#EF4444' }} />
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button 
            onClick={loadUserAndReports}
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#FF4800', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Reports</Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={18} />
            <SearchInput
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <AddButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Report New Issue
          </AddButton>
        </Controls>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatValue style={{ color: '#3B82F6' }}>{stats.total}</StatValue>
          <StatLabel>Total Reports</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatValue style={{ color: '#F59E0B' }}>{stats.open}</StatValue>
          <StatLabel>Open</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatValue style={{ color: '#3B82F6' }}>{stats.inProgress}</StatValue>
          <StatLabel>In Progress</StatLabel>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatValue style={{ color: '#10B981' }}>{stats.resolved}</StatValue>
          <StatLabel>Resolved</StatLabel>
        </StatCard>
      </StatsGrid>

      <ReportsGrid>
        <AnimatePresence>
          {filteredReports.length === 0 ? (
            <EmptyState
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ marginBottom: '0.5rem', color: '#ccc' }}>
                {searchTerm ? 'No Matching Reports' : 'No Reports Yet'}
              </h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Click "Report New Issue" to submit your first civic issue report.'
                }
              </p>
            </EmptyState>
          ) : (
            filteredReports.map((report, index) => (
              <ReportCard
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReportHeader>
                  <ReportTitle>{report.title}</ReportTitle>
                  <StatusBadge status={report.status}>
                    {report.status.replace('_', ' ')}
                  </StatusBadge>
                </ReportHeader>
                
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    {report.description}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      <span>{report.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                </div>
              </ReportCard>
            ))
          )}
        </AnimatePresence>
      </ReportsGrid>
    </Container>
  );
};

export default MyReports;
