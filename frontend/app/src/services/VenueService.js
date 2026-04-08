import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * VenueService - Gọi các API liên quan đến Cụm sân (Venues)
 * Tương ứng với: VenuesController.java
 */
class VenueService {
  /** Lấy tất cả cụm sân (public, mọi người xem được) */
  static getAll(params = {}) {
    return axios.get(`${API_BASE_URL}/venues`, { params });
  }

  /** Tìm kiếm cụm sân theo từ khóa / địa chỉ */
  static search(keyword) {
    return axios.get(`${API_BASE_URL}/venues/search`, { params: { keyword } });
  }

  /** Xem chi tiết 1 cụm sân */
  static getById(venueId) {
    return axios.get(`${API_BASE_URL}/venues/${venueId}`);
  }

  /** [OWNER] Lấy danh sách cụm sân do mình sở hữu */
  static getMyVenues() {
    return axios.get(`${API_BASE_URL}/venues/my-venues`);
  }

  /** [OWNER] Tạo cụm sân mới */
  static create(venueData) {
    return axios.post(`${API_BASE_URL}/venues`, venueData);
  }

  /** [OWNER] Cập nhật cụm sân */
  static update(venueId, venueData) {
    return axios.put(`${API_BASE_URL}/venues/${venueId}`, venueData);
  }

  /** [OWNER] Xóa cụm sân */
  static delete(venueId) {
    return axios.delete(`${API_BASE_URL}/venues/${venueId}`);
  }

  /** [OWNER] Upload ảnh cho cụm sân */
  static uploadImage(venueId, formData) {
    return axios.post(`${API_BASE_URL}/venues/${venueId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export default VenueService;
