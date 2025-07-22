import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const bookingId = searchParams.get('bookingId');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra trạng thái thanh toán từ URL
        const paymentStatus = paymentService.getPaymentStatusFromUrl();
        
        if (paymentStatus?.status === 'CANCELLED') {
          toast({
            title: "Thanh toán đã bị hủy",
            description: "Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.",
            variant: "destructive",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái...</p>
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
              <div className="bg-red-500 p-2 rounded-xl">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">ZentroBus</span>
                <div className="text-sm text-gray-600 font-medium">Thanh toán bị hủy</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">Thanh toán bị hủy</CardTitle>
              <p className="text-red-600 mt-2">
                Giao dịch thanh toán đã bị hủy hoặc không thành công
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Information */}
              <div className="bg-white rounded-lg p-6 border border-red-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin đặt vé</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt vé:</span>
                    <span className="font-medium">{orderCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="text-red-600 font-medium">Chưa thanh toán</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">{new Date().toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Possible Reasons */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold mb-4 text-yellow-800">Có thể do:</h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Bạn đã hủy giao dịch</li>
                  <li>• Thời gian thanh toán đã hết hạn</li>
                  <li>• Có lỗi kỹ thuật xảy ra</li>
                  <li>• Thông tin thanh toán không hợp lệ</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-red-600 hover:bg-red-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại thanh toán
                </Button>
                <Button variant="outline" className="flex-1 border-red-200 text-red-700 hover:bg-red-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-red-200">
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">
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

export default PaymentCancel; 