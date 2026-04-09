import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * CourtService - Gọi các API liên quan đến Sân lẻ (Courts)
 * Tương ứng với: CourtController.java
 */
class CourtService {
  /** Lấy danh sách sân lẻ của 1 cụm sân */
  static getByVenue(venueId) {
    return axios.get(`${API_BASE_URL}/courts`, { params: { venueId } });
  }

  /** Xem chi tiết 1 sân lẻ */
  static getById(courtId) {
    return axios.get(`${API_BASE_URL}/courts/${courtId}`);
  }

  /** Kiểm tra lịch trống của sân theo ngày */
  static getAvailability(courtId, date) {
    return axios.get(`${API_BASE_URL}/courts/${courtId}/availability`, {
      params: { date },
    });
  }

  /** [OWNER] Tạo sân lẻ mới trong cụm sân */
  static create(courtData) {
    return axios.post(`${API_BASE_URL}/courts`, courtData);
  }

  /** [OWNER] Cập nhật sân lẻ */
  static update(courtId, courtData) {
    return axios.put(`${API_BASE_URL}/courts/${courtId}`, courtData);
  }

  /** [OWNER] Xóa sân lẻ */
  static delete(courtId) {
    return axios.delete(`${API_BASE_URL}/courts/${courtId}`);
  }
}

export default CourtService;
