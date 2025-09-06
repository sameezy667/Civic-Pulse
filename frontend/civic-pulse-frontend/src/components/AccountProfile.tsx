import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  LogOut, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  ArrowUp
} from 'lucide-react';
import { getCurrentUser } from '../utils/supabase';

// Types
interface AccountProfileProps {
  userRole?: 'citizen' | 'admin' | null;
  onLogout?: () => void;
}

interface UserIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  upvotes: number;
  comments: number;
}

// Mock user data
const mockUser = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  initials: 'SJ',
  joinDate: 'March 2024',
  issuesSubmitted: 8,
  totalUpvotes: 142
};

// Mock user issues
const mockUserIssues: UserIssue[] = [
  {
    id: '1',
    title: 'Massive pothole on Main St damaging cars',
    description: 'Several vehicles have reported damage near the intersection by 5th Ave.',
    category: 'Pothole',
    status: 'in-progress',
    createdAt: '2 days ago',
    upvotes: 32,
    comments: 4
  },
  {
    id: '2',
    title: 'Broken streetlight creating safety concern',
    description: 'The streetlight at Park Avenue has been out for over a week.',
    category: 'Streetlight',
    status: 'resolved',
    createdAt: '1 week ago',
    upvotes: 18,
    comments: 7
  },
  {
    id: '3',
    title: 'Sidewalk crack near school zone',
    description: 'Large crack in sidewalk poses tripping hazard for students.',
    category: 'Sidewalk',
    status: 'pending',
    createdAt: '3 days ago',
    upvotes: 25,
    comments: 2
  }
];

const Account: React.FC<AccountProfileProps> = ({ userRole = 'citizen', onLogout }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Use current user data or fallback to mock data
  const userData = currentUser ? {
    name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email || 'user@example.com',
    initials: (currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'U')
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    joinDate: 'March 2024',
    issuesSubmitted: 8,
    totalUpvotes: 142
  } : {
    name: 'Demo User',
    email: 'demo@example.com',
    initials: 'DU',
    joinDate: 'March 2024',
    issuesSubmitted: 8,
    totalUpvotes: 142
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>My Account</Title>
          <Subtitle>Loading your profile...</Subtitle>
        </Header>
      </Container>
    );
  }
  const handleSignOut = () => {
    // Handle sign out logic
    if (onLogout) {
      onLogout();
    }
    console.log('User signed out');
  };

  const getStatusIcon = (status: UserIssue['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: UserIssue['status']) => {
    switch (status) {
      case 'resolved':
        return '#10B981';
      case 'in-progress':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <Container>
      <Header>
        <Title>My Account</Title>
        <Subtitle>Manage your profile and track your civic contributions</Subtitle>
      </Header>

      <ProfileSection
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProfileHeader>
          <UserAvatar>{userData.initials}</UserAvatar>
          <UserInfo>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <UserName>{userData.name}</UserName>
              <div style={{
                background: userRole === 'admin' ? 'rgba(255, 72, 0, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                color: userRole === 'admin' ? '#FF4800' : '#4CAF50',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: `1px solid ${userRole === 'admin' ? 'rgba(255, 72, 0, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`
              }}>
                {userRole === 'admin' ? '🛡️ Admin' : '👤 Citizen'}
              </div>
            </div>
            <UserEmail>{userData.email}</UserEmail>
            <UserStats>
              Member since {userData.joinDate} • {userData.issuesSubmitted} issues submitted • {userData.totalUpvotes} total upvotes
            </UserStats>
          </UserInfo>
          <ActionButtons>
            <EditButton>
              <Edit size={16} />
              Edit Profile
            </EditButton>
            <SignOutButton onClick={handleSignOut}>
              <LogOut size={16} />
              Sign Out
            </SignOutButton>
          </ActionButtons>
        </ProfileHeader>
      </ProfileSection>

      <IssuesSection>
        <SectionTitle>My Submitted Issues</SectionTitle>
        <IssuesList>
          {mockUserIssues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <IssueHeader>
                <IssueTitle>{issue.title}</IssueTitle>
                <StatusBadge status={issue.status}>
                  {getStatusIcon(issue.status)}
                  <span>{issue.status.replace('-', ' ')}</span>
                </StatusBadge>
              </IssueHeader>
              
              <IssueDescription>{issue.description}</IssueDescription>
              
              <IssueFooter>
                <IssueMeta>
                  <CategoryTag category={issue.category}>{issue.category}</CategoryTag>
                  <span>•</span>
                  <span>{issue.createdAt}</span>
                </IssueMeta>
                <IssueStats>
                  <StatItem>
                    <ArrowUp size={14} />
                    <span>{issue.upvotes}</span>
                  </StatItem>
                  <StatItem>
                    <MessageSquare size={14} />
                    <span>{issue.comments}</span>
                  </StatItem>
                </IssueStats>
              </IssueFooter>
            </IssueCard>
          ))}
        </IssuesList>
      </IssuesSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #FF4800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
`;

const ProfileSection = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8C42);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2rem;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #181818;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const UserStats = styled.p`
  color: #9CA3AF;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #E5E7EB;
    border-color: #9CA3AF;
  }
`;

const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #FEE2E2;
    border-color: #FCA5A5;
  }
`;

const IssuesSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #181818;
  margin-bottom: 1.5rem;
`;

const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const IssueCard = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #FF6B35;
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.1);
  }
`;

const IssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const IssueTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #181818;
  line-height: 1.4;
  flex: 1;
`;

const StatusBadge = styled.div<{ status: UserIssue['status'] }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'resolved': return '#D1FAE5';
      case 'in-progress': return '#FEF3C7';
      case 'pending': return '#F3F4F6';
      default: return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'resolved': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'pending': return '#6B7280';
      default: return '#6B7280';
    }
  }};
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }

  span {
    text-transform: capitalize;
  }
`;

const IssueDescription = styled.p`
  color: #4B5563;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const IssueFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #F3F4F6;
`;

const IssueMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const CategoryTag = styled.span<{ category: string }>`
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.category) {
      case 'Pothole': return '#FEF3C7';
      case 'Streetlight': return '#DBEAFE';
      case 'Sidewalk': return '#FCE7F3';
      default: return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch (props.category) {
      case 'Pothole': return '#92400E';
      case 'Streetlight': return '#1E40AF';
      case 'Sidewalk': return '#BE185D';
      default: return '#374151';
    }
  }};
`;

const IssueStats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
`;

export default Account;
