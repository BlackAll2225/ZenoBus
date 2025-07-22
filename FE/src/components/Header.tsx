import { Link } from 'react-router-dom';
import { Bus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header({ isLoggedIn, username, handleLogout, navigate }: {
  isLoggedIn: boolean;
  username: string;
  handleLogout: () => void;
  navigate: (path: string) => void;
}) {
  return (
    <header className="bg-white shadow border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-green p-2 rounded-xl">
              <Bus className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">ZentroBus</span>
              <div className="text-sm text-gray-600 font-medium">hợp tác cùng với nhà xe Phương Trang</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <span
              onClick={() => (window.location.href = '/')}
              className="cursor-pointer text-gray-700 hover:text-primary-green font-medium"
            >
              Trang chủ
            </span>
            <Link to="/trips/search" className="text-gray-700 hover:text-primary-green font-medium">Lịch Trình</Link>
            <Link to="/support" className="text-gray-700 hover:text-primary-green font-medium">Tra cứu vé</Link>
            <Link to="/trips/select-vip-seats" className="text-gray-700 hover:text-primary-green font-medium">VIP</Link>
            <Link to="/support" className="text-gray-700 hover:text-primary-green font-medium">Tin Tức</Link>
            <Link to="/support" className="text-gray-700 hover:text-primary-green font-medium">Về Chúng Tôi</Link>
          </nav>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <span
                  className="text-green-700 font-medium cursor-pointer hover:underline"
                  onClick={() => navigate('/profile')}
                >
                  👋 Xin chào, {username}!
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                    <User className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-vibrant-red hover:bg-red-600 text-white">
                    Đăng ký
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button>Admin Panel</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 