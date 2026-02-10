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

  // Get user profile
  getProfile: async () => {
    return apiCall('/auth/profile', {
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

  // Get all users (Admin only)
  getAllUsers: async () => {
    return apiCall('/auth/users', {
      method: 'GET',
    });
  },

  // Update user (Admin only)
  updateUser: async (userId, userData) => {
    return apiCall(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    return apiCall(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Get user contacts
  getContacts: async () => {
    return apiCall('/auth/contacts', {
      method: 'GET',
    });
  },

  // Add contact
  addContact: async (contactData) => {
    return apiCall('/auth/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  // Update contact
  updateContact: async (contactId, contactData) => {
    return apiCall(`/auth/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  },

  // Delete contact
  deleteContact: async (contactId) => {
    return apiCall(`/auth/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token, password, confirmPassword) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  },

  // Google OAuth login
  googleLogin: async (idToken) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  // Email Verification
  sendEmailVerification: async () => {
    return apiCall('/auth/send-email-verification', {
      method: 'POST',
    });
  },

  verifyEmail: async (code) => {
    return apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // Phone Verification
  sendPhoneOTP: async () => {
    return apiCall('/auth/send-phone-otp', {
      method: 'POST',
    });
  },

  verifyPhone: async (otp) => {
    return apiCall('/auth/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  // Profile Picture Upload
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/upload-profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload profile picture');
    }

    return response.json();
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    return await apiCall('/auth/profile-picture', {
      method: 'DELETE',
    });
  },

  // Two-Factor Authentication
  generate2FA: async () => {
    return apiCall('/auth/2fa/generate', {
      method: 'POST',
    });
  },

  verifyEnable2FA: async (token) => {
    return apiCall('/auth/2fa/verify-enable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  disable2FA: async (token, password) => {
    return apiCall('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  verify2FALogin: async (userId, token) => {
    return apiCall('/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify({ userId, token }),
    });
  },
};

export default apiCall;

export const psgcAPI = {
  _fetchJSON: async (url) => {
    const key = `psgc:${url}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 1000 * 60 * 60) return data;
      } catch (e) { void e; }
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`PSGC error: ${res.status}`);
    const data = await res.json();
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    return data;
  },
  getRegions: async () => {
    return await psgcAPI._fetchJSON('https://psgc.cloud/api/regions');
  },
  getProvincesByRegion: async (regionCode) => {
    const list = await psgcAPI._fetchJSON(`https://psgc.cloud/api/regions/${regionCode}/provinces`);
    if (Array.isArray(list) && list.length > 0) return list;
    const alt = await psgcAPI._fetchJSON(`https://psgc.cloud/api/provinces?region_code=${regionCode}`);
    return alt;
  },
  getCitiesMunicipalitiesByProvince: async (provinceCode) => {
    const cities = await psgcAPI._fetchJSON(`https://psgc.cloud/api/provinces/${provinceCode}/cities`);
    const municipalities = await psgcAPI._fetchJSON(`https://psgc.cloud/api/provinces/${provinceCode}/municipalities`);
    const altCities = Array.isArray(cities) && cities.length > 0 ? cities : await psgcAPI._fetchJSON(`https://psgc.cloud/api/cities?province_code=${provinceCode}`);
    const altMunicipalities = Array.isArray(municipalities) && municipalities.length > 0 ? municipalities : await psgcAPI._fetchJSON(`https://psgc.cloud/api/municipalities?province_code=${provinceCode}`);
    const merged = [
      ...altCities.map((c) => ({ code: c.code || c.psgc_id || c.correspondence_code, name: c.name, type: 'City' })),
      ...altMunicipalities.map((m) => ({ code: m.code || m.psgc_id || m.correspondence_code, name: m.name, type: 'Municipality' })),
    ].filter((x) => x.code && x.name);
    return merged.sort((a, b) => a.name.localeCompare(b.name));
  },
  getCitiesMunicipalitiesByRegion: async (regionCode) => {
    const cities = await psgcAPI._fetchJSON(`https://psgc.cloud/api/regions/${regionCode}/cities`);
    const municipalities = await psgcAPI._fetchJSON(`https://psgc.cloud/api/regions/${regionCode}/municipalities`);
    const altCities = Array.isArray(cities) && cities.length > 0 ? cities : await psgcAPI._fetchJSON(`https://psgc.cloud/api/cities?region_code=${regionCode}`);
    const altMunicipalities = Array.isArray(municipalities) && municipalities.length > 0 ? municipalities : await psgcAPI._fetchJSON(`https://psgc.cloud/api/municipalities?region_code=${regionCode}`);
    const merged = [
      ...altCities.map((c) => ({ code: c.code || c.psgc_id || c.correspondence_code, name: c.name, type: 'City' })),
      ...altMunicipalities.map((m) => ({ code: m.code || m.psgc_id || m.correspondence_code, name: m.name, type: 'Municipality' })),
    ].filter((x) => x.code && x.name);
    return merged.sort((a, b) => a.name.localeCompare(b.name));
  },
  getBarangaysByCity: async (cityCode) => {
    const list = await psgcAPI._fetchJSON(`https://psgc.cloud/api/cities/${cityCode}/barangays`);
    if (Array.isArray(list) && list.length > 0) return list;
    const alt = await psgcAPI._fetchJSON(`https://psgc.cloud/api/barangays?city_code=${cityCode}`);
    return alt;
  },
  getBarangaysByMunicipality: async (municipalityCode) => {
    const list = await psgcAPI._fetchJSON(`https://psgc.cloud/api/municipalities/${municipalityCode}/barangays`);
    if (Array.isArray(list) && list.length > 0) return list;
    const alt = await psgcAPI._fetchJSON(`https://psgc.cloud/api/barangays?municipality_code=${municipalityCode}`);
    return alt;
  },
};
