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
  const { user } = useAppSelector((state) => state.auth);

  const isAdminRole = () => {
    const roleId = user?.role?.id ?? user?.role_id ?? null;
    // Support array roles as well
    const rolesArray = Array.isArray(user?.roles) ? user.roles : [];
    const hasAdminInArray = rolesArray.some((r) => (r?.id ?? r) === 1);
    return roleId === 1 || hasAdminInArray;
  };

  const hasPermission = (perm) => {
    if (isAdminRole()) return true; // role id 1 sees all
    if (!perm) return true; // no perm requirement -> visible
    const perms = user?.role?.permissions || user?.permissions || [];
    return perms.some((p) => (p?.name || p) === perm);
  };

  const menuItems = [
    {
      id: 'dashboard',  
      label: 'Dashboard',
      icon: '📋',
      description: 'Your Dashboard',
      perm: 'view_dashboard',
      subItems: []
    },
    {
      id: 'master-data',
      label: 'Master Data',
      icon: '📋',
      description: 'Setup & Configuration',
      perm: 'view_employee_management',
      subItems: [
        { id: 'employee-management', label: 'Employee Management', icon: '👥', perm: 'view_employee_management' },
        { id: 'add-caste', label: 'Add Caste', icon: '🏷️', perm: 'view_caste_management' },
        { id: 'caste-ratio', label: 'Caste Ratio', icon: '📊', perm: 'view_caste_ratio' },
        { id: 'village-description', label: 'Village Description', icon: '🏘️', perm: 'view_village_description' },
        { id: 'education-management', label: 'Education Management', icon: '🎓', perm: 'view_education_management' },
        { id: 'category', label: 'Expense Category', icon: '📂', perm: 'view_category_management' },
        { id: 'employee-types', label: 'Employee Types', icon: '🏷️', perm: 'view_employee_types' }
      ]
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: '👤',
      description: 'Users & Roles Management',
      perm: 'view_user_management',
      subItems: [
        { id: 'users', label: 'Users', icon: '👥', perm: 'view_user_management' },
        { id: 'role-management', label: 'Role Management', icon: '🔐', perm: 'view_role_management' },
        { id: 'permission-management', label: 'Permission Management', icon: '🛡️', perm: 'view_permission_management' }
      ]
    },
    {
      id: 'parliament',
      label: 'Parliament',
      icon: '🏛️',
      description: 'Parliamentary Management',
      perm: 'view_parliament_management',
      subItems: [
        { id: 'add-parliament', label: 'Add Parliament', icon: '🏛️', perm: 'view_parliament_management' },
        { id: 'add-lok-sabha', label: 'Add Lok Sabha', icon: '🏛️', perm: 'view_lok_sabha' },
        { id: 'add-vidhan-sabha', label: 'Add Vidhan Sabha', icon: '🏛️', perm: 'view_vidhan_sabha' },
        { id: 'add-block', label: 'Add Block', icon: '🏛️', perm: 'view_blocks' },
        { id: 'add-panchayat', label: 'Add Panchayat', icon: '🏛️', perm: 'view_panchayats' },
        { id: 'add-village', label: 'Add Village', icon: '🏘️', perm: 'view_villages' },
        { id: 'add-booth', label: 'Add Booth', icon: '📊', perm: 'view_booths' }
      ]
    },
    {
      id: 'data-collection',
      label: 'Data Collection & Forms',
      icon: '📝',
      description: 'Forms & Information Gathering',
      perm: 'view_form_builder',
      subItems: [
        { id: 'form-builder', label: 'Form Builder', icon: '🔨', perm: 'view_form_builder' },
        { id: 'form-list', label: 'Form List', icon: '📋', perm: 'view_form_list' },
        { id: 'respondent-table', label: 'Respondent Table', icon: '📋', perm: 'view_respondent_table' },
        { id: 'teams', label: 'Teams', icon: '👥', perm: 'view_teams' }
      ]
    },
    {
      id: 'analysis-tools',
      label: 'Analysis & Tools',
      icon: '📈',
      description: 'Reports & Performance Tracking',
      perm: 'view_employee_analysis',
      subItems: [
        { id: 'employee-analysis', label: 'Employee Analysis', icon: '👥', perm: 'view_employee_analysis' },
        { id: 'analysis', label: 'Analysis', icon: '🔍', perm: 'view_analysis' },
        { id: 'cache-clear', label: 'Cache Clear', icon: '🗑️', perm: 'view_cache_clear' }
      ]
    }
  ];

  const filterByPermissions = (items) => {
    if (isAdminRole()) return items; // Admin sees all categories and items
    return items
      .filter(cat => hasPermission(cat.perm))
      .map(cat => {
        const subItems = (cat.subItems || []).filter(si => hasPermission(si.perm));
        // Hide categories that have no visible subItems (when they are group categories)
        if ((cat.subItems || []).length > 0 && subItems.length === 0) {
          return null;
        }
        return { ...cat, subItems };
      })
      .filter(Boolean);
  };

  const visibleMenu = filterByPermissions(menuItems);

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
          {visibleMenu.map((category) => (
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
              
              {expandedCategories.includes(category.id) && !sidebarCollapsed && category.subItems && category.subItems.length > 0 && (
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
