import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Download, Mail } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<{
    id: number;
    orderCode: string;
    status: string;
    totalAmount: number;
    bookedAt: string;
  } | null>(null);
  const { toast } = useToast();

  const bookingId = searchParams.get('bookingId');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra trạng thái thanh toán từ URL
        const paymentStatus = paymentService.getPaymentStatusFromUrl();
        
        console.log('Payment status from URL:', paymentStatus);
        console.log('URL params:', { bookingId, orderCode });
        
        // Kiểm tra các trường hợp success
        const isSuccess = 
          (paymentStatus?.status === 'paid' || paymentStatus?.status === 'PAID') ||
          (bookingId && !paymentStatus?.status) || // Có bookingId nhưng không có status (có thể là success)
          (paymentStatus?.bookingId && paymentStatus?.bookingId === bookingId); // bookingId khớp
        
        if (isSuccess) {
          toast({
            title: "Thanh toán thành công!",
            description: "Vé của bạn đã được xác nhận.",
            variant: "default",
          });
        } else {
          toast({
            title: "Có lỗi xảy ra",
            description: "Không thể xác nhận trạng thái thanh toán.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        toast({
          title: "Lỗi",
          description: "Không thể kiểm tra trạng thái thanh toán.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId, orderCode, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-green p-2 rounded-xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">ZentroBus</span>
                <div className="text-sm text-gray-600 font-medium">Thanh toán thành công</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Thanh toán thành công!</CardTitle>
              <p className="text-green-600 mt-2">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Information */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin đặt vé</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt vé:</span>
                    <span className="font-medium">{orderCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="text-green-600 font-medium">Đã thanh toán</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">{new Date().toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Bước tiếp theo</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Vé điện tử sẽ được gửi đến email của bạn</li>
                  <li>• Vui lòng đến bến xe 30 phút trước giờ khởi hành</li>
                  <li>• Mang theo giấy tờ tùy thân để làm thủ tục</li>
                  <li>• Có thể tra cứu vé tại trang chủ</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Tải vé PDF
                </Button>
                <Button variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                  <Mail className="h-4 w-4 mr-2" />
                  Gửi lại email
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-200">
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Về trang chủ
                  </Button>
                </Link>
                <Link to="/trips/search" className="flex-1">
                  <Button className="w-full bg-vibrant-red hover:bg-red-600">
                    Đặt vé khác
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 