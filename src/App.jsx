import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/screens/Dashboard';
import Analytics from './components/screens/Analytics';
import Users from './components/screens/Users';
import Settings from './components/screens/Settings';

// Master Data Components
import EmployeeManagement from './components/screens/EmployeeManagement';
import AddCaste from './components/screens/AddCaste';
import CasteRatio from './components/screens/CasteRatio';
import VillageDescription from './components/screens/VillageDescription';
import AddEducations from './components/screens/AddEducations';
import AddParliament from './components/screens/AddParliament';
import Category from './components/screens/Category';

// Data Collection Components
import FormBuilder from './components/screens/FormBuilder';
import FormList from './components/screens/FormList';
import RespondentTable from './components/screens/RespondentTable';
import Teams from './components/screens/Teams';

// Analysis Components
import EmployeeAnalysis from './components/screens/EmployeeAnalysis';
import Analysis from './components/screens/Analysis';
import CacheClear from './components/screens/CacheClear';

import './App.css';
import './components/css/Components.css';

function App() {
  const [activeScreen, setActiveScreen] = useState('employee-management');

  const renderContent = () => {
    switch (activeScreen) {
      // Legacy components
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      
      // Master Data Components
      case 'employee-management':
        return <EmployeeManagement />;
      case 'add-caste':
        return <AddCaste />;
      case 'caste-ratio':
        return <CasteRatio />;
      case 'village-description':
        return <VillageDescription />;
      case 'add-educations':
        return <AddEducations />;
      case 'add-parliament':
        return <AddParliament />;
      case 'category':
        return <Category />;
      
      // Data Collection Components
      case 'form-builder':
        return <FormBuilder />;
      case 'form-list':
        return <FormList />;
      case 'respondent-table':
        return <RespondentTable />;
      case 'teams':
        return <Teams />;
      
      // Analysis Components
      case 'employee-analysis':
        return <EmployeeAnalysis />;
      case 'analysis':
        return <Analysis />;
      case 'cache-clear':
        return <CacheClear />;
      
      default:
        return <EmployeeManagement />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <div className="main-content">
        <Header />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
