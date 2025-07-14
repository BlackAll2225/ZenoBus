import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Bus, MapPin, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import { Seat } from '@/services/routeService';
import { Stop } from '@/services/stopService';

interface ScheduleInfo {
  id: number;
  departureTime: string;
  price: number;
  status: string;
  bus: {
    id: number;
    licensePlate: string;
    seatCount: number;
    description: string;
    busType: string;
  };
  route: {
    id: number;
    departureProvinceId: number;
    arrivalProvinceId: number;
    distanceKm: number;
    estimatedTime: number;
    departureProvince: string;
    arrivalProvince: string;
  };
}

interface BookingData {
  scheduleId: number;
  seatIds: number[];
  pickupStopId: number | null;
  dropoffStopId: number | null;
  totalPrice: number;
}

interface PaymentPageProps {
  bookingData?: BookingData;
  selectedSeats?: Seat[];
  selectedPickupStop?: Stop | null;
  selectedDropoffStop?: Stop | null;
  scheduleInfo?: ScheduleInfo;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');

  // Get data from location state or localStorage
  const bookingData = location.state?.bookingData || JSON.parse(localStorage.getItem('bookingData') || '{}');
  const selectedSeats = location.state?.selectedSeats || [];
  const selectedPickupStop = location.state?.selectedPickupStop || null;
  const selectedDropoffStop = location.state?.selectedDropoffStop || null;
  const scheduleInfo = location.state?.scheduleInfo || null;

  useEffect(() => {
    if (isLoggedIn) {
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData.scheduleId || !bookingData.seatIds || bookingData.seatIds.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có thông tin đặt vé. Vui lòng chọn ghế trước.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Redirect if not logged in
    if (!isLoggedIn) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để tiếp tục.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  }, [bookingData, isLoggedIn, navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('bookingData');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
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

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const paymentData = {
        scheduleId: bookingData.scheduleId,
        seatIds: bookingData.seatIds,
        pickupStopId: bookingData.pickupStopId,
        dropoffStopId: bookingData.dropoffStopId,
        totalAmount: bookingData.totalPrice
      };

      const response = await paymentService.createPaymentLink(paymentData);
      setPaymentUrl(response.paymentUrl);
      
      // Redirect to payment URL
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo liên kết thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData.scheduleId || !scheduleInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không có thông tin đặt vé</p>
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
            <div className="flex items-center space-x-3">
              {isLoggedIn && (
                <>
                  <span className="text-green-700 font-medium">👋 Xin chào, {username}!</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </>
              )}
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

          {/* Payment Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Trip Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-blue-600" />
                    Thông tin chuyến xe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trip Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{scheduleInfo.bus.busType}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{scheduleInfo.route.departureProvince}</div>
                        <div className="text-sm text-gray-500">Điểm đi</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{formatTime(scheduleInfo.departureTime)}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(scheduleInfo.departureTime)} • {formatDuration(scheduleInfo.route.estimatedTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{scheduleInfo.route.arrivalProvince}</div>
                        <div className="text-sm text-gray-500">Điểm đến</div>
                      </div>
                    </div>
                  </div>

                  {/* Stop Information */}
                  {(selectedPickupStop || selectedDropoffStop) && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Điểm đón/trả</h4>
                      <div className="space-y-2">
                        {selectedPickupStop && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium text-green-700">Điểm đón: {selectedPickupStop.name}</div>
                              {selectedPickupStop.address && (
                                <div className="text-sm text-gray-500">{selectedPickupStop.address}</div>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedDropoffStop && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <div>
                              <div className="font-medium text-red-700">Điểm trả: {selectedDropoffStop.name}</div>
                              {selectedDropoffStop.address && (
                                <div className="text-sm text-gray-500">{selectedDropoffStop.address}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Seats */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Ghế đã chọn</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedSeats.map((seat) => (
                        <Badge key={seat.id} variant="secondary" className="justify-center">
                          Ghế {seat.seatNumber}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Payment */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Giá vé:</span>
                      <span>{formatPrice(scheduleInfo.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Số lượng:</span>
                      <span>{selectedSeats.length}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-green-600">{formatPrice(bookingData.totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Phương thức thanh toán</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">PayOS</div>
                          <div className="text-sm text-gray-600">Thanh toán an toàn qua PayOS</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={handleCreatePayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Thanh toán ngay
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Payment Info */}
                  <div className="text-sm text-gray-600 text-center">
                    <p>Bạn sẽ được chuyển đến trang thanh toán an toàn của PayOS</p>
                    <p className="mt-1">Vé sẽ được gửi qua email sau khi thanh toán thành công</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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

export default PaymentPage; 