import api from './api';

export interface SchedulePattern {
  id: number;
  name: string;
  description: string;
  routeId: number;
  busTypeId: number;
  departureTimes: string;
  daysOfWeek: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  departureProvince: string;
  arrivalProvince: string;
  busTypeName: string;
}

export interface SchedulePatternInput {
  name: string;
  description: string;
  routeId: number;
  busTypeId: number;
  departureTimes: string;
  daysOfWeek: string;
  basePrice: number;
  isActive: boolean;
}

export interface SchedulePatternFilters {
  routeId?: number;
  busTypeId?: number;
  isActive?: boolean;
}

class SchedulePatternService {
  private baseUrl = '/schedule-patterns';

  async getAll(filters?: SchedulePatternFilters): Promise<SchedulePattern[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.routeId) {
        params.append('routeId', filters.routeId.toString());
      }
      if (filters?.busTypeId) {
        params.append('busTypeId', filters.busTypeId.toString());
      }
      if (filters?.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }

      const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
      const response = await api.get(url);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching schedule patterns:', error);
      throw new Error('Không thể tải danh sách mẫu lịch trình');
    }
  }

  async getById(id: number): Promise<SchedulePattern> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching schedule pattern:', error);
      throw new Error('Không thể tải thông tin mẫu lịch trình');
    }
  }

  async create(data: SchedulePatternInput): Promise<SchedulePattern> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error('Error creating schedule pattern:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: { message?: string } } };
        if (axiosError.response?.status === 409) {
          throw new Error('Mẫu lịch trình với tên này đã tồn tại');
        }
        if (axiosError.response?.status === 400) {
          throw new Error(axiosError.response.data.message || 'Dữ liệu không hợp lệ');
        }
      }
      
      throw new Error('Không thể tạo mẫu lịch trình');
    }
  }

  async update(id: number, data: SchedulePatternInput): Promise<SchedulePattern> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error('Error updating schedule pattern:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: { message?: string } } };
        if (axiosError.response?.status === 404) {
          throw new Error('Không tìm thấy mẫu lịch trình');
        }
        if (axiosError.response?.status === 409) {
          throw new Error('Mẫu lịch trình với tên này đã tồn tại');
        }
        if (axiosError.response?.status === 400) {
          throw new Error(axiosError.response.data.message || 'Dữ liệu không hợp lệ');
        }
      }
      
      throw new Error('Không thể cập nhật mẫu lịch trình');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: unknown) {
      console.error('Error deleting schedule pattern:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
          throw new Error('Không tìm thấy mẫu lịch trình');
        }
        if (axiosError.response?.status === 409) {
          throw new Error('Không thể xóa mẫu lịch trình đang được sử dụng');
        }
      }
      
      throw new Error('Không thể xóa mẫu lịch trình');
    }
  }
}

export const schedulePatternService = new SchedulePatternService();
export default schedulePatternService; 