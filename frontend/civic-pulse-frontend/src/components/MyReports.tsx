import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RefreshCw, MapPin, Calendar, Eye, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { fetchUserReports, Report } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  background: rgba(26, 26, 26, 0.95);
  min-height: 100vh;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
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
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const UserGreeting = styled.p`
  color: #cccccc;
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
`;

const RefreshButton = styled.button`
  background: rgba(255, 72, 0, 0.1);
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 8px;
  color: #FF4800;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 72, 0, 0.2);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ReportCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 72, 0, 0.3);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'open':
        return `
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        `;
      case 'in_progress':
        return `
          background: rgba(0, 123, 255, 0.2);
          color: #007bff;
          border: 1px solid rgba(0, 123, 255, 0.3);
        `;
      case 'resolved':
        return `
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.3);
        `;
      case 'closed':
        return `
          background: rgba(220, 53, 69, 0.2);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.3);
        `;
      default:
        return `
          background: rgba(108, 117, 125, 0.2);
          color: #6c757d;
          border: 1px solid rgba(108, 117, 125, 0.3);
        `;
    }
  }}
`;

const ReportTitle = styled.h3`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const ReportDescription = styled.p`
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReportMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888888;
  font-size: 0.8rem;
  
  .icon {
    color: #FF4800;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #888888;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #cccccc;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 72, 0, 0.3);
    border-top: 3px solid #FF4800;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  
  .number {
    font-size: 2rem;
    font-weight: 700;
    color: #FF4800;
    margin: 0;
  }
  
  .label {
    color: #cccccc;
    font-size: 0.9rem;
    margin: 0.25rem 0 0 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const MyReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchUserReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock size={16} />;
      case 'in_progress':
        return <RefreshCw size={16} />;
      case 'resolved':
        return <CheckCircle2 size={16} />;
      case 'closed':
        return <AlertCircle size={16} />;
      default:
        return <Eye size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const total = reports.length;
    const open = reports.filter(r => r.status === 'open').length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </Container>
    );
  }

  const stats = getStats();

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>My Reports</Title>
          <UserGreeting>
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
          </UserGreeting>
        </HeaderLeft>
        <RefreshButton onClick={loadReports} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </RefreshButton>
      </Header>

      {error && (
        <ErrorMessage>
          <AlertCircle size={20} />
          <span>{error}</span>
        </ErrorMessage>
      )}

      {reports.length > 0 && (
        <StatsContainer>
          <StatCard>
            <h2 className="number">{stats.total}</h2>
            <p className="label">Total Reports</p>
          </StatCard>
          <StatCard>
            <h2 className="number">{stats.open}</h2>
            <p className="label">Open</p>
          </StatCard>
          <StatCard>
            <h2 className="number">{stats.inProgress}</h2>
            <p className="label">In Progress</p>
          </StatCard>
          <StatCard>
            <h2 className="number">{stats.resolved}</h2>
            <p className="label">Resolved</p>
          </StatCard>
        </StatsContainer>
      )}

      {reports.length === 0 && !loading ? (
        <EmptyState>
          <div className="icon">📋</div>
          <h3>No Reports Yet</h3>
          <p>You haven't submitted any reports. Start by creating your first report!</p>
        </EmptyState>
      ) : (
        <ReportsGrid>
          {reports.map((report) => (
            <ReportCard key={report.id}>
              <ReportHeader>
                <StatusBadge status={report.status}>
                  {getStatusIcon(report.status)}
                  {report.status.replace('_', ' ')}
                </StatusBadge>
              </ReportHeader>
              
              <ReportTitle>{report.title}</ReportTitle>
              <ReportDescription>{report.description}</ReportDescription>
              
              <ReportMeta>
                <MetaRow>
                  <Calendar className="icon" size={14} />
                  <span>Submitted {formatDate(report.created_at)}</span>
                </MetaRow>
                <MetaRow>
                  <MapPin className="icon" size={14} />
                  <span>{report.address}</span>
                </MetaRow>
                {report.image_url && (
                  <MetaRow>
                    <Eye className="icon" size={14} />
                    <span>Has attachment</span>
                  </MetaRow>
                )}
              </ReportMeta>
            </ReportCard>
          ))}
        </ReportsGrid>
      )}
    </Container>
  );
};

export default MyReports;