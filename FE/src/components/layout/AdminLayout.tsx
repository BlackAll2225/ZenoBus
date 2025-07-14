import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      navigate('/admin/login', { replace: true });
    } else if (location.pathname === '/admin') {
      // Redirect dựa trên role
      if (role === 'admin') {
        navigate('/admin/revenue', { replace: true });
      } else if (role === 'manager') {
        navigate('/admin/schedules', { replace: true });
      } else {
        navigate('/admin/schedules', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />

      {/* Main content */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '16rem' : '4rem' }}
      >
        {/* Top Header with Back Button */}
        <div className="flex justify-end items-center p-4 border-b bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="border-gray-300 text-green-700 hover:bg-green-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </div>

        {/* Nested Routes */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
