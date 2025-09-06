import { useState } from 'react';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// Hook for managing toasts
export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const newToast: Toast = {
      ...toast,
      id: Date.now(),
      timestamp: new Date(),
    };

    setToasts((prev: Toast[]) => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev: Toast[]) => prev.filter((toast: Toast) => toast.id !== id));
  };

  const showNewIssueToast = (issueType: string, location: string) => {
    addToast({
      type: 'warning',
      title: 'New Issue Reported',
      message: `${issueType} reported at ${location}`,
    });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showNewIssueToast,
  };
};
