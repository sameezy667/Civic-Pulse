import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Shield, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Styled Components - matching existing Civic Pulse design
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: 
    radial-gradient(circle at 15% 85%, rgba(255, 67, 54, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 85% 15%, rgba(244, 67, 54, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 45% 45%, rgba(0, 150, 255, 0.06) 0%, transparent 50%),
    linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #1a1a1a 60%, #000000 100%);
`;

const AuthCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.37),
    0 0 40px rgba(255, 67, 54, 0.1);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #CCCCCC;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ff4336;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ff4336, #ff6b35);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #CCCCCC;
    font-size: 1rem;
  }
`;

const RoleSelection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const RoleButton = styled(motion.button)<{ $selected: boolean }>`
  flex: 1;
  padding: 1.5rem;
  border: 2px solid ${props => props.$selected ? '#ff4336' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  background: ${props => props.$selected 
    ? 'linear-gradient(135deg, rgba(255, 67, 54, 0.2), rgba(255, 107, 53, 0.1))' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$selected ? '#ff4336' : '#CCCCCC'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  
  &:hover {
    border-color: #ff4336;
    background: linear-gradient(135deg, rgba(255, 67, 54, 0.15), rgba(255, 107, 53, 0.05));
    color: #ff4336;
  }
  
  .icon {
    width: 40px;
    height: 40px;
  }
  
  .title {
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .description {
    font-size: 0.8rem;
    opacity: 0.8;
    text-align: center;
    line-height: 1.3;
  }
`;

const AuthModeToggle = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 2px;
`;

const AuthModeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(255, 67, 54, 0.2)' : 'transparent'};
  color: ${props => props.$active ? '#ff4336' : '#CCCCCC'};
  font-weight: ${props => props.$active ? '500' : '400'};
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(255, 67, 54, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #CCCCCC;
  font-weight: 500;
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ff4336;
    box-shadow: 0 0 0 2px rgba(255, 67, 54, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #CCCCCC;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #CCCCCC;
  cursor: pointer;
  padding: 0;
  z-index: 1;
  
  &:hover {
    color: #ff4336;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff4336, #f44336);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ff6659, #f66659);
    box-shadow: 0 0 20px rgba(255, 67, 54, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 67, 54, 0.1);
  border: 1px solid rgba(255, 67, 54, 0.3);
  border-radius: 8px;
  color: #ff6659;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const DemoCredentials = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  
  h4 {
    color: #ff4336;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .creds {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.8rem;
    
    .cred-item {
      display: flex;
      justify-content: space-between;
      
      .label {
        color: #888;
      }
      
      .value {
        color: #FFFFFF;
        font-family: monospace;
      }
    }
  }
`;

// Types
type UserRole = 'citizen' | 'admin';
type AuthMode = 'login' | 'signup';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
}

// Mock authentication function
const authenticateUser = async (email: string, password: string, role: UserRole, mode: AuthMode): Promise<{ success: boolean; message?: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (mode === 'login') {
    // Mock login validation
    if (role === 'admin' && email === 'admin@civicpulse.com' && password === 'admin123') {
      return { success: true };
    }
    if (role === 'citizen' && email.includes('@') && password.length >= 6) {
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  } else {
    // Mock signup validation
    if (email.includes('@') && password.length >= 6) {
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password too short' };
  }
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }

    setLoading(true);
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (authMode === 'signup') {
      if (!formData.name) {
        setError('Name is required for signup');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const result = await authenticateUser(formData.email, formData.password, selectedRole, authMode);
      
      if (result.success) {
        // Store auth info in localStorage for session management
        localStorage.setItem('civic_user_role', selectedRole);
        localStorage.setItem('civic_user_email', formData.email);
        localStorage.setItem('civic_auth_token', 'mock-token-' + Date.now());
        localStorage.setItem('civic_is_logged_in', 'true');
        
        // Role-based redirect logic
        if (selectedRole === 'admin') {
          // Admin users go to admin dashboard
          navigate('/admin');
        } else {
          // Citizens return to main homepage with hero
          navigate('/');
        }
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <AuthContainer>
      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackButton onClick={handleBackToHome}>
          <ArrowLeft size={16} />
          Back to Home
        </BackButton>

        <Logo>
          <h1>Civic Pulse</h1>
          <p>Choose your access level</p>
        </Logo>

        {/* Role Selection - Two clearly separated buttons */}
        {!selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RoleSelection>
              <RoleButton
                $selected={false}
                onClick={() => setSelectedRole('citizen')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="icon" />
                <div className="title">Citizen Login</div>
                <div className="description">Report issues, track progress, engage with your community</div>
              </RoleButton>

              <RoleButton
                $selected={false}
                onClick={() => setSelectedRole('admin')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="icon" />
                <div className="title">Admin Login</div>
                <div className="description">Manage reports, oversee operations, administrative access</div>
              </RoleButton>
            </RoleSelection>
          </motion.div>
        )}

        {/* Login Form - Shows after role selection */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Selected Role Indicator */}
            <RoleSelection>
              <RoleButton
                $selected={true}
                onClick={() => setSelectedRole(null)}
              >
                {selectedRole === 'admin' ? <Shield className="icon" /> : <User className="icon" />}
                <div className="title">{selectedRole === 'admin' ? 'Admin' : 'Citizen'} Access</div>
                <div className="description">Click to change</div>
              </RoleButton>
            </RoleSelection>

            {/* Auth Mode Toggle */}
            <AuthModeToggle>
              <AuthModeButton
                type="button"
                $active={authMode === 'login'}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </AuthModeButton>
              <AuthModeButton
                type="button"
                $active={authMode === 'signup'}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </AuthModeButton>
            </AuthModeToggle>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <ErrorMessage
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle size={16} />
                  {error}
                </ErrorMessage>
              )}
            </AnimatePresence>

            <Form onSubmit={handleSubmit}>
              {authMode === 'signup' && (
                <FormGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <InputWrapper>
                    <InputIcon>
                      <User size={18} />
                    </InputIcon>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="email">Email Address</Label>
                <InputWrapper>
                  <InputIcon>
                    <Mail size={18} />
                  </InputIcon>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={selectedRole === 'admin' ? 'admin@civicpulse.com' : 'your.email@example.com'}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <InputWrapper>
                  <InputIcon>
                    <Lock size={18} />
                  </InputIcon>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={selectedRole === 'admin' ? 'admin123' : 'Enter your password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </PasswordToggle>
                </InputWrapper>
              </FormGroup>

              {authMode === 'signup' && (
                <FormGroup>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <InputWrapper>
                    <InputIcon>
                      <Lock size={18} />
                    </InputIcon>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </PasswordToggle>
                  </InputWrapper>
                </FormGroup>
              )}

              <SubmitButton
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Please wait...' : `${authMode === 'login' ? 'Sign In' : 'Create Account'}`}
                <ArrowRight size={18} />
              </SubmitButton>
            </Form>

            {/* Demo Credentials */}
            <DemoCredentials>
              <h4>Demo Credentials</h4>
              <div className="creds">
                {selectedRole === 'admin' ? (
                  <>
                    <div className="cred-item">
                      <span className="label">Email:</span>
                      <span className="value">admin@civicpulse.com</span>
                    </div>
                    <div className="cred-item">
                      <span className="label">Password:</span>
                      <span className="value">admin123</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cred-item">
                      <span className="label">Email:</span>
                      <span className="value">Any valid email</span>
                    </div>
                    <div className="cred-item">
                      <span className="label">Password:</span>
                      <span className="value">6+ characters</span>
                    </div>
                  </>
                )}
              </div>
            </DemoCredentials>
          </motion.div>
        )}
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthPage;
