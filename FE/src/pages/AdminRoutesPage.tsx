import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { routeService, Route, CreateRouteData } from '@/services/routeService';
import { provinceService, Province } from '@/services/provinceService';
import { Pencil, Trash2, Plus, MapPin, AlertTriangle } from 'lucide-react';

const AdminRoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<CreateRouteData>({
    departureProvinceId: 0,
    arrivalProvinceId: 0,
    distanceKm: undefined,
    estimatedTime: undefined
  });
  const [formErrors, setFormErrors] = useState<{
    departureProvinceId?: string;
    arrivalProvinceId?: string;
    distanceKm?: string;
  }>({});
  const [formTouched, setFormTouched] = useState<{ estimatedTime?: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [showInactive]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesResponse, provincesResponse] = await Promise.all([
        routeService.getAllRoutes(showInactive),
        provinceService.getAllProvinces()
      ]);
      
      if (routesResponse.status === 200 && Array.isArray(routesResponse.data)) {
        setRoutes(routesResponse.data);
      } else {
        console.error('Routes response is not valid:', routesResponse);
        setRoutes([]);
      }
      
      // Handle provinces response - it returns Province[] directly
      if (Array.isArray(provincesResponse)) {
        setProvinces(provincesResponse);
      } else {
        console.error('Provinces response is not an array:', provincesResponse);
        setProvinces([]);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setCreateLoading(true);
    try {
      const response = await routeService.createRoute(formData);
      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Thành công",
          description: "Tạo tuyến đường thành công"
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo tuyến đường";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRoute) return;
    
    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await routeService.updateRoute(editingRoute.id, formData);
      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Thành công",
          description: "Cập nhật tuyến đường thành công"
        });
        setIsEditDialogOpen(false);
        setEditingRoute(null);
        resetForm();
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật tuyến đường";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tuyến đường này?')) return;
    
    setDeleteLoading(id);
    try {
      const response = await routeService.deleteRoute(id);
      if (response.status === 200 || response.status === 204) {
        toast({
          title: "Thành công",
          description: "Xóa tuyến đường thành công"
        });
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể xóa tuyến đường";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const route = routes.find(r => r.id === id);
    if (!route) return;

    // Hiển thị cảnh báo khi disable tuyến đường
    if (route.isActive) {
      const confirmed = confirm(
        'Bạn có chắc chắn muốn vô hiệu hóa tuyến đường này?\n\n' +
        '⚠️ Cảnh báo: \n' +
        '• Sẽ không thể tạo chuyến đi mới trong tương lai cho tuyến này\n' +
        '• Tất cả mẫu lịch trình (schedule patterns) liên quan cũng sẽ bị vô hiệu hóa\n' +
        '• Các mẫu lịch trình cần được kích hoạt thủ công nếu muốn sử dụng lại'
      );
      if (!confirmed) return;
    }

    setToggleLoading(id);
    try {
      const response = await routeService.toggleRouteStatus(id);
      if (response.status === 200) {
        // Kiểm tra xem có thông tin về schedule patterns bị ảnh hưởng không
        const affectedPatternsCount = response.data?.affectedPatternsCount || 0;
        const statusChanged = response.data?.statusChanged;
        
        let description = "";
        if (statusChanged === 'disabled') {
          description = "Đã vô hiệu hóa tuyến đường. Không thể tạo chuyến đi mới cho tuyến này.";
          if (affectedPatternsCount > 0) {
            description += ` ${affectedPatternsCount} mẫu lịch trình liên quan cũng đã bị vô hiệu hóa.`;
          }
        } else {
          description = "Đã kích hoạt tuyến đường. Có thể tạo chuyến đi mới cho tuyến này. Các mẫu lịch trình cần được kích hoạt thủ công nếu cần.";
        }
        
        toast({
          title: "Thành công",
          description: description
        });
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật trạng thái";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setToggleLoading(null);
    }
  };

  // Khi nhập số kilomet, tự động gợi ý thời gian nếu chưa chỉnh sửa thủ công
  const handleDistanceChange = (value: string) => {
    let error = undefined;
    let distance: number | undefined = undefined;
    if (value) {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed <= 0 || parsed > 2000) {
        error = 'Vui lòng nhập số kilomet hợp lệ (1-2000)';
      } else {
        distance = parsed;
      }
    }
    let newEstimatedTime = formData.estimatedTime;
    if (distance && !formTouched.estimatedTime) {
      newEstimatedTime = Math.round((distance / 50) * 60); // phút
    }
    setFormData({
      ...formData,
      distanceKm: distance,
      estimatedTime: newEstimatedTime,
    });
    setFormErrors((prev) => ({
      ...prev,
      distanceKm: error,
    }));
  };

  // Khi nhập thời gian, đánh dấu đã chỉnh sửa thủ công
  const handleEstimatedTimeChange = (value: string) => {
    setFormTouched({ ...formTouched, estimatedTime: true });
    setFormData({
      ...formData,
      estimatedTime: value ? parseInt(value) : undefined,
    });
  };

  const resetForm = () => {
    setFormData({
      departureProvinceId: 0,
      arrivalProvinceId: 0,
      distanceKm: undefined,
      estimatedTime: undefined
    });
    setFormErrors({});
    setFormTouched({});
  };

  const validateForm = (): boolean => {
    const errors: {
      departureProvinceId?: string;
      arrivalProvinceId?: string;
      distanceKm?: string;
    } = {};

    if (!formData.departureProvinceId) {
      errors.departureProvinceId = 'Vui lòng chọn tỉnh đi';
    }

    if (!formData.arrivalProvinceId) {
      errors.arrivalProvinceId = 'Vui lòng chọn tỉnh đến';
    }

    if (formData.departureProvinceId && formData.arrivalProvinceId && 
        formData.departureProvinceId === formData.arrivalProvinceId) {
      errors.arrivalProvinceId = 'Tỉnh đến không được trùng với tỉnh đi';
    }

    if (formData.distanceKm === undefined || isNaN(formData.distanceKm)) {
      errors.distanceKm = 'Vui lòng nhập khoảng cách';
    } else if (formData.distanceKm <= 0 || formData.distanceKm > 2000) {
      errors.distanceKm = 'Khoảng cách phải lớn hơn 0 và nhỏ hơn 2000 km';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openEditDialog = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      departureProvinceId: route.departureProvinceId,
      arrivalProvinceId: route.arrivalProvinceId,
      distanceKm: route.distanceKm,
      estimatedTime: route.estimatedTime
    });
    setIsEditDialogOpen(true);
  };

  const getProvinceName = (id: number) => {
    return provinces.find(p => p.id === id)?.name || 'N/A';
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}p` : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý tuyến đường</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Bao gồm các tuyến không hoạt động</Label>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm tuyến đường
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm tuyến đường mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tỉnh đi</Label>
                    <Select 
                      value={formData.departureProvinceId.toString()} 
                      onValueChange={(value) => {
                        setFormData({...formData, departureProvinceId: parseInt(value)});
                        if (formErrors.departureProvinceId) {
                          setFormErrors({...formErrors, departureProvinceId: undefined});
                        }
                      }}
                      disabled={createLoading}
                    >
                      <SelectTrigger className={formErrors.departureProvinceId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn tỉnh đi" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(provinces) && provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.departureProvinceId && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.departureProvinceId}</p>
                    )}
                  </div>
                  <div>
                    <Label>Tỉnh đến</Label>
                    <Select 
                      value={formData.arrivalProvinceId.toString()} 
                      onValueChange={(value) => {
                        setFormData({...formData, arrivalProvinceId: parseInt(value)});
                        if (formErrors.arrivalProvinceId) {
                          setFormErrors({...formErrors, arrivalProvinceId: undefined});
                        }
                      }}
                      disabled={createLoading}
                    >
                      <SelectTrigger className={formErrors.arrivalProvinceId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn tỉnh đến" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(provinces) && provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.arrivalProvinceId && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.arrivalProvinceId}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Khoảng cách (km)</Label>
                    <Input
                      type="number"
                      placeholder="Nhập khoảng cách"
                      value={formData.distanceKm === undefined ? '' : formData.distanceKm}
                      onChange={(e) => handleDistanceChange(e.target.value)}
                      disabled={createLoading}
                    />
                    {formErrors.distanceKm && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.distanceKm}</p>
                    )}
                  </div>
                  <div>
                    <Label>Thời gian dự kiến (phút)</Label>
                    <Input
                      type="number"
                      placeholder="Nhập thời gian"
                      value={formData.estimatedTime || ''}
                      onChange={(e) => handleEstimatedTimeChange(e.target.value)}
                      disabled={createLoading}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }} disabled={createLoading}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreate} disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang tạo...
                      </>
                    ) : (
                      'Tạo'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tuyến đường</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tỉnh đi</TableHead>
                <TableHead>Tỉnh đến</TableHead>
                <TableHead>Khoảng cách</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(routes) && routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-red-500" />
                      {getProvinceName(route.departureProvinceId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-green-500" />
                      {getProvinceName(route.arrivalProvinceId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {route.distanceKm ? `${route.distanceKm} km` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {formatTime(route.estimatedTime)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={route.isActive ? 'default' : 'destructive' as const}>
                      {route.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Switch
                          checked={route.isActive}
                          onCheckedChange={() => handleToggleStatus(route.id)}
                          disabled={toggleLoading === route.id}
                          aria-label="Toggle route status"
                        />
                        {!route.isActive && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Tuyến đường bị vô hiệu hóa - không thể tạo chuyến đi mới</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(route)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật tuyến đường</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tỉnh đi</Label>
                <Select 
                  value={formData.departureProvinceId.toString()} 
                  onValueChange={(value) => {
                    setFormData({...formData, departureProvinceId: parseInt(value)});
                    if (formErrors.departureProvinceId) {
                      setFormErrors({...formErrors, departureProvinceId: undefined});
                    }
                  }}
                  disabled={updateLoading}
                >
                  <SelectTrigger className={formErrors.departureProvinceId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn tỉnh đi" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(provinces) && provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.departureProvinceId && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.departureProvinceId}</p>
                )}
              </div>
              <div>
                <Label>Tỉnh đến</Label>
                <Select 
                  value={formData.arrivalProvinceId.toString()} 
                  onValueChange={(value) => {
                    setFormData({...formData, arrivalProvinceId: parseInt(value)});
                    if (formErrors.arrivalProvinceId) {
                      setFormErrors({...formErrors, arrivalProvinceId: undefined});
                    }
                  }}
                  disabled={updateLoading}
                >
                  <SelectTrigger className={formErrors.arrivalProvinceId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn tỉnh đến" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(provinces) && provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.arrivalProvinceId && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.arrivalProvinceId}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Khoảng cách (km)</Label>
                <Input
                  type="number"
                  placeholder="Nhập khoảng cách"
                  value={formData.distanceKm === undefined ? '' : formData.distanceKm}
                  onChange={(e) => handleDistanceChange(e.target.value)}
                  disabled={updateLoading}
                />
                {formErrors.distanceKm && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.distanceKm}</p>
                )}
              </div>
              <div>
                <Label>Thời gian dự kiến (phút)</Label>
                <Input
                  type="number"
                  placeholder="Nhập thời gian"
                  value={formData.estimatedTime || ''}
                  onChange={(e) => handleEstimatedTimeChange(e.target.value)}
                  disabled={updateLoading}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingRoute(null);
                resetForm();
              }} disabled={updateLoading}>
                Hủy
              </Button>
              <Button onClick={handleUpdate} disabled={updateLoading}>
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminRoutesPage; 