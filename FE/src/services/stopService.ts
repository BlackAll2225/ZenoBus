import api from './api';

export interface Stop {
  id: number;
  provinceId: number;
  name: string;
  address?: string;
  type: 'pickup' | 'dropoff';
  provinceName: string;
  provinceCode: string;
}

export interface StopsResponse {
  success: boolean;
  message: string;
  data: Stop[];
}

export interface StopResponse {
  success: boolean;
  message: string;
  data: Stop;
}

class StopService {
  // Get all stops
  async getAllStops(provinceId?: number, type?: 'pickup' | 'dropoff'): Promise<Stop[]> {
    const params = new URLSearchParams();
    if (provinceId) params.append('provinceId', provinceId.toString());
    if (type) params.append('type', type);
    
    const response = await api.get<StopsResponse>(`/stops?${params.toString()}`);
    return response.data.data;
  }

  // Get stop by ID
  async getStopById(id: number): Promise<Stop> {
    const response = await api.get<StopResponse>(`/stops/${id}`);
    return response.data.data;
  }

  // Get stops by province
  async getStopsByProvince(provinceId: number): Promise<Stop[]> {
    const response = await api.get<StopsResponse>(`/stops/province/${provinceId}`);
    return response.data.data;
  }

  // Get stops by type
  async getStopsByType(type: 'pickup' | 'dropoff'): Promise<Stop[]> {
    const response = await api.get<StopsResponse>(`/stops/type/${type}`);
    return response.data.data;
  }

  // Create stop (admin only)
  async createStop(stopData: Omit<Stop, 'id' | 'provinceName' | 'provinceCode'>): Promise<Stop> {
    const response = await api.post<StopResponse>('/stops', stopData);
    return response.data.data;
  }

  // Update stop (admin only)
  async updateStop(id: number, stopData: Partial<Omit<Stop, 'id' | 'provinceName' | 'provinceCode'>>): Promise<Stop> {
    const response = await api.put<StopResponse>(`/stops/${id}`, stopData);
    return response.data.data;
  }

  // Delete stop (admin only)
  async deleteStop(id: number): Promise<void> {
    await api.delete(`/stops/${id}`);
  }
}

export const stopService = new StopService(); 