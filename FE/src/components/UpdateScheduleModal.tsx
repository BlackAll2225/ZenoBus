import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import scheduleService, { Schedule, UpdateScheduleData } from '@/services/scheduleService';
import api from '@/services/api';
import { convertUTCStringToVNDateTime } from '@/lib/dateUtils';

// Định nghĩa type cho dropdown
interface DropdownRoute {
  id: number;
  departureProvince: string | { name: string };
  arrivalProvince: string | { name: string };
  distanceKm?: number;
  estimatedTime?: number;
}
interface DropdownBus {
  id: number;
  licensePlate: string;
  seatCount: number;
  description?: string;
  busType?: { id?: number; name: string };
}
interface DropdownDriver {
  id: number;
  fullName: string;
  phoneNumber: string;
  licenseNumber?: string;
}

interface UpdateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onUpdate: () => void;
}

const UpdateScheduleModal: React.FC<UpdateScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    driverId: '',
    departureTime: '',
    price: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'delayed'
  });

  // Dropdown data
  const [drivers, setDrivers] = useState<DropdownDriver[]>([]);
  const [buses, setBuses] = useState<DropdownBus[]>([]);
  const [routes, setRoutes] = useState<DropdownRoute[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (schedule) {
      // Convert UTC time from API to VN datetime input format
      const vnDateTime = convertUTCStringToVNDateTime(schedule.departureTime);

      setFormData({
        busId: schedule.busId.toString(),
        routeId: schedule.routeId.toString(),
        driverId: schedule.driverId.toString(),
        departureTime: vnDateTime,
        price: schedule.price.toString(),
        status: schedule.status
      });
    }
  }, [schedule]);

  const loadDropdownData = async () => {
    setDataLoading(true);
    try {
      const [driversRes, busesRes, routesRes] = await Promise.all([
        api.get('/drivers/active'),
        api.get('/buses'),
        api.get('/routes')
      ]);

      setDrivers(driversRes.data.data || driversRes.data);
      setBuses(busesRes.data.data || busesRes.data);
      setRoutes(routesRes.data.data || routesRes.data);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu dropdown. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schedule) return;

    // Validate required fields
    if (!formData.busId || !formData.routeId || !formData.driverId || 
        !formData.departureTime || !formData.price) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Note: scheduleService.updateSchedule will handle VN to UTC conversion
      const updateData: UpdateScheduleData = {
        busId: parseInt(formData.busId),
        routeId: parseInt(formData.routeId),
        driverId: parseInt(formData.driverId),
        departureTime: formData.departureTime, // Will be converted to UTC by scheduleService
        price: parseFloat(formData.price),
        status: formData.status as 'scheduled' | 'completed' | 'cancelled' | 'delayed'
      };

      console.log('Update form data (VN time):', formData);
      
      await scheduleService.updateSchedule(schedule.id, updateData);

      toast({
        title: 'Thành công',
        description: 'Cập nhật lịch trình thành công.',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi cập nhật lịch trình.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      busId: '',
      routeId: '',
      driverId: '',
      departureTime: '',
      price: '',
      status: 'scheduled'
    });
    onClose();
  };

  if (!schedule) return null;

  // Helper function to safely get province name
  const getProvinceName = (province: unknown) => {
    if (typeof province === 'string') return province;
    if (province && typeof province === 'object' && 'name' in province) {
      return (province as { name: string }).name;
    }
    return '-';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa lịch trình #{schedule.id}</DialogTitle>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Info Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Thông tin hiện tại:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Tuyến đường:</span> {getProvinceName(schedule.route?.departureProvince)} → {getProvinceName(schedule.route?.arrivalProvince)}
                </div>
                <div>
                  <span className="font-medium">Xe:</span> {schedule.bus?.licensePlate} ({schedule.bus?.busType?.name})
                </div>
                <div>
                  <span className="font-medium">Tài xế:</span> {schedule.driver?.fullName}
                </div>
                <div>
                  <span className="font-medium">Trạng thái:</span> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {schedule.status === 'scheduled' ? 'Đã lên lịch' :
                     schedule.status === 'completed' ? 'Hoàn thành' :
                     schedule.status === 'cancelled' ? 'Đã hủy' : 'Trễ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Route Selection */}
              <div className="space-y-2">
                <Label htmlFor="routeId">Tuyến đường *</Label>
                <Select value={formData.routeId} onValueChange={(value) => handleInputChange('routeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tuyến đường" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {getProvinceName(route.departureProvince)} → {getProvinceName(route.arrivalProvince)} ({route.distanceKm}km, {route.estimatedTime}p)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bus Selection */}
              <div className="space-y-2">
                <Label htmlFor="busId">Xe khách *</Label>
                <Select value={formData.busId} onValueChange={(value) => handleInputChange('busId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {bus.licensePlate} - {bus.busType?.name} ({bus.seatCount} ghế)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Driver Selection */}
              <div className="space-y-2">
                <Label htmlFor="driverId">Tài xế *</Label>
                <Select value={formData.driverId} onValueChange={(value) => handleInputChange('driverId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.fullName} - {driver.phoneNumber} (GPLX: {driver.licenseNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="delayed">Trễ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Departure Time */}
              <div className="space-y-2">
                <Label htmlFor="departureTime">Thời gian khởi hành (VN) *</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => handleInputChange('departureTime', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Giá vé (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Nhập giá vé"
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật lịch trình
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateScheduleModal; 