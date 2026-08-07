const API_BASE = '/api/v1';

// Helper for fetch requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('sasti_sehat_token');
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Search & Catalog
  getTreatments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/treatments${query ? `?${query}` : ''}`);
  },
  getTreatmentById: (id) => request(`/treatments/${id}`),

  getHospitals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/hospitals${query ? `?${query}` : ''}`);
  },
  getHospitalCosts: (id) => request(`/hospitals/${id}/costs`),

  // Bill Analysis
  uploadBill: (file) => {
    const formData = new FormData();
    formData.append('bill', file);
    return request('/bills/upload', {
      method: 'POST',
      body: formData
    });
  },

  // AI Expense Estimator
  estimateCost: (payload) => request('/ai/estimate-cost', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
