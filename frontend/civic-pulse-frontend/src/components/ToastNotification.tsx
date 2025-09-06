import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
}

interface ToastNotificationProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
`;

const ToastWrapper = styled(motion.div)<{ type: string }>`
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  max-width: 400px;
  min-width: 300px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  position: relative;
`;

const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ToastTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
`;

const ToastMessage = styled.div`
  font-size: 13px;
  color: #e5e7eb;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={16} />;
    case 'error':
      return <AlertCircle size={16} />;
    case 'warning':
      return <AlertTriangle size={16} />;
    default:
      return <Info size={16} />;
  }
};

const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, removeToast }) => {
  return (
    <ToastContainer>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastWrapper
            key={toast.id}
            type={toast.type}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <ToastHeader>
              <ToastTitle>
                {getIcon(toast.type)}
                {toast.title}
              </ToastTitle>
              <CloseButton onClick={() => removeToast(toast.id)}>
                <X size={16} />
              </CloseButton>
            </ToastHeader>
            <ToastMessage>{toast.message}</ToastMessage>
          </ToastWrapper>
        ))}
      </AnimatePresence>
    </ToastContainer>
  );
};

export default ToastNotification;
