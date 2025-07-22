import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bus, Calendar, MapPin, Search, User, Clock, Ticket, Shield, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripSearch from '@/components/TripSearch';

const TripSearchPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  const departureProvinceId = searchParams.get('departureProvinceId') ? parseInt(searchParams.get('departureProvinceId')!) : undefined;
  const arrivalProvinceId = searchParams.get('arrivalProvinceId') ? parseInt(searchParams.get('arrivalProvinceId')!) : undefined;
  const departureDate = searchParams.get('departureDate') || undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50">
      {/* Header */}
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
                  <span className="text-green-700 font-medium">👋 Xin chào, {username}!</span>
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

      {/* Main Content */}
      <main className="flex-1">
        <TripSearch 
          departureProvinceId={departureProvinceId}
          arrivalProvinceId={arrivalProvinceId}
          departureDate={departureDate}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary-green p-2 rounded-xl">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BusBooker</span>
              </div>
              <p className="text-gray-400 leading-relaxed">Đối tác tin cậy cho hành trình liên tỉnh của bạn tại Việt Nam</p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Dịch vụ khách hàng</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Liên hệ hỗ trợ</li>
                <li className="hover:text-white transition-colors cursor-pointer">Câu hỏi thường gặp</li>
                <li className="hover:text-white transition-colors cursor-pointer">Hướng dẫn đặt vé</li>
                <li className="hover:text-white transition-colors cursor-pointer">Chính sách hoàn tiền</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Dành cho nhà xe</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Đăng nhập nhà xe</li>
                <li className="hover:text-white transition-colors cursor-pointer">Quản lý tuyến đường</li>
                <li className="hover:text-white transition-colors cursor-pointer">Báo cáo doanh thu</li>
                <li className="hover:text-white transition-colors cursor-pointer">Hợp tác kinh doanh</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Quản trị hệ thống</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Cổng quản trị</li>
                <li className="hover:text-white transition-colors cursor-pointer">Quản lý hệ thống</li>
                <li className="hover:text-white transition-colors cursor-pointer">Quản lý người dùng</li>
                <li className="hover:text-white transition-colors cursor-pointer">Phân tích dữ liệu</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BusBooker. Tất cả quyền được bảo lưu. Được vận hành bởi Tập đoàn Phương Trang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TripSearchPage;
