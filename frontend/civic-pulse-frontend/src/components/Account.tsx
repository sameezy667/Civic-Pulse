import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  LogIn,
  Shield,
  Award,
  Settings,
  Bell,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';

// Account Container with enhanced styling and responsive design
const AccountContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0a0a0f 0%, 
    #1a1a2e 25%, 
    #16213e 50%, 
    #0a0a0f 100%
  );
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  
  /* Responsive padding for mobile */
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    padding-top: 1rem;
  }
  
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
    
    /* Smaller grid on mobile */
    @media (max-width: 768px) {
      background-size: 20px 20px;
    }
  }
`;

const AccountCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 2;
  
  /* Responsive design for mobile */
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 20px;
    max-width: 100%;
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 16px;
    margin: 0;
  }
  
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
  /* Neon glow effect */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      rgba(0, 255, 255, 0.1) 0%, 
      rgba(255, 69, 0, 0.1) 50%, 
      rgba(255, 0, 128, 0.1) 100%
    );
    border-radius: 26px;
    z-index: -1;
    opacity: 0.6;
    filter: blur(8px);
    
    @media (max-width: 768px) {
      border-radius: 22px;
      filter: blur(6px);
    }
    
    @media (max-width: 480px) {
      border-radius: 18px;
      filter: blur(4px);
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #00ffff 50%, #ff4500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin: 0 0 0.25rem 0;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 1rem;
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    border-radius: 8px;
    padding: 3px;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 20px;
  background: ${props => props.active ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#00ffff' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 4px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
  
  &:hover {
    color: #00ffff;
    background: rgba(0, 255, 255, 0.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
    
    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1.25rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.4rem;
  }
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  padding-left: 50px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 14px 18px;
    padding-left: 46px;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    padding-left: 42px;
    border-radius: 8px;
    font-size: 0.95rem;
  }
  
  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  
  @media (max-width: 768px) {
    left: 14px;
  }
  
  @media (max-width: 480px) {
    left: 12px;
  }
  
  svg {
    width: 18px;
    height: 18px;
    
    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  
  @media (max-width: 768px) {
    right: 14px;
  }
  
  @media (max-width: 480px) {
    right: 12px;
    padding: 3px;
  }
  
  &:hover {
    color: #00ffff;
  }
  
  svg {
    width: 18px;
    height: 18px;
    
    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 16px 20px;
  background: linear-gradient(135deg, #00ffff 0%, #ff4500 100%);
  border: none;
  border-radius: 12px;
  color: #000000;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    padding: 14px 18px;
    border-radius: 10px;
    margin-top: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    margin-top: 0.5rem;
  }
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ForgotLink = styled.button`
  background: none;
  border: none;
  color: rgba(0, 255, 255, 0.8);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  
  &:hover {
    color: #00ffff;
    text-decoration: underline;
  }
`;

const ProfileSection = styled.div`
  text-align: center;
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ffff 0%, #ff4500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  font-size: 2rem;
  font-weight: 900;
  color: #000000;
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 1.75rem;
    margin: 0 auto 1.25rem auto;
  }
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    font-size: 1.5rem;
    margin: 0 auto 1rem auto;
  }
`;

const ProfileName = styled.h2`
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin: 0 0 0.4rem 0;
  }
`;

const ProfileEmail = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem 0;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin: 0 0 1.25rem 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    border-radius: 8px;
  }
  
  h3 {
    margin: 0 0 0.25rem 0;
    color: #00ffff;
    font-size: 1.5rem;
    font-weight: 700;
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    @media (max-width: 480px) {
      font-size: 0.75rem;
      letter-spacing: 0.3px;
    }
  }
`;

const MenuButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 14px 18px;
    border-radius: 10px;
    gap: 10px;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    border-radius: 8px;
    gap: 8px;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.3);
    color: #00ffff;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LogoutButton = styled(MenuButton)`
  background: rgba(255, 69, 0, 0.1);
  border-color: rgba(255, 69, 0, 0.3);
  color: #ff4500;
  
  &:hover {
    background: rgba(255, 69, 0, 0.2);
    border-color: #ff4500;
  }
`;

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  reportsSubmitted: number;
  issuesResolved: number;
  communityRank: string;
}

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Mock user data
  const [user] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    avatar: 'AJ',
    reportsSubmitted: 24,
    issuesResolved: 18,
    communityRank: 'Gold Contributor'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/signup logic
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (isLoggedIn) {
    return (
      <AccountContainer>
        <AccountCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileSection>
            <ProfileAvatar>{user.avatar}</ProfileAvatar>
            <ProfileName>{user.name}</ProfileName>
            <ProfileEmail>{user.email}</ProfileEmail>
            
            <StatsGrid>
              <StatCard>
                <h3>{user.reportsSubmitted}</h3>
                <p>Reports Submitted</p>
              </StatCard>
              <StatCard>
                <h3>{user.issuesResolved}</h3>
                <p>Issues Resolved</p>
              </StatCard>
            </StatsGrid>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                color: '#ffc107',
                marginBottom: '0.5rem'
              }}>
                <Award style={{ width: '18px', height: '18px' }} />
                <span style={{ fontWeight: '600' }}>{user.communityRank}</span>
              </div>
            </div>
          </ProfileSection>
          
          <div>
            <MenuButton>
              <User />
              Edit Profile
            </MenuButton>
            <MenuButton>
              <Settings />
              Account Settings
            </MenuButton>
            <MenuButton>
              <Bell />
              Notifications
            </MenuButton>
            <MenuButton>
              <MapPin />
              My Reports
            </MenuButton>
            <MenuButton>
              <Calendar />
              Activity History
            </MenuButton>
            <MenuButton>
              <Star />
              Achievements
            </MenuButton>
            
            <LogoutButton onClick={handleLogout}>
              <LogIn />
              Logout
            </LogoutButton>
          </div>
        </AccountCard>
      </AccountContainer>
    );
  }

  return (
    <AccountContainer>
      <AccountCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <Title>Welcome</Title>
          <Subtitle>Join the Civic Pulse community</Subtitle>
        </Header>

        <TabsContainer>
          <Tab 
            active={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            <LogIn />
            Login
          </Tab>
          <Tab 
            active={activeTab === 'signup'}
            onClick={() => setActiveTab('signup')}
          >
            <UserPlus />
            Sign Up
          </Tab>
        </TabsContainer>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Form onSubmit={handleSubmit}>
              {activeTab === 'signup' && (
                <InputGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <InputWrapper>
                    <InputIcon>
                      <User />
                    </InputIcon>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                </InputGroup>
              )}

              <InputGroup>
                <Label htmlFor="email">Email Address</Label>
                <InputWrapper>
                  <InputIcon>
                    <Mail />
                  </InputIcon>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="password">Password</Label>
                <InputWrapper>
                  <InputIcon>
                    <Lock />
                  </InputIcon>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </PasswordToggle>
                </InputWrapper>
              </InputGroup>

              {activeTab === 'signup' && (
                <InputGroup>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <InputWrapper>
                    <InputIcon>
                      <Shield />
                    </InputIcon>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                </InputGroup>
              )}

              <SubmitButton
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </SubmitButton>

              {activeTab === 'login' && (
                <ForgotLink type="button">
                  Forgot your password?
                </ForgotLink>
              )}
            </Form>
          </motion.div>
        </AnimatePresence>
      </AccountCard>
    </AccountContainer>
  );
};

export default Account;
