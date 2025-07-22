import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Calendar, MapPin, Search, User, Clock, Ticket, Shield, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { TripSearchForm } from '@/components/TripSearchForm';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
    }
  }, [isLoggedIn]);

  const navigate = useNavigate();

  const handleSearch = async (searchData: {
    departureProvinceId: number;
    arrivalProvinceId: number;
    departureDate: string;
  }) => {
    setSearchLoading(true);
    try {
      // Navigate to search page with the search data
      navigate(`/trips/search?departureProvinceId=${searchData.departureProvinceId}&arrivalProvinceId=${searchData.arrivalProvinceId}&departureDate=${searchData.departureDate}`);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };



  const popularRoutes = [
    { from: 'Ho Chi Minh City', to: 'Đà Lạt', price: '280.000₫', duration: '6h', image: 'https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg' },
    { from: 'Ho Chi Minh City', to: 'Nha Trang', price: '275.000₫', duration: '8h', image: 'https://vcdn1-dulich.vnecdn.net/2022/05/09/shutterstock-280926449-6744-15-3483-9174-1652070682.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=bGCo6Rv6DseMDE_07TT1Aw' },
    { from: 'Ho Chi Minh City', to: 'Đà Nẵng', price: '250,000₫', duration: '12h', image: 'https://tourism.danang.vn/wp-content/uploads/2023/02/tour-du-lich-da-nang-1.jpg' },
    { from: 'Ho Chi Minh City', to: 'Vũng Tàu', price: '150.000₫', duration: '3h', image: 'https://ik.imagekit.io/tvlk/blog/2025/03/shutterstock_2477953603.jpg' },
    { from: 'Ho Chi Minh City', to: 'Buôn Ma Thuột', price: '245.000₫', duration: '8h', image: 'https://i2.ex-cdn.com/crystalbay.com/files/content/2024/06/19/du-lich-buon-ma-thuot-1-1128.jpg' },
    { from: 'Ho Chi Minh City', to: 'Quảng Ngãi', price: '370.000₫', duration: '20h', image: 'https://www.flc.vn/wp-content/uploads/2019/07/Anh-2-12.jpg' },
    { from: 'Ho Chi Minh City', to: 'Kiên Giang', price: '200.000₫', duration: '7h30', image: 'https://cdn.tgdd.vn/Files/2021/07/07/1366331/tong-hop-10-dia-diem-du-lich-dep-nhat-tai-kien-giang-202107071104258273.jpg' },
    { from: 'Ho Chi Minh City', to: 'Long An', price: '150.000₫', duration: '2h', image: 'https://scontent.iocvnpt.com/resources/portal//Images/LAN/sangvt.lan/tien_ich/dia_diem/cong_vien_tuong_dai/2_637189269840792897.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50">
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


      {/* Hero + Search */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-red-600/90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920')] bg-cover bg-center" />
        <div className="relative container mx-auto max-w-6xl text-center text-white z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Khám phá <span className="text-yellow-300">Việt Nam</span><br />với ZentroBus</h1>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">Đặt vé xe khách liên tỉnh dễ dàng, an toàn và tiện lợi.</p>

          <Card className="p-8 bg-white/95 backdrop-blur-sm shadow max-w-5xl mx-auto">
            <TripSearchForm 
              onSearch={handleSearch}
              loading={searchLoading}
              className="text-black"
            />
          </Card>
        </div>
      </section>

      {/* Popular Routes
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary-green">Tuyến đường phổ biến</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="overflow-hidden shadow hover:shadow-lg transition-all duration-300">
                <img src={route.image} alt={route.to} className="w-full h-40 object-cover" />
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{route.from} → {route.to}</h3>
                  <div className="text-sm text-gray-600">Giá: {route.price}</div>
                  <div className="text-sm text-gray-600">Thời gian: {route.duration}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Popular Destinations */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Tuyến đường <span className="text-primary-green">phổ biến</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Được khách hàng tin tưởng và lựa chọn
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 cursor-pointer border-0 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={route.image} 
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-lg font-semibold">{route.from}</div>
                    <div className="text-sm opacity-90">→ {route.to}</div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-vibrant-red">{route.price}</span>
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{route.duration}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    Xem lịch trình
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Tại sao chọn <span className="text-vibrant-red">ZentroBus</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm đặt vé tốt nhất cho hành khách
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-10 w-10 text-primary-green" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Nhà xe uy tín</h3>
              <p className="text-gray-600 leading-relaxed">Hợp tác với các nhà xe hàng đầu như Phương Trang, đảm bảo chất lượng dịch vụ và an toàn tuyệt đối</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="h-10 w-10 text-vibrant-red" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Đặt vé dễ dàng</h3>
              <p className="text-gray-600 leading-relaxed">Giao diện thân thiện, đặt vé trực tuyến chỉ trong vài phút với xác nhận ngay lập tức</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <HeartHandshake className="h-10 w-10 text-warm-gold" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Hỗ trợ 24/7</h3>
              <p className="text-gray-600 leading-relaxed">Đội ngũ chăm sóc khách hàng chuyên nghiệp, sẵn sàng hỗ trợ bạn mọi lúc mọi nơi</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-green">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Hãy bắt đầu hành trình khám phá Việt Nam cùng BusBooker ngay hôm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary-green hover:bg-gray-100 text-lg px-8 py-4">
              <Search className="h-5 w-5 mr-2" />
              Tìm chuyến xe ngay
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-green text-lg px-8 py-4">
              <User className="h-5 w-5 mr-2" />
              Đăng ký tài khoản
            </Button>
          </div>
        </div>
      </section>

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

export default Index;
