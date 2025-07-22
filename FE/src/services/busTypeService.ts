import adminApi from './adminApi';
import { BusType, CreateBusTypeData, UpdateBusTypeData } from './types';

export const busTypeService = {
  // Lấy tất cả loại xe
  getAllBusTypes: async (): Promise<BusType[]> => {
    const response = await adminApi.get('/bus-types');
    return response.data.data;
  },

  // Lấy loại xe theo ID
  getBusTypeById: async (id: number): Promise<BusType> => {
    const response = await adminApi.get(`/bus-types/${id}`);
    return response.data.data;
  },

  // Tạo loại xe mới
  createBusType: async (data: CreateBusTypeData): Promise<BusType> => {
    const response = await adminApi.post('/bus-types', data);
    return response.data.data;
  },

  // Cập nhật loại xe
  updateBusType: async (id: number, data: UpdateBusTypeData): Promise<BusType> => {
    const response = await adminApi.put(`/bus-types/${id}`, data);
    return response.data.data;
  },

  // Xóa loại xe
  deleteBusType: async (id: number): Promise<void> => {
    await adminApi.delete(`/bus-types/${id}`);
  }
}; 