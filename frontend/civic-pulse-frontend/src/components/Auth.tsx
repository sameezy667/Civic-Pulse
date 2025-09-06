import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Shield, User } from 'lucide-react';

interface AuthProps {
  mode?: 'client' | 'admin';
  onSuccess?: () => void;
  onBack?: () => void;
}

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const AuthCard = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(255, 72, 0, 0.2);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(255, 72, 0, 0.1);
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 350px;
    padding: 2rem;
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 1rem);
    padding: 1.5rem;
    border-radius: 12px;
    margin: 0.5rem;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #ffffff;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.5rem;
  }
`;

const ModeIndicator = styled.div<{ isAdmin: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 3rem 0 1rem 0;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    margin: 2.5rem 0 1rem 0;
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  ${props => props.isAdmin ? `
    background: rgba(147, 51, 234, 0.1);
    border: 1px solid rgba(147, 51, 234, 0.3);
    color: #9333ea;
  ` : `
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  `}
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #cccccc;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Input = styled.input`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(80, 80, 80, 0.6);
  border-radius: 8px;
  padding: 0.875rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF4800;
    box-shadow: 0 0 0 3px rgba(255, 72, 0, 0.1);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #FF4800 0%, #FF8A00 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 72, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #cccccc;
  font-size: 0.875rem;
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #FF4800;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.875rem;
  
  &:hover {
    color: #FF8A00;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.875rem;
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const AdminNotice = styled.div`
  background: rgba(147, 51, 234, 0.1);
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #9333ea;
  
  div {
    flex: 1;
  }
  
  strong {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const AdminFooter = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  p {
    color: #888888;
    font-size: 0.8rem;
    margin: 0;
  }
`;

const Auth: React.FC<AuthProps> = ({ mode = 'client', onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  // Auto-fill admin email if in admin mode
  useEffect(() => {
    if (mode === 'admin' && isLogin) {
      setEmail('admin@civicpulse.com');
    } else {
      setEmail('');
    }
  }, [mode, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Allow admin signup - backend handles the role assignment
        const userRole = mode === 'admin' ? 'admin' : 'client';
        await signUp(email, password, name, userRole);
        alert('Check your email to confirm your account!');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        {onBack && (
          <BackButton onClick={onBack} type="button">
            <ArrowLeft size={16} />
          </BackButton>
        )}
        
        <ModeIndicator isAdmin={mode === 'admin'}>
          {mode === 'admin' ? (
            <>
              <Shield size={18} />
              Administrator Access
            </>
          ) : (
            <>
              <User size={18} />
              Citizen Portal
            </>
          )}
        </ModeIndicator>
        
        <Title>
          {isLogin ? 'Welcome Back' : 'Join the Platform'}
        </Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {mode === 'admin' && (
          <AdminNotice>
            <Shield size={16} />
            <div>
              <strong>{isLogin ? 'Administrator Login' : 'Create Administrator Account'}</strong>
              <p>
                {isLogin 
                  ? 'Please use your administrator credentials to access the admin dashboard.'
                  : 'Create an administrator account with elevated privileges and dashboard access.'
                }
              </p>
            </div>
          </AdminNotice>
        )}
        
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <InputGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder={mode === 'admin' ? 'Enter administrator name' : 'Enter your full name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </InputGroup>
          )}
          
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder={mode === 'admin' && isLogin ? 'admin@civicpulse.com' : 'Enter your email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </SubmitButton>
        </Form>
        
        {mode === 'client' && (
          <ToggleText>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <ToggleLink
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </ToggleLink>
          </ToggleText>
        )}
        
        {mode === 'admin' && (
          <>
            <ToggleText>
              {isLogin ? "Need to create an admin account? " : "Already have an admin account? "}
              <ToggleLink
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? 'Create Admin Account' : 'Sign in'}
              </ToggleLink>
            </ToggleText>
            <AdminFooter>
              <p>Administrator accounts have elevated privileges and access to the admin dashboard.</p>
            </AdminFooter>
          </>
        )}
      </AuthCard>
    </AuthContainer>
  );
};

export default Auth;
