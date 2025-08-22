import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addNotification, clearNotifications } from "../store/slices/uiSlice";
import { logout } from "../store/slices/authSlice";
import "./css/Header.css";

const Header = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.ui);

  const getRoleLabel = (role) => {
    if (!role) return 'Guest';
    if (typeof role === 'string' || typeof role === 'number') return String(role);
    if (Array.isArray(role)) {
      const parts = role.map((r) => (r?.display_name || r?.name || r?.id || ''));
      return parts.filter(Boolean).join(', ') || 'Guest';
    }
    if (typeof role === 'object') {
      return role.display_name || role.name || String(role.id || 'Guest');
    }
    return 'Guest';
  };

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
          <span className="logo-text">India Info Speed</span>
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
              <span className="user-role">{getRoleLabel(user?.role)}</span>
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
