import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Bus, Users, Car, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { routeService, Trip, SearchTripsResponse } from '@/services/routeService';
import { useToast } from '@/hooks/use-toast';

interface TripSearchProps {
  departureProvinceId?: number;
  arrivalProvinceId?: number;
  departureDate?: string;
}

const TripSearch = ({ departureProvinceId, arrivalProvinceId, departureDate }: TripSearchProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useState<SearchTripsResponse | null>(null);

  useEffect(() => {
    if (departureProvinceId && arrivalProvinceId && departureDate) {
      searchTrips();
    }
  }, [departureProvinceId, arrivalProvinceId, departureDate]);

  const searchTrips = async () => {
    if (!departureProvinceId || !arrivalProvinceId || !departureDate) return;

    setLoading(true);
    try {
      const result = await routeService.searchTrips(
        departureProvinceId,
        arrivalProvinceId,
        departureDate
      );
      setSearchResults(result.trips);
      setSearchInfo(result);
    } catch (error) {
      console.error('Error searching trips:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tìm kiếm chuyến xe. Vui lòng thử lại.",
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

  return (
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

        {/* Search Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Kết quả tìm kiếm chuyến xe
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {searchInfo ? (
                  `${searchInfo.searchCriteria.departureProvince.name} → ${searchInfo.searchCriteria.arrivalProvince.name}`
                ) : (
                  `${departureProvinceId ? `Tỉnh ${departureProvinceId}` : 'Chưa chọn điểm đi'} → ${arrivalProvinceId ? `Tỉnh ${arrivalProvinceId}` : 'Chưa chọn điểm đến'}`
                )}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {departureDate ? formatDate(departureDate) : 'Chưa chọn ngày'}
              </div>
              <Badge variant="secondary">
                {loading ? 'Đang tìm kiếm...' : `${searchResults.length} chuyến xe`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tìm kiếm chuyến xe...</span>
          </div>
        )}

        {/* No Results */}
        {!loading && searchResults.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy chuyến xe</h3>
              <p className="text-gray-600 mb-4">
                Không có chuyến xe nào phù hợp với tiêu chí tìm kiếm của bạn.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại tìm kiếm
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((trip) => (
              <Card key={trip.scheduleId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Trip Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bus className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-lg">{trip.bus.busType.name}</span>
                          <Badge variant="outline">{trip.bus.licensePlate}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{formatPrice(trip.price)}</div>
                          <div className="text-sm text-gray-500">mỗi người</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                              Thời gian: {formatDuration(trip.route.estimatedTime)}
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{trip.bus.seatCount} ghế</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4" />
                          <span>{trip.bus.busType.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{trip.driver.fullName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-2">
                      <Button asChild className="w-full">
                        <Link to={`/trips/select-seats?scheduleId=${trip.scheduleId}`}>
                          Chọn ghế
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripSearch;
