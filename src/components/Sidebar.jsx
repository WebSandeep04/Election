import React, { useState } from "react";
import "./css/Sidebar.css";

const Sidebar = ({ activeScreen, onScreenChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(['master-data']);

  const menuItems = [
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
        { id: 'add-parliament', label: 'Add Parliament', icon: '🏛️' },
        { id: 'category', label: 'Category', icon: '📂' }
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

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleItemClick = (itemId) => {
    onScreenChange(itemId);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((category) => (
            <li key={category.id} className="nav-category">
              <button
                className="category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                {!isCollapsed && (
                  <>
                    <div className="category-info">
                      <span className="category-label">{category.label}</span>
                      <span className="category-description">{category.description}</span>
                    </div>
                    <span className="expand-icon">
                      {expandedCategories.includes(category.id) ? '▼' : '▶'}
                    </span>
                  </>
                )}
              </button>
              
              {expandedCategories.includes(category.id) && !isCollapsed && (
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
          {!isCollapsed && (
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
