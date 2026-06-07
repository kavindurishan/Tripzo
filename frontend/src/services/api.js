const BASE_URL = 'http://127.0.0.1:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('tripzo_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (err) {
    console.error(`API Error in ${endpoint}:`, err);
    throw err;
  }
};

export const api = {
  // Authentication
  auth: {
    forgotPassword: (email) => request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  },

  // Users Management
  users: {
    getAll: () => request('/users'),
    create: (data) => request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // Buses
  buses: {
    getAll: () => request('/buses'),
    create: (data) => request('/buses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/buses/${id}`, { method: 'DELETE' }),
  },

  // Routes
  routes: {
    getAll: () => request('/routes'),
    create: (data) => request('/routes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/routes/${id}`, { method: 'DELETE' }),
  },

  // Schedules
  schedules: {
    getAll: (from = '', to = '', date = '') => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (date) params.append('date', date);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/schedules${query}`);
    },
    create: (data) => request('/schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/schedules/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    getAll: () => request('/bookings'),
    create: (data) => request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    pay: (data) => request('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMy: () => request('/bookings/my'),
    cancel: (id, reason) => request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
  },

  // Payments
  payments: {
    getAll: () => request('/payments'),
  },

  // Offers
  offers: {
    getAll: () => request('/offers'),
    create: (data) => request('/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/offers/${id}`, { method: 'DELETE' }),
    verify: (code, amount) => request('/offers/verify', {
      method: 'POST',
      body: JSON.stringify({ code, amount })
    }),
  },

  // Reviews
  reviews: {
    getAll: () => request('/reviews'),
    create: (data) => request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markAllRead: () => request('/notifications/read', { method: 'POST' }),
  },

  // Reports
  reports: {
    getDashboard: () => request('/reports/dashboard'),
  }
};
