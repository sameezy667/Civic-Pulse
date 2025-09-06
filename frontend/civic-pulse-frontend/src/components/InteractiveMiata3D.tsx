import React from 'react';

interface InteractiveMiata3DProps {}

const InteractiveMiata3D: React.FC<InteractiveMiata3DProps> = () => {
  return (
    <div style={{
      width: '100%',
      height: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(16, 19, 32, 0.8), rgba(24, 28, 47, 0.8))',
      borderRadius: '12px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      backdropFilter: 'blur(10px)',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '1.2rem', 
          fontWeight: 600, 
          color: '#3b82f6' 
        }}>
          🚗 3D Car Model
        </h3>
        <p style={{ 
          margin: '0', 
          fontSize: '0.9rem', 
          opacity: 0.7 
        }}>
          Interactive Mazda Miata with civic context
        </p>
      </div>
    </div>
  );
};

export default InteractiveMiata3D;
