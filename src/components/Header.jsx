import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addNotification, clearNotifications } from "../store/slices/uiSlice";
import { logout } from "../store/slices/authSlice";
import "./css/Header.css";

const Header = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.ui);

  const handleNotificationClick = () => {
    // Add a sample notification
    dispatch(addNotification({
      type: 'info',
      message: 'This is a sample notification!',
      title: 'System Update'
    }));
  };

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addNotification({
      type: 'success',
      message: 'You have been logged out successfully!',
      title: 'Logout'
    }));
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Election App</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-actions">
          <button className="notification-btn" onClick={handleNotificationClick}>
            <span className="notification-icon">🔔</span>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
          
          <div className="user-profile">
            <div className="user-avatar">
              <span>{user?.avatar || '👤'}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Guest'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span>🚪</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
