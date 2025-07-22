import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { userService, Customer, UserStats, UserFilters } from '@/services/userService';
import { formatShortDate } from '@/lib/dateUtils';

export const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const customersPerPage = 10;

  const { toast } = useToast();

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const filters: UserFilters = {
        search: searchTerm || undefined,
        page: currentPage,
        limit: customersPerPage,
        sortBy,
        sortOrder
      };
      
      const response = await userService.getUsers(filters);
      setCustomers(response?.users || []);
      setTotalPages(response?.totalPages || 1);
      setTotalCustomers(response?.total || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalPages(1);
      setTotalCustomers(0);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khách hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const filters: UserFilters = {
        search: searchTerm || undefined
      };
      
      const statsData = await userService.getUserStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
      toast({
        title: "Lỗi",
        description: "Không thể tải thống kê",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, []);

  // useEffect(() => {
  //   fetchStats();
  // }, [searchTerm]);

  const getStatusBadge = (status: Customer['status']) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
    );
  };

  const handleAddCustomer = () => {
    console.log('Add new customer');
    // TODO: Implement add customer modal
    toast({
      title: "Thông báo",
      description: "Tính năng thêm khách hàng sẽ được cập nhật sớm",
    });
  };

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customer = await userService.getUserById(customerId);
      console.log('View customer:', customer);
      // TODO: Implement view customer modal
      toast({
        title: "Thông báo",
        description: `Xem thông tin khách hàng: ${customer.fullName}`,
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khách hàng",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomer = (customerId: string) => {
    console.log('Edit customer:', customerId);
    // TODO: Implement edit customer modal
    toast({
      title: "Thông báo",
      description: "Tính năng chỉnh sửa khách hàng sẽ được cập nhật sớm",
    });
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return;
    }

    try {
      await userService.deleteUser(customerId);
      toast({
        title: "Thành công",
        description: "Đã xóa khách hàng thành công",
      });
      fetchCustomers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khách hàng",
        variant: "destructive",
      });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return formatShortDate(dateString);
  };

  const startIndex = (currentPage - 1) * customersPerPage;
  const endIndex = startIndex + (customers?.length || 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts and view details</p>
        </div>
        {/* <Button 
          onClick={handleAddCustomer}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Customer
        </Button> */}
      </div>

      {/* Customer Stats Summary */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.newUsersThisMonth || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full mr-4">
                <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Bookings</p>
                {statsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats?.averageBookingsPerUser || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Search and Filter Section */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or customer ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={clearSearch}
                className="border-gray-300 hover:bg-gray-50"
              >
                Clear Search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Customer List ({totalCustomers} customers)
            </CardTitle>
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{endIndex} of {totalCustomers}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead 
                    className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('id')}
                  >
                    Customer ID
                    {sortBy === 'id' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('fullName')}
                  >
                    Full Name
                    {sortBy === 'fullName' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {sortBy === 'email' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Phone Number</TableHead>
                  <TableHead 
                    className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('createdAt')}
                  >
                    Registration Date
                    {sortBy === 'createdAt' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  {/* <TableHead 
                    className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortBy === 'status' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead> */}
                  <TableHead className="font-semibold text-gray-700">Total Bookings</TableHead>
                  {/* <TableHead className="font-semibold text-gray-700">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500">Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (customers && customers.length > 0) ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium text-gray-900">{customer.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{customer.fullName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-700">{customer.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-700">{customer.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-700">{formatDate(customer.createdAt)}</div>
                      </TableCell>
                      {/* <TableCell>{getStatusBadge(customer.status)}</TableCell> */}
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-800">
                          {customer.totalBookings || 0} bookings
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCustomer(customer.id)}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCustomer(customer.id)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center px-4">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
};
