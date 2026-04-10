import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * BookingService - Gọi các API liên quan đến Đặt sân (Bookings)
 * Đồng bộ theo endpoint thực tế của BookingController.java
 */
class BookingService {
  /** [USER] Tạo đơn đặt sân mới */
  static create(bookingData) {
    return axios.post(`${API_BASE_URL}/bookings`, bookingData);
  }

  /** [USER] Xem lịch sử đặt sân của chính mình */
  static getMyBookings() {
    return axios.get(`${API_BASE_URL}/bookings/my-bookings`);
  }

  /** [USER] Hủy đơn đặt sân */
  static cancel(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
  }

  /** [USER] Xác nhận thanh toán (sau khi upload biên lai) */
  static pay(bookingId, paymentProofUrl) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/confirm-payment`, { paymentProofUrl });
  }

  /** [USER] Upload ảnh biên lai thanh toán */
  static uploadPaymentProof(bookingId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/bookings/${bookingId}/upload-payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** [OWNER] Lấy danh sách đơn chờ duyệt */
  static getPendingBookingsForOwner() {
    return axios.get(`${API_BASE_URL}/bookings/pending`);
  }

  /** [OWNER] Lấy tất cả đơn của owner */
  static getAllBookingsForOwner() {
    return axios.get(`${API_BASE_URL}/bookings/owner/all-bookings`);
  }

  /** [OWNER] API cũ gọi chung danh sách booking */
  static getOwnerBookings(params = {}) {
    return axios.get(`${API_BASE_URL}/bookings/owner/all-bookings`, { params });
  }

  /** [OWNER] Chấp thuận đơn */
  static acceptBooking(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/accept`);
  }

  /** [OWNER] Từ chối đơn */
  static rejectBooking(bookingId, rejectionReason) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/reject`, { rejectionReason });
  }

  /** [OWNER] Tương thích API controller cũ */
  static approve(bookingId) {
    return this.acceptBooking(bookingId);
  }

  /** [OWNER] Tương thích API controller cũ */
  static reject(bookingId, rejectionReason) {
    return this.rejectBooking(bookingId, rejectionReason || 'Không đáp ứng yêu cầu');
  }

  /** Placeholder: backend chưa có endpoint finish */
  static finish() {
    return Promise.reject(new Error('Endpoint finish chưa được hỗ trợ ở backend hiện tại'));
  }

  /** Xem chi tiết 1 đơn */
  static getById(bookingId) {
    return axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
  }
}

export default BookingService;
