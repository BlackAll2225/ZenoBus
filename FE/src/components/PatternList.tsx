import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  Clock,
  MapPin,
  Bus,
  DollarSign,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { schedulePatternService, SchedulePattern } from '@/services/schedulePatternService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';



interface PatternListProps {
  onCreatePattern: () => void;
  onEditPattern: (pattern: SchedulePattern) => void;
  onDeletePattern?: (patternId: number) => void;
}

const PatternList: React.FC<PatternListProps> = ({
  onCreatePattern,
  onEditPattern,
  onDeletePattern
}) => {
  const [patterns, setPatterns] = useState<SchedulePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [busTypeFilter, setBusTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    pattern: SchedulePattern | null;
  }>({ open: false, pattern: null });

  // Load patterns from API
  const loadPatterns = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: { routeId?: number; busTypeId?: number; isActive?: boolean } = {};
      if (routeFilter !== 'all') filters.routeId = parseInt(routeFilter);
      if (busTypeFilter !== 'all') filters.busTypeId = parseInt(busTypeFilter);
      if (statusFilter === 'active') filters.isActive = true;
      if (statusFilter === 'inactive') filters.isActive = false;

      const data = await schedulePatternService.getAll(filters);
      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatterns();
  }, [routeFilter, busTypeFilter, statusFilter]);

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.departureProvince.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.arrivalProvince.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoute = routeFilter === 'all' || pattern.routeId.toString() === routeFilter;
    const matchesBusType = busTypeFilter === 'all' || pattern.busTypeId.toString() === busTypeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pattern.isActive) ||
                         (statusFilter === 'inactive' && !pattern.isActive);

    return matchesSearch && matchesRoute && matchesBusType && matchesStatus;
  });

  const formatDepartureTimes = (times: string) => {
    try {
      const parsed = JSON.parse(times);
      return parsed.join(', ');
    } catch {
      return times;
    }
  };

  const formatDaysOfWeek = (days: string) => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayNumbers = days.split(',').map(d => parseInt(d.trim()));
    return dayNumbers.map(num => dayNames[num === 7 ? 0 : num]).join(', ');
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.pattern) {
      try {
        await schedulePatternService.delete(deleteDialog.pattern.id);
        setDeleteDialog({ open: false, pattern: null });
        // Reload patterns after successful delete
        await loadPatterns();
        // Also call parent callback if provided
        if (onDeletePattern) onDeletePattern(deleteDialog.pattern.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa mẫu lịch trình');
        setDeleteDialog({ open: false, pattern: null });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách mẫu lịch trình...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadPatterns} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mẫu lịch trình</h2>
          <p className="text-gray-600">Quản lý các mẫu lịch trình tự động</p>
        </div>
        <Button onClick={onCreatePattern} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo mẫu mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm mẫu lịch trình..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={routeFilter} onValueChange={setRouteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả tuyến đường" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tuyến đường</SelectItem>
                <SelectItem value="1">Hà Nội - Hồ Chí Minh</SelectItem>
                <SelectItem value="2">Hồ Chí Minh - Đà Nẵng</SelectItem>
                <SelectItem value="3">Hà Nội - Đà Nẵng</SelectItem>
              </SelectContent>
            </Select>

            <Select value={busTypeFilter} onValueChange={setBusTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại xe</SelectItem>
                <SelectItem value="1">Xe ghế ngồi</SelectItem>
                <SelectItem value="2">Xe giường nằm</SelectItem>
                <SelectItem value="3">Xe VIP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pattern List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách mẫu lịch trình ({filteredPatterns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatterns.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy mẫu lịch trình nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên mẫu</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Loại xe</TableHead>
                  <TableHead>Giờ khởi hành</TableHead>
                  <TableHead>Ngày trong tuần</TableHead>
                  <TableHead>Giá cơ bản</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatterns.map((pattern) => (
                  <TableRow key={pattern.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pattern.name}</div>
                        <div className="text-sm text-gray-500">{pattern.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{pattern.departureProvince} → {pattern.arrivalProvince}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Bus className="h-4 w-4 text-gray-400" />
                        <span>{pattern.busTypeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDepartureTimes(pattern.departureTimes)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatDaysOfWeek(pattern.daysOfWeek)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{pattern.basePrice.toLocaleString()}₫</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={pattern.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                        }
                      >
                        {pattern.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPattern(pattern)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, pattern: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mẫu lịch trình "{deleteDialog.pattern?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatternList; 