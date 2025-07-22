import adminApi from './adminApi';
import { BusEntity, CreateBusData, UpdateBusData } from './types';

export const busService = {
  // Lấy tất cả xe bus
  getAllBuses: async (): Promise<BusEntity[]> => {
    const response = await adminApi.get('/buses');
    return response.data.data;
  },

  // Lấy xe bus theo ID
  getBusById: async (id: number): Promise<BusEntity> => {
    const response = await adminApi.get(`/buses/${id}`);
    return response.data.data;
  },

  // Tạo xe bus mới
  createBus: async (data: CreateBusData): Promise<BusEntity> => {
    const response = await adminApi.post('/buses', data);
    return response.data.data;
  },

  // Cập nhật xe bus
  updateBus: async (id: number, data: UpdateBusData): Promise<BusEntity> => {
    const response = await adminApi.put(`/buses/${id}`, data);
    return response.data.data;
  },

  // Xóa xe bus
  deleteBus: async (id: number): Promise<void> => {
    await adminApi.delete(`/buses/${id}`);
  }
}; 