import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { 
  setSidebarCollapsed, 
  setActiveScreen, 
  toggleCategory 
} from "../store/slices/uiSlice";
import "./css/Sidebar.css";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { 
    sidebarCollapsed, 
    activeScreen, 
    expandedCategories 
  } = useAppSelector((state) => state.ui);

  const menuItems = [
    {
      id: 'dashboard',  
      label: 'Dashboard',
      icon: '📋',
      description: 'Your Dashboard',
      subItems: []
    },
    {
      id: 'master-data',
      label: 'Master Data',
      icon: '📋',
      description: 'Setup & Configuration',
      subItems: [
        { id: 'employee-management', label: 'Employee Management', icon: '👥' },
        { id: 'add-caste', label: 'Add Caste', icon: '🏷️' },
        { id: 'caste-ratio', label: 'Caste Ratio', icon: '📊' },
        { id: 'village-description', label: 'Village Description', icon: '🏘️' },
        { id: 'add-educations', label: 'Add Educations', icon: '🎓' },
        { id: 'category', label: 'Category', icon: '📂' }
      ]
    },
    {
      id: 'parliament',
      label: 'Parliament',
      icon: '🏛️',
      description: 'Parliamentary Management',
      subItems: [
        { id: 'add-parliament', label: 'Add Parliament', icon: '🏛️' },
        { id: 'add-lok-sabha', label: 'Add Lok Sabha', icon: '🏠' },
        { id: 'add-vidhan-sabha', label: 'Add Vidhan Sabha', icon: '🏢' },
        { id: 'add-block', label: 'Add Block', icon: '🏛️' },
        { id: 'add-panchayat', label: 'Add Panchayat', icon: '👥' },
        { id: 'add-village', label: 'Add Village', icon: '🏘️' },
        { id: 'add-booth', label: 'Add Booth', icon: '📊' }
      ]
    },
    {
      id: 'data-collection',
      label: 'Data Collection & Forms',
      icon: '📝',
      description: 'Forms & Information Gathering',
      subItems: [
        { id: 'form-builder', label: 'Form Builder', icon: '🔨' },
        { id: 'form-list', label: 'Form List', icon: '📋' },
        { id: 'respondent-table', label: 'Respondent Table', icon: '👤' },
        { id: 'teams', label: 'Teams', icon: '👥' }
      ]
    },
    {
      id: 'analysis-tools',
      label: 'Analysis & Tools',
      icon: '📈',
      description: 'Reports & Performance Tracking',
      subItems: [
        { id: 'employee-analysis', label: 'Employee Analysis', icon: '📊' },
        { id: 'analysis', label: 'Analysis', icon: '🔍' },
        { id: 'cache-clear', label: 'Cache Clear', icon: '🧹' }
      ]
    }
  ];

  const handleToggleSidebar = () => {
    dispatch(setSidebarCollapsed(!sidebarCollapsed));
  };

  const handleCategoryToggle = (categoryId) => {
    dispatch(toggleCategory(categoryId));
  };

  const handleItemClick = (itemId) => {
    dispatch(setActiveScreen(itemId));
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={handleToggleSidebar}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((category) => (
            <li key={category.id} className="nav-category">
              <button
                className="category-header"
                onClick={() => handleCategoryToggle(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <div className="category-info">
                      <span className="category-label">{category.label}</span>
                      <span className="category-description">{category.description}</span>
                    </div>
                    <span className="expand-icon">
                      {category.id === 'dashboard'
                        ? null
                        : expandedCategories.includes(category.id) ? '▼' : '▶'}
                    </span>
                  </>
                )}
              </button>
              
              {expandedCategories.includes(category.id) && !sidebarCollapsed && (
                <ul className="sub-menu">
                  {category.subItems.map((item) => (
                    <li key={item.id} className="sub-item">
                      <button
                        className={`sub-link ${activeScreen === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <span className="sub-icon">{item.icon}</span>
                        <span className="sub-label">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-info">
          {!sidebarCollapsed && (
            <>
              <div className="version">v1.0.0</div>
              <div className="status">Online</div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
