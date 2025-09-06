import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Trophy, 
  MapPin, 
  Clock, 
  TrendingUp,
  Filter,
  Plus,
  MessageCircle,
  Camera,
  CheckCircle,
  AlertCircle,
  Award,
  Tag
} from 'lucide-react';
import NewIssueModal from './NewIssueModal';
import { useToasts } from '../utils/toast';

// Types
interface NewIssueData {
  title: string;
  description: string;
  location: string;
  image?: File;
}

interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  location: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  status: 'pending' | 'acknowledged' | 'resolved';
  isAwarded: boolean;
  timestamp: Date;
  image?: string;
  comments: Comment[];
  category: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  upvotes: number;
}

// Main container with black theme
const CommunityContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 67, 54, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(244, 67, 54, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(0, 150, 255, 0.06) 0%, transparent 60%),
    linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #1a1a1a 60%, #000000 100%);
`;

// Header section
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 67, 54, 0.2);
  border-radius: 20px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff4336 0%, #f44336 50%, #0096ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 67, 54, 0.5);
  margin: 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
`;

// Controls section
const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 67, 54, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 67, 54, 0.15), rgba(255, 67, 54, 0.08));
    border-color: rgba(255, 67, 54, 0.6);
    transform: translateY(-2px);
  }
`;

const NewIssueButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff4336, #f44336);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 0 20px rgba(255, 67, 54, 0.4);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ff6659, #f66659);
    transform: translateY(-2px);
    box-shadow: 0 5px 25px rgba(255, 67, 54, 0.6);
  }
`;

// Filter tabs
const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #ff4336, #f44336)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))'
  };
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.active ? 'rgba(255, 67, 54, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 0 15px rgba(255, 67, 54, 0.3)' : 'none'};

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #ff6659, #f66659)'
      : 'linear-gradient(135deg, rgba(255, 67, 54, 0.15), rgba(255, 67, 54, 0.08))'
    };
    border-color: rgba(255, 67, 54, 0.6);
  }
`;

// Issues list
const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Individual issue card - Reddit-like style
const IssueCard = styled(motion.div)<{ status: string; isAwarded: boolean }>`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(20px);
  border: 1px solid ${props => 
    props.status === 'resolved' ? 'rgba(76, 175, 80, 0.5)' :
    props.status === 'acknowledged' ? 'rgba(255, 193, 7, 0.5)' :
    props.isAwarded ? 'rgba(255, 152, 0, 0.6)' :
    'rgba(255, 67, 54, 0.3)'
  };
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 1rem;
  
  &:hover {
    transform: translateY(-5px);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
    border-color: ${props => 
      props.status === 'resolved' ? 'rgba(76, 175, 80, 0.8)' :
      props.status === 'acknowledged' ? 'rgba(255, 193, 7, 0.8)' :
      props.isAwarded ? 'rgba(255, 152, 0, 0.9)' :
      'rgba(255, 67, 54, 0.6)'
    };
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px ${props => 
        props.status === 'resolved' ? 'rgba(76, 175, 80, 0.3)' :
        props.status === 'acknowledged' ? 'rgba(255, 193, 7, 0.3)' :
        props.isAwarded ? 'rgba(255, 152, 0, 0.4)' :
        'rgba(255, 67, 54, 0.3)'
      };
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

// Voting section
const VotingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
`;

const VoteButton = styled(motion.button)<{ voted?: boolean; type?: 'up' | 'down' }>`
  background: ${props => 
    props.voted ? 
      props.type === 'up' ? 'linear-gradient(135deg, #ff4336, #f44336)' : 'linear-gradient(135deg, #666, #555)' 
    : 'transparent'
  };
  border: 2px solid ${props => 
    props.voted ? 
      props.type === 'up' ? '#ff4336' : '#666' 
    : 'rgba(255, 255, 255, 0.3)'
  };
  border-radius: 8px;
  padding: 0.5rem;
  color: ${props => props.voted ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => 
      props.type === 'up' ? 'rgba(255, 67, 54, 0.2)' : 'rgba(100, 100, 100, 0.2)'
    };
    border-color: ${props => 
      props.type === 'up' ? '#ff4336' : '#666'
    };
    transform: scale(1.1);
  }
`;

const VoteCount = styled.div<{ hasVotes: boolean }>`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => props.hasVotes ? '#ff4336' : 'rgba(255, 255, 255, 0.7)'};
  text-shadow: ${props => props.hasVotes ? '0 0 10px rgba(255, 67, 54, 0.5)' : 'none'};
