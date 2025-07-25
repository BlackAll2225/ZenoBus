import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, Eye, Edit, Trash2, RefreshCw, Ticket, Users, Route, Bus, DollarSign, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/bookingService';
import { BookingEntity, BookingStats, BookingFilters, UpdateBookingStatusData, CancelBookingData } from '@/services/types';
import { cn } from '@/lib/utils';
import { formatUTCToVNTime } from '@/lib/dateUtils';
import { provinceService } from '@/services/provinceService';
import { routeService } from '@/services/routeService';
import type { Route as RouteType } from '@/services/routeService';
import { DateRange } from 'react-day-picker';


const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingEntity | null>(null);
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 10,
    sortBy: 'bookedAt',
    sortOrder: 'desc',
    routeId: undefined // luôn là string hoặc undefined
  });
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [statusData, setStatusData] = useState<UpdateBookingStatusData>({ status: 'paid' });
  const [cancelData, setCancelData] = useState<CancelBookingData>({ reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [routes, setRoutes] = useState<{ id: number; name: string }[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { toast } = useToast();

  // Load bookings
  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings(filters);
      setBookings(response.bookings);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách vé xe',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async (currentFilters: BookingFilters = {}) => {
    try {
      setStatsLoading(true);
      const statsData = await bookingService.getBookingStats(currentFilters);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    loadStats(filters);
  }, [filters]);

  useEffect(() => {
    // Load initial stats without filters
    loadStats();
    // Load all routes for filter
    routeService.getAllRoutes().then((res) => {
      const data = res.data;
      setRoutes(data.map((r: RouteType) => ({ id: r.id, name: `${r.departureProvince?.name || r.departureProvince} → ${r.arrivalProvince?.name || r.arrivalProvince}` })));
    });
  }, []);

  // Khi dateRange thay đổi, cập nhật filters
  useEffect(() => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) {
      setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined, page: 1 }));
    } else if (dateRange.from && !dateRange.to) {
      // Chọn 1 ngày
      setFilters((prev) => ({ ...prev, startDate: format(dateRange.from, 'yyyy-MM-dd'), endDate: format(dateRange.from, 'yyyy-MM-dd'), page: 1 }));
    } else if (dateRange.from && dateRange.to) {
      setFilters((prev) => ({ ...prev, startDate: format(dateRange.from, 'yyyy-MM-dd'), endDate: format(dateRange.to, 'yyyy-MM-dd'), page: 1 }));
    }
  }, [dateRange]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      await bookingService.updateBookingStatus(selectedBooking.id, statusData);
      toast({
        title: 'Thành công',
        description: 'Cập nhật trạng thái thành công'
      });
      setShowStatusDialog(false);
      loadBookings();
      loadStats(filters);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelData.reason) return;

    try {
      setActionLoading(true);
      await bookingService.cancelBooking(selectedBooking.id, cancelData);
      toast({
        title: 'Thành công',
        description: 'Hủy vé xe thành công'
      });
      setShowCancelDialog(false);
      loadBookings();
      loadStats(filters);
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy vé xe',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ thanh toán', variant: 'secondary' as const },
      paid: { label: 'Đã thanh toán', variant: 'default' as const },
      cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
      completed: { label: 'Hoàn thành', variant: 'default' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Format date - convert UTC to VN time for display
  const formatDate = (utcDateString: string) => {
    return formatUTCToVNTime(utcDateString, 'dd/MM/yyyy HH:mm');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Handle sorting
  const handleSort = (field: 'id' | 'totalPrice' | 'status' | 'bookedAt' | 'userName' | 'departureTime' | 'departureProvince' | 'arrivalProvince') => {
    const currentSortBy = filters.sortBy;
    const currentSortOrder = filters.sortOrder;
    
    let newSortOrder: 'asc' | 'desc' = 'asc';
    
    if (currentSortBy === field) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: newSortOrder,
      page: 1 // Reset to first page when sorting
    });
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    return filters.sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Reset sorting
  const resetSorting = () => {
    setFilters({
      ...filters,
      sortBy: 'bookedAt',
      sortOrder: 'desc',
      page: 1
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Vé xe</h1>
        <div className="flex gap-2">
          {filters.sortBy !== 'bookedAt' || filters.sortOrder !== 'desc' ? (
            <Button onClick={resetSorting} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset sắp xếp
            </Button>
          ) : null}
          <Button onClick={() => { loadBookings(); loadStats(filters); }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Tổng vé</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Chờ thanh toán</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-muted-foreground">Đã thanh toán</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Đã hủy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Hoàn thành</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Doanh thu</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên, email, SĐT..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as 'pending' | 'paid' | 'cancelled' | 'completed', page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tuyến đường</Label>
              <Select
                value={filters.routeId || 'all'}
                onValueChange={(value) => setFilters({ ...filters, routeId: value === 'all' ? undefined : value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả tuyến đường" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tuyến đường</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>{route.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Thay thế 2 trường ngày thành 1 trường chọn range */}
            <div className="space-y-2">
              <Label>Ngày đặt vé</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                      : dateRange?.from
                      ? format(dateRange.from, 'dd/MM/yyyy')
                      : 'Chọn ngày hoặc khoảng ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách vé xe ({total})</CardTitle>
            {filters.sortBy && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <span>Sắp xếp theo:</span>
                <span className="font-medium capitalize">
                  {filters.sortBy === 'id' && 'ID'}
                  {filters.sortBy === 'totalPrice' && 'Giá vé'}
                  {filters.sortBy === 'status' && 'Trạng thái'}
                  {filters.sortBy === 'bookedAt' && 'Ngày đặt'}
                  {filters.sortBy === 'userName' && 'Tên khách hàng'}
                  {filters.sortBy === 'departureTime' && 'Thời gian khởi hành'}
                  {filters.sortBy === 'departureProvince' && 'Tỉnh đi'}
                  {filters.sortBy === 'arrivalProvince' && 'Tỉnh đến'}
                </span>
                <span className="text-xs">
                  ({filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'})
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {getSortIcon('id')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('userName')}
                    >
                      <div className="flex items-center gap-1">
                        Khách hàng
                        {getSortIcon('userName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('departureProvince')}
                    >
                      <div className="flex items-center gap-1">
                        Tuyến xe
                        {getSortIcon('departureProvince')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('departureTime')}
                    >
                      <div className="flex items-center gap-1">
                        Thời gian
                        {getSortIcon('departureTime')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('totalPrice')}
                    >
                      <div className="flex items-center gap-1">
                        Giá vé
                        {getSortIcon('totalPrice')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('totalPrice')}
                    >
                      <div className="flex items-center gap-1">
                        Ngày đặt
                        {getSortIcon('totalPrice')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Trạng thái
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.user.name}</div>
                          <div className="text-sm text-muted-foreground">{booking.user.email}</div>
                          <div className="text-sm text-muted-foreground">{booking.user.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.route.departureProvince} → {booking.route.arrivalProvince}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.bus.licensePlate} - {booking.bus.busType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDate(booking.schedule.departureTime)}
                          </div>
                         
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(booking.totalPrice)}
                      </TableCell>
                      <TableCell>
                      <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.bookedAt), 'dd/MM/yyyy HH:mm')}
                          </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setStatusData({ status: 'paid' });
                                  setShowStatusDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelData({ reason: '' });
                                  setShowCancelDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    >
                      Trước
                    </Button>
                    <span className="flex items-center px-4">
                      Trang {filters.page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={filters.page === totalPages}
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Ticket className="h-6 w-6 text-green-600" />
              Chi tiết vé xe #{selectedBooking?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 py-4">
              {/* Status Banner */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      {getStatusBadge(selectedBooking.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Trạng thái vé xe</h3>
                      <p className="text-sm text-gray-600">Cập nhật lần cuối: {format(new Date(selectedBooking.bookedAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(selectedBooking.totalPrice)}
                    </div>
                    <div className="text-sm text-gray-500">Tổng tiền</div>
                  </div>
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {selectedBooking.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedBooking.user.name}</div>
                        <div className="text-sm text-gray-600">{selectedBooking.user.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                        <div className="font-medium">{selectedBooking.user.email}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Số điện thoại</div>
                        <div className="font-medium">{selectedBooking.user.phone}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trip Information */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Route className="h-5 w-5 text-green-600" />
                      Thông tin chuyến xe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Bus className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedBooking.route.departureProvince} → {selectedBooking.route.arrivalProvince}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedBooking.bus.licensePlate} - {selectedBooking.bus.busType}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Thời gian khởi hành</div>
                        <div className="font-medium">{formatDate(selectedBooking.schedule.departureTime)}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Giá vé/ghế</div>
                        <div className="font-medium">{formatPrice(selectedBooking.schedule.seatPrice)}</div>
                      </div>
                    </div>
                    {(selectedBooking.route.pickupStop || selectedBooking.route.dropoffStop) && (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedBooking.route.pickupStop && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Điểm đón</div>
                            <div className="font-medium">{selectedBooking.route.pickupStop}</div>
                          </div>
                        )}
                        {selectedBooking.route.dropoffStop && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Điểm trả</div>
                            <div className="font-medium">{selectedBooking.route.dropoffStop}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Seats Information */}
              {selectedBooking.seats && selectedBooking.seats.length > 0 && (
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600 text-xs font-bold">💺</span>
                      </div>
                      Danh sách ghế đã đặt ({selectedBooking.seats.length} ghế)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedBooking.seats.map((seat) => (
                        <div key={seat.seatId} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-bold text-sm">{seat.seatNumber}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Ghế {seat.seatNumber}</div>
                                <div className="text-xs text-gray-500 capitalize">{seat.floor} floor</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-purple-600">{formatPrice(seat.price)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phương thức thanh toán</div>
                      <div className="font-semibold text-gray-900">
                        {selectedBooking.paymentMethod.toUpperCase() || 'Chưa thanh toán'}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ngày đặt vé</div>
                      <div className="font-semibold text-gray-900">{format(new Date(selectedBooking.bookedAt), 'dd/MM/yyyy HH:mm')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái vé xe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trạng thái mới</Label>
              <Select
                value={statusData.status}
                onValueChange={(value) => setStatusData({ ...statusData, status: value as 'paid' | 'completed' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lý do (tùy chọn)</Label>
              <Textarea
                value={statusData.reason || ''}
                onChange={(e) => setStatusData({ ...statusData, reason: e.target.value })}
                placeholder="Nhập lý do cập nhật..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleStatusUpdate} disabled={actionLoading}>
                {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy vé xe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Lý do hủy *</Label>
              <Textarea
                value={cancelData.reason}
                onChange={(e) => setCancelData({ reason: e.target.value })}
                placeholder="Nhập lý do hủy vé xe..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleCancelBooking} 
                disabled={actionLoading || !cancelData.reason}
                variant="destructive"
              >
                {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingsPage; 