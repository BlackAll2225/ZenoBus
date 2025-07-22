import axios from 'axios';

const API_BASE_URL = 'http://14.225.255.72:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor để thêm admin token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle errors
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to admin login
      // Chỉ redirect nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/admin/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '/admin/login';
      }
    }
    
    if (error.response?.status === 403) {
      // Forbidden - có thể là manager không có quyền
      // Không redirect nữa, để component tự xử lý
      console.warn('Access forbidden:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

export default adminApi; 