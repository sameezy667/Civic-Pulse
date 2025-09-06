import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter,
  Badge,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit3,
  MessageSquare
} from 'lucide-react';
import { Department, DEPARTMENTS, getReportsByDepartment, DepartmentAssignment } from '../types/departments';
import { Report } from '../utils/supabase';

interface DepartmentManagementProps {
  reports: Report[];
  assignments: DepartmentAssignment[];
  onAssignmentUpdate: (reportId: string, assignment: Partial<DepartmentAssignment>) => void;
  onStatusUpdate: (reportId: string, status: DepartmentAssignment['status'], notes?: string) => void;
  currentUserDepartment?: string; // For department users
  isAdmin?: boolean;
}

const Container = styled.div`
  background: rgba(26, 26, 26, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin: 1rem 0;
  border: 1px solid rgba(255, 72, 0, 0.2);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 0.5rem 0;
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
    align-items: stretch;
  }
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DepartmentFilter = styled.select`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
  }
  
  option {
    background: #2a2a2a;
    color: #ffffff;
  }
`;

const StatusFilter = styled(DepartmentFilter)``;

const DepartmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const DepartmentCard = styled(motion.div)`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #FF4800;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255, 72, 0, 0.1);
  }
`;

const DepartmentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const DepartmentInfo = styled.div`
  flex: 1;
`;

const DepartmentName = styled.h3`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DepartmentDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: rgba(20, 20, 20, 0.6);
  border-radius: 8px;
`;

const StatNumber = styled.div`
  color: #FF4800;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(80, 80, 80, 0.3);
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
`;

const ReportsSection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReportCard = styled(motion.div)`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF4800;
    box-shadow: 0 4px 20px rgba(255, 72, 0, 0.1);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ReportTitle = styled.h4`
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span<{ status: DepartmentAssignment['status'] }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return 'background: rgba(255, 193, 7, 0.2); color: #FFC107; border: 1px solid #FFC107;';
      case 'acknowledged':
        return 'background: rgba(0, 123, 255, 0.2); color: #007BFF; border: 1px solid #007BFF;';
      case 'in_progress':
        return 'background: rgba(255, 72, 0, 0.2); color: #FF4800; border: 1px solid #FF4800;';
      case 'resolved':
        return 'background: rgba(40, 167, 69, 0.2); color: #28A745; border: 1px solid #28A745;';
      case 'rejected':
        return 'background: rgba(220, 53, 69, 0.2); color: #DC3545; border: 1px solid #DC3545;';
      default:
        return 'background: rgba(108, 117, 125, 0.2); color: #6C757D; border: 1px solid #6C757D;';
    }
  }}
`;

const ReportMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ReportDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #FF4800;
          color: white;
          &:hover { background: #E63E00; }
        `;
      case 'success':
        return `
          background: #28A745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'danger':
        return `
          background: #DC3545;
          color: white;
          &:hover { background: #C82333; }
        `;
      default:
        return `
          background: rgba(80, 80, 80, 0.6);
          color: #ffffff;
          &:hover { background: rgba(100, 100, 100, 0.8); }
        `;
    }
  }}
