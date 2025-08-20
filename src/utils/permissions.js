/**
 * Permission Utilities
 * Helper functions for checking user permissions throughout the application
 */

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role and permissions
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (user, permissionName) => {
  if (!user?.role?.permissions) return false;
  return user.role.permissions.some(perm => perm.name === permissionName);
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object with role and permissions
 * @param {Array<string>} permissionNames - Array of permission names to check
 * @returns {boolean} - True if user has at least one permission
 */
export const hasAnyPermission = (user, permissionNames) => {
  if (!user?.role?.permissions) return false;
  return user.role.permissions.some(perm => permissionNames.includes(perm.name));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object with role and permissions
 * @param {Array<string>} permissionNames - Array of permission names to check
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (user, permissionNames) => {
  if (!user?.role?.permissions) return false;
  return permissionNames.every(permName => 
    user.role.permissions.some(perm => perm.name === permName)
  );
};

/**
 * Check if user is an admin (role ID 1)
 * @param {Object} user - User object
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  const roleId = user?.role?.id ?? user?.role_id ?? null;
  const rolesArray = Array.isArray(user?.roles) ? user.roles : [];
  const hasAdminInArray = rolesArray.some((r) => (r?.id ?? r) === 1);
  return roleId === 1 || hasAdminInArray;
};

/**
 * Get user's role name
 * @param {Object} user - User object
 * @returns {string} - Role name or 'Guest'
 */
export const getUserRoleName = (user) => {
  if (!user?.role) return 'Guest';
  return user.role.display_name || user.role.name || 'Guest';
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object
 * @returns {Array} - Array of permission objects
 */
export const getUserPermissions = (user) => {
  return user?.role?.permissions || [];
};

/**
 * Get permission names for a user
 * @param {Object} user - User object
 * @returns {Array<string>} - Array of permission names
 */
export const getUserPermissionNames = (user) => {
  const permissions = getUserPermissions(user);
  return permissions.map(perm => perm.name);
};

/**
 * Check if user can access a specific feature
 * @param {Object} user - User object
 * @param {string} feature - Feature name (e.g., 'employee_management', 'user_management')
 * @returns {boolean} - True if user can access the feature
 */
export const canAccessFeature = (user, feature) => {
  if (isAdmin(user)) return true;
  return hasPermission(user, `view_${feature}`);
};

/**
 * Check if user can manage a specific feature
 * @param {Object} user - User object
 * @param {string} feature - Feature name
 * @returns {boolean} - True if user can manage the feature
 */
export const canManageFeature = (user, feature) => {
  if (isAdmin(user)) return true;
  return hasPermission(user, `manage_${feature}`);
};

/**
 * Get sidebar permissions for different roles
 */
export const SIDEBAR_PERMISSIONS = {
  // Dashboard
  DASHBOARD: 'view_dashboard',
  
  // Master Data
  EMPLOYEE_MANAGEMENT: 'view_employee_management',
  CASTE_MANAGEMENT: 'view_caste_management',
  CASTE_RATIO: 'view_caste_ratio',
  VILLAGE_DESCRIPTION: 'view_village_description',
  EDUCATION_MANAGEMENT: 'view_education_management',
  CATEGORY_MANAGEMENT: 'view_category_management',
  EMPLOYEE_TYPES: 'view_employee_types',
  
  // User Management
  USER_MANAGEMENT: 'view_user_management',
  ROLE_MANAGEMENT: 'view_role_management',
  PERMISSION_MANAGEMENT: 'view_permission_management',
  
  // Parliament
  PARLIAMENT_MANAGEMENT: 'view_parliament_management',
  LOK_SABHA: 'view_lok_sabha',
  VIDHAN_SABHA: 'view_vidhan_sabha',
  BLOCKS: 'view_blocks',
  PANCHAYATS: 'view_panchayats',
  VILLAGES: 'view_villages',
  BOOTHS: 'view_booths',
  
  // Data Collection
  FORM_BUILDER: 'view_form_builder',
  FORM_LIST: 'view_form_list',
  RESPONDENT_TABLE: 'view_respondent_table',
  TEAMS: 'view_teams',
  
  // Analysis
  EMPLOYEE_ANALYSIS: 'view_employee_analysis',
  ANALYSIS: 'view_analysis',
  CACHE_CLEAR: 'view_cache_clear'
};

/**
 * Role-based permission sets
 */
export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(SIDEBAR_PERMISSIONS),
  
  MANAGER: [
    SIDEBAR_PERMISSIONS.DASHBOARD,
    SIDEBAR_PERMISSIONS.EMPLOYEE_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CASTE_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CASTE_RATIO,
    SIDEBAR_PERMISSIONS.VILLAGE_DESCRIPTION,
    SIDEBAR_PERMISSIONS.EDUCATION_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CATEGORY_MANAGEMENT,
    SIDEBAR_PERMISSIONS.EMPLOYEE_TYPES,
    SIDEBAR_PERMISSIONS.USER_MANAGEMENT,
    SIDEBAR_PERMISSIONS.PARLIAMENT_MANAGEMENT,
    SIDEBAR_PERMISSIONS.LOK_SABHA,
    SIDEBAR_PERMISSIONS.VIDHAN_SABHA,
    SIDEBAR_PERMISSIONS.BLOCKS,
    SIDEBAR_PERMISSIONS.PANCHAYATS,
    SIDEBAR_PERMISSIONS.VILLAGES,
    SIDEBAR_PERMISSIONS.BOOTHS,
    SIDEBAR_PERMISSIONS.FORM_BUILDER,
    SIDEBAR_PERMISSIONS.FORM_LIST,
    SIDEBAR_PERMISSIONS.RESPONDENT_TABLE,
    SIDEBAR_PERMISSIONS.TEAMS,
    SIDEBAR_PERMISSIONS.EMPLOYEE_ANALYSIS,
    SIDEBAR_PERMISSIONS.ANALYSIS
  ],
  
  EMPLOYEE: [
    SIDEBAR_PERMISSIONS.DASHBOARD,
    SIDEBAR_PERMISSIONS.EMPLOYEE_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CASTE_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CASTE_RATIO,
    SIDEBAR_PERMISSIONS.VILLAGE_DESCRIPTION,
    SIDEBAR_PERMISSIONS.EDUCATION_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CATEGORY_MANAGEMENT,
    SIDEBAR_PERMISSIONS.EMPLOYEE_TYPES,
    SIDEBAR_PERMISSIONS.PARLIAMENT_MANAGEMENT,
    SIDEBAR_PERMISSIONS.LOK_SABHA,
    SIDEBAR_PERMISSIONS.VIDHAN_SABHA,
    SIDEBAR_PERMISSIONS.BLOCKS,
    SIDEBAR_PERMISSIONS.PANCHAYATS,
    SIDEBAR_PERMISSIONS.VILLAGES,
    SIDEBAR_PERMISSIONS.BOOTHS,
    SIDEBAR_PERMISSIONS.FORM_BUILDER,
    SIDEBAR_PERMISSIONS.FORM_LIST,
    SIDEBAR_PERMISSIONS.RESPONDENT_TABLE,
    SIDEBAR_PERMISSIONS.TEAMS,
    SIDEBAR_PERMISSIONS.EMPLOYEE_ANALYSIS,
    SIDEBAR_PERMISSIONS.ANALYSIS
  ],
  
  VIEWER: [
    SIDEBAR_PERMISSIONS.DASHBOARD,
    SIDEBAR_PERMISSIONS.EMPLOYEE_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CASTE_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CASTE_RATIO,
    SIDEBAR_PERMISSIONS.VILLAGE_DESCRIPTION,
    SIDEBAR_PERMISSIONS.EDUCATION_MANAGEMENT,
    SIDEBAR_PERMISSIONS.CATEGORY_MANAGEMENT,
    SIDEBAR_PERMISSIONS.EMPLOYEE_TYPES,
    SIDEBAR_PERMISSIONS.PARLIAMENT_MANAGEMENT,
    SIDEBAR_PERMISSIONS.LOK_SABHA,
    SIDEBAR_PERMISSIONS.VIDHAN_SABHA,
    SIDEBAR_PERMISSIONS.BLOCKS,
    SIDEBAR_PERMISSIONS.PANCHAYATS,
    SIDEBAR_PERMISSIONS.VILLAGES,
    SIDEBAR_PERMISSIONS.BOOTHS,
    SIDEBAR_PERMISSIONS.FORM_LIST,
    SIDEBAR_PERMISSIONS.RESPONDENT_TABLE,
    SIDEBAR_PERMISSIONS.TEAMS,
    SIDEBAR_PERMISSIONS.EMPLOYEE_ANALYSIS,
    SIDEBAR_PERMISSIONS.ANALYSIS
  ],
  
  GUEST: [
    SIDEBAR_PERMISSIONS.DASHBOARD,
    SIDEBAR_PERMISSIONS.PARLIAMENT_MANAGEMENT,
    SIDEBAR_PERMISSIONS.LOK_SABHA,
    SIDEBAR_PERMISSIONS.VIDHAN_SABHA,
    SIDEBAR_PERMISSIONS.BLOCKS,
    SIDEBAR_PERMISSIONS.PANCHAYATS,
    SIDEBAR_PERMISSIONS.VILLAGES,
    SIDEBAR_PERMISSIONS.BOOTHS
  ]
};

/**
 * Debug helper to log user permissions
 * @param {Object} user - User object
 */
export const debugUserPermissions = (user) => {
  console.log('=== User Permission Debug ===');
  console.log('User:', user?.name || 'Unknown');
  console.log('Role:', getUserRoleName(user));
  console.log('Is Admin:', isAdmin(user));
  console.log('Permissions:', getUserPermissionNames(user));
  console.log('=============================');
};
