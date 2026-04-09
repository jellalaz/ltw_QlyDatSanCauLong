import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * ReviewService - Gọi các API đánh giá sân
 * Tương ứng với: ReviewController.java
 */
class ReviewService {
  /** Lấy danh sách review của 1 cụm sân */
  static getByVenue(venueId) {
    return axios.get(`${API_BASE_URL}/reviews`, { params: { venueId } });
  }

  /** [USER] Viết review */
  static create(reviewData) {
    return axios.post(`${API_BASE_URL}/reviews`, reviewData);
  }

  /** [USER] Sửa review của mình */
  static update(reviewId, reviewData) {
    return axios.put(`${API_BASE_URL}/reviews/${reviewId}`, reviewData);
  }

  /** [USER] Xóa review của mình */
  static delete(reviewId) {
    return axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
  }
}

export default ReviewService;
