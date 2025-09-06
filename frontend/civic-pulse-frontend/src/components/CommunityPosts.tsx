import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageCircle, MapPin, Clock, Award, Trophy, Star } from 'lucide-react';

// Types
interface CommunityPost {
  id: string;
  author: {
    name: string;
    initials: string;
    avatar?: string;
  };
  timestamp: string;
  title: string;
  description: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  location?: string;
  isAwarded?: boolean;
  isMostUpvoted?: boolean;
  userVote?: 'up' | 'down' | null;
}

// Enhanced mock data with voting states
const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Johnson',
      initials: 'SJ'
    },
    timestamp: '2h',
    title: 'Massive pothole on Main St damaging cars',
    description: 'Several vehicles have reported damage near the intersection by 5th Ave. The pothole has been growing larger after recent rains and is now causing significant damage to vehicles.',
    category: 'Road Maintenance',
    upvotes: 47,
    downvotes: 3,
    comments: 12,
    location: 'Main St & 5th Ave',
    isAwarded: true,
    isMostUpvoted: true,
    userVote: 'up'
  },
  {
    id: '2',
    author: {
      name: 'Michael Chen',
      initials: 'MC'
    },
    timestamp: '4h',
    title: 'Broken streetlight creating safety concern',
    description: 'The streetlight at Park Avenue has been out for over a week, making the crosswalk dangerous at night. Multiple residents have expressed safety concerns.',
    category: 'Public Safety',
    upvotes: 23,
    downvotes: 1,
    comments: 7,
    location: 'Park Avenue',
    userVote: null
  },
  {
    id: '3',
    author: {
      name: 'Emily Rodriguez',
      initials: 'ER'
    },
    timestamp: '6h',
    title: 'Graffiti cleanup needed in downtown area',
    description: 'Multiple buildings on Commerce Street have been tagged with graffiti over the weekend. The area needs immediate attention to maintain our downtown\'s appearance.',
    category: 'Vandalism',
    upvotes: 15,
    downvotes: 2,
    comments: 8,
    location: 'Commerce Street',
    userVote: 'down'
  }
];

// Styled Components - Ultra-Modern Dark Theme with Premium Enhancements
const Container = styled.div`
  min-height: 100vh;
  background: #151515;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2rem;
  
  /* Enhanced subtle noise texture with radial vignette */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"),
      radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%),
      radial-gradient(circle at 25% 15%, rgba(255, 72, 0, 0.05) 0%, transparent 60%);
    background-size: 200px 200px, 100% 100%, 800px 800px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #FF4800 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.045em;
  line-height: 1.05;
  
  /* Enhanced text shadow with orange glow */
  text-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(255, 72, 0, 0.15),
    0 8px 32px rgba(255, 72, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: -0.035em;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #a8a8a8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
  letter-spacing: -0.015em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 90%;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const PostsList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
`;

const PostCard = styled.div`
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 72, 0, 0.25);
  border-radius: 24px;
  padding: 0;
  display: flex;
  gap: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(24px);
  position: relative;
  
  /* Enhanced shadow system with larger radius and orange glow */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 12px 48px rgba(255, 72, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  
  &:hover {
    transform: translateY(-6px);
    border-color: rgba(255, 72, 0, 0.6);
    
    /* Premium hover glow with smooth orange shadow */
    box-shadow: 
      0 25px 80px rgba(255, 72, 0, 0.3),
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 8px 24px rgba(255, 72, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 20px;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  @media (max-width: 480px) {
    border-radius: 16px;
    margin: 0 0.5rem;
  }
`;

const VotingSection = styled.div`
  background: rgba(20, 20, 20, 0.9);
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-right: 1px solid rgba(255, 72, 0, 0.2);
  min-width: 60px;
  
  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    padding: 0.75rem 1rem;
    border-right: none;
    border-bottom: 1px solid rgba(255, 72, 0, 0.2);
    min-width: unset;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    gap: 0.75rem;
  }
`;

const VoteButton = styled.button<{ isActive?: boolean; voteType?: 'up' | 'down' }>`
  background: ${props => 
    props.isActive 
      ? props.voteType === 'up' 
        ? 'rgba(255, 72, 0, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)'
      : 'rgba(40, 40, 40, 0.6)'
  };
  border: 1px solid ${props => 
    props.isActive 
      ? props.voteType === 'up' 
        ? 'rgba(255, 72, 0, 0.6)' 
        : 'rgba(239, 68, 68, 0.6)'
      : 'rgba(80, 80, 80, 0.6)'
  };
  border-radius: 8px;
  color: ${props => 
    props.isActive 
      ? props.voteType === 'up' 
        ? '#FF4800' 
        : '#ef4444'
      : '#cccccc'
  };
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => 
      props.voteType === 'up' 
        ? 'rgba(255, 72, 0, 0.2)' 
        : 'rgba(239, 68, 68, 0.2)'
    };
    border-color: ${props => 
      props.voteType === 'up' 
        ? 'rgba(255, 72, 0, 0.4)' 
        : 'rgba(239, 68, 68, 0.4)'
    };
    color: ${props => 
      props.voteType === 'up' 
        ? '#FF4800' 
        : '#ef4444'
    };
    transform: scale(1.05);
    box-shadow: 0 2px 8px ${props => 
      props.voteType === 'up' 
        ? 'rgba(255, 72, 0, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem;
    min-width: 40px;
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem;
    min-width: 36px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const VoteScore = styled.div<{ score: number }>`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => 
    props.score > 0 
      ? '#FF4800' 
      : props.score < 0 
        ? '#ef4444' 
        : '#cccccc'
  };
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const PostContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF4800, #ff6600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
  box-shadow: 
    0 0 20px rgba(255, 72, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #ffffff;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #999999;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const PostTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    flex-wrap: wrap;
    line-height: 1.3;
  }