`;

// Content section
const ContentSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const IssueHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const IssueTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const StatusBadge = styled.div<{ status: string; isAwarded: boolean }>`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: ${props => 
    props.status === 'resolved' ? 'linear-gradient(135deg, #4caf50, #45a049)' :
    props.status === 'acknowledged' ? 'linear-gradient(135deg, #ffc107, #ff9800)' :
    props.isAwarded ? 'linear-gradient(135deg, #ff9800, #f57c00)' :
    'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
  };
  color: ${props => 
    props.status === 'resolved' || props.status === 'acknowledged' || props.isAwarded ? 
    '#ffffff' : 'rgba(255, 255, 255, 0.9)'
  };
  box-shadow: ${props => 
    props.status === 'resolved' ? '0 0 15px rgba(76, 175, 80, 0.4)' :
    props.status === 'acknowledged' ? '0 0 15px rgba(255, 193, 7, 0.4)' :
    props.isAwarded ? '0 0 15px rgba(255, 152, 0, 0.4)' :
    'none'
  };
`;

const IssueDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
  font-size: 1rem;
`;

const IssueMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Avatar = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.8rem;
`;

const CommentsSection = styled.div`
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
`;

const CommentButton = styled(motion.button)`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 67, 54, 0.1);
    border-color: rgba(255, 67, 54, 0.4);
    color: #ffffff;
  }
