import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2,
  Clock,
  MapPin,
  Bus,
  DollarSign,
  Calendar,
  Info
} from 'lucide-react';
import { SchedulePattern, SchedulePatternInput } from '@/services/schedulePatternService';
import { routeService } from '@/services/routeService';
import { busTypeService } from '@/services/busTypeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';



interface Route {
  id: number;
  departureProvinceId: number;
  arrivalProvinceId: number;
  departureProvince?: {
    id: number;
    name: string;
    code: string;
  };
  arrivalProvince?: {
    id: number;
    name: string;
    code: string;
  };
}

interface BusType {
  id: number;
  name: string;
}

interface PatternFormProps {
  pattern?: SchedulePattern;
  onSave: (pattern: SchedulePatternInput) => void;
  onCancel: () => void;
}

const PatternForm: React.FC<PatternFormProps> = ({
  pattern,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<SchedulePatternInput>({
    name: '',
    description: '',
    routeId: 0,
    busTypeId: 0,
    departureTimes: '[]',
    daysOfWeek: '',
    basePrice: 0,
    isActive: true
  });

  const [departureTimes, setDepartureTimes] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [routes, setRoutes] = useState<Route[]>([]);
  const [busTypes, setBusTypes] = useState<BusType[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [routesResponse, busTypesData] = await Promise.all([
          routeService.getAllRoutes(),
          busTypeService.getAllBusTypes()
        ]);
        const routesData = routesResponse.data;
        setRoutes(routesData);
        setBusTypes(busTypesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const daysOfWeek = [
    { id: 1, name: 'Thứ 2', short: 'T2' },
    { id: 2, name: 'Thứ 3', short: 'T3' },
    { id: 3, name: 'Thứ 4', short: 'T4' },
    { id: 4, name: 'Thứ 5', short: 'T5' },
    { id: 5, name: 'Thứ 6', short: 'T6' },
    { id: 6, name: 'Thứ 7', short: 'T7' },
    { id: 7, name: 'Chủ nhật', short: 'CN' },
  ];

  useEffect(() => {
    if (pattern) {
      setFormData(pattern);
      
      // Parse departure times
      try {
        const times = JSON.parse(pattern.departureTimes);
        setDepartureTimes(times);
      } catch {
        setDepartureTimes([]);
      }
      
      // Parse days of week
      const days = pattern.daysOfWeek.split(',').map(d => parseInt(d.trim()));
      setSelectedDays(days);
    }
  }, [pattern]);

  const handleInputChange = (field: keyof SchedulePattern, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addDepartureTime = () => {
    if (newTime && !departureTimes.includes(newTime)) {
      const updatedTimes = [...departureTimes, newTime].sort();
      setDepartureTimes(updatedTimes);
      setFormData(prev => ({
        ...prev,
        departureTimes: JSON.stringify(updatedTimes)
      }));
      setNewTime('');
    }
  };

  const removeDepartureTime = (time: string) => {
    const updatedTimes = departureTimes.filter(t => t !== time);
    setDepartureTimes(updatedTimes);
    setFormData(prev => ({
      ...prev,
      departureTimes: JSON.stringify(updatedTimes)
    }));
  };

  const toggleDay = (dayId: number) => {
    const updatedDays = selectedDays.includes(dayId)
      ? selectedDays.filter(d => d !== dayId)
      : [...selectedDays, dayId].sort();
    
    setSelectedDays(updatedDays);
    setFormData(prev => ({
      ...prev,
      daysOfWeek: updatedDays.join(',')
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên mẫu lịch trình là bắt buộc';
    }

    if (!formData.routeId) {
      newErrors.routeId = 'Vui lòng chọn tuyến đường';
    }

    if (!formData.busTypeId) {
      newErrors.busTypeId = 'Vui lòng chọn loại xe';
    }

    if (departureTimes.length === 0) {
      newErrors.departureTimes = 'Vui lòng thêm ít nhất một giờ khởi hành';
    }

    if (selectedDays.length === 0) {
      newErrors.daysOfWeek = 'Vui lòng chọn ít nhất một ngày trong tuần';
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = 'Giá cơ bản phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving pattern:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedRoute = () => {
    return routes.find(r => r.id === formData.routeId);
  };

  const getSelectedBusType = () => {
    return busTypes.find(bt => bt.id === formData.busTypeId);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {pattern ? 'Chỉnh sửa mẫu lịch trình' : 'Tạo mẫu lịch trình mới'}
          </h2>
          <p className="text-gray-600">
            {pattern ? 'Cập nhật thông tin mẫu lịch trình' : 'Tạo mẫu lịch trình tự động cho hệ thống'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên mẫu lịch trình *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="VD: Hà Nội - Hồ Chí Minh (Hàng ngày)"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Giá cơ bản (VNĐ) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseInt(e.target.value) || 0)}
                  placeholder="350000"
                  className={errors.basePrice ? 'border-red-500' : ''}
                />
                {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về mẫu lịch trình..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Kích hoạt mẫu lịch trình</Label>
            </div>
          </CardContent>
        </Card>

        {/* Route and Bus Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Tuyến đường và loại xe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="routeId">Tuyến đường *</Label>
                <Select 
                  value={formData.routeId.toString()} 
                  onValueChange={(value) => handleInputChange('routeId', parseInt(value))}
                >
                  <SelectTrigger className={errors.routeId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn tuyến đường" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map(route => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.departureProvince?.name} → {route.arrivalProvince?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.routeId && <p className="text-sm text-red-500">{errors.routeId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="busTypeId">Loại xe *</Label>
                <Select 
                  value={formData.busTypeId.toString()} 
                  onValueChange={(value) => handleInputChange('busTypeId', parseInt(value))}
                >
                  <SelectTrigger className={errors.busTypeId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {busTypes.map(busType => (
                      <SelectItem key={busType.id} value={busType.id.toString()}>
                        {busType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.busTypeId && <p className="text-sm text-red-500">{errors.busTypeId}</p>}
              </div>
            </div>

            {/* Preview */}
            {formData.routeId && formData.busTypeId && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Xem trước:</strong> {getSelectedRoute()?.departureProvince?.name} → {getSelectedRoute()?.arrivalProvince?.name} 
                  bằng {getSelectedBusType()?.name} với giá {formData.basePrice.toLocaleString()}₫
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Departure Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Giờ khởi hành
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addDepartureTime}
                disabled={!newTime}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm
              </Button>
            </div>

            {departureTimes.length > 0 && (
              <div className="space-y-2">
                <Label>Danh sách giờ khởi hành ({departureTimes.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {departureTimes.map(time => (
                    <Badge key={time} variant="secondary" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeDepartureTime(time)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {errors.departureTimes && <p className="text-sm text-red-500">{errors.departureTimes}</p>}
          </CardContent>
        </Card>

        {/* Days of Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Ngày trong tuần
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map(day => (
                <Button
                  key={day.id}
                  type="button"
                  variant={selectedDays.includes(day.id) ? "default" : "outline"}
                  className="flex flex-col items-center p-2 h-16"
                  onClick={() => toggleDay(day.id)}
                >
                  <span className="text-xs">{day.short}</span>
                  <span className="text-xs">{day.name}</span>
                </Button>
              ))}
            </div>

            {selectedDays.length > 0 && (
              <div className="space-y-2">
                <Label>Đã chọn ({selectedDays.length} ngày)</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDays.map(dayId => {
                    const day = daysOfWeek.find(d => d.id === dayId);
                    return (
                      <Badge key={dayId} variant="secondary">
                        {day?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {errors.daysOfWeek && <p className="text-sm text-red-500">{errors.daysOfWeek}</p>}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {pattern ? 'Cập nhật' : 'Tạo mẫu'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatternForm; 