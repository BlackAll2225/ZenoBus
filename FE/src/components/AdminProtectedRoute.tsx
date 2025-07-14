import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // Kiểm tra xem user đã đăng nhập chưa
  const isAuthenticated = authService.isAuthenticated();
  const token = authService.getToken();
  
  if (!isAuthenticated || !token) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // TODO: Có thể thêm logic kiểm tra role admin từ token nếu cần
  // Hiện tại chỉ kiểm tra token tồn tại
  
  return <>{children}</>;
};

export default AdminProtectedRoute; 