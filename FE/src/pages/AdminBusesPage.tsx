import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Bus, Settings } from 'lucide-react';
import { busService } from '@/services/busService';
import { busTypeService } from '@/services/busTypeService';
import { BusEntity, BusType, CreateBusData, UpdateBusData, CreateBusTypeData, UpdateBusTypeData } from '@/services/types';

const AdminBusesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('buses');
  
  // Bus states
  const [buses, setBuses] = useState<BusEntity[]>([]);
  const [busTypes, setBusTypes] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateBusDialogOpen, setIsCreateBusDialogOpen] = useState(false);
  const [isEditBusDialogOpen, setIsEditBusDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusEntity | null>(null);
  const [createBusLoading, setCreateBusLoading] = useState(false);
  const [updateBusLoading, setUpdateBusLoading] = useState(false);
  const [deleteBusLoading, setDeleteBusLoading] = useState<number | null>(null);
  
  // Bus form data
  const [busFormData, setBusFormData] = useState<CreateBusData>({
    licensePlate: '',
    busTypeId: 0,
    seatCount: 0
  });
  const [busFormErrors, setBusFormErrors] = useState<{[key: string]: string}>({});

  // BusType states
  const [isCreateBusTypeDialogOpen, setIsCreateBusTypeDialogOpen] = useState(false);
  const [isEditBusTypeDialogOpen, setIsEditBusTypeDialogOpen] = useState(false);
  const [editingBusType, setEditingBusType] = useState<BusType | null>(null);
  const [createBusTypeLoading, setCreateBusTypeLoading] = useState(false);
  const [updateBusTypeLoading, setUpdateBusTypeLoading] = useState(false);
  const [deleteBusTypeLoading, setDeleteBusTypeLoading] = useState<number | null>(null);
  
  // BusType form data
  const [busTypeFormData, setBusTypeFormData] = useState<CreateBusTypeData>({
    name: '',
    description: ''
  });
  const [busTypeFormErrors, setBusTypeFormErrors] = useState<{[key: string]: string}>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busesData, busTypesData] = await Promise.all([
        busService.getAllBuses(),
        busTypeService.getAllBusTypes()
      ]);
      setBuses(busesData);
      setBusTypes(busTypesData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tải dữ liệu";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Bus handlers
  const handleCreateBus = async () => {
    if (!validateBusForm()) {
      return;
    }

    setCreateBusLoading(true);
    try {
      await busService.createBus(busFormData);
      toast({
        title: "Thành công",
        description: "Tạo xe bus thành công"
      });
      setIsCreateBusDialogOpen(false);
      resetBusForm();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo xe bus";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCreateBusLoading(false);
    }
  };

  const handleUpdateBus = async () => {
    if (!editingBus) return;
    
    if (!validateBusForm()) {
      return;
    }

    setUpdateBusLoading(true);
    try {
      await busService.updateBus(editingBus.id, busFormData);
      toast({
        title: "Thành công",
        description: "Cập nhật xe bus thành công"
      });
      setIsEditBusDialogOpen(false);
      setEditingBus(null);
      resetBusForm();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật xe bus";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdateBusLoading(false);
    }
  };

  const handleDeleteBus = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa xe bus này?')) return;
    
    setDeleteBusLoading(id);
    try {
      await busService.deleteBus(id);
      toast({
        title: "Thành công",
        description: "Xóa xe bus thành công"
      });
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể xóa xe bus";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDeleteBusLoading(null);
    }
  };

  const resetBusForm = () => {
    setBusFormData({
      licensePlate: '',
      busTypeId: 0,
      seatCount: 0
    });
    setBusFormErrors({});
  };

  const validateBusForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!busFormData.licensePlate.trim()) {
      errors.licensePlate = 'Vui lòng nhập biển số xe';
    }

    if (!busFormData.busTypeId) {
      errors.busTypeId = 'Vui lòng chọn loại xe';
    }

    if (!busFormData.seatCount || busFormData.seatCount <= 0) {
      errors.seatCount = 'Vui lòng nhập số ghế hợp lệ';
    }

    setBusFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openEditBusDialog = (bus: BusEntity) => {
    setEditingBus(bus);
    setBusFormData({
      licensePlate: bus.licensePlate,
      busTypeId: bus.busTypeId,
      seatCount: bus.seatCount || 0
    });
    setIsEditBusDialogOpen(true);
  };

  // BusType handlers
  const handleCreateBusType = async () => {
    if (!validateBusTypeForm()) {
      return;
    }

    setCreateBusTypeLoading(true);
    try {
      await busTypeService.createBusType(busTypeFormData);
      toast({
        title: "Thành công",
        description: "Tạo loại xe thành công"
      });
      setIsCreateBusTypeDialogOpen(false);
      resetBusTypeForm();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo loại xe";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCreateBusTypeLoading(false);
    }
  };

  const handleUpdateBusType = async () => {
    if (!editingBusType) return;
    
    if (!validateBusTypeForm()) {
      return;
    }

    setUpdateBusTypeLoading(true);
    try {
      await busTypeService.updateBusType(editingBusType.id, busTypeFormData);
      toast({
        title: "Thành công",
        description: "Cập nhật loại xe thành công"
      });
      setIsEditBusTypeDialogOpen(false);
      setEditingBusType(null);
      resetBusTypeForm();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật loại xe";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdateBusTypeLoading(false);
    }
  };

  const handleDeleteBusType = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại xe này?')) return;
    
    setDeleteBusTypeLoading(id);
    try {
      await busTypeService.deleteBusType(id);
      toast({
        title: "Thành công",
        description: "Xóa loại xe thành công"
      });
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể xóa loại xe";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDeleteBusTypeLoading(null);
    }
  };

  const resetBusTypeForm = () => {
    setBusTypeFormData({
      name: '',
      description: ''
    });
    setBusTypeFormErrors({});
  };

  const validateBusTypeForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!busTypeFormData.name.trim()) {
      errors.name = 'Vui lòng nhập tên loại xe';
    }

    setBusTypeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openEditBusTypeDialog = (busType: BusType) => {
    setEditingBusType(busType);
    setBusTypeFormData({
      name: busType.name,
      description: busType.description || ''
    });
    setIsEditBusTypeDialogOpen(true);
  };

  const getBusTypeName = (id: number) => {
    return busTypes.find(bt => bt.id === id)?.name || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý xe khách</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buses" className="flex items-center gap-2">
            <Bus className="w-4 h-4" />
            Xe khách
          </TabsTrigger>
          <TabsTrigger value="busTypes" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Loại xe
          </TabsTrigger>
        </TabsList>

        {/* Bus Management Tab */}
        <TabsContent value="buses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách xe khách</CardTitle>
                <Dialog open={isCreateBusDialogOpen} onOpenChange={setIsCreateBusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetBusForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm xe bus
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm xe bus mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Biển số xe</Label>
                        <Input
                          value={busFormData.licensePlate}
                          onChange={(e) => {
                            setBusFormData({...busFormData, licensePlate: e.target.value});
                            if (busFormErrors.licensePlate) {
                              setBusFormErrors({...busFormErrors, licensePlate: undefined});
                            }
                          }}
                          placeholder="Nhập biển số xe"
                          disabled={createBusLoading}
                          className={busFormErrors.licensePlate ? "border-red-500" : ""}
                        />
                        {busFormErrors.licensePlate && (
                          <p className="text-sm text-red-500 mt-1">{busFormErrors.licensePlate}</p>
                        )}
                      </div>
                      <div>
                        <Label>Loại xe</Label>
                        <Select 
                          value={busFormData.busTypeId.toString()} 
                          onValueChange={(value) => {
                            setBusFormData({...busFormData, busTypeId: parseInt(value)});
                            if (busFormErrors.busTypeId) {
                              setBusFormErrors({...busFormErrors, busTypeId: undefined});
                            }
                          }}
                          disabled={createBusLoading}
                        >
                          <SelectTrigger className={busFormErrors.busTypeId ? "border-red-500" : ""}>
                            <SelectValue placeholder="Chọn loại xe" />
                          </SelectTrigger>
                          <SelectContent>
                            {busTypes.map((busType) => (
                              <SelectItem key={busType.id} value={busType.id.toString()}>
                                {busType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {busFormErrors.busTypeId && (
                          <p className="text-sm text-red-500 mt-1">{busFormErrors.busTypeId}</p>
                        )}
                      </div>
                      <div>
                        <Label>Số ghế</Label>
                        <Input
                          type="number"
                          value={busFormData.seatCount}
                          onChange={(e) => {
                            setBusFormData({...busFormData, seatCount: parseInt(e.target.value) || 0});
                            if (busFormErrors.seatCount) {
                              setBusFormErrors({...busFormErrors, seatCount: undefined});
                            }
                          }}
                          placeholder="Nhập số ghế"
                          disabled={createBusLoading}
                          className={busFormErrors.seatCount ? "border-red-500" : ""}
                        />
                        {busFormErrors.seatCount && (
                          <p className="text-sm text-red-500 mt-1">{busFormErrors.seatCount}</p>
                        )}
                      </div>

                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateBusDialogOpen(false)} disabled={createBusLoading}>
                        Hủy
                      </Button>
                      <Button onClick={handleCreateBus} disabled={createBusLoading}>
                        {createBusLoading ? "Đang tạo..." : "Tạo"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Biển số xe</TableHead>
                    <TableHead>Loại xe</TableHead>
                    <TableHead>Số ghế</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses.map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell>{bus.id}</TableCell>
                      <TableCell className="font-mono">{bus.licensePlate}</TableCell>
                      <TableCell>{getBusTypeName(bus.busTypeId)}</TableCell>
                      <TableCell>{bus.seatCount || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditBusDialog(bus)}
                            disabled={deleteBusLoading === bus.id}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBus(bus.id)}
                            disabled={deleteBusLoading === bus.id}
                          >
                            {deleteBusLoading === bus.id ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BusType Management Tab */}
        <TabsContent value="busTypes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách loại xe</CardTitle>
                <Dialog open={isCreateBusTypeDialogOpen} onOpenChange={setIsCreateBusTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetBusTypeForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm loại xe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm loại xe mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Tên loại xe</Label>
                        <Input
                          value={busTypeFormData.name}
                          onChange={(e) => {
                            setBusTypeFormData({...busTypeFormData, name: e.target.value});
                            if (busTypeFormErrors.name) {
                              setBusTypeFormErrors({...busTypeFormErrors, name: undefined});
                            }
                          }}
                          placeholder="Nhập tên loại xe"
                          disabled={createBusTypeLoading}
                          className={busTypeFormErrors.name ? "border-red-500" : ""}
                        />
                        {busTypeFormErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{busTypeFormErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label>Mô tả</Label>
                        <Textarea
                          value={busTypeFormData.description}
                          onChange={(e) => setBusTypeFormData({...busTypeFormData, description: e.target.value})}
                          placeholder="Nhập mô tả (tùy chọn)"
                          disabled={createBusTypeLoading}
                        />
                      </div>

                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateBusTypeDialogOpen(false)} disabled={createBusTypeLoading}>
                        Hủy
                      </Button>
                      <Button onClick={handleCreateBusType} disabled={createBusTypeLoading}>
                        {createBusTypeLoading ? "Đang tạo..." : "Tạo"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên loại xe</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {busTypes.map((busType) => (
                    <TableRow key={busType.id}>
                      <TableCell>{busType.id}</TableCell>
                      <TableCell className="font-medium">{busType.name}</TableCell>
                      <TableCell>{busType.description || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditBusTypeDialog(busType)}
                            disabled={deleteBusTypeLoading === busType.id}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBusType(busType.id)}
                            disabled={deleteBusTypeLoading === busType.id}
                          >
                            {deleteBusTypeLoading === busType.id ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Bus Dialog */}
      <Dialog open={isEditBusDialogOpen} onOpenChange={setIsEditBusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật xe bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Biển số xe</Label>
              <Input
                value={busFormData.licensePlate}
                onChange={(e) => {
                  setBusFormData({...busFormData, licensePlate: e.target.value});
                  if (busFormErrors.licensePlate) {
                    setBusFormErrors({...busFormErrors, licensePlate: undefined});
                  }
                }}
                placeholder="Nhập biển số xe"
                disabled={updateBusLoading}
                className={busFormErrors.licensePlate ? "border-red-500" : ""}
              />
              {busFormErrors.licensePlate && (
                <p className="text-sm text-red-500 mt-1">{busFormErrors.licensePlate}</p>
              )}
            </div>
            <div>
              <Label>Loại xe</Label>
              <Select 
                value={busFormData.busTypeId.toString()} 
                onValueChange={(value) => {
                  setBusFormData({...busFormData, busTypeId: parseInt(value)});
                  if (busFormErrors.busTypeId) {
                    setBusFormErrors({...busFormErrors, busTypeId: undefined});
                  }
                }}
                disabled={updateBusLoading}
              >
                <SelectTrigger className={busFormErrors.busTypeId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  {busTypes.map((busType) => (
                    <SelectItem key={busType.id} value={busType.id.toString()}>
                      {busType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {busFormErrors.busTypeId && (
                <p className="text-sm text-red-500 mt-1">{busFormErrors.busTypeId}</p>
              )}
            </div>
            <div>
              <Label>Số ghế</Label>
              <Input
                type="number"
                value={busFormData.seatCount}
                onChange={(e) => {
                  setBusFormData({...busFormData, seatCount: parseInt(e.target.value) || 0});
                  if (busFormErrors.seatCount) {
                    setBusFormErrors({...busFormErrors, seatCount: undefined});
                  }
                }}
                placeholder="Nhập số ghế"
                disabled={updateBusLoading}
                className={busFormErrors.seatCount ? "border-red-500" : ""}
              />
              {busFormErrors.seatCount && (
                <p className="text-sm text-red-500 mt-1">{busFormErrors.seatCount}</p>
              )}
            </div>

          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditBusDialogOpen(false)} disabled={updateBusLoading}>
              Hủy
            </Button>
            <Button onClick={handleUpdateBus} disabled={updateBusLoading}>
              {updateBusLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit BusType Dialog */}
      <Dialog open={isEditBusTypeDialogOpen} onOpenChange={setIsEditBusTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật loại xe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên loại xe</Label>
              <Input
                value={busTypeFormData.name}
                onChange={(e) => {
                  setBusTypeFormData({...busTypeFormData, name: e.target.value});
                  if (busTypeFormErrors.name) {
                    setBusTypeFormErrors({...busTypeFormErrors, name: undefined});
                  }
                }}
                placeholder="Nhập tên loại xe"
                disabled={updateBusTypeLoading}
                className={busTypeFormErrors.name ? "border-red-500" : ""}
              />
              {busTypeFormErrors.name && (
                <p className="text-sm text-red-500 mt-1">{busTypeFormErrors.name}</p>
              )}
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={busTypeFormData.description}
                onChange={(e) => setBusTypeFormData({...busTypeFormData, description: e.target.value})}
                placeholder="Nhập mô tả (tùy chọn)"
                disabled={updateBusTypeLoading}
              />
            </div>

          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditBusTypeDialogOpen(false)} disabled={updateBusTypeLoading}>
              Hủy
            </Button>
            <Button onClick={handleUpdateBusType} disabled={updateBusTypeLoading}>
              {updateBusTypeLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBusesPage; 