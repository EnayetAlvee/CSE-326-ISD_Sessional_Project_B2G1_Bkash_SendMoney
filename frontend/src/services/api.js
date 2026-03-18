import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('bkash_user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear user data and redirect to login
      localStorage.removeItem('bkash_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Request OTP for login
  requestOTP: async (phoneNumber) => {
    try {
      const response = await api.post('/auth/request-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send OTP' };
    }
  },

  // Verify OTP and login
  verifyOTP: async (phoneNumber, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid OTP' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we'll clear local data
      console.error('Logout error:', error);
    }
  }
};

// Transaction API calls
export const transactionAPI = {
  // Validate receiver phone number
  validateReceiver: async (phoneNumber) => {
    try {
      const response = await api.post('/transaction/validate-receiver', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to validate receiver' };
    }
  },

  // Get account balance
  getBalance: async () => {
    try {
      const response = await api.get('/account/balance');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get balance' };
    }
  },

  // Send money
  sendMoney: async (transactionData) => {
    try {
      const response = await api.post('/transaction/send-money', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Transaction failed' };
    }
  },

  // Verify PIN
  verifyPIN: async (pin) => {
    try {
      const response = await api.post('/auth/verify-pin', { pin });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid PIN' };
    }
  },

  // Get transaction history
  getTransactionHistory: async () => {
    try {
      const response = await api.get('/transaction/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get transaction history' };
    }
  }
};

export default api;
