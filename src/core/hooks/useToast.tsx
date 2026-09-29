import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastProps } from '@shared/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'onDismiss'>) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((props: Omit<ToastProps, 'onDismiss'>) => {
    setToast({ ...props, onDismiss: hideToast });
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <React.Fragment key={JSON.stringify(toast)}>
          <Toast {...toast} />
        </React.Fragment>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
