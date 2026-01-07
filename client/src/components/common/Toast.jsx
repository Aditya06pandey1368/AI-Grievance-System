import { Toaster } from 'react-hot-toast';
import useTheme from '../../hooks/useTheme';

const Toast = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#1e293b' : '#fff',
          color: theme === 'dark' ? '#fff' : '#0f172a',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          padding: '16px',
          borderRadius: '12px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
};

export default Toast;