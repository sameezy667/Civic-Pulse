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
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
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

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Reports</Title>
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

      {reports.length === 0 && !loading ? (
        <EmptyState>
          <div className="icon">📋</div>
          <h3>No Reports Yet</h3>
          <p>You haven't submitted any reports. Start by creating your first report!</p>
        </EmptyState>
      ) : (
        <div>
          <p style={{ color: '#cccccc' }}>Found {reports.length} reports</p>
        </div>
      )}
    </Container>
  );
};

export default MyReports;
