import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  RefreshCw, 
  X, 
  MapPin, 
  UserCheck, 
  UserX 
} from 'lucide-react';
import { Report, Profile, reportAPI, profileAPI, supabase } from '../utils/supabase';

type AdminSection = 'overview' | 'reports' | 'users' | 'settings';

// Styled Components
const Container = styled.div`
  background: #0a0a0a;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(20, 20, 20, 0.95);
  border-bottom: 1px solid rgba(255, 72, 0, 0.2);
`;

const Logo = styled.h1`
  color: #FF4800;
  font-size: 1.5rem;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  button {
    background: rgba(255, 72, 0, 0.1);
    border: 1px solid rgba(255, 72, 0, 0.3);
    color: #FF4800;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 72, 0, 0.2);
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.div`
  width: 280px;
  background: rgba(20, 20, 20, 0.95);
  border-right: 1px solid rgba(255, 72, 0, 0.2);
  backdrop-filter: blur(20px);
  
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 1000;
  }
`;

const SidebarItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: ${props => props.active ? '#FF4800' : '#CCCCCC'};
  background: ${props => props.active ? 'rgba(255, 72, 0, 0.1)' : 'transparent'};
  border-right: ${props => props.active ? '2px solid #FF4800' : '2px solid transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 72, 0, 0.05);
    color: #FF4800;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const Section = styled.div`
  background: rgba(20, 20, 20, 0.6);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 72, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    color: #ffffff;
    font-size: 1.5rem;
    margin: 0;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 72, 0, 0.1);
  border: 1px solid rgba(255, 72, 0, 0.3);
  color: #FF4800;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 72, 0, 0.2);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(40, 40, 40, 0.6);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
`;

const StatLabel = styled.div`
  color: #CCCCCC;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 72, 0, 0.1);
  }
  
  th {
    color: #FF4800;
    font-weight: 600;
    background: rgba(255, 72, 0, 0.05);
  }
  
  td {
    color: #CCCCCC;
  }
  
  tr:hover {
    background: rgba(255, 72, 0, 0.02);
  }
`;

const Badge = styled.span<{ color: string }>`
  background: ${props => `${props.color}20`};
  color: ${props => props.color};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid ${props => `${props.color}40`};
`;

const Select = styled.select`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(255, 72, 0, 0.3);
  color: #ffffff;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
  }
`;

const Button = styled.button`
  background: rgba(255, 72, 0, 0.1);
  border: 1px solid rgba(255, 72, 0, 0.3);
  color: #FF4800;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 72, 0, 0.2);
  }
`;

const AssignButton = styled.button`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22C55E;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(34, 197, 94, 0.2);
  }
