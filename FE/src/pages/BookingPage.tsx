import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Bus, MapPin, Clock, Users, Car, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { routeService, Trip } from '@/services/routeService';
import { useToast } from '@/hooks/use-toast';

const BookingPage = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scheduleId) {
      fetchTripDetails();
    }
  }, [scheduleId]);

  const fetchTripDetails = async () => {
    if (!scheduleId) return;

    setLoading(true);
    try {
      // Tạm thời sử dụng mock data vì chưa có API để lấy chi tiết một chuyến xe
      // Trong thực tế sẽ gọi API: const result = await routeService.getTripDetails(parseInt(scheduleId));
      
      // Mock data cho demo
      const mockTrip: Trip = {
        scheduleId: parseInt(scheduleId),
        departureTime: new Date().toISOString(),
        price: 150000,
        status: 'active',
        route: {
          id: 1,
          departureProvinceId: 1,
          arrivalProvinceId: 2,
          distanceKm: 300,
          estimatedTime: 360,
          departureProvince: {
            id: 1,
            name: 'TP. Hồ Chí Minh',
            code: 'HCM'
          },
          arrivalProvince: {
            id: 2,
            name: 'Đà Lạt',
            code: 'DL'
          }
        },
        bus: {
          id: 1,
          licensePlate: '51F-12345',
          seatCount: 45,
          description: 'Xe khách chất lượng cao',
          busType: {
            id: 1,
            name: 'VIP 45 chỗ',
            description: 'Xe VIP 45 chỗ ngồi'
          }
        },
        driver: {
          id: 1,
          fullName: 'Nguyễn Văn A',
          phoneNumber: '0901234567',
          licenseNumber: 'DL123456'
        }
      };
      
      setTrip(mockTrip);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin chuyến xe. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin chuyến xe...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin chuyến xe</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* Go Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            className="border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {/* Trip Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bus className="h-5 w-5 mr-2" />
              Chi tiết chuyến xe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trip Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{trip.bus.busType.name}</span>
                  <Badge variant="outline">{trip.bus.licensePlate}</Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{trip.route.departureProvince.name}</div>
                      <div className="text-sm text-gray-500">Điểm đi</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{formatTime(trip.departureTime)}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(trip.departureTime)} • {formatDuration(trip.route.estimatedTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{trip.route.arrivalProvince.name}</div>
                      <div className="text-sm text-gray-500">Điểm đến</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus and Driver Info */}
              <div className="space-y-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{formatPrice(trip.price)}</div>
                  <div className="text-sm text-gray-500">mỗi người</div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{trip.bus.seatCount} ghế</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{trip.bus.busType.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{trip.driver.fullName}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700" 
            size="lg"
            onClick={() => navigate(`/trips/select-vip-seats?scheduleId=${trip.scheduleId}`)}
          >
            Chọn ghế VIP
          </Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700" 
            size="lg"
            onClick={() => navigate(`/trips/select-seats?scheduleId=${trip.scheduleId}`)}
          >
            Chọn ghế thường
          </Button>
        </div>
        </div>
      </div>

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

export default BookingPage; 