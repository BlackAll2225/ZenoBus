import adminApi from './adminApi';
import api from './api';
import { SeatEntity, CreateSeatData, UpdateSeatData, BulkCreateSeatData } from './types';

export const seatService = {
  // Lấy tất cả ghế
  getAllSeats: async (): Promise<SeatEntity[]> => {
    const response = await adminApi.get('/seats');
    return response.data.data;
  },

  // Lấy ghế theo ID
  getSeatById: async (id: number): Promise<SeatEntity> => {
    const response = await adminApi.get(`/seats/${id}`);
    return response.data.data;
  },

  // Lấy ghế theo schedule ID
  getSeatsByScheduleId: async (scheduleId: number): Promise<SeatEntity[]> => {
    const response = await adminApi.get(`/seats/schedule/${scheduleId}`);
    return response.data.data;
  },

  // Tạo ghế mới
  createSeat: async (data: CreateSeatData): Promise<SeatEntity> => {
    const response = await adminApi.post('/seats', data);
    return response.data.data;
  },

  // Tạo nhiều ghế cùng lúc
  bulkCreateSeats: async (data: BulkCreateSeatData): Promise<SeatEntity[]> => {
    const response = await adminApi.post('/seats/bulk', data);
    return response.data.data;
  },

  // Cập nhật ghế
  updateSeat: async (id: number, data: UpdateSeatData): Promise<SeatEntity> => {
    const response = await adminApi.put(`/seats/${id}`, data);
    return response.data.data;
  },

  // Xóa ghế
  deleteSeat: async (id: number): Promise<void> => {
    await adminApi.delete(`/seats/${id}`);
  },

  // Lấy ghế có sẵn cho một schedule (public API)
  getAvailableSeats: async (scheduleId: number) => {
    const response = await api.get(`/routes/schedules/${scheduleId}/seats`);
    return response.data.data;
  }
}; 