`;

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  reports,
  assignments,
  onAssignmentUpdate,
  onStatusUpdate,
  currentUserDepartment,
  isAdmin = false
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Get department stats
  const getDepartmentStats = (departmentId: string) => {
    const deptAssignments = assignments.filter(a => a.departmentId === departmentId);
    return {
      total: deptAssignments.length,
      pending: deptAssignments.filter(a => a.status === 'pending').length,
      inProgress: deptAssignments.filter(a => a.status === 'in_progress').length,
      resolved: deptAssignments.filter(a => a.status === 'resolved').length
    };
  };

  // Filter reports based on department and status
  const filteredReports = reports.filter(report => {
    const assignment = assignments.find(a => a.reportId === report.id);
    
    if (currentUserDepartment && !isAdmin) {
      // Department users only see their own reports
      if (!assignment || assignment.departmentId !== currentUserDepartment) return false;
    }
    
    if (selectedDepartment !== 'all') {
      if (!assignment || assignment.departmentId !== selectedDepartment) return false;
    }
    
    if (selectedStatus !== 'all') {
      if (!assignment || assignment.status !== selectedStatus) return false;
    }
    
    return true;
  });

  // Handle status update
  const handleStatusUpdate = (reportId: string, newStatus: DepartmentAssignment['status']) => {
    onStatusUpdate(reportId, newStatus);
  };

  const getStatusIcon = (status: DepartmentAssignment['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'acknowledged': return <Eye size={16} />;
      case 'in_progress': return <Edit3 size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      case 'rejected': return <AlertTriangle size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Building2 size={24} />
          Department Management
        </Title>
        
        {isAdmin && (
          <FilterContainer>
            <DepartmentFilter
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </DepartmentFilter>
            
            <StatusFilter
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </StatusFilter>
          </FilterContainer>
        )}
      </Header>

      {/* Department Overview (Admin only) */}
      {isAdmin && (
        <DepartmentGrid>
          {DEPARTMENTS.map(department => {
            const stats = getDepartmentStats(department.id);
            return (
              <DepartmentCard
                key={department.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDepartment(department.id)}
              >
                <DepartmentHeader>
                  <DepartmentInfo>
                    <DepartmentName style={{ color: department.color }}>
                      {department.name}
                    </DepartmentName>
                    <DepartmentDescription>
                      {department.description}
                    </DepartmentDescription>
                  </DepartmentInfo>
                </DepartmentHeader>
                
                <StatsContainer>
                  <StatItem>
                    <StatNumber>{stats.total}</StatNumber>
                    <StatLabel>Total</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.pending}</StatNumber>
                    <StatLabel>Pending</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.inProgress}</StatNumber>
                    <StatLabel>In Progress</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.resolved}</StatNumber>
                    <StatLabel>Resolved</StatLabel>
                  </StatItem>
                </StatsContainer>
                
                <ContactInfo>
                  <ContactItem>
                    <Mail size={14} />
                    {department.contactEmail}
                  </ContactItem>
                  <ContactItem>
                    <Phone size={14} />
                    {department.phone}
                  </ContactItem>
                </ContactInfo>
              </DepartmentCard>
            );
          })}
        </DepartmentGrid>
      )}

      {/* Reports Section */}
      <ReportsSection>
        <SectionTitle>
          <Badge size={20} />
          Assigned Reports ({filteredReports.length})
        </SectionTitle>
        
        <AnimatePresence>
          {filteredReports.map(report => {
            const assignment = assignments.find(a => a.reportId === report.id);
            const department = DEPARTMENTS.find(d => d.id === assignment?.departmentId);
            
            return (
              <ReportCard
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <ReportHeader>
                  <ReportTitle>{report.title}</ReportTitle>
                  {assignment && (
                    <StatusBadge status={assignment.status}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status.replace('_', ' ')}
                    </StatusBadge>
                  )}
                </ReportHeader>
                
                <ReportMeta>
                  <MetaItem>
                    <Calendar size={14} />
                    {new Date(report.created_at).toLocaleDateString()}
                  </MetaItem>
                  <MetaItem>
                    <MapPin size={14} />
                    {report.address || 'Location not specified'}
                  </MetaItem>
                  {department && (
                    <MetaItem>
                      <Building2 size={14} />
                      {department.name}
                    </MetaItem>
                  )}
                </ReportMeta>
                
                <ReportDescription>
                  {report.description}
                </ReportDescription>
                
                {assignment && (assignment.status !== 'resolved' && assignment.status !== 'rejected') && (
                  <ActionButtons>
                    {assignment.status === 'pending' && (
                      <ActionButton
                        variant="primary"
                        onClick={() => handleStatusUpdate(report.id, 'acknowledged')}
                      >
                        <Eye size={16} />
                        Acknowledge
                      </ActionButton>
                    )}
                    
                    {(assignment.status === 'acknowledged' || assignment.status === 'pending') && (
                      <ActionButton
                        variant="primary"
                        onClick={() => handleStatusUpdate(report.id, 'in_progress')}
                      >
                        <Edit3 size={16} />
                        Start Work
                      </ActionButton>
                    )}
                    
                    {assignment.status === 'in_progress' && (
                      <ActionButton
                        variant="success"
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                      >
                        <CheckCircle size={16} />
                        Mark Resolved
                      </ActionButton>
                    )}
                    
                    <ActionButton
                      variant="danger"
                      onClick={() => handleStatusUpdate(report.id, 'rejected')}
                    >
                      <AlertTriangle size={16} />
                      Reject
                    </ActionButton>
                  </ActionButtons>
                )}
              </ReportCard>
            );
          })}
        </AnimatePresence>
        
        {filteredReports.length === 0 && (
          <ReportCard
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              No reports found for the selected criteria.
            </div>
          </ReportCard>
        )}
      </ReportsSection>
    </Container>
  );
};

export default DepartmentManagement;