`;

const PostDescription = styled.p`
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button`
  background: rgba(40, 40, 40, 0.6);
  border: 1px solid rgba(80, 80, 80, 0.4);
  border-radius: 8px;
  color: #cccccc;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(60, 60, 60, 0.8);
    border-color: rgba(255, 72, 0, 0.4);
    color: #FF4800;
    box-shadow: 0 2px 8px rgba(255, 72, 0, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    
    span {
      display: none;
    }
  }
`;

const CategoryTag = styled.div<{ category: string }>`
  background: ${props => {
    switch (props.category.toLowerCase()) {
      case 'road maintenance': return 'rgba(255, 72, 0, 0.2)';
      case 'public safety': return 'rgba(239, 68, 68, 0.2)';
      case 'vandalism': return 'rgba(168, 85, 247, 0.2)';
      default: return 'rgba(80, 80, 80, 0.6)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.category.toLowerCase()) {
      case 'road maintenance': return 'rgba(255, 72, 0, 0.4)';
      case 'public safety': return 'rgba(239, 68, 68, 0.4)';
      case 'vandalism': return 'rgba(168, 85, 247, 0.4)';
      default: return 'rgba(120, 120, 120, 0.4)';
    }
  }};
  color: ${props => {
    switch (props.category.toLowerCase()) {
      case 'road maintenance': return '#FF4800';
      case 'public safety': return '#ef4444';
      case 'vandalism': return '#a855f7';
      default: return '#cccccc';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const AwardBadge = styled.div`
  color: #fbbf24;
  
  svg {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
  }
`;

const CommunityPosts: React.FC = () => {
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>(
    mockPosts.reduce((acc, post) => ({ ...acc, [post.id]: post.userVote || null }), {})
  );

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setVotes(prev => ({
      ...prev,
      [postId]: prev[postId] === voteType ? null : voteType
    }));
  };

  const getNetScore = (post: CommunityPost) => {
    const userVote = votes[post.id];
    let upvotes = post.upvotes;
    let downvotes = post.downvotes;
    
    // Adjust scores based on user vote vs original vote
    if (post.userVote !== userVote) {
      if (post.userVote === 'up') upvotes--;
      if (post.userVote === 'down') downvotes--;
      if (userVote === 'up') upvotes++;
      if (userVote === 'down') downvotes++;
    }
    
    return upvotes - downvotes;
  };

  return (
    <Container>
      <Header>
        <Title>Community Issues</Title>
        <Subtitle>Help improve your neighborhood by reporting and discussing local issues</Subtitle>
      </Header>
      
      <PostsList>
        {mockPosts.map((post, index) => (
          <PostCard
            key={post.id}
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <VotingSection>
              <VoteButton
                voteType="up"
                isActive={votes[post.id] === 'up'}
                onClick={() => handleVote(post.id, 'up')}
              >
                <ArrowUp size={16} />
              </VoteButton>
              
              <VoteScore score={getNetScore(post)}>
                {getNetScore(post)}
              </VoteScore>
              
              <VoteButton
                voteType="down"
                isActive={votes[post.id] === 'down'}
                onClick={() => handleVote(post.id, 'down')}
              >
                <ArrowDown size={16} />
              </VoteButton>
            </VotingSection>
            
            <PostContent>
              <PostHeader>
                <AuthorInfo>
                  <Avatar>{post.author.initials}</Avatar>
                  <AuthorDetails>
                    <AuthorName>{post.author.name}</AuthorName>
                    <PostMeta>
                      <Clock size={12} />
                      <span>{post.timestamp}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <MapPin size={12} />
                          <span>{post.location}</span>
                        </>
                      )}
                    </PostMeta>
                  </AuthorDetails>
                </AuthorInfo>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CategoryTag category={post.category}>
                    {post.category}
                  </CategoryTag>
                  {post.isAwarded && (
                    <AwardBadge>
                      <Award size={16} />
                    </AwardBadge>
                  )}
                  {post.isMostUpvoted && (
                    <AwardBadge>
                      <Trophy size={16} />
                    </AwardBadge>
                  )}
                </div>
              </PostHeader>
              
              <PostTitle>
                {post.title}
                {post.isMostUpvoted && (
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                )}
              </PostTitle>
              <PostDescription>{post.description}</PostDescription>
              
              <PostActions>
                <ActionButton>
                  <MessageCircle size={16} />
                  <span>{post.comments} comments</span>
                </ActionButton>
              </PostActions>
            </PostContent>
          </PostCard>
        ))}
      </PostsList>
    </Container>
  );
};

export default CommunityPosts;
