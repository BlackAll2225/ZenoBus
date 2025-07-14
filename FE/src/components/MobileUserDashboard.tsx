
import { useState } from 'react';
import { Calendar, Clock, MapPin, Ticket, User, FileText, Settings, X, QrCode, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Booking {
  id: string;
  bookingCode: string;
  operator: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  qrCode?: string;
}

const MobileUserDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      bookingCode: 'BUS2024120001',
      operator: 'Phương Trang',
      from: 'Ho Chi Minh City',
      to: 'Da Lat',
      date: '2024-12-05',
      time: '08:00',
      seats: ['3A', '3B'],
      status: 'confirmed',
      price: 240000,
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+PC9zdmc+'
    },
    {
      id: '2',
      bookingCode: 'BUS2024120002',
      operator: 'Sinh Tourist',
      from: 'Ha Noi',
      to: 'Da Nang',
      date: '2024-12-15',
      time: '22:00',
      seats: ['5C'],
      status: 'pending',
      price: 250000
    },
    {
      id: '3',
      bookingCode: 'BUS2024110003',
      operator: 'Phương Trang',
      from: 'Ho Chi Minh City',
      to: 'Can Tho',
      date: '2024-11-20',
      time: '14:30',
      seats: ['2A'],
      status: 'confirmed',
      price: 80000
    }
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
    setShowCancelDialog(false);
  };

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.date) >= new Date() && booking.status !== 'cancelled'
  );

  const pastBookings = bookings.filter(booking => 
    new Date(booking.date) < new Date() || booking.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-sm text-gray-600">Manage your trips and tickets</p>
      </div>

      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Ticket className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800">{upcomingBookings.length}</div>
              <div className="text-xs text-gray-600">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800">{bookings.length}</div>
              <div className="text-xs text-gray-600">Total Trips</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
            <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{booking.operator}</div>
                        <div className="text-xs text-gray-500">#{booking.bookingCode}</div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{booking.from}</span>
                        </div>
                        <span className="text-xs text-gray-500">{booking.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{booking.to}</span>
                        </div>
                        <span className="text-xs text-gray-500">{booking.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Seats</div>
                        <div className="text-sm font-semibold">{booking.seats.join(', ')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-sm font-semibold text-orange-600">{booking.price.toLocaleString()}₫</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setSelectedBooking(booking)}>
                            <QrCode className="h-3 w-3 mr-1" />
                            E-Ticket
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh]">
                          <SheetHeader>
                            <SheetTitle>E-Ticket</SheetTitle>
                            <SheetDescription>
                              Your electronic ticket for {booking.operator}
                            </SheetDescription>
                          </SheetHeader>
                          {selectedBooking && (
                            <div className="mt-6 space-y-4">
                              <Card>
                                <CardHeader className="text-center">
                                  <CardTitle className="text-lg">{selectedBooking.operator}</CardTitle>
                                  <p className="text-sm text-gray-600">Booking Code: {selectedBooking.bookingCode}</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm font-medium">{selectedBooking.from}</p>
                                      <p className="text-xs text-gray-500">{selectedBooking.time}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{selectedBooking.to}</p>
                                      <p className="text-xs text-gray-500">{selectedBooking.date}</p>
                                    </div>
                                  </div>
                                  <div className="text-center border-t border-b py-4">
                                    <p className="text-sm">Seats: <span className="font-semibold">{selectedBooking.seats.join(', ')}</span></p>
                                    <p className="text-lg font-bold text-orange-600 mt-2">{selectedBooking.price.toLocaleString()}₫</p>
                                  </div>
                                  {selectedBooking.qrCode && (
                                    <div className="text-center">
                                      <img src={selectedBooking.qrCode} alt="QR Code" className="w-32 h-32 mx-auto mb-2" />
                                      <p className="text-xs text-gray-500">Show this QR code when boarding</p>
                                    </div>
                                  )}
                                  <Button className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                      
                      {booking.status === 'confirmed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelDialog(true);
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No upcoming trips</h3>
                  <p className="text-gray-500 mb-4 text-sm">Ready to plan your next journey?</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">Book New Trip</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-75 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{booking.operator}</div>
                      <div className="text-xs text-gray-500">#{booking.bookingCode}</div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{booking.from} → {booking.to}</span>
                      </div>
                      <span className="text-xs text-gray-500">{booking.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500">Seats: {booking.seats.join(', ')}</div>
                    </div>
                    <div className="text-sm font-semibold text-orange-600">{booking.price.toLocaleString()}₫</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Cancel Confirmation Dialog */}
        {showCancelDialog && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Cancel Booking?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to cancel your booking for {selectedBooking.operator} on {selectedBooking.date}?
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowCancelDialog(false)}
                  >
                    Keep Booking
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                  >
                    Cancel Trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileUserDashboard;
