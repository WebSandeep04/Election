import React from 'react';
import { useAppSelector } from '../store/hooks';

const ReduxDebugger = () => {
  const uiState = useAppSelector((state) => state.ui);
  const authState = useAppSelector((state) => state.auth);
  const dataState = useAppSelector((state) => state.data);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#60a5fa' }}>Redux State</h4>
      
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ color: '#34d399' }}>UI State:</strong>
        <div>Active Screen: {uiState.activeScreen}</div>
        <div>Sidebar Collapsed: {uiState.sidebarCollapsed ? 'Yes' : 'No'}</div>
        <div>Notifications: {uiState.notifications.length}</div>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ color: '#fbbf24' }}>Auth State:</strong>
        <div>User: {authState.user?.name}</div>
        <div>Role: {authState.user?.role}</div>
        <div>Authenticated: {authState.isAuthenticated ? 'Yes' : 'No'}</div>
      </div>
      
      <div>
        <strong style={{ color: '#f87171' }}>Data State:</strong>
        <div>Employees: {dataState.employees.length}</div>
        <div>Castes: {dataState.castes.length}</div>
        <div>Villages: {dataState.villages.length}</div>
        <div>Forms: {dataState.forms.length}</div>
        <div>Teams: {dataState.teams.length}</div>
      </div>
    </div>
  );
};

export default ReduxDebugger;
