import React, { useEffect } from 'react';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--pm-black)',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '4px',
      zIndex: 9999,
      fontSize: '0.9rem',
      fontWeight: 500,
      animation: 'slideUp 0.3s ease-out',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      {message}
    </div>
  );
};

export default Toast;