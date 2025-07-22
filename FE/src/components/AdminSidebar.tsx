import { NavLink } from 'react-router-dom';
import { 
  DollarSign, 
  Route, 
  Bus, 
  Users, 
  Ticket,
  Menu,
  X,
  Map,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  // Lấy role từ localStorage
  const userRole = localStorage.getItem('role') || 'admin';

  const navigationItems = [
    {
      name: 'Doanh thu',
      href: '/admin/revenue',
      icon: DollarSign,
      roles: ['admin'] // Chỉ admin mới thấy doanh thu
    },
    {
      name: 'Tuyến đường',
      href: '/admin/routes',
      icon: Route,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    },
    {
      name: 'Quản lý tỉnh',
      href: '/admin/provinces',
      icon: Map,
      roles: ['admin'] // Chỉ admin mới thấy
    },
    {
      name: 'Xe khách',
      href: '/admin/buses',
      icon: Bus,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    },
    {
      name: 'Tài xế',
      href: '/admin/drivers',
      icon: UserCheck,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    },
    {
      name: 'Mẫu lịch trình',
      href: '/admin/schedule-patterns',
      icon: Calendar,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    },
    {
      name: 'Chuyến đi',
      href: '/admin/schedules',
      icon: Clock,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    },
    {
      name: 'Khách hàng',
      href: '/admin/customers',
      icon: Users,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    },
    {
      name: 'Vé xe',
      href: '/admin/tickets',
      icon: Ticket,
      roles: ['admin', 'manager'] // Admin và manager đều thấy
    }
  ];

  // Lọc menu theo role
  const filteredNavigationItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className={`bg-white shadow-xl transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} fixed h-full z-20 border-r border-gray-200`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">ZentroBus</h1>
              <p className="text-sm text-green-100">Quản trị hệ thống</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 text-white hover:bg-green-600 rounded-lg"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        {filteredNavigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 mb-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'} flex-shrink-0`} />
            {isOpen && (
              <span className="truncate">{item.name}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-16 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Background Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-50 to-transparent pointer-events-none opacity-30"></div>
    </div>
  );
};

export default AdminSidebar;