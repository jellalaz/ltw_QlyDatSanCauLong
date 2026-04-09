import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * BookingService - Gọi các API liên quan đến Đặt sân (Bookings)
 * Tương ứng với: BookingController.java
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

  /** [USER] Hủy đơn đặt sân (nếu còn trong điều kiện) */
  static cancel(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
  }

  /** [USER] Thanh toán đơn */
  static pay(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/pay`);
  }

  /** [OWNER] Lấy tất cả đơn đặt sân của cơ sở mình */
  static getOwnerBookings(params = {}) {
    return axios.get(`${API_BASE_URL}/bookings/owner`, { params });
  }

  /** [OWNER] Phê duyệt đơn đặt sân */
  static approve(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/approve`);
  }

  /** [OWNER] Từ chối đơn đặt sân */
  static reject(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/reject`);
  }

  /** [OWNER] Đánh dấu hoàn thành */
  static finish(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/finish`);
  }

  /** Xem chi tiết 1 đơn (cả user và owner được xem đơn liên quan) */
  static getById(bookingId) {
    return axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
  }
}

export default BookingService;