`;

// Stats section
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 67, 54, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff4336, #0096ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CommunityIssues: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('trending');
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [sortBy, setSortBy] = useState<'trending' | 'new' | 'top'>('trending');
  const { addToast } = useToasts();

  // Mock data
  const mockIssues: CommunityIssue[] = [
    {
      id: '1',
      title: 'Massive Pothole on Highway 101 Causing Traffic Delays',
      description: 'There\'s a huge pothole near exit 15 that\'s been getting worse over the past month. Multiple cars have been damaged, and it\'s causing significant traffic backups during rush hour.',
      author: {
        name: 'Sarah Chen',
        initials: 'SC'
      },
      location: 'Highway 101, Exit 15',
      upvotes: 247,
      downvotes: 3,
      userVote: 'up',
      status: 'acknowledged',
      isAwarded: true,
      timestamp: new Date('2024-01-15T10:30:00'),
      category: 'Road Infrastructure',
      comments: [
        {
          id: 'c1',
          author: 'Mike Rodriguez',
          content: 'I damaged my tire here last week. This needs immediate attention!',
          timestamp: new Date('2024-01-15T11:00:00'),
          upvotes: 23
        }
      ]
    },
    {
      id: '2',
      title: 'Broken Street Light Creating Safety Hazard',
      description: 'The street light at the corner of Main St and Oak Ave has been out for two weeks. It\'s very dark at night and poses a safety risk for pedestrians.',
      author: {
        name: 'David Kim',
        initials: 'DK'
      },
      location: 'Main St & Oak Ave',
      upvotes: 89,
      downvotes: 1,
      status: 'pending',
      isAwarded: false,
      timestamp: new Date('2024-01-14T15:45:00'),
      category: 'Public Safety',
      comments: []
    },
    {
      id: '3',
      title: 'Excessive Noise from Construction Site',
      description: 'Construction work starting at 5:30 AM violates city noise ordinances. Residents in the area are losing sleep and productivity.',
      author: {
        name: 'Jennifer Walsh',
        initials: 'JW'
      },
      location: 'Downtown District',
      upvotes: 156,
      downvotes: 12,
      status: 'resolved',
      isAwarded: false,
      timestamp: new Date('2024-01-13T08:20:00'),
      category: 'Noise Pollution',
      comments: []
    }
  ];

  useEffect(() => {
    setIssues(mockIssues);
  }, []);

  const handleVote = (issueId: string, voteType: 'up' | 'down') => {
    setIssues(prevIssues => 
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          const currentVote = issue.userVote;
          let newUpvotes = issue.upvotes;
          let newDownvotes = issue.downvotes;
          let newUserVote: 'up' | 'down' | null = voteType;

          // Remove previous vote
          if (currentVote === 'up') newUpvotes--;
          if (currentVote === 'down') newDownvotes--;

          // Add new vote or toggle off
          if (currentVote === voteType) {
            newUserVote = null; // Toggle off
          } else {
            if (voteType === 'up') newUpvotes++;
            if (voteType === 'down') newDownvotes++;
          }

          return {
            ...issue,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote
          };
        }
        return issue;
      })
    );

    addToast({
      type: 'success',
      title: 'Vote Recorded',
      message: `Your ${voteType}vote has been recorded!`,
    });
  };

  const getAvatarColor = (initials: string) => {
    const colors = ['#ff4336', '#f44336', '#0096ff', '#4caf50', '#ff9800', '#9c27b0'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'trending') return issue.upvotes > 50;
    if (activeTab === 'new') return true;
    if (activeTab === 'resolved') return issue.status === 'resolved';
    if (activeTab === 'awarded') return issue.isAwarded;
    return true;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'trending') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (sortBy === 'new') return b.timestamp.getTime() - a.timestamp.getTime();
    if (sortBy === 'top') return b.upvotes - a.upvotes;
    return 0;
  });

  const stats = [
    { number: '1,247', label: 'Total Issues' },
    { number: '892', label: 'Resolved' },
    { number: '156', label: 'This Week' },
    { number: '98%', label: 'Response Rate' }
  ];

  return (
    <CommunityContainer>
      <Header>
        <div>
          <Title>Community Issues</Title>
          <Subtitle>Report, discuss, and track civic issues in your city</Subtitle>
        </div>
        <Controls>
          <FilterButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={18} />
            Filter
          </FilterButton>
          <NewIssueButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewIssueModal(true)}
          >
            <Plus size={18} />
            New Issue
          </NewIssueButton>
        </Controls>
      </Header>

      {/* Statistics */}
      <StatsContainer>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatCard>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          </motion.div>
        ))}
      </StatsContainer>

      {/* Filter tabs */}
      <FilterTabs>
        {['trending', 'new', 'resolved', 'awarded'].map((tab) => (
          <Tab
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Tab>
        ))}
      </FilterTabs>

      {/* Issues list */}
      <IssuesList>
        <AnimatePresence>
          {sortedIssues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              status={issue.status}
              isAwarded={issue.isAwarded}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Voting section */}
              <VotingSection>
                <VoteButton
                  type="up"
                  voted={issue.userVote === 'up'}
                  onClick={() => handleVote(issue.id, 'up')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronUp size={20} />
                </VoteButton>
                <VoteCount hasVotes={issue.upvotes > 0}>
                  {issue.upvotes - issue.downvotes}
                </VoteCount>
                <VoteButton
                  type="down"
                  voted={issue.userVote === 'down'}
                  onClick={() => handleVote(issue.id, 'down')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronDown size={20} />
                </VoteButton>
              </VotingSection>

              {/* Content section */}
              <ContentSection>
                <IssueHeader>
                  <IssueTitle>{issue.title}</IssueTitle>
                  <StatusBadge status={issue.status} isAwarded={issue.isAwarded}>
                    {issue.isAwarded && <Award size={14} />}
                    {issue.status === 'resolved' && <CheckCircle size={14} />}
                    {issue.status === 'acknowledged' && <AlertCircle size={14} />}
                    {issue.isAwarded ? 'Awarded' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                  </StatusBadge>
                </IssueHeader>

                <IssueDescription>{issue.description}</IssueDescription>

                <IssueMetadata>
                  <Author>
                    <Avatar color={getAvatarColor(issue.author.initials)}>
                      {issue.author.initials}
                    </Avatar>
                    {issue.author.name}
                  </Author>
                  <MetaItem>
                    <MapPin size={16} />
                    {issue.location}
                  </MetaItem>
                  <MetaItem>
                    <Clock size={16} />
                    {issue.timestamp.toLocaleDateString()}
                  </MetaItem>
                  <MetaItem>
                    <Tag size={16} />
                    {issue.category}
                  </MetaItem>
                </IssueMetadata>

                {/* Comments section */}
                <CommentsSection>
                  <CommentButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle size={16} />
                    {issue.comments.length} Comments
                  </CommentButton>
                </CommentsSection>
              </ContentSection>
            </IssueCard>
          ))}
        </AnimatePresence>
      </IssuesList>

      {/* New Issue Modal */}
      <AnimatePresence>
        {showNewIssueModal && (
          <NewIssueModal 
            isOpen={showNewIssueModal}
            onClose={() => setShowNewIssueModal(false)}
            onSubmit={(issue) => {
              console.log('New issue submitted:', issue);
              setShowNewIssueModal(false);
              addToast({
                type: 'success',
                title: 'Issue Reported',
                message: 'Your civic issue has been successfully reported!',
              });
            }}
          />
        )}
      </AnimatePresence>
    </CommunityContainer>
  );
};

export default CommunityIssues;
