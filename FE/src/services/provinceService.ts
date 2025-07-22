import api from './api';
import { ApiResponse, PaginatedResponse } from './types';

export interface Province {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProvinceData {
  name: string;
  code: string;
}

export interface UpdateProvinceData {
  name?: string;
  code?: string;
}

export interface DestinationResponse {
  departureProvince: Province;
  destinations: Province[];
}

class ProvinceService {
  // Lấy tất cả tỉnh thành
  async getAllProvinces(): Promise<Province[]> {
    try {
      const response = await api.get('/provinces');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  // Lấy tỉnh theo ID
  async getProvinceById(id: number): Promise<Province> {
    try {
      const response = await api.get(`/provinces/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching province:', error);
      throw error;
    }
  }

  // Lấy danh sách điểm đến từ một tỉnh
  async getDestinationsFromProvince(provinceId: number): Promise<DestinationResponse> {
    try {
      const response = await api.get(`/routes/destinations/${provinceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  }

  // Tạo tỉnh mới
  async create(data: CreateProvinceData): Promise<ApiResponse<Province>> {
    const response = await api.post<ApiResponse<Province>>('/provinces', data);
    return response.data;
  }

  // Cập nhật tỉnh
  async update(id: number, data: UpdateProvinceData): Promise<ApiResponse<Province>> {
    const response = await api.put<ApiResponse<Province>>(`/provinces/${id}`, data);
    return response.data;
  }

  // Xóa tỉnh
  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/provinces/${id}`);
    return response.data;
  }

  // Tìm kiếm tỉnh theo tên hoặc mã
  async search(query: string): Promise<ApiResponse<Province[]>> {
    const response = await api.get<ApiResponse<Province[]>>('/provinces/search', {
      params: { q: query }
    });
    return response.data;
  }
}

export const provinceService = new ProvinceService(); 