
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Ticket, 
  Bus, 
  Users,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { statisticsService, DashboardStats, TopRoute, MonthlyStats } from '@/services/statisticsService';
import { useToast } from '@/hooks/use-toast';



export const AdminRevenue = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [topRoutes, setTopRoutes] = useState<TopRoute[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);

  
  const { toast } = useToast();
  
  // Mock admin data - in real app this would come from auth context
  const adminFullName = "Nguyen Van Admin";



  // Load statistics data
  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboard, routes, monthly] = await Promise.all([
        statisticsService.getDashboardStats(),
        statisticsService.getTopRoutes(5),
        statisticsService.getMonthlyStats(new Date().getFullYear())
      ]);
      
      setDashboardStats(dashboard);
      setTopRoutes(routes);
      setMonthlyStats(monthly);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      setError('Không thể tải dữ liệu thống kê');
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu thống kê",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Prepare chart data from API
  const monthlyChartData = monthlyStats?.months.map(month => ({
    month: month.monthName,
    revenue: month.revenue,
    tickets: month.totalBookings
  })) || [];



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-lg text-gray-600">Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={loadStatistics} className="bg-green-500 hover:bg-green-600">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Chào mừng, {adminFullName}!</h1>
        <p className="text-green-100">Đây là tổng quan dashboard doanh thu hôm nay</p>
      </div>

      {/* Time Filter */}
      {/* <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Doanh Thu</h2>
        <div className="flex space-x-2">
          <Button
            variant={timeFilter === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('week')}
            className={timeFilter === 'week' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Tuần Này
          </Button>
          <Button
            variant={timeFilter === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('month')}
            className={timeFilter === 'month' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Tháng Này
          </Button>
          <Button
            variant={timeFilter === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('year')}
            className={timeFilter === 'year' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Năm Này
          </Button>
        </div>
      </div> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Tổng Doanh Thu</p>
                <p className="text-3xl font-bold text-green-800">
                  {dashboardStats ? formatCurrency(dashboardStats.bookings.totalRevenue) : formatCurrency(0)}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Tổng Vé Đã Bán</p>
                <p className="text-3xl font-bold text-blue-800">
                  {dashboardStats ? dashboardStats.bookings.total.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Ticket className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+8.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Tổng Chuyến Đi</p>
                <p className="text-3xl font-bold text-purple-800">
                  {dashboardStats ? dashboardStats.schedules.total.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Bus className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+5.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Tổng Khách Hàng</p>
                <p className="text-3xl font-bold text-orange-800">
                  {dashboardStats ? dashboardStats.users.total.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+15.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
              Xu Hướng Doanh Thu Theo Tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#666" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Doanh Thu']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


      </div>

      {/* Top Routes Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Bus className="h-5 w-5 text-green-500 mr-2" />
              Tuyến Đường Top Doanh Thu
            </CardTitle>
            <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
              Xem Tất Cả Tuyến Đường
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Tuyến Đường</TableHead>
                  <TableHead className="font-semibold">Số Vé</TableHead>
                  <TableHead className="font-semibold">Doanh Thu</TableHead>
                  <TableHead className="font-semibold">Xếp Hạng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRoutes.map((route, index) => (
                  <TableRow key={route.routeId} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="text-green-600">{route.departureProvince} → {route.arrivalProvince}</div>
                        <div className="text-sm text-gray-500">Tuyến #{route.routeId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{route.bookingCount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">{formatCurrency(route.revenue)}</TableCell>
                    <TableCell>
                      <Badge className={index < 3 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};