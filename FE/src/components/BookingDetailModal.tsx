import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bus, MapPin, Calendar, CreditCard, User, Armchair, Clock, Receipt, Hash } from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import { BookingEntity } from '@/services/types';
import { formatUTCToVNTime } from '@/lib/dateUtils';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | null;
}

export default function BookingDetailModal({ isOpen, onClose, bookingId }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<BookingEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetail();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetail = async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const bookingData = await bookingService.getUserBookingDetail(bookingId);
      console.log('Booking data from API:', bookingData);
      console.log('Route data:', bookingData?.route);
      console.log('User data:', bookingData?.user);
      console.log('Bus data:', bookingData?.bus);
      setBooking(bookingData);
    } catch (err: unknown) {
      console.error('Error fetching booking detail:', err);
      let errorMessage = 'Có lỗi xảy ra khi tải dữ liệu';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          window.location.href = '/login';
          return;
        }
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // return formatUTCToVNTime(dateString, 'dd/MM/yyyy HH:mm');
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '0₫';
    }
    return price.toLocaleString('vi-VN') + '₫';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang đặt';
      case 'paid': return 'Đã thanh toán';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'pending': return 'Chờ thanh toán';
      case 'completed': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  };

  const getPaymentStatusColor = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClose = () => {
    setBooking(null);
    setError(null);
    onClose();
  };

  // Helper function để render an toàn
  const safeRender = (value: unknown, fallback: string = '-') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string') {
      return value.trim() === '' ? fallback : value;
    }
    if (typeof value === 'number') {
      return value;
    }
    return fallback;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chi tiết vé xe #{bookingId}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin vé...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600">
              Đóng
            </Button>
          </div>
        )}

        {booking && !loading && !error && typeof booking === 'object' && (
          <div className="space-y-6">
            {/* Booking Status & Payment Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Trạng thái vé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(booking.status)} text-sm font-medium`}>
                        {getStatusText(booking.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPrice(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đặt vé lúc:</span>
                        <span className="font-medium">{formatDate(booking.bookedAt)}</span>
                      </div>
                      
                      {booking.orderCode && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã đặt vé:</span>
                          <span className="font-mono font-medium text-blue-600">
                            #{safeRender(booking.orderCode)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="font-medium">{safeRender(booking.paymentMethod, 'Chưa chọn')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                                         <div className="flex items-center justify-between">
                       <Badge className={`${getPaymentStatusColor(booking.paymentStatus)} text-sm font-medium`}>
                         {getPaymentStatusText(booking.paymentStatus)}
                       </Badge>
                     </div>
                     
                     <div className="space-y-2 text-sm">
                       {booking.paymentCompletedAt && (
                         <div className="flex justify-between">
                           <span className="text-gray-600">Thanh toán lúc:</span>
                           <span className="font-medium">{formatDate(booking.paymentCompletedAt)}</span>
                         </div>
                       )}
                       
                       {booking.paymentRequestId && (
                         <div className="flex justify-between">
                           <span className="text-gray-600">Mã giao dịch:</span>
                           <span className="font-mono text-xs text-gray-600 break-all">
                             {safeRender(booking.paymentRequestId)}
                           </span>
                         </div>
                       )}
                       
                       {booking.paymentUrl && booking.status === 'pending' && (
                         <div className="pt-2">
                           <Button 
                             size="sm" 
                             className="w-full bg-green-600 hover:bg-green-700"
                             onClick={() => window.open(booking.paymentUrl, '_blank')}
                           >
                             Thanh toán ngay
                           </Button>
                         </div>
                       )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Thông tin tuyến đường
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold">{safeRender(booking.route?.departureProvince?.name)}</p>
                          {typeof booking.route?.pickupStop === 'string' && (
                            <p className="text-sm text-gray-600">Điểm đón: {safeRender(booking.route.pickupStop)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="w-0.5 h-8 bg-gray-300"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold">{safeRender(booking.route?.arrivalProvince?.name)}</p>
                          {typeof booking.route?.dropoffStop === 'string' && (
                            <p className="text-sm text-gray-600">Điểm trả: {safeRender(booking.route.dropoffStop)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Thông tin lịch trình
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày khởi hành:</span>
                      <span className="font-semibold">
                        {booking.schedule?.departureTime ? formatDate(booking.schedule.departureTime) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giờ khởi hành:</span>
                      <span className="font-semibold">
                        {booking.schedule?.departureTime ? formatTime(booking.schedule.departureTime) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá vé/ghế:</span>
                      <span className="font-semibold">
                        {booking.schedule?.price ? formatPrice(booking.schedule.price) : '-'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bus Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Thông tin xe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biển số xe:</span>
                      <span className="font-semibold">{safeRender(booking.bus?.licensePlate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại xe:</span>
                      <span className="font-semibold">{safeRender(booking.bus?.busType)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin hành khách
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-semibold">{safeRender(booking.user?.fullName)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{safeRender(booking.user?.email)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-semibold">{safeRender(booking.user?.phoneNumber)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seats Information */}
            {booking.seats && booking.seats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Armchair className="h-5 w-5" />
                    Thông tin ghế ngồi ({booking.seats.length} ghế)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {booking.seats.map((seat, index) => (
                        <div key={seat.seatId || index} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-lg">Ghế {safeRender(seat.seatNumber)}</span>
                            <Badge variant="outline" className="text-xs">
                              {seat.floor === 'upper' ? 'Tầng trên' : 
                               seat.floor === 'lower' ? 'Tầng dưới' : 
                               safeRender(seat.floor, 'Tầng chính')}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giá:</span>
                            <span className="font-semibold text-orange-600">
                              {formatPrice(seat.price || 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {formatPrice(booking.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Đóng
              </Button>
              {booking.status.toLowerCase() === 'pending'.toLowerCase() && booking.paymentUrl ? (
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => window.location.href = booking.paymentUrl}
                >
                  Tiếp tục thanh toán
                </Button>
              ) : (
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Đặt vé mới
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 