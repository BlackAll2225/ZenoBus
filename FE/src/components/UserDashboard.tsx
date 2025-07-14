import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import { userService, UserProfile, UpdateProfileData } from '@/services/userService';
import { BookingEntity } from '@/services/types';
import BookingDetailModal from './BookingDetailModal';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react';

const sidebarMenu = [
  { id: 'profile', label: 'Thông tin tài khoản', active: true },
  { id: 'bookings', label: 'Lịch sử mua vé', active: false },
  { id: 'logout', label: 'Đăng xuất', active: false },
];

export default function UserDashboard() {
  // State cho active tab
  const [activeTab, setActiveTab] = useState('profile');
  
  // State filter cho bookings
  const [filters, setFilters] = useState({ code: '', date: '', route: '', status: 'all' });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // State cho user profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({
    fullName: '',
    phoneNumber: ''
  });

  // State cho booking data
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
      
      // Fetch user profile
      fetchUserProfile();
      
      // Fetch bookings nếu tab bookings đang active
      if (activeTab === 'bookings') {
        fetchUserBookings();
      }
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  }, [isLoggedIn, navigate, activeTab]);

  // Fetch lại data khi pagination thay đổi
  useEffect(() => {
    if (isLoggedIn && activeTab === 'bookings') {
      fetchUserBookings();
    }
  }, [pagination.page, pagination.limit]);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
      setProfileForm({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber
      });
    } catch (err: unknown) {
      console.error('Error fetching user profile:', err);
      let errorMessage = 'Có lỗi xảy ra khi tải thông tin tài khoản';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          setIsLoggedIn(false);
          navigate('/login');
          return;
        }
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      
      const result = await bookingService.getUserBookings({
        page: pagination.page,
        limit: pagination.limit
      });
      
      setBookings(result.bookings);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (err: unknown) {
      console.error('Error fetching user bookings:', err);
      let errorMessage = 'Có lỗi xảy ra khi tải dữ liệu';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          setIsLoggedIn(false);
          navigate('/login');
          return;
        }
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setBookingError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMenuClick = (menuId: string) => {
    if (menuId === 'logout') {
      handleLogout();
      return;
    }
    
    setActiveTab(menuId);
    // Reset edit mode khi chuyển tab
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    // Reset form về giá trị ban đầu
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.fullName,
        phoneNumber: userProfile.phoneNumber
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      
      // Chỉ gửi fullName và phoneNumber, không gửi email
      const updateData = {
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber
      };
      
      const updatedProfile = await userService.updateCurrentUserProfile(updateData);
      setUserProfile(updatedProfile);
      setIsEditingProfile(false);
      
      // Cập nhật username trong localStorage
      localStorage.setItem('username', updatedProfile.fullName);
      setUsername(updatedProfile.fullName);
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin tài khoản thành công!",
      });
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileFormChange = (field: keyof UpdateProfileData, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBookingId(null);
    setIsModalOpen(false);
  };

  const renderProfileContent = () => {
    if (profileLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin tài khoản...</p>
          </div>
        </div>
      );
    }

    if (!userProfile) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Không thể tải thông tin tài khoản</p>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800">
            <User className="inline-block w-5 h-5 mr-2" />
            Thông tin tài khoản
          </CardTitle>
          {!isEditingProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Họ và tên
              </Label>
              {isEditingProfile ? (
                <Input
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(e) => handleProfileFormChange('fullName', e.target.value)}
                  className="border-gray-300 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{userProfile.fullName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span>{userProfile.email}</span>
                {isEditingProfile && (
                  <span className="ml-2 text-xs text-gray-500 italic">(không thể thay đổi)</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                Số điện thoại
              </Label>
              {isEditingProfile ? (
                <Input
                  id="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={(e) => handleProfileFormChange('phoneNumber', e.target.value)}
                  className="border-gray-300 focus:border-green-500"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{userProfile.phoneNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Ngày tạo tài khoản
              </Label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>{formatDate(userProfile.createdAt)}</span>
              </div>
            </div>
          </div>

          {isEditingProfile && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={profileLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {profileLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBookingContent = () => {
    if (bookingLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch sử mua vé...</p>
          </div>
        </div>
      );
    }

    if (bookingError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {bookingError}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {/* Booking list */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã vé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày khởi hành
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá vé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.route.departureProvince} → {booking.route.arrivalProvince}
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {formatDate(booking.schedule.departureTime)}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(booking.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(booking.id)}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Bạn chưa có vé nào.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Trước
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'bookings':
        return renderBookingContent();
      default:
        return renderProfileContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header isLoggedIn={isLoggedIn} username={username} handleLogout={handleLogout} navigate={navigate} />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col py-8 px-4">
          <nav className="space-y-2">
            {sidebarMenu.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer text-base font-medium transition-colors ${
                  activeTab === item.id ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
      <Footer />

      {/* Booking Detail Modal */}
      {selectedBookingId && (
        <BookingDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bookingId={selectedBookingId}
        />
      )}
    </div>
  );
}
