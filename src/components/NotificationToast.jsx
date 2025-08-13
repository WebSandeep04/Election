import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removeNotification } from '../store/slices/uiSlice';

const NotificationToast = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);

  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'error':
        return { backgroundColor: '#ef4444', color: 'white' };
      case 'warning':
        return { backgroundColor: '#f59e0b', color: 'white' };
      default:
        return { backgroundColor: '#3b82f6', color: 'white' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            ...getNotificationStyle(notification.type),
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {notification.title}
              </div>
              <div style={{ fontSize: '14px' }}>
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '18px',
                marginLeft: '10px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
