import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Search, Filter, Bus, MapPin, Clock, User, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import scheduleService, { ScheduleFilters, Schedule } from '@/services/scheduleService';
import CreateScheduleModal from '@/components/CreateScheduleModal';
import UpdateScheduleModal from '@/components/UpdateScheduleModal';
import { formatUTCToVNTime, getCurrentVNDate } from '@/lib/dateUtils';

const AdminSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  console.log('Current schedules state:', schedules);
  console.log('Current loading state:', loading);
  console.log('Current searchTerm:', searchTerm);
  console.log('Current selectedDate:', selectedDate);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const filters: ScheduleFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedDate) filters.departureDate = format(selectedDate, 'yyyy-MM-dd');
      const result = await scheduleService.getSchedules(filters);
      console.log('Schedules result:', result);
      console.log('Schedules length:', result?.length);
      setSchedules(Array.isArray(result) ? result : []);
      console.log('State updated with schedules:', Array.isArray(result) ? result.length : 0);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error('Có lỗi xảy ra khi tải danh sách chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminSchedulesPage mounted');
    fetchSchedules();
    // eslint-disable-next-line
  }, []);

  const handleSearch = () => {
    fetchSchedules();
  };

  const handleDateFilter = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
    setTimeout(() => {
      fetchSchedules();
    }, 100);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate(undefined);
    fetchSchedules();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default" className="bg-blue-500">Đã lên lịch</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="default" className="bg-red-500">Đã hủy</Badge>;
      case 'delayed':
        return <Badge variant="default" className="bg-yellow-500">Bị trễ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (utcDateTime: string) => {
    // Convert UTC datetime from API to VN time for display
    return formatUTCToVNTime(utcDateTime, 'HH:mm - dd/MM/yyyy');
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowUpdateModal(true);
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) {
      try {
        await scheduleService.deleteSchedule(scheduleId);
        toast.success('Xóa chuyến đi thành công');
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Có lỗi xảy ra khi xóa chuyến đi');
      }
    }
  };

  console.log('Rendering AdminSchedulesPage');
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Chuyến Đi</h1>
          <p className="text-gray-600">Xem và quản lý tất cả chuyến đi trong hệ thống</p>
        </div>
        <CreateScheduleModal onSuccess={fetchSchedules} />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tuyến đường, biển số xe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleSearch} className="px-6">
                <Search className="h-4 w-4 mr-2" />
                Tìm
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Xóa lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách chuyến đi...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center">
              <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có chuyến đi nào</h3>
              <p className="text-gray-600">Không tìm thấy chuyến đi phù hợp với bộ lọc hiện tại</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tuyến Đường</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead>Xe Bus</TableHead>
                  <TableHead>Tài Xế</TableHead>
                  <TableHead>Giá Vé</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            {schedule.route?.departureProvince} → {schedule.route?.arrivalProvince}
                          </div>
                          {schedule.route?.distanceKm && (
                            <div className="text-sm text-gray-500">
                              {schedule.route.distanceKm}km
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatDateTime(schedule.departureTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Bus className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{schedule.bus?.licensePlate}</div>
                          <div className="text-sm text-gray-500">
                            {schedule.bus?.busType?.name} • {schedule.bus?.seatCount} ghế
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{schedule.driver?.fullName}</div>
                          <div className="text-sm text-gray-500">{schedule.driver?.phoneNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatPrice(Number(schedule.price))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(schedule.status)}
                        <div className="flex gap-1">
                          {schedule.isAutoGenerated && (
                            <Badge variant="outline" className="text-xs">
                              Tự động
                            </Badge>
                          )}
                          {schedule.pattern && (
                            <Badge variant="outline" className="text-xs">
                              {schedule.pattern.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Summary */}
      {!loading && schedules.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Hiển thị {schedules.length} chuyến đi
        </div>
      )}

      {/* Update Modal */}
      <UpdateScheduleModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onSuccess={fetchSchedules}
      />
    </div>
  );
};

export default AdminSchedulesPage; 