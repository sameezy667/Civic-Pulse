import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Award,
  Clock,
  MapPin,
  Camera,
  TrendingUp,
  Filter,
  Plus,
  User,
  Heart,
  Share2,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react';
import LocationFilter from './LocationFilter';
import { LocationFilter as LocationFilterType, isWithinFilter } from '../types/departments';

// Enhanced Community Container
const CommunityContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0a0a0f 0%, 
    #1a1a2e 25%, 
    #16213e 50%, 
    #0a0a0f 100%
  );
  padding: 2rem;
  color: white;
  font-family: 'Inter', sans-serif;
  
  /* Tech grid overlay */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(0, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 1;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #00ffff 50%, #ff4500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 300;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.active ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.active ? '#00ffff' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    color: #00ffff;
    background: rgba(0, 255, 255, 0.1);
  }
`;

const PostCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
  &:hover {
    border-color: rgba(0, 255, 255, 0.3);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(0, 255, 255, 0.1);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.color}40, ${props => props.color}20);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${props => props.color};
  border: 2px solid ${props => props.color}40;
`;

const UserDetails = styled.div`
  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #ffffff;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const PostContent = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.4;
  }
  
  p {
    margin: 0 0 1rem 0;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }
`;

const PostLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #00ffff;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const VoteSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VoteButton = styled.button<{ active?: boolean; type: 'up' | 'down' }>`
  background: ${props => props.active ? 
    (props.type === 'up' ? 'rgba(255, 69, 0, 0.2)' : 'rgba(255, 0, 128, 0.2)') : 
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.active ? 
    (props.type === 'up' ? '#ff4500' : '#ff0080') : 
    'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 8px;
  padding: 8px;
  color: ${props => props.active ? 
    (props.type === 'up' ? '#ff4500' : '#ff0080') : 
    'rgba(255, 255, 255, 0.7)'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.type === 'up' ? 'rgba(255, 69, 0, 0.1)' : 'rgba(255, 0, 128, 0.1)'};
    border-color: ${props => props.type === 'up' ? '#ff4500' : '#ff0080'};
    color: ${props => props.type === 'up' ? '#ff4500' : '#ff0080'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const VoteCount = styled.span`
  font-weight: 600;
  color: #ffffff;
  min-width: 30px;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.3);
    color: #00ffff;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusBadge = styled.span<{ status: 'new' | 'investigating' | 'resolved' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'new':
        return `
          background: rgba(255, 69, 0, 0.2);
          color: #ff4500;
          border: 1px solid rgba(255, 69, 0, 0.3);
        `;
      case 'investigating':
        return `
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        `;
      case 'resolved':
        return `
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.3);
        `;
      default:
        return '';
    }
  }}
`;

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    initials: string;
    color: string;
  };
  location: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved';
  userVote?: 'up' | 'down' | null;
}

