// API Configuration
export const API_CONFIG = {
	// Base URL for your API (loaded from Vite's environment variables)
	BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
	// Whether to use cookie-based auth (e.g., Laravel Sanctum). If true, fetch will send credentials
	USE_COOKIE_AUTH: String(import.meta.env.VITE_USE_COOKIE_AUTH || 'false') === 'true',

	// API Endpoints
	ENDPOINTS: {
		LOGIN: '/api/login',
		LOGOUT: '/api/logout',
		REGISTER: '/api/register',
		PROFILE: '/api/profile',
		REFRESH_TOKEN: '/api/refresh-token',
		CASTES: '/api/castes',
		CASTE_RATIO: '/api/cast-ratios',
		LOK_SABHA: '/api/lok-sabhas',
		VIDHAN_SABHA: '/api/vidhan-sabhas',
		BLOCK: '/api/blocks',
		PANCHAYAT: '/api/panchayats',
		VILLAGE: '/api/villages', // Added for Village
		BOOTH: '/api/booths', // Added for Booth
		FORMS: '/api/forms', // Added for Forms
		ROLES: '/api/roles', // Added for Roles
		USERS: '/api/users', // Added for Users
		PERMISSIONS: '/api/permissions', // Added for Permissions
		EDUCATIONS: '/api/educations', // Added for Educations
		EXPENSE_CATEGORIES: '/api/expense-categories', // Added for Expense Categories
	},

	// Request timeout (in milliseconds)
	TIMEOUT: 10000,

	// Default headers
	DEFAULT_HEADERS: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
	},
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
	return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get headers with auth token
export const getAuthHeaders = (token) => {
	const resolvedToken = token || localStorage.getItem('auth_token') || undefined;
	const authHeader = resolvedToken
		? (resolvedToken.startsWith('Bearer ') ? resolvedToken : `Bearer ${resolvedToken}`)
		: undefined;
	return {
		...API_CONFIG.DEFAULT_HEADERS,
		...(authHeader && { Authorization: authHeader }),
	};
};

// Ensure CSRF cookie for Sanctum/session flows
let csrfFetched = false;
export const ensureCsrf = async () => {
	if (!API_CONFIG.USE_COOKIE_AUTH) return;
	if (csrfFetched) return;
	try {
		await fetch(getApiUrl('/sanctum/csrf-cookie'), {
			method: 'GET',
			credentials: 'include',
		});
		csrfFetched = true;
	} catch (_) {
		// ignore; backend may not use Sanctum
	}
};
