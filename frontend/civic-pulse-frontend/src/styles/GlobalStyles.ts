import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    background: 
      radial-gradient(circle at 15% 85%, rgba(255, 67, 54, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 85% 15%, rgba(244, 67, 54, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 45% 45%, rgba(0, 150, 255, 0.06) 0%, transparent 50%),
      linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #1a1a1a 60%, #000000 100%);
    color: #ffffff;
    overflow-x: hidden;
    min-height: 100vh;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0.01em;
  }

  html {
    scroll-behavior: smooth;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  p {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    line-height: 1.6;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #ff4336, #f44336);
    border-radius: 5px;
    transition: all 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #ff6659, #f66659);
    box-shadow: 0 0 10px rgba(255, 67, 54, 0.5);
  }
`;

export const theme = {
  colors: {
    primary: '#ff4336',
    secondary: '#f44336',
    accent: '#0096ff',
    warning: '#ff9800',
    dark: '#000000',
    darkSecondary: '#0a0a0a',
    darkTertiary: '#1a1a1a',
    glass: 'rgba(255, 255, 255, 0.08)',
    glassHover: 'rgba(255, 255, 255, 0.12)',
    neonRed: '#ff4336',
    neonOrange: '#ff6b35',
    neonBlue: '#0096ff',
    neonPurple: '#9c27b0',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ff4336, #f44336)',
    secondary: 'linear-gradient(135deg, #ff6b35, #ff9800)',
    accent: 'linear-gradient(135deg, #0096ff, #2196f3)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
    glow: 'linear-gradient(135deg, rgba(255, 67, 54, 0.3), rgba(244, 67, 54, 0.3))',
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    glow: '0 0 20px rgba(255, 67, 54, 0.5)',
    glowOrange: '0 0 20px rgba(255, 107, 53, 0.5)',
    glowBlue: '0 0 20px rgba(0, 150, 255, 0.5)',
    glowPurple: '0 0 20px rgba(156, 39, 176, 0.5)',
    glowRed: '0 0 20px rgba(255, 67, 54, 0.5)',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '20px',
    xl: '24px',
  },
  backdrop: 'backdrop-filter: blur(10px);',
};

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
`;

export const GlassCard = styled.div<{
  glow?: string;
  hover?: boolean;
}>`
  background: ${({ theme }) => theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  ${({ glow, theme }) => glow && `
    box-shadow: ${theme.shadows.glass}, ${theme.shadows[glow as keyof typeof theme.shadows]};
  `}

  ${({ hover }) => hover && `
    &:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
    }
  `}

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

export const NeonText = styled.h1<{
  color?: string;
  size?: string;
}>`
  font-size: ${({ size }) => size || '3rem'};
  font-weight: 700;
  background: ${({ color, theme }) => 
    color ? `linear-gradient(135deg, ${color}, ${color}88)` : theme.gradients.primary
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
  letter-spacing: 2px;
  margin-bottom: 1rem;
`;

export const SubtitleText = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
`;

export const FloatingCard = styled(GlassCard)<{
  x?: number;
  y?: number;
  delay?: number;
  hover?: boolean;
}>`
  position: absolute;
  padding: 1.5rem;
  cursor: pointer;
  animation: float 3s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || 0}s;

  ${({ x, y }) => x && y && `
    left: ${x}px;
    top: ${y}px;
  `}

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

export const IconContainer = styled.div<{
  color?: string;
  size?: string;
}>`
  width: ${({ size }) => size || '60px'};
  height: ${({ size }) => size || '60px'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: ${({ color, theme }) => 
    color ? `linear-gradient(135deg, ${color}, ${color}88)` : theme.gradients.primary
  };
  box-shadow: ${({ color, theme }) => 
    color === theme.colors.neonOrange ? theme.shadows.glowOrange :
    color === theme.colors.neonPurple ? theme.shadows.glowPurple :
    theme.shadows.glow
  };
`;

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'glass';
  glow?: boolean;
}>`
  padding: 12px 24px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return `
          background: ${theme.gradients.secondary};
          color: white;
          box-shadow: ${theme.shadows.glowOrange};
        `;
      case 'glass':
        return `
          background: ${theme.gradients.glass};
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: white;
        `;
      default:
        return `
          background: ${theme.gradients.primary};
          color: white;
          box-shadow: ${theme.shadows.glow};
        `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
