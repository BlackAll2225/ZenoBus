import adminApi from './adminApi';

export interface Driver {
  id: number;
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
  hireDate?: string;
  isActive: boolean;
}

export interface CreateDriverData {
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
  hireDate?: string;
}

export interface UpdateDriverData {
  fullName?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  hireDate?: string;
  isActive?: boolean;
}

export interface DriverFilters {
  isActive?: boolean;
  search?: string;
}

class DriverService {
  /**
   * Lấy tất cả tài xế
   */
  async getAllDrivers(filters: DriverFilters = {}): Promise<Driver[]> {
    try {
      const params = new URLSearchParams();
      if (filters.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await adminApi.get(`/drivers?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tài xế active cho dropdown
   */
  async getActiveDrivers(): Promise<Driver[]> {
    try {
      const response = await adminApi.get('/drivers/active');
      return response.data.data;
    } catch (error) {
      console.error('Error getting active drivers:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin tài xế theo ID
   */
  async getDriverById(id: number): Promise<Driver> {
    try {
      const response = await adminApi.get(`/drivers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting driver:', error);
      throw error;
    }
  }

  /**
   * Tạo tài xế mới
   */
  async createDriver(driverData: CreateDriverData): Promise<Driver> {
    try {
      const response = await adminApi.post('/drivers', driverData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  /**
   * Cập nhật tài xế
   */
  async updateDriver(id: number, updateData: UpdateDriverData): Promise<Driver> {
    try {
      const response = await adminApi.put(`/drivers/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  /**
   * Xóa tài xế (soft delete)
   */
  async deleteDriver(id: number): Promise<void> {
    try {
      await adminApi.delete(`/drivers/${id}`);
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra chuyến đi của tài xế
   */
  async getDriverSchedules(driverId: number): Promise<{
    id: number;
    departureTime: string;
    route: {
      departureProvince: string;
      arrivalProvince: string;
    };
    bus: {
      licensePlate: string;
    };
  }[]> {
    try {
      const response = await adminApi.get(`/schedules?driverId=${driverId}&status=scheduled`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting driver schedules:', error);
      throw error;
    }
  }
}

export default new DriverService(); 