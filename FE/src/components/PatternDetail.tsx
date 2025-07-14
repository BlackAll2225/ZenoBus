import React from 'react';
import { 
  Edit, 
  Trash2, 
  Clock,
  MapPin,
  Bus,
  DollarSign,
  Calendar,
  Info,
  Activity,
  Settings
} from 'lucide-react';
import { SchedulePattern } from '@/services/schedulePatternService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';



interface PatternDetailProps {
  pattern: SchedulePattern;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const PatternDetail: React.FC<PatternDetailProps> = ({
  pattern,
  onEdit,
  onDelete,
  onClose
}) => {
  const formatDepartureTimes = (times: string) => {
    try {
      const parsed = JSON.parse(times);
      return parsed;
    } catch {
      return [];
    }
  };

  const formatDaysOfWeek = (days: string) => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayFullNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayNumbers = days.split(',').map(d => parseInt(d.trim()));
    return dayNumbers.map(num => ({
      short: dayNames[num === 7 ? 0 : num],
      full: dayFullNames[num === 7 ? 0 : num]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const departureTimes = formatDepartureTimes(pattern.departureTimes);
  const daysInfo = formatDaysOfWeek(pattern.daysOfWeek);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{pattern.name}</h2>
            <Badge 
              className={pattern.isActive 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
              }
            >
              {pattern.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Badge>
          </div>
          <p className="text-gray-600">{pattern.description}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route and Bus Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Thông tin tuyến đường
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Tuyến đường</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {pattern.departureProvince} → {pattern.arrivalProvince}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Loại xe</label>
                  <div className="flex items-center space-x-2">
                    <Bus className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{pattern.busTypeName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Giá cơ bản</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-xl font-bold text-green-600">
                    {pattern.basePrice.toLocaleString()}₫
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Thông tin lịch trình
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Giờ khởi hành ({departureTimes.length} chuyến/ngày)
                </label>
                <div className="flex flex-wrap gap-2">
                  {departureTimes.map((time: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Ngày hoạt động ({daysInfo.length} ngày/tuần)
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => {
                    const isActive = daysInfo.some(d => d.short === day);
                    return (
                      <div
                        key={day}
                        className={`text-center p-2 rounded-md text-sm font-medium ${
                          isActive 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysInfo.map((day, index) => (
                    <Badge key={index} variant="outline">
                      {day.full}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Hoạt động</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    pattern.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">
                    {pattern.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">ID Pattern</label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  #{pattern.id}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Thông tin hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-sm">{formatDate(pattern.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                <p className="text-sm">{formatDate(pattern.updatedAt)}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Route ID</label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {pattern.routeId}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Bus Type ID</label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {pattern.busTypeId}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa mẫu
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                disabled
              >
                <Calendar className="h-4 w-4 mr-2" />
                Tạo lịch trình
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa mẫu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatternDetail; 