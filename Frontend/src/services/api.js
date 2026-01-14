const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add token to headers if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, it's likely an HTML error page
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      
      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check if the backend server is running.');
      } else if (response.status === 0 || !response.ok) {
        throw new Error('Cannot connect to the server. Please make sure the backend is running on port 5000.');
      } else {
        throw new Error('Server returned an unexpected response format.');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.message && !error.message.includes('JSON')) {
      throw error;
    }
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new Error('Server returned invalid response. Please check if the backend server is running.');
    }
    
    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to the server. Please make sure the backend is running on port 5000.');
    }
    
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // User registration
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Admin login
  adminLogin: async (email, password) => {
    return apiCall('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Verify token
  verifyToken: async () => {
    return apiCall('/auth/verify', {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

export default apiCall;
