const PayOS = require("@payos/node");

class PaymentService {
  constructor() {
    // Sử dụng thư viện PayOS thay vì gọi API trực tiếp
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID || 'cbed4cad-0f62-4415-b51e-17ecb95317d6',
      process.env.PAYOS_API_KEY || 'cc30960e-aa1f-4937-90ab-e75a54b5eb36',
      process.env.PAYOS_CHECKSUM_KEY || '2b55dd7d0693acb404e36149d01bfeca6d0af282db696aaa5212d5cc8e7ae43b'
    );
  }

  // Tạo payment link sử dụng PayOS SDK
  async createPaymentLink(paymentData) {
    try {
      const { orderCode, amount, description, returnUrl, cancelUrl, buyerName, buyerEmail, buyerPhone, buyerAddress, items, expiredAt } = paymentData;
      
      // Đảm bảo orderCode là số
      const numericOrderCode = typeof orderCode === 'string' ? parseInt(orderCode.replace(/\D/g, '')) : orderCode;
      
      const requestData = {
        orderCode: numericOrderCode,
        amount,
        description: description.substring(0, 25), // Giới hạn 25 ký tự
        cancelUrl,
        returnUrl,
        items: items || [],
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerAddress,
        expiredAt: expiredAt || Math.floor(Date.now() / 1000) + 3600 // 1 hour
      };

      console.log('Creating payment link with data:', requestData);

      const paymentLinkResponse = await this.payOS.createPaymentLink(requestData);

      console.log('Payment link created successfully:', paymentLinkResponse);

      return {
        data: {
          checkoutUrl: paymentLinkResponse.checkoutUrl,
          paymentRequestId: paymentLinkResponse.paymentRequestId,
          orderCode: paymentLinkResponse.orderCode,
          status: paymentLinkResponse.status
        }
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Không thể tạo link thanh toán: ' + error.message);
    }
  }

  // Xác thực webhook signature
  verifyWebhookSignature(webhookData, signature) {
    try {
      // Tạo signature từ webhook data (loại bỏ signature field)
      const dataToSign = { ...webhookData };
      delete dataToSign.signature; // Loại bỏ signature field trước khi tạo signature
      
      const expectedSignature = this.createSignature(dataToSign);
      console.log('Webhook signature verification:', {
        received: signature,
        expected: expectedSignature,
        isValid: signature === expectedSignature,
        dataKeys: Object.keys(webhookData)
      });
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Lấy thông tin thanh toán
  async getPaymentInfo(paymentRequestId) {
    try {
      // Sử dụng method đúng của PayOS SDK
      const paymentInfo = await this.payOS.getPaymentLinkInformation(paymentRequestId);
      
      return {
        data: paymentInfo
      };
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw new Error('Không thể lấy thông tin thanh toán: ' + error.message);
    }
  }

  // Hủy thanh toán
  async cancelPayment(paymentRequestId, reason) {
    try {
      const cancelResult = await this.payOS.cancelPaymentLink(paymentRequestId, reason);
      
      return {
        data: cancelResult
      };
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw new Error('Không thể hủy thanh toán: ' + error.message);
    }
  }

  // Tạo signature cho manual verification (nếu cần)
  createSignature(data) {
    const crypto = require('crypto');
    const dataStr = JSON.stringify(data);
    const signature = crypto
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY || '2b55dd7d0693acb404e36149d01bfeca6d0af282db696aaa5212d5cc8e7ae43b')
      .update(dataStr)
      .digest('hex');
    return signature;
  }
}

module.exports = new PaymentService(); 