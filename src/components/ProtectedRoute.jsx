import React from 'react';
import { useAppSelector } from '../store/hooks';
import { hasPermission, isAdmin } from '../utils/permissions';

/**
 * ProtectedRoute Component
 * Wraps components that require specific permissions to access
 */
const ProtectedRoute = ({ 
  requiredPermission, 
  children, 
  fallback = null,
  showAccessDenied = true 
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Check if user is logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>🔒 Authentication Required</h2>
          <p>Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check if user account is active
  if (user.is_active === false) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>⚠️ Account Inactive</h2>
          <p>Your account has been deactivated. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  // If no specific permission required, render children
  if (!requiredPermission) {
    return children;
  }

  // Check if user has required permission
  const hasAccess = isAdmin(user) || hasPermission(user, requiredPermission);

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    if (!showAccessDenied) {
      return null;
    }

    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>🚫 Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <div className="permission-info">
            <strong>Required Permission:</strong> {requiredPermission}
          </div>
          <div className="user-info">
            <strong>Your Role:</strong> {user.role?.display_name || user.role?.name || 'Unknown'}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * FeatureGate Component
 * Conditionally renders content based on user permissions
 */
export const FeatureGate = ({ 
  permission, 
  children, 
  fallback = null,
  user = null 
}) => {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const currentUser = user || authUser;

  if (!currentUser) {
    return fallback;
  }

  const hasAccess = isAdmin(currentUser) || hasPermission(currentUser, permission);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

/**
 * AdminOnly Component
 * Only renders content for admin users (role ID 1)
 */
export const AdminOnly = ({ children, fallback = null }) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user || !isAdmin(user)) {
    return fallback;
  }

  return children;
};

/**
 * RoleBased Component
 * Renders different content based on user role
 */
export const RoleBased = ({ 
  roles = [], 
  children, 
  fallback = null,
  user = null 
}) => {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const currentUser = user || authUser;

  if (!currentUser) {
    return fallback;
  }

  const userRoleId = currentUser.role?.id || currentUser.role_id;
  const hasRole = roles.includes(userRoleId) || isAdmin(currentUser);

  if (!hasRole) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
