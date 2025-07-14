import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { AxiosError } from 'axios';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{ username: string; password: string }>({ 
    username: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.adminLogin(formData);
      
      // Lưu token và thông tin admin từ ApiResponse structure
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.admin.username);
      localStorage.setItem('role', response.data.admin.role);
      
      // Chuyển hướng dựa trên role
      if (response.data.admin.role === 'admin') {
        navigate('/admin/revenue');
      } else if (response.data.admin.role === 'manager') {
        navigate('/admin/schedules');
      } else {
        navigate('/admin/schedules');
      }
    } catch (err: unknown) {
      // Handle different types of errors
      if (err instanceof AxiosError) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Đăng nhập thất bại! Vui lòng thử lại.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đăng nhập thất bại! Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-orange-700 mb-2">Đăng nhập Admin</h1>
        <p className="text-center text-gray-500 mb-6">Chỉ dành cho quản trị viên hệ thống</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-2 px-4 rounded shadow mt-2 transition-colors"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage; 