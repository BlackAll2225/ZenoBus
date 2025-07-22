import api from './api';
import { ApiResponse } from './types';

export interface PaymentRequest {
  bookingId: number;
}

export interface CreatePaymentLinkRequest {
  scheduleId: number;
  seatIds: number[];
  pickupStopId?: number | null;
  dropoffStopId?: number | null;
  totalAmount: number;
}

export interface PaymentResponse {
  paymentUrl: string;
  paymentRequestId: string;
  orderCode: string;
}

export interface PaymentInfo {
  id: string;
  orderCode: string;
  amount: number;
  status: string;
  description: string;
  checkoutUrl: string;
  returnUrl: string;
  cancelUrl: string;
  signature: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt: number;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  // Tạo payment link cho booking
  async createPayment(bookingId: number): Promise<PaymentResponse> {
    try {
      const response = await api.post<ApiResponse<PaymentResponse>>('/payments/create', {
        bookingId
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Không thể tạo link thanh toán');
    }
  }

  // Tạo payment link trực tiếp từ thông tin đặt vé
  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post<ApiResponse<PaymentResponse>>('/payments/create-link', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Không thể tạo link thanh toán');
    }
  }

  // Lấy thông tin thanh toán
  async getPaymentInfo(paymentRequestId: string): Promise<PaymentInfo> {
    try {
      const response = await api.get<ApiResponse<PaymentInfo>>(`/payments/${paymentRequestId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw new Error('Không thể lấy thông tin thanh toán');
    }
  }

  // Hủy thanh toán
  async cancelPayment(paymentRequestId: string, reason: string): Promise<void> {
    try {
      await api.post(`/payments/${paymentRequestId}/cancel`, { reason });
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw new Error('Không thể hủy thanh toán');
    }
  }

  // Chuyển hướng đến trang thanh toán payOS
  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
  }

  // Kiểm tra trạng thái thanh toán từ URL params (sau khi return từ payOS)
  getPaymentStatusFromUrl(): { status: string; orderCode?: string; bookingId?: string } | null {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const orderCode = urlParams.get('orderCode');
    const bookingId = urlParams.get('bookingId');
    
    if (status || bookingId) {
      return { 
        status: status || 'unknown', 
        orderCode: orderCode || undefined,
        bookingId: bookingId || undefined
      };
    }
    
    return null;
  }
}

export const paymentService = new PaymentService(); 