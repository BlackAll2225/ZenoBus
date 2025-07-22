import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Bus, MapPin, Clock, Users, Car, Phone, User, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTimeFromUTC, formatDateFromUTC } from '@/lib/dateUtils';
import { seatService } from '@/services/seatService';
import { SeatsResponse, Seat } from '@/services/routeService';
import { Stop } from '@/services/stopService';
import StopSelection from './StopSelection';
import { useToast } from '@/hooks/use-toast';

const SeatSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seatsData, setSeatsData] = useState<SeatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedPickupStop, setSelectedPickupStop] = useState<Stop | null>(null);
  const [selectedDropoffStop, setSelectedDropoffStop] = useState<Stop | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [pendingCountdown, setPendingCountdown] = useState<{[key: number]: number}>({});

  const scheduleId = searchParams.get('scheduleId');

  useEffect(() => {
    if (isLoggedIn) {
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (scheduleId) {
      fetchSeatsData();
    }
  }, [scheduleId]);

  // Countdown timer cho ghế pending
  useEffect(() => {
    if (!seatsData) return;

    const pendingSeats = seatsData.seats.allSeats.filter(seat => seat.status === 'pending');
    const countdowns: {[key: number]: number} = {};

    pendingSeats.forEach(seat => {
      if (seat.pendingSeconds) {
        const remainingSeconds = Math.max(0, 300 - seat.pendingSeconds); // 5 phút = 300 giây
        countdowns[seat.id] = remainingSeconds;
      }
    });

    setPendingCountdown(countdowns);

    const interval = setInterval(() => {
      setPendingCountdown(prev => {
        const updated: {[key: number]: number} = {};
        Object.keys(prev).forEach(seatId => {
          const id = parseInt(seatId);
          const newTime = Math.max(0, prev[id] - 1);
          updated[id] = newTime;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seatsData]);

  const fetchSeatsData = async () => {
    if (!scheduleId) return;

    setLoading(true);
    try {
      const result = await seatService.getAvailableSeats(parseInt(scheduleId));
      setSeatsData(result);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin ghế. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  const formatTime = (dateString: string) => {
    return formatTimeFromUTC(dateString);
  };

  const formatDate = (dateString: string) => {
    return formatDateFromUTC(dateString);
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

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available') return;

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= 5) {
          toast({
            title: 'Giới hạn số ghế',
            description: 'Bạn chỉ có thể chọn tối đa 5 ghế cho mỗi lần đặt.',
            variant: 'destructive',
          });
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed';
      case 'blocked':
        return 'bg-gray-100 text-gray-800 border-gray-200 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSelectedSeatColor = (seatId: number) => {
    return selectedSeats.find(s => s.id === seatId) 
      ? 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-500' 
      : '';
  };

  const totalPrice = selectedSeats.length * (seatsData?.schedule.price || 0);

  const handleContinueToPayment = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một ghế.",
        variant: "destructive",
      });
      return;
    }

    // Prepare booking data
    const bookingData = {
      scheduleId: parseInt(scheduleId!),
      seatIds: selectedSeats.map(seat => seat.id),
      pickupStopId: selectedPickupStop?.id || null,
      dropoffStopId: selectedDropoffStop?.id || null,
      totalPrice: totalPrice
    };

    // Store booking data in localStorage for payment page
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to payment page
    navigate('/payment', { 
      state: { 
        bookingData,
        selectedSeats,
        selectedPickupStop,
        selectedDropoffStop,
        scheduleInfo: seatsData?.schedule
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin ghế...</p>
        </div>
      </div>
    );
  }

  if (!seatsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin ghế</p>
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
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
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

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Seat Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stop Selection */}
              <StopSelection
                departureProvinceId={seatsData.schedule.route.departureProvinceId}
                arrivalProvinceId={seatsData.schedule.route.arrivalProvinceId}
                onPickupStopChange={setSelectedPickupStop}
                onDropoffStopChange={setSelectedDropoffStop}
                selectedPickupStop={selectedPickupStop}
                selectedDropoffStop={selectedDropoffStop}
              />

              {/* Seat Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Chọn ghế</span>
                    {seatsData.seats.pending > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                        <AlertCircle className="h-4 w-4" />
                        <span>{seatsData.seats.pending} ghế đang được đặt</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                        <span>Có sẵn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                        <span>Đã đặt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                        <span>Đang đặt (5 phút)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                        <span>Bị khóa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded ring-2 ring-blue-500"></div>
                        <span>Đã chọn</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Bus Layout */}
                  <div className="space-y-6">
                    {/* Upper Floor */}
                    {seatsData.seats.byFloor.upper.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Tầng trên</h3>
                        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                          {seatsData.seats.byFloor.upper.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.status !== 'available'}
                              className={`
                                p-3 border rounded-lg text-sm font-medium transition-all relative
                                ${getSeatStatusColor(seat.status)}
                                ${getSelectedSeatColor(seat.id)}
                                ${seat.status === 'available' ? 'hover:scale-105' : ''}
                              `}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-semibold">{seat.seatNumber}</span>
                                {seat.status === 'pending' && (
                                  <div className="text-xs mt-1 text-center">
                                    <div className="text-yellow-700 font-medium">Đang đặt</div>
                                    {pendingCountdown[seat.id] !== undefined && (
                                      <div className="text-yellow-600">
                                        {formatCountdown(pendingCountdown[seat.id])}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {seat.status === 'booked' && (
                                  <div className="text-xs mt-1 text-red-700 font-medium">
                                    Đã đặt
                                  </div>
                                )}
                                {seat.status === 'blocked' && (
                                  <div className="text-xs mt-1 text-gray-600 font-medium">
                                    Bị khóa
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lower Floor */}
                    {seatsData.seats.byFloor.lower.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Tầng dưới</h3>
                        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                          {seatsData.seats.byFloor.lower.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.status !== 'available'}
                              className={`
                                p-3 border rounded-lg text-sm font-medium transition-all relative
                                ${getSeatStatusColor(seat.status)}
                                ${getSelectedSeatColor(seat.id)}
                                ${seat.status === 'available' ? 'hover:scale-105' : ''}
                              `}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-semibold">{seat.seatNumber}</span>
                                {seat.status === 'pending' && (
                                  <div className="text-xs mt-1 text-center">
                                    <div className="text-yellow-700 font-medium">Đang đặt</div>
                                    {pendingCountdown[seat.id] !== undefined && (
                                      <div className="text-yellow-600">
                                        {formatCountdown(pendingCountdown[seat.id])}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {seat.status === 'booked' && (
                                  <div className="text-xs mt-1 text-red-700 font-medium">
                                    Đã đặt
                                  </div>
                                )}
                                {seat.status === 'blocked' && (
                                  <div className="text-xs mt-1 text-red-700 font-medium">
                                    Bị khóa
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Floor */}
                    {seatsData.seats.byFloor.main.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Tầng chính</h3>
                        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                          {seatsData.seats.byFloor.main.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.status !== 'available'}
                              className={`
                                p-3 border rounded-lg text-sm font-medium transition-all relative
                                ${getSeatStatusColor(seat.status)}
                                ${getSelectedSeatColor(seat.id)}
                                ${seat.status === 'available' ? 'hover:scale-105' : ''}
                              `}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-semibold">{seat.seatNumber}</span>
                                {seat.status === 'pending' && (
                                  <div className="text-xs mt-1 text-center">
                                    <div className="text-yellow-700 font-medium">Đang đặt</div>
                                    {pendingCountdown[seat.id] !== undefined && (
                                      <div className="text-yellow-600">
                                        {formatCountdown(pendingCountdown[seat.id])}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {seat.status === 'booked' && (
                                  <div className="text-xs mt-1 text-red-700 font-medium">
                                    Đã đặt
                                  </div>
                                )}
                                {seat.status === 'blocked' && (
                                  <div className="text-xs mt-1 text-gray-600 font-medium">
                                    Bị khóa
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seat Statistics */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-800">{seatsData.seats.total}</div>
                        <div className="text-sm text-gray-600">Tổng ghế</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{seatsData.seats.available}</div>
                        <div className="text-sm text-gray-600">Có sẵn</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{seatsData.seats.booked}</div>
                        <div className="text-sm text-gray-600">Đã đặt</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{seatsData.seats.pending}</div>
                        <div className="text-sm text-gray-600">Đang đặt</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">{seatsData.seats.blocked}</div>
                        <div className="text-sm text-gray-600">Bị khóa</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Ticket Information */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Thông tin vé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trip Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{seatsData.schedule.bus.busType}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{seatsData.schedule.route.departureProvince}</div>
                        <div className="text-sm text-gray-500">Điểm đi</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{formatTime(seatsData.schedule.departureTime)}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(seatsData.schedule.departureTime)} • {formatDuration(seatsData.schedule.route.estimatedTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{seatsData.schedule.route.arrivalProvince}</div>
                        <div className="text-sm text-gray-500">Điểm đến</div>
                      </div>
                    </div>
                  </div>

                  {/* Pickup and Dropoff Stops */}
                  {(selectedPickupStop || selectedDropoffStop) && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Điểm đón/trả</h4>
                      <div className="space-y-3">
                        {selectedPickupStop && (
                          <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-green-700 text-sm">Điểm đón</div>
                              <div className="text-sm font-semibold">{selectedPickupStop.name}</div>
                              {selectedPickupStop.address && (
                                <div className="text-xs text-gray-600">{selectedPickupStop.address}</div>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedDropoffStop && (
                          <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-red-700 text-sm">Điểm trả</div>
                              <div className="text-sm font-semibold">{selectedDropoffStop.name}</div>
                              {selectedDropoffStop.address && (
                                <div className="text-xs text-gray-600">{selectedDropoffStop.address}</div>
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
                    {selectedSeats.length === 0 ? (
                      <p className="text-gray-500 text-sm">Chưa chọn ghế nào</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedSeats.map((seat) => (
                          <div key={seat.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="font-medium">Ghế {seat.seatNumber}</span>
                            <button
                              onClick={() => handleSeatClick(seat)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Giá vé:</span>
                      <span>{formatPrice(seatsData.schedule.price)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Số lượng:</span>
                      <span>{selectedSeats.length}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-green-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    {!isLoggedIn ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">Vui lòng đăng nhập để đặt vé</p>
                        <Link to="/login">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Đăng nhập
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        disabled={selectedSeats.length === 0}
                        onClick={handleContinueToPayment}
                      >
                        Tiếp tục thanh toán
                      </Button>
                    )}
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

export default SeatSelection;
