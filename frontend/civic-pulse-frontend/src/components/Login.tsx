import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Smartphone } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
}

// Styled Components - Ultra-Modern Dark Theme with Premium Glassmorphism
const Overlay = styled.div`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(21, 21, 21, 0.95);
  backdrop-filter: blur(24px);
  z-index: 9999 !important;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Enhanced subtle noise texture with radial vignette */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"),
      radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
    background-size: 200px 200px, 100% 100%;
    pointer-events: none;
    opacity: 0.6;
  }
`;

const LoginCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 72, 0, 0.35);
  border-radius: 32px;
  padding: 2.8rem;
  width: 100%;
  max-width: 440px;
  position: relative;
  backdrop-filter: blur(48px);
  
  /* Enhanced shadow system with larger radius and orange glow */
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 15px 50px rgba(255, 72, 0, 0.18),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(255, 72, 0, 0.12);
  
  /* Enhanced animated border gradient */
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(45deg, 
      rgba(255, 72, 0, 0.8) 0%, 
      rgba(255, 102, 0, 0.4) 25%, 
      rgba(255, 72, 0, 0.15) 50%, 
      rgba(255, 102, 0, 0.4) 75%, 
      rgba(255, 72, 0, 0.8) 100%
    );
    border-radius: 32px;
    z-index: -1;
    animation: borderGlow 4s ease-in-out infinite alternate;
  }
  
  @keyframes borderGlow {
    0% { opacity: 0.7; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.002); }
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.4);
  border-radius: 12px;
  color: #cccccc;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 72, 0, 0.2);
    border-color: rgba(255, 72, 0, 0.6);
    color: #FF4800;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 72, 0, 0.3);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 1rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #FF4800 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.035em;
  line-height: 1.15;
  
  /* Enhanced text shadow with orange glow */
  text-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(255, 72, 0, 0.15),
    0 8px 32px rgba(255, 72, 0, 0.1);
`;

const Subtitle = styled.p`
  color: #a8a8a8;
  font-size: 0.875rem;
  line-height: 1.6;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.3);
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => 
    props.isActive 
      ? 'linear-gradient(135deg, rgba(255, 72, 0, 0.3), rgba(255, 102, 0, 0.2))' 
      : 'transparent'
  };
  color: ${props => props.isActive ? '#FF4800' : '#cccccc'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  ${props => props.isActive && `
    box-shadow: 
      0 2px 8px rgba(255, 72, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}
  
  &:hover {
    color: ${props => props.isActive ? '#FF4800' : '#ffffff'};
    background: ${props => 
      props.isActive 
        ? 'linear-gradient(135deg, rgba(255, 72, 0, 0.4), rgba(255, 102, 0, 0.3))' 
        : 'rgba(40, 40, 40, 0.6)'
    };
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  color: #cccccc;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.4);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:focus {
    outline: none;
    border-color: rgba(255, 72, 0, 0.6);
    background: rgba(30, 30, 30, 0.9);
    box-shadow: 
      0 0 0 3px rgba(255, 72, 0, 0.1),
      0 4px 12px rgba(255, 72, 0, 0.2);
  }
  
  &::placeholder {
    color: #999999;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #999999;
  z-index: 1;
  transition: color 0.2s ease;
  
  ${Input}:focus + & {
    color: #FF4800;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #999999;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: #FF4800;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #FF4800 0%, #ff6600 100%);
  border: none;
  border-radius: 12px;
  color: white;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  /* Enhanced shadow with orange glow */
  box-shadow: 
    0 4px 16px rgba(255, 72, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(255, 72, 0, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(80, 80, 80, 0.6), transparent);
`;

const DividerText = styled.span`
  color: #999999;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const SocialButton = styled.button`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.4);
  border-radius: 12px;
  color: #cccccc;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(60, 60, 60, 0.9);
    border-color: rgba(255, 72, 0, 0.4);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 72, 0, 0.2);
  }
`;

const ForgotPassword = styled.button`
  background: none;
  border: none;
  color: #FF4800;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  align-self: flex-end;
  margin-top: -0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ff6600;
    text-decoration: underline;
    text-shadow: 0 0 8px rgba(255, 72, 0, 0.5);
  }
`;

const Login: React.FC<LoginProps> = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login form submitted with:', { email: formData.email, password: formData.password });
    
    if (isLogin) {
      // Handle login
      console.log('Calling onLogin with:', formData.email, formData.password);
      onLogin(formData.email, formData.password);
    } else {
      // Handle signup - you can expand this later
      console.log('Signup form submitted:', formData);
      // For now, just call onLogin after signup
      onLogin(formData.email, formData.password);
    }
  };

  return (
    <Overlay
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <LoginCard
        as={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <BackButton onClick={onClose}>
          <ArrowLeft size={20} />
        </BackButton>

        <Header>
          <Title>{isLogin ? 'Welcome Back' : 'Join Civic Pulse'}</Title>
          <Subtitle>
            {isLogin 
              ? 'Sign in to continue making your community better' 
              : 'Create your account to start reporting issues'
            }
          </Subtitle>
        </Header>

        <TabContainer>
          <Tab 
            isActive={isLogin} 
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Sign In
          </Tab>
          <Tab 
            isActive={!isLogin} 
            onClick={() => setIsLogin(false)}
            type="button"
          >
            Sign Up
          </Tab>
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputGroup>
                  <InputLabel>First Name</InputLabel>
                  <InputContainer>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <InputIcon>
                      <User size={16} />
                    </InputIcon>
                  </InputContainer>
                </InputGroup>
                
                <InputGroup>
                  <InputLabel>Last Name</InputLabel>
                  <InputContainer>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    <InputIcon>
                      <User size={16} />
                    </InputIcon>
                  </InputContainer>
                </InputGroup>
              </div>

              <InputGroup>
                <InputLabel>Phone Number</InputLabel>
                <InputContainer>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <InputIcon>
                    <Smartphone size={16} />
                  </InputIcon>
                </InputContainer>
              </InputGroup>
            </>
          )}

          <InputGroup>
            <InputLabel>Email Address</InputLabel>
            <InputContainer>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <InputIcon>
                <Mail size={16} />
              </InputIcon>
            </InputContainer>
            {isLogin && (
              <div style={{
                fontSize: '0.75rem',
                color: '#888',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'rgba(255, 72, 0, 0.05)',
                border: '1px solid rgba(255, 72, 0, 0.1)',
                borderRadius: '6px'
              }}>
                💡 <strong>Admin Access:</strong> Use email containing "admin" or "admin@city.gov" for admin privileges
              </div>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel>Password</InputLabel>
            <InputContainer>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <InputIcon>
                <Lock size={16} />
              </InputIcon>
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </InputContainer>
          </InputGroup>

          {!isLogin && (
            <InputGroup>
              <InputLabel>Confirm Password</InputLabel>
              <InputContainer>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <InputIcon>
                  <Lock size={16} />
                </InputIcon>
              </InputContainer>
            </InputGroup>
          )}

          {isLogin && (
            <ForgotPassword type="button">
              Forgot your password?
            </ForgotPassword>
          )}

          <SubmitButton type="submit">
            {isLogin ? 'Sign In' : 'Create Account'}
          </SubmitButton>
        </Form>

        <DividerContainer>
          <DividerLine />
          <DividerText>Or continue with</DividerText>
          <DividerLine />
        </DividerContainer>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <SocialButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </SocialButton>
          
          <SocialButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </SocialButton>
        </div>
      </LoginCard>
    </Overlay>
  );
};

export default Login;
