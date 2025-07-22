
import { useState } from 'react';
import { ArrowLeft, User, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom'; // ✅ Thêm dòng này

interface Seat {
  id: string;
  number: string;
  type: 'vip' | 'premium';
  status: 'available' | 'selected' | 'occupied';
  price: number;
}

const VipSeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const navigate = useNavigate(); // ✅ Khởi tạo navigate
  
  // VIP bus layout with 3 columns (1-1-1 configuration)
  const seatLayout: Seat[][] = [
    [
      { id: '1A', number: '1A', type: 'vip', status: 'available', price: 150000 },
      { id: '1B', number: '1B', type: 'vip', status: 'occupied', price: 150000 },
      { id: '1C', number: '1C', type: 'vip', status: 'available', price: 150000 }
    ],
    [
      { id: '2A', number: '2A', type: 'vip', status: 'available', price: 150000 },
      { id: '2B', number: '2B', type: 'premium', status: 'available', price: 180000 },
      { id: '2C', number: '2C', type: 'vip', status: 'occupied', price: 150000 }
    ],
    [
      { id: '3A', number: '3A', type: 'vip', status: 'available', price: 150000 },
      { id: '3B', number: '3B', type: 'premium', status: 'available', price: 180000 },
      { id: '3C', number: '3C', type: 'vip', status: 'available', price: 150000 }
    ],
    [
      { id: '4A', number: '4A', type: 'vip', status: 'occupied', price: 150000 },
      { id: '4B', number: '4B', type: 'premium', status: 'available', price: 180000 },
      { id: '4C', number: '4C', type: 'vip', status: 'available', price: 150000 }
    ],
    [
      { id: '5A', number: '5A', type: 'vip', status: 'available', price: 150000 },
      { id: '5B', number: '5B', type: 'vip', status: 'available', price: 150000 },
      { id: '5C', number: '5C', type: 'vip', status: 'available', price: 150000 }
    ],
    [
      { id: '6A', number: '6A', type: 'vip', status: 'available', price: 150000 },
      { id: '6B', number: '6B', type: 'premium', status: 'available', price: 180000 },
      { id: '6C', number: '6C', type: 'vip', status: 'occupied', price: 150000 }
    ]
  ];

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  const getSeatClassName = (seat: Seat) => {
    const baseClass = "w-16 h-16 md:w-18 md:h-18 rounded-2xl border-3 flex flex-col items-center justify-center text-xs font-bold cursor-pointer transition-all duration-300 transform relative shadow-md hover:shadow-lg";
    
    if (seat.status === 'occupied') {
      return `${baseClass} bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed`;
    }
    
    if (selectedSeats.includes(seat.id)) {
      return `${baseClass} bg-vibrant-red border-red-600 text-white shadow-xl scale-110 animate-pulse`;
    }
    
    if (seat.type === 'premium') {
      return `${baseClass} bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-800 hover:border-yellow-500 hover:shadow-xl hover:scale-105`;
    }
    
    return `${baseClass} bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800 hover:border-green-500 hover:shadow-xl hover:scale-105`;
  };

  const getSelectedSeatsData = () => {
    return selectedSeats.map(seatId => {
      const seat = seatLayout.flat().find(s => s.id === seatId);
      return seat;
    }).filter(Boolean);
  };

  const totalPrice = getSelectedSeatsData().reduce((sum, seat) => sum + (seat?.price || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            className="mb-6 border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => navigate(-1)} // ✅ Thêm onClick
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Chọn ghế của bạn</h1>
          <p className="text-gray-600 text-base md:text-lg">Phương Trang - TP. Hồ Chí Minh đến Đà Lạt </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-3">
            <Card className="shadow-elegant border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="text-center text-xl md:text-2xl">Sơ đồ xe</CardTitle>
                <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 rounded-lg"></div>
                    <span>VIP (150k₫)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg"></div>
                    <span>Premium (180k₫)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-vibrant-red rounded-lg"></div>
                    <span>Đã chọn</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-lg"></div>
                    <span>Đã đặt</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 md:px-8 py-8">
                {/* Driver area */}
                <div className="mb-12 text-center">
                  <div className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-xl text-base text-gray-700 shadow-md">
                    🚗 Tài xế
                  </div>
                </div>

                {/* Seat grid - 3 columns for VIP */}
                <div className="space-y-6 md:space-y-8">
                  {seatLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center items-center space-x-6 md:space-x-12">
                      {row.map((seat, seatIndex) => (
                        <div key={seat.id} className="relative">
                          <button
                            className={getSeatClassName(seat)}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'occupied'}
                          >
                            {selectedSeats.includes(seat.id) ? (
                              <Check className="h-6 w-6" />
                            ) : seat.status === 'occupied' ? (
                              <User className="h-5 w-5" />
                            ) : (
                              <>
                                <span className="text-sm font-black">{seat.number}</span>
                                <span className="text-xs opacity-90 font-bold">{seat.price.toLocaleString()}₫</span>
                              </>
                            )}
                          </button>
                          {/* Add spacing between first and second seat */}
                          {seatIndex === 0 && <div className="w-8 md:w-16"></div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-elegant border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tóm tắt đặt vé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">Chi tiết chuyến đi</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="font-medium">TP. Hồ Chí Minh → Đà Lạt</div>
                    <div>Hôm nay, 08:00 - 14:00</div>
                    <div>Phương Trang - VIP 18 Ghế</div>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">Ghế đã chọn</h4>
                    <div className="space-y-3">
                      {getSelectedSeatsData().map(seat => (
                        <div key={seat?.id} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                          <Badge variant={seat?.type === 'premium' ? 'default' : 'secondary'} className="bg-primary-green text-white">
                            {seat?.number} - {seat?.type === 'premium' ? 'Premium' : 'VIP'}
                          </Badge>
                          <span className="font-bold text-vibrant-red">{seat?.price.toLocaleString()}₫</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-3 text-base">
                    <span className="text-gray-600 font-medium">Ghế ({selectedSeats.length})</span>
                    <span className="font-bold">{totalPrice.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold bg-gradient-to-r from-green-50 to-red-50 p-4 rounded-lg">
                    <span>Tổng cộng</span>
                    <span className="text-vibrant-red">{totalPrice.toLocaleString()}₫</span>
                  </div>
                </div>

                <Button 
                  className="w-full gradient-green hover:opacity-90 text-white text-lg py-6" 
                  size="lg"
                  disabled={selectedSeats.length === 0}
                >
                  Tiếp tục thanh toán
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipSeatSelection;