const CommunityIssues: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'resolved'>('trending');
  const [locationFilter, setLocationFilter] = useState<LocationFilterType | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'Major Pothole Causing Traffic Issues on Highway 101',
      content: 'There\'s a massive pothole near Exit 15 that\'s been growing for weeks. Multiple vehicles have been damaged, and it\'s creating dangerous conditions during rush hour. The city needs to address this immediately.',
      author: {
        name: 'Sarah Chen',
        initials: 'SC',
        color: '#00ffff'
      },
      location: 'Highway 101, Exit 15',
      upvotes: 247,
      downvotes: 12,
      comments: 34,
      timestamp: '2 hours ago',
      status: 'investigating',
      userVote: null
    },
    {
      id: '2',
      title: 'Broken Streetlight Creating Safety Hazard',
      content: 'The streetlight at the intersection of Main St and Oak Ave has been out for over a week. This is a high-traffic pedestrian area, especially at night. Really concerned about safety here.',
      author: {
        name: 'Mike Rodriguez',
        initials: 'MR',
        color: '#ff4500'
      },
      location: 'Main St & Oak Ave',
      upvotes: 156,
      downvotes: 3,
      comments: 18,
      timestamp: '4 hours ago',
      status: 'new',
      userVote: 'up'
    },
    {
      id: '3',
      title: 'Illegal Parking Blocking Bus Stop',
      content: 'Cars are consistently parking in the bus stop zone on Pine Street. This forces buses to stop in traffic lanes and creates dangerous situations for passengers boarding.',
      author: {
        name: 'Jennifer Walsh',
        initials: 'JW',
        color: '#ff0080'
      },
      location: 'Pine Street Bus Stop',
      upvotes: 89,
      downvotes: 21,
      comments: 12,
      timestamp: '6 hours ago',
      status: 'new',
      userVote: null
    },
    {
      id: '4',
      title: 'Abandoned Vehicle Removal - SUCCESS!',
      content: 'Thanks to everyone who reported this! The abandoned car on Elm Street has finally been removed after 3 weeks. Great work by the community and city response team.',
      author: {
        name: 'David Park',
        initials: 'DP',
        color: '#28a745'
      },
      location: 'Elm Street',
      upvotes: 324,
      downvotes: 2,
      comments: 45,
      timestamp: '1 day ago',
      status: 'resolved',
      userVote: 'up'
    },
    {
      id: '5',
      title: 'Traffic Signal Malfunction During Rush Hour',
      content: 'The traffic light at 5th and Broadway keeps getting stuck on red in all directions. This happened three times this week during morning rush hour, causing major delays.',
      author: {
        name: 'Amanda Foster',
        initials: 'AF',
        color: '#ffc107'
      },
      location: '5th St & Broadway',
      upvotes: 203,
      downvotes: 8,
      comments: 27,
      timestamp: '1 day ago',
      status: 'investigating',
      userVote: null
    }
  ]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.log('Error getting location:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Filter posts based on location and status
  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'trending' ? true : post.status === (activeTab === 'new' ? 'new' : activeTab);
    
    // For demo purposes, we'll assign mock coordinates to posts
    // In a real app, posts would have actual lat/lng coordinates
    const mockCoordinates = {
      '1': { lat: 40.7580, lng: -73.9855 }, // Times Square area
      '2': { lat: 40.7505, lng: -73.9934 }, // Penn Station area
      '3': { lat: 40.7614, lng: -73.9776 }, // Central Park area
      '4': { lat: 40.7282, lng: -74.0776 }, // Brooklyn Bridge area
      '5': { lat: 40.7488, lng: -73.9857 }  // Herald Square area
    };
    
    const postCoords = mockCoordinates[post.id as keyof typeof mockCoordinates];
    const matchesLocation = !locationFilter || !postCoords || isWithinFilter(postCoords, locationFilter);
    
    return matchesTab && matchesLocation;
  });

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentVote = post.userVote;
          let newUpvotes = post.upvotes;
          let newDownvotes = post.downvotes;
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
            ...post,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote
          };
        }
        return post;
      })
    );
  };

  return (
    <CommunityContainer>
      <Header>
        <Title>Community Hub</Title>
        <Subtitle>Report, discuss, and resolve urban issues together</Subtitle>
      </Header>

      <ContentWrapper>
        {/* Location Filter */}
        <LocationFilter
          currentLocation={userLocation}
          activeFilter={locationFilter}
          onFilterChange={setLocationFilter}
          onLocationRequest={getCurrentLocation}
        />

        <TabsContainer>
          <Tab 
            active={activeTab === 'trending'}
            onClick={() => setActiveTab('trending')}
          >
            <TrendingUp style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Trending
          </Tab>
          <Tab 
            active={activeTab === 'new'}
            onClick={() => setActiveTab('new')}
          >
            <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            New Issues
          </Tab>
          <Tab 
            active={activeTab === 'resolved'}
            onClick={() => setActiveTab('resolved')}
          >
            <CheckCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Resolved
          </Tab>
        </TabsContainer>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostHeader>
                  <UserInfo>
                    <Avatar color={post.author.color}>
                      {post.author.initials}
                    </Avatar>
                    <UserDetails>
                      <h4>{post.author.name}</h4>
                      <p>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        {post.timestamp}
                      </p>
                    </UserDetails>
                  </UserInfo>
                  <StatusBadge status={post.status}>
                    {post.status}
                  </StatusBadge>
                </PostHeader>

                <PostContent>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </PostContent>

                <PostLocation>
                  <MapPin />
                  {post.location}
                </PostLocation>

                <PostActions>
                  <VoteSection>
                    <VoteButton
                      type="up"
                      active={post.userVote === 'up'}
                      onClick={() => handleVote(post.id, 'up')}
                    >
                      <ChevronUp />
                    </VoteButton>
                    <VoteCount>{post.upvotes - post.downvotes}</VoteCount>
                    <VoteButton
                      type="down"
                      active={post.userVote === 'down'}
                      onClick={() => handleVote(post.id, 'down')}
                    >
                      <ChevronDown />
                    </VoteButton>
                  </VoteSection>

                  <ActionButtons>
                    <ActionButton>
                      <MessageCircle />
                      {post.comments}
                    </ActionButton>
                    <ActionButton>
                      <Share2 />
                      Share
                    </ActionButton>
                    <ActionButton>
                      <MoreHorizontal />
                    </ActionButton>
                  </ActionButtons>
                </PostActions>
              </PostCard>
            ))}
          </motion.div>
        </AnimatePresence>
      </ContentWrapper>
    </CommunityContainer>
  );
};

export default CommunityIssues;
