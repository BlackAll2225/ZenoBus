import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import scheduleService, { CreateScheduleData } from '@/services/scheduleService';
import { busService } from '@/services/busService';
import { routeService } from '@/services/routeService';
import { schedulePatternService, SchedulePattern } from '@/services/schedulePatternService';
import adminApi from '@/services/adminApi';
import driverService from '@/services/driverService';

interface CreateScheduleModalProps {
  onSuccess: () => void;
}

interface Bus {
  id: number;
  licensePlate: string;
  seatCount?: number;
  busType?: {
    id: number;
    name: string;
  };
}

interface Route {
  id: number;
  departureProvinceId: number;
  arrivalProvinceId: number;
  departureProvince?: {
    id: number;
    name: string;
  };
  arrivalProvince?: {
    id: number;
    name: string;
  };
}

interface Driver {
  id: number;
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [patterns, setPatterns] = useState<SchedulePattern[]>([]);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    busId: '',
    routeId: '',
    driverId: '',
    departureTime: '',
    price: '',
    patternId: '',
    usePattern: false
  });

  // Auto form state
  const [autoForm, setAutoForm] = useState({
    patternId: '',
    startDate: '',
    endDate: '',
    busId: '',
    driverId: '',
    priceOverride: ''
  });

  // Date picker state
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Load data
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load buses
      const busesData = await busService.getAllBuses();
      setBuses(busesData);

      // Load routes
      const routesResponse = await routeService.getAllRoutes();
      setRoutes(routesResponse.data);

             // Load drivers
       const driversData = await driverService.getActiveDrivers();
       setDrivers(driversData);

      // Load patterns
      const patternsData = await schedulePatternService.getAll({ isActive: true });
      setPatterns(patternsData);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualForm.busId || !manualForm.routeId || !manualForm.driverId || 
        !manualForm.departureTime || !manualForm.price) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (manualForm.usePattern && !manualForm.patternId) {
      toast.error('Vui lòng chọn mẫu lịch trình');
      return;
    }

    // Validate ngày khởi hành không được trong quá khứ
    const departureDateTime = new Date(manualForm.departureTime);
    const now = new Date();
    if (departureDateTime < now) {
      toast.error('Thời gian khởi hành không được trong quá khứ');
      return;
    }

    try {
      setLoading(true);
      
      // Ensure departureTime is in proper format
      let departureTime = manualForm.departureTime;
      console.log('Frontend departureTime:', departureTime);
      
      if (!departureTime || !departureTime.includes('T') || !departureTime.includes(':')) {
        throw new Error('Vui lòng chọn cả ngày và giờ khởi hành');
      }
      
      // Ensure format is YYYY-MM-DDTHH:mm (local time)
      if (departureTime.length === 16) { // YYYY-MM-DDTHH:mm
        departureTime = departureTime + ':00'; // Add seconds
      }
      
      console.log('Processed departureTime:', departureTime);
      
             const scheduleData: CreateScheduleData = {
         busId: parseInt(manualForm.busId),
         routeId: parseInt(manualForm.routeId),
         driverId: parseInt(manualForm.driverId),
         departureTime: departureTime,
         price: parseFloat(manualForm.price),
         patternId: manualForm.usePattern && manualForm.patternId ? parseInt(manualForm.patternId) : undefined
       };

      await scheduleService.createSchedule(scheduleData);
      
      toast.success('Tạo lịch trình thành công');
      setOpen(false);
      resetForms();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch trình';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate các trường bắt buộc
    if (!autoForm.patternId || !autoForm.startDate || !autoForm.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate xe bus bắt buộc
    if (!autoForm.busId || autoForm.busId === 'auto') {
      toast.error('Vui lòng chọn xe bus');
      return;
    }

    // Validate tài xế bắt buộc
    if (!autoForm.driverId || autoForm.driverId === 'auto') {
      toast.error('Vui lòng chọn tài xế');
      return;
    }

    // Validate ngày
    const startDate = new Date(autoForm.startDate);
    const endDate = new Date(autoForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error('Ngày bắt đầu không được nhỏ hơn ngày hiện tại');
      return;
    }

    if (endDate < startDate) {
      toast.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
      return;
    }

    // Kiểm tra khoảng cách ngày (tối đa 3 tháng)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      toast.error('Khoảng cách giữa ngày bắt đầu và kết thúc không được vượt quá 3 tháng');
      return;
    }

    try {
      setLoading(true);
      
      const bulkData = {
        patternId: parseInt(autoForm.patternId),
        startDate: autoForm.startDate,
        endDate: autoForm.endDate,
        busId: parseInt(autoForm.busId),
        driverId: parseInt(autoForm.driverId),
        priceOverride: autoForm.priceOverride ? parseFloat(autoForm.priceOverride) : undefined
      };

      const result = await scheduleService.bulkCreateSchedules(bulkData);
      
      toast.success(`Tạo thành công ${result.created} lịch trình`);
      setOpen(false);
      resetForms();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating schedules:', error);
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch trình';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
         setManualForm({
       busId: '',
       routeId: '',
       driverId: '',
       departureTime: '',
       price: '',
       patternId: 'none',
       usePattern: false
     });
     setAutoForm({
       patternId: '',
       startDate: '',
       endDate: '',
       busId: '',
       driverId: '',
       priceOverride: ''
     });
    setDepartureDate(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Lọc xe bus theo busTypeId từ pattern được chọn
  const getFilteredBuses = () => {
    if (!manualForm.usePattern || !manualForm.patternId || manualForm.patternId === 'none') {
      return buses;
    }
    
    const selectedPattern = patterns.find(p => p.id.toString() === manualForm.patternId);
    if (!selectedPattern || !selectedPattern.busTypeId) {
      return buses;
    }
    
    return buses.filter(bus => bus.busType?.id === selectedPattern.busTypeId);
  };

  // Xử lý thay đổi pattern
  const handlePatternChange = (value: string) => {
    setManualForm({
      ...manualForm, 
      patternId: value,
      busId: '' // Reset bus selection khi đổi pattern
    });
  };

  // Xử lý toggle switch sử dụng pattern
  const handleUsePatternChange = (usePattern: boolean) => {
    setManualForm({
      ...manualForm,
      usePattern,
      patternId: usePattern ? '' : 'none',
      busId: '' // Reset bus selection
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo Lịch Trình
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Lịch Trình Mới</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Thủ Công</TabsTrigger>
            <TabsTrigger value="auto">Tự Động</TabsTrigger>
          </TabsList>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Switch sử dụng mẫu */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-pattern"
                  checked={manualForm.usePattern}
                  onCheckedChange={handleUsePatternChange}
                />
                <Label htmlFor="use-pattern">Sử dụng mẫu lịch trình</Label>
              </div>

              {/* Chọn mẫu lịch trình nếu bật switch */}
              {manualForm.usePattern && (
                <div>
                  <Label htmlFor="manual-pattern">Mẫu Lịch Trình *</Label>
                  <Select 
                    value={manualForm.patternId} 
                    onValueChange={handlePatternChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mẫu lịch trình" />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((pattern) => (
                        <SelectItem key={pattern.id} value={pattern.id.toString()}>
                          {pattern.name} - {formatPrice(pattern.basePrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-bus">Xe Bus *</Label>
                  <Select 
                    value={manualForm.busId} 
                    onValueChange={(value) => setManualForm({...manualForm, busId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredBuses().map((bus) => (
                        <SelectItem key={bus.id} value={bus.id.toString()}>
                          {bus.licensePlate} ({bus.busType?.name || 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {manualForm.usePattern && manualForm.patternId && (
                    <p className="text-sm text-gray-500 mt-1">
                      Xe được lọc theo loại xe của mẫu lịch trình
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="manual-route">Tuyến Đường *</Label>
                  <Select 
                    value={manualForm.routeId} 
                    onValueChange={(value) => setManualForm({...manualForm, routeId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tuyến đường" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.departureProvince.name} → {route.arrivalProvince.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="manual-driver">Tài Xế *</Label>
                  <Select 
                    value={manualForm.driverId} 
                    onValueChange={(value) => setManualForm({...manualForm, driverId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tài xế" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.fullName} ({driver.phoneNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="manual-price">Giá Vé (VND) *</Label>
                  <Input
                    id="manual-price"
                    type="number"
                    placeholder="Nhập giá vé"
                    value={manualForm.price}
                    onChange={(e) => setManualForm({...manualForm, price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="manual-departure-time">Thời Gian Khởi Hành *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={(date) => {
                          setDepartureDate(date);
                          if (date) {
                            const time = manualForm.departureTime.split('T')[1] || '08:00';
                            setManualForm({
                              ...manualForm, 
                              departureTime: `${format(date, 'yyyy-MM-dd')}T${time}`
                            });
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          date.setHours(0,0,0,0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={manualForm.departureTime.split('T')[1] || ''}
                    onChange={(e) => {
                      const date = manualForm.departureTime.split('T')[0] || format(new Date(), 'yyyy-MM-dd');
                      setManualForm({
                        ...manualForm, 
                        departureTime: `${date}T${e.target.value}`
                      });
                    }}
                    className="w-32"
                  />
                </div>
              </div>



              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo Lịch Trình
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Auto Tab */}
          <TabsContent value="auto" className="space-y-4">
            <form onSubmit={handleAutoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="auto-pattern">Mẫu Lịch Trình *</Label>
                <Select 
                  value={autoForm.patternId} 
                  onValueChange={(value) => setAutoForm({...autoForm, patternId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mẫu lịch trình" />
                  </SelectTrigger>
                  <SelectContent>
                    {patterns.map((pattern) => (
                      <SelectItem key={pattern.id} value={pattern.id.toString()}>
                        {pattern.name} - {formatPrice(pattern.basePrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auto-start-date">Ngày Bắt Đầu *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          if (date) {
                            setAutoForm({...autoForm, startDate: format(date, 'yyyy-MM-dd')});
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="auto-end-date">Ngày Kết Thúc *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          if (date) {
                            setAutoForm({...autoForm, endDate: format(date, 'yyyy-MM-dd')});
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auto-bus">Xe Bus *</Label>
                  <Select 
                    value={autoForm.busId} 
                    onValueChange={(value) => setAutoForm({...autoForm, busId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id.toString()}>
                          {bus.licensePlate} ({bus.busType?.name || 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="auto-driver">Tài Xế *</Label>
                  <Select 
                    value={autoForm.driverId} 
                    onValueChange={(value) => setAutoForm({...autoForm, driverId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tài xế" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.fullName} ({driver.phoneNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="auto-price-override">Ghi Đè Giá (Tùy chọn)</Label>
                <Input
                  id="auto-price-override"
                  type="number"
                  placeholder="Để trống để sử dụng giá từ mẫu"
                  value={autoForm.priceOverride}
                  onChange={(e) => setAutoForm({...autoForm, priceOverride: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo Lịch Trình Tự Động
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleModal; 