`;

const Modal = styled(motion.div)`
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
`;

const ModalContent = styled(motion.div)`
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 72, 0, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    color: #ffffff;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #CCCCCC;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const ModalBody = styled.div`
  color: #CCCCCC;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 72, 0, 0.1);
  
  label {
    font-weight: 600;
    color: #FF4800;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #CCCCCC;
  
  p {
    margin-top: 1rem;
  }
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
  
  h3 {
    color: #ffffff;
    margin: 1rem 0 0.5rem 0;
  }
  
  p {
    color: #CCCCCC;
    margin-bottom: 1rem;
  }
  
  button {
    background: rgba(255, 72, 0, 0.1);
    border: 1px solid rgba(255, 72, 0, 0.3);
    color: #FF4800;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 72, 0, 0.2);
    }
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SettingsCard = styled.div`
  background: rgba(40, 40, 40, 0.6);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  
  h3 {
    color: #ffffff;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #CCCCCC;
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
  }
  
  button {
    background: rgba(255, 72, 0, 0.1);
    border: 1px solid rgba(255, 72, 0, 0.3);
    color: #FF4800;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 72, 0, 0.2);
    }
  }
`;

// Main Component
interface AdminDashboardProps {
  onBackToMain: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMain }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const reportsChannel = supabase
      .channel('admin-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        loadReports();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadReports(), loadUsers()]);
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Admin data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const data = await reportAPI.getAll();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await profileAPI.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const updateReportStatus = async (reportId: string, status: Report['status']) => {
    try {
      const updatedReport = await reportAPI.updateStatus(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
    } catch (err) {
      console.error('Failed to update report status:', err);
    }
  };

  const assignReport = async (reportId: string, userId: string) => {
    try {
      const updatedReport = await reportAPI.assign(reportId, userId);
      setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
      setAssignmentModal(null);
    } catch (err) {
      console.error('Failed to assign report:', err);
    }
  };

  const updateUserRole = async (userId: string, role: Profile['role']) => {
    try {
      const updatedUser = await profileAPI.updateRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'open': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#F59E0B';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'urgent': return '#DC2626';
      default: return '#F59E0B';
    }
  };

  const getStats = () => {
    return {
      total: reports.length,
      open: reports.filter(r => r.status === 'open').length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.role !== 'admin').length
    };
  };

  const renderOverview = () => {
    const stats = getStats();
    
    return (
      <Section>
        <SectionHeader>
          <h2>Dashboard Overview</h2>
          <RefreshButton onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </RefreshButton>
        </SectionHeader>
        
        <StatsGrid>
          <StatCard>
            <StatIcon style={{ background: '#3B82F620', color: '#3B82F6' }}>
              <FileText size={24} />
            </StatIcon>
            <StatInfo>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Total Reports</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon style={{ background: '#F59E0B20', color: '#F59E0B' }}>
              <AlertTriangle size={24} />
            </StatIcon>
            <StatInfo>
              <StatNumber>{stats.open}</StatNumber>
              <StatLabel>Open Reports</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon style={{ background: '#3B82F620', color: '#3B82F6' }}>
              <TrendingUp size={24} />
            </StatIcon>
            <StatInfo>
              <StatNumber>{stats.inProgress}</StatNumber>
              <StatLabel>In Progress</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon style={{ background: '#10B98120', color: '#10B981' }}>
              <CheckCircle size={24} />
            </StatIcon>
            <StatInfo>
              <StatNumber>{stats.resolved}</StatNumber>
              <StatLabel>Resolved</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon style={{ background: '#8B5CF620', color: '#8B5CF6' }}>
              <Users size={24} />
            </StatIcon>
            <StatInfo>
              <StatNumber>{stats.totalUsers}</StatNumber>
              <StatLabel>Total Users</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon style={{ background: '#10B98120', color: '#10B981' }}>
              <UserCheck size={24} />
            </StatIcon>
            <StatInfo>
              <StatNumber>{stats.activeUsers}</StatNumber>
              <StatLabel>Active Citizens</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        <div>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Recent Reports</h3>
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map((report) => (
                <tr key={report.id}>
                  <td>{report.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{report.category}</td>
                  <td>
                    <Badge color={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={getStatusColor(report.status)}>
                      {report.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button onClick={() => setSelectedReport(report)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Section>
    );
  };

  const renderReports = () => (
    <Section>
      <SectionHeader>
        <h2>Reports Management</h2>
        <RefreshButton onClick={handleRefresh}>
          <RefreshCw size={16} />
          Refresh
        </RefreshButton>
      </SectionHeader>

      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.title}</td>
              <td style={{ textTransform: 'capitalize' }}>{report.category}</td>
              <td>
                <Badge color={getPriorityColor(report.priority)}>
                  {report.priority}
                </Badge>
              </td>
              <td>
                <Select
                  value={report.status}
                  onChange={(e) => updateReportStatus(report.id, e.target.value as Report['status'])}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </td>
              <td>
                {report.assigned_to ? (
                  users.find(u => u.id === report.assigned_to)?.name || 'Unknown'
                ) : (
                  <AssignButton onClick={() => setAssignmentModal(report)}>
                    Assign
                  </AssignButton>
                )}
              </td>
              <td>{new Date(report.created_at).toLocaleDateString()}</td>
              <td>
                <Button onClick={() => setSelectedReport(report)}>
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Section>
  );

  const renderUsers = () => (
    <Section>
      <SectionHeader>
        <h2>User Management</h2>
        <RefreshButton onClick={handleRefresh}>
          <RefreshCw size={16} />
          Refresh
        </RefreshButton>
      </SectionHeader>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || 'N/A'}</td>
              <td>{user.email}</td>
              <td>
                <Select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value as Profile['role'])}
                >
                  <option value="citizen">Citizen</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <Button>
                  {user.role === 'admin' ? <UserX size={16} /> : <UserCheck size={16} />}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Section>
  );

  const renderSettings = () => (
    <Section>
      <SectionHeader>
        <h2>System Settings</h2>
      </SectionHeader>
      
      <SettingsGrid>
        <SettingsCard>
          <h3>General Settings</h3>
          <p>Configure system-wide settings and preferences.</p>
          <button>Configure</button>
        </SettingsCard>
        
        <SettingsCard>
          <h3>Notifications</h3>
          <p>Manage notification settings and alerts.</p>
          <button>Configure</button>
        </SettingsCard>
        
        <SettingsCard>
          <h3>Data Management</h3>
          <p>Export reports and manage data retention.</p>
          <button>Manage</button>
        </SettingsCard>
        
        <SettingsCard>
          <h3>User Permissions</h3>
          <p>Configure role-based access controls.</p>
          <button>Configure</button>
        </SettingsCard>
      </SettingsGrid>
    </Section>
  );

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <RefreshCw className="animate-spin" size={48} />
          <p>Loading admin dashboard...</p>
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          <AlertTriangle size={48} color="#EF4444" />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Logo>Civic Pulse Admin</Logo>
        <HeaderActions>
          <button onClick={onBackToMain}>Back to Main</button>
        </HeaderActions>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarItem 
            active={activeSection === 'overview'}
            onClick={() => setActiveSection('overview')}
          >
            <BarChart3 size={20} />
            Overview
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'reports'}
            onClick={() => setActiveSection('reports')}
          >
            <FileText size={20} />
            Reports
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'users'}
            onClick={() => setActiveSection('users')}
          >
            <Users size={20} />
            Users
          </SidebarItem>
          <SidebarItem 
            active={activeSection === 'settings'}
            onClick={() => setActiveSection('settings')}
          >
            <Settings size={20} />
            Settings
          </SidebarItem>
        </Sidebar>

        <Content>
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'reports' && renderReports()}
          {activeSection === 'users' && renderUsers()}
          {activeSection === 'settings' && renderSettings()}
        </Content>
      </MainContent>

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>{selectedReport.title}</h3>
                <CloseButton onClick={() => setSelectedReport(null)}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <DetailRow>
                  <label>Status:</label>
                  <Badge color={getStatusColor(selectedReport.status)}>
                    {selectedReport.status.replace('_', ' ')}
                  </Badge>
                </DetailRow>

                <DetailRow>
                  <label>Priority:</label>
                  <Badge color={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                </DetailRow>

                <DetailRow>
                  <label>Category:</label>
                  <span style={{ textTransform: 'capitalize' }}>{selectedReport.category}</span>
                </DetailRow>

                <DetailRow>
                  <label>Description:</label>
                  <span>{selectedReport.description}</span>
                </DetailRow>

                <DetailRow>
                  <label>Location:</label>
                  <span>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedReport.address || 'Location not specified'}
                  </span>
                </DetailRow>

                <DetailRow>
                  <label>Created:</label>
                  <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
                </DetailRow>

                {selectedReport.image_url && (
                  <DetailRow>
                    <label>Photo:</label>
                    <img 
                      src={selectedReport.image_url} 
                      alt="Report" 
                      style={{ maxWidth: '100%', borderRadius: '8px' }} 
                    />
                  </DetailRow>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignmentModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAssignmentModal(null)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>Assign Report: {assignmentModal.title}</h3>
                <CloseButton onClick={() => setAssignmentModal(null)}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <label>Select Admin/Staff Member:</label>
                <select 
                  onChange={(e) => assignReport(assignmentModal.id, e.target.value)}
                  defaultValue=""
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(40, 40, 40, 0.8)',
                    border: '1px solid rgba(255, 72, 0, 0.3)',
                    color: '#ffffff'
                  }}
                >
                  <option value="">Select...</option>
                  {users.filter(u => u.role === 'admin' || u.role === 'staff').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AdminDashboard;
