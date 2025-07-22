import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  RefreshCw, 
  User, 
  Phone, 
  CreditCard, 
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import driverService, { 
  Driver, 
  CreateDriverData, 
  UpdateDriverData, 
  DriverFilters 
} from '@/services/driverService';

const AdminDriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DriverFilters>({});
  const [sortBy, setSortBy] = useState<'fullName' | 'phoneNumber' | 'licenseNumber' | 'hireDate' | 'isActive'>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverSchedules, setDriverSchedules] = useState<{
    id: number;
    departureTime: string;
    route: {
      departureProvince: string;
      arrivalProvince: string;
    };
    bus: {
      licensePlate: string;
    };
  }[]>([]);
  const [checkingSchedules, setCheckingSchedules] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState<CreateDriverData>({
    fullName: '',
    phoneNumber: '',
    licenseNumber: '',
    hireDate: undefined
  });
  const [editFormData, setEditFormData] = useState<UpdateDriverData>({});
  const [formLoading, setFormLoading] = useState(false);

  // Form errors
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  // Load drivers
  const loadDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await driverService.getAllDrivers(filters);
      
      // Sort drivers
      const sortedDrivers = [...driversData].sort((a, b) => {
        let aValue: string | number | boolean;
        let bValue: string | number | boolean;
        
        switch (sortBy) {
          case 'fullName':
            aValue = a.fullName?.toLowerCase() || '';
            bValue = b.fullName?.toLowerCase() || '';
            break;
          case 'phoneNumber':
            aValue = a.phoneNumber || '';
            bValue = b.phoneNumber || '';
            break;
          case 'licenseNumber':
            aValue = a.licenseNumber || '';
            bValue = b.licenseNumber || '';
            break;
          case 'hireDate':
            aValue = a.hireDate ? new Date(a.hireDate).getTime() : 0;
            bValue = b.hireDate ? new Date(b.hireDate).getTime() : 0;
            break;
          case 'isActive':
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
            break;
          default:
            aValue = a.fullName?.toLowerCase() || '';
            bValue = b.fullName?.toLowerCase() || '';
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setDrivers(sortedDrivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tài xế',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [filters, sortBy, sortOrder]);

  // Validate create form
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!createFormData.fullName?.trim()) {
      errors.fullName = 'Họ tên là bắt buộc';
    }

    if (!createFormData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(createFormData.phoneNumber.trim())) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!createFormData.licenseNumber?.trim()) {
      errors.licenseNumber = 'Số giấy phép lái xe là bắt buộc';
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate edit form
  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (editFormData.fullName !== undefined && !editFormData.fullName?.trim()) {
      errors.fullName = 'Họ tên không được để trống';
    }

    if (editFormData.phoneNumber !== undefined && !editFormData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (editFormData.phoneNumber && !/^[0-9]{10,11}$/.test(editFormData.phoneNumber.trim())) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (editFormData.licenseNumber !== undefined && !editFormData.licenseNumber?.trim()) {
      errors.licenseNumber = 'Số giấy phép lái xe không được để trống';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create driver
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCreateForm()) return;

    try {
      setFormLoading(true);
      await driverService.createDriver(createFormData);
      
      toast({
        title: 'Thành công',
        description: 'Tạo tài xế mới thành công'
      });
      
      setShowCreateDialog(false);
      resetCreateForm();
      loadDrivers();
    } catch (error) {
      console.error('Error creating driver:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo tài xế mới',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update driver
  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDriver || !validateEditForm()) return;

    // Check if trying to deactivate driver with active schedules
    const isDeactivating = selectedDriver.isActive && editFormData.isActive === false;
    if (isDeactivating && driverSchedules.length > 0) {
      const confirmed = window.confirm(
        `Tài xế ${selectedDriver.fullName} có ${driverSchedules.length} chuyến đi sắp tới. ` +
        'Việc vô hiệu hóa tài xế có thể ảnh hưởng đến các chuyến đi này. Bạn có chắc chắn muốn tiếp tục?'
      );
      if (!confirmed) return;
    }

    try {
      setFormLoading(true);
      await driverService.updateDriver(selectedDriver.id, editFormData);
      
      toast({
        title: 'Thành công',
        description: 'Cập nhật tài xế thành công'
      });
      
      setShowEditDialog(false);
      resetEditForm();
      setDriverSchedules([]);
      loadDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật tài xế',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };



  // Reset forms
  const resetCreateForm = () => {
    setCreateFormData({
      fullName: '',
      phoneNumber: '',
      licenseNumber: '',
      hireDate: undefined
    });
    setCreateErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({});
    setEditErrors({});
    setSelectedDriver(null);
    setDriverSchedules([]);
  };

  // Check driver schedules
  const checkDriverSchedules = async (driverId: number) => {
    try {
      setCheckingSchedules(true);
      const schedules = await driverService.getDriverSchedules(driverId);
      setDriverSchedules(schedules);
      return schedules.length > 0;
    } catch (error) {
      console.error('Error checking driver schedules:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra chuyến đi của tài xế',
        variant: 'destructive'
      });
      return false;
    } finally {
      setCheckingSchedules(false);
    }
  };

  // Open edit dialog
  const openEditDialog = async (driver: Driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      hireDate: driver.hireDate,
      isActive: driver.isActive
    });
    
    // Check if driver has active schedules
    await checkDriverSchedules(driver.id);
    
    setShowEditDialog(true);
  };

  // Handle sorting
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? (
          <>
            <UserCheck className="h-3 w-3 mr-1" />
            Hoạt động
          </>
        ) : (
          <>
            <UserX className="h-3 w-3 mr-1" />
            Không hoạt động
          </>
        )}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài xế</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin tài xế trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDrivers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Thêm tài xế
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <p className="text-xs text-muted-foreground">Tổng tài xế</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {drivers.filter(d => d.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {drivers.filter(d => !d.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">Không hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên, SĐT, số giấy phép..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                onValueChange={(value) => setFilters({ 
                  ...filters, 
                  isActive: value === 'all' ? undefined : value === 'true' 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài xế ({drivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      Họ tên
                      {getSortIcon('fullName')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('phoneNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Số điện thoại
                      {getSortIcon('phoneNumber')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('licenseNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Số giấy phép
                      {getSortIcon('licenseNumber')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('hireDate')}
                  >
                    <div className="flex items-center gap-1">
                      Ngày tuyển dụng
                      {getSortIcon('hireDate')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center gap-1">
                      Trạng thái
                      {getSortIcon('isActive')}
                    </div>
                  </TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="font-medium">{driver.fullName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {driver.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        {driver.licenseNumber}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(driver.hireDate)}</TableCell>
                    <TableCell>{getStatusBadge(driver.isActive)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(driver)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Driver Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tài xế mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDriver} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-fullName">Họ tên *</Label>
              <Input
                id="create-fullName"
                value={createFormData.fullName}
                onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                placeholder="Nhập họ tên"
                className={createErrors.fullName ? 'border-red-500' : ''}
              />
              {createErrors.fullName && (
                <p className="text-sm text-red-500">{createErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-phoneNumber">Số điện thoại *</Label>
              <Input
                id="create-phoneNumber"
                value={createFormData.phoneNumber}
                onChange={(e) => setCreateFormData({ ...createFormData, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại"
                className={createErrors.phoneNumber ? 'border-red-500' : ''}
              />
              {createErrors.phoneNumber && (
                <p className="text-sm text-red-500">{createErrors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-licenseNumber">Số giấy phép lái xe *</Label>
              <Input
                id="create-licenseNumber"
                value={createFormData.licenseNumber}
                onChange={(e) => setCreateFormData({ ...createFormData, licenseNumber: e.target.value })}
                placeholder="Nhập số giấy phép"
                className={createErrors.licenseNumber ? 'border-red-500' : ''}
              />
              {createErrors.licenseNumber && (
                <p className="text-sm text-red-500">{createErrors.licenseNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ngày tuyển dụng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !createFormData.hireDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {createFormData.hireDate ? format(new Date(createFormData.hireDate), 'dd/MM/yyyy') : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={createFormData.hireDate ? new Date(createFormData.hireDate) : undefined}
                    onSelect={(date) => setCreateFormData({ 
                      ...createFormData, 
                      hireDate: date ? format(date, 'yyyy-MM-dd') : undefined 
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài xế
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài xế</DialogTitle>
          </DialogHeader>
          
          {/* Warning for active schedules */}
          {driverSchedules.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">
                    Cảnh báo: Tài xế có chuyến đi đang hoạt động
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Tài xế này có {driverSchedules.length} chuyến đi sắp tới. Việc thay đổi trạng thái có thể ảnh hưởng đến các chuyến đi này.
                  </p>
                  <div className="space-y-2">
                    {driverSchedules.slice(0, 3).map((schedule) => (
                      <div key={schedule.id} className="text-xs bg-yellow-100 rounded p-2">
                        <div className="font-medium">
                          {schedule.route.departureProvince} → {schedule.route.arrivalProvince}
                        </div>
                        <div className="text-yellow-600">
                          {format(new Date(schedule.departureTime), 'dd/MM/yyyy HH:mm')} - {schedule.bus.licensePlate}
                        </div>
                      </div>
                    ))}
                    {driverSchedules.length > 3 && (
                      <div className="text-xs text-yellow-600">
                        Và {driverSchedules.length - 3} chuyến đi khác...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleUpdateDriver} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Họ tên *</Label>
              <Input
                id="edit-fullName"
                value={editFormData.fullName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                placeholder="Nhập họ tên"
                className={editErrors.fullName ? 'border-red-500' : ''}
              />
              {editErrors.fullName && (
                <p className="text-sm text-red-500">{editErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Số điện thoại *</Label>
              <Input
                id="edit-phoneNumber"
                value={editFormData.phoneNumber || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại"
                className={editErrors.phoneNumber ? 'border-red-500' : ''}
              />
              {editErrors.phoneNumber && (
                <p className="text-sm text-red-500">{editErrors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">Số giấy phép lái xe *</Label>
              <Input
                id="edit-licenseNumber"
                value={editFormData.licenseNumber || ''}
                onChange={(e) => setEditFormData({ ...editFormData, licenseNumber: e.target.value })}
                placeholder="Nhập số giấy phép"
                className={editErrors.licenseNumber ? 'border-red-500' : ''}
              />
              {editErrors.licenseNumber && (
                <p className="text-sm text-red-500">{editErrors.licenseNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ngày tuyển dụng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editFormData.hireDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editFormData.hireDate ? format(new Date(editFormData.hireDate), 'dd/MM/yyyy') : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editFormData.hireDate ? new Date(editFormData.hireDate) : undefined}
                    onSelect={(date) => setEditFormData({ 
                      ...editFormData, 
                      hireDate: date ? format(date, 'yyyy-MM-dd') : undefined 
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={editFormData.isActive?.toString() || 'true'}
                onValueChange={(value) => setEditFormData({ 
                  ...editFormData, 
                  isActive: value === 'true' 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default AdminDriversPage; 