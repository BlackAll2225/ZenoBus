import { useState, useEffect } from 'react';
import { MapPin, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { stopService, Stop } from '@/services/stopService';
import { useToast } from '@/hooks/use-toast';

interface StopSelectionProps {
  departureProvinceId: number;
  arrivalProvinceId: number;
  onPickupStopChange: (stop: Stop | null) => void;
  onDropoffStopChange: (stop: Stop | null) => void;
  selectedPickupStop?: Stop | null;
  selectedDropoffStop?: Stop | null;
}

const StopSelection = ({
  departureProvinceId,
  arrivalProvinceId,
  onPickupStopChange,
  onDropoffStopChange,
  selectedPickupStop,
  selectedDropoffStop
}: StopSelectionProps) => {
  console.log('🚀 StopSelection component mounted!');
  console.log('Props:', { departureProvinceId, arrivalProvinceId });
  
  const { toast } = useToast();
  const [pickupStops, setPickupStops] = useState<Stop[]>([]);
  const [dropoffStops, setDropoffStops] = useState<Stop[]>([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDropoff, setLoadingDropoff] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('StopSelection component mounted with props:', {
      departureProvinceId,
      arrivalProvinceId,
      selectedPickupStop,
      selectedDropoffStop
    });
  }, [departureProvinceId, arrivalProvinceId, selectedPickupStop, selectedDropoffStop]);

  // Fetch pickup stops
  useEffect(() => {
    const fetchPickupStops = async () => {
      setLoadingPickup(true);
      try {
        const stops = await stopService.getStopsByProvince(departureProvinceId);
        const pickupStops = stops.filter(stop => stop.type === 'pickup');
        setPickupStops(pickupStops);
      } catch (error) {
        console.error('Error fetching pickup stops:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách điểm đón. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setLoadingPickup(false);
      }
    };

    if (departureProvinceId) {
      fetchPickupStops();
    }
  }, [departureProvinceId, toast]);

  // Fetch dropoff stops
  useEffect(() => {
    const fetchDropoffStops = async () => {
      setLoadingDropoff(true);
      try {
        const stops = await stopService.getStopsByProvince(arrivalProvinceId);
        const dropoffStops = stops.filter(stop => stop.type === 'dropoff');
        setDropoffStops(dropoffStops);
      } catch (error) {
        console.error('Error fetching dropoff stops:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách điểm trả. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setLoadingDropoff(false);
      }
    };

    if (arrivalProvinceId) {
      fetchDropoffStops();
    }
  }, [arrivalProvinceId, toast]);

  const handlePickupStopSelect = (stop: Stop) => {
    onPickupStopChange(stop);
    setShowPickupDropdown(false);
  };

  const handleDropoffStopSelect = (stop: Stop) => {
    onDropoffStopChange(stop);
    setShowDropoffDropdown(false);
  };

  const handlePickupStopClear = () => {
    onPickupStopChange(null);
  };

  const handleDropoffStopClear = () => {
    onDropoffStopChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Chọn điểm đón/trả
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pickup Stop Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Điểm đón</label>
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowPickupDropdown(!showPickupDropdown)}
              disabled={loadingPickup || pickupStops.length === 0}
            >
              {loadingPickup ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : selectedPickupStop ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-left">{selectedPickupStop.name}</span>
                  {selectedPickupStop.address && (
                    <span className="text-gray-500 text-sm">({selectedPickupStop.address})</span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">
                  {pickupStops.length === 0 ? 'Không có điểm đón' : 'Chọn điểm đón'}
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showPickupDropdown && pickupStops.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {pickupStops.map((stop) => (
                  <button
                    key={stop.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handlePickupStopSelect(stop)}
                  >
                    <div className="font-medium">{stop.name}</div>
                    {stop.address && (
                      <div className="text-sm text-gray-500">{stop.address}</div>
                    )}
                    <Badge variant="secondary" className="mt-1">
                      {stop.provinceName}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedPickupStop && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600 hover:text-red-700"
                onClick={handlePickupStopClear}
              >
                Xóa lựa chọn
              </Button>
            )}
          </div>
        </div>

        {/* Dropoff Stop Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Điểm trả</label>
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowDropoffDropdown(!showDropoffDropdown)}
              disabled={loadingDropoff || dropoffStops.length === 0}
            >
              {loadingDropoff ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : selectedDropoffStop ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-left">{selectedDropoffStop.name}</span>
                  {selectedDropoffStop.address && (
                    <span className="text-gray-500 text-sm">({selectedDropoffStop.address})</span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">
                  {dropoffStops.length === 0 ? 'Không có điểm trả' : 'Chọn điểm trả'}
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showDropoffDropdown && dropoffStops.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {dropoffStops.map((stop) => (
                  <button
                    key={stop.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleDropoffStopSelect(stop)}
                  >
                    <div className="font-medium">{stop.name}</div>
                    {stop.address && (
                      <div className="text-sm text-gray-500">{stop.address}</div>
                    )}
                    <Badge variant="secondary" className="mt-1">
                      {stop.provinceName}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedDropoffStop && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600 hover:text-red-700"
                onClick={handleDropoffStopClear}
              >
                Xóa lựa chọn
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StopSelection; 