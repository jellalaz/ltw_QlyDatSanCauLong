import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ReviewService {
  static getByVenue(venueId) {
    return axios.get(`${API_BASE_URL}/venues/${venueId}/reviews`);
  }

  static create(bookingId, reviewData) {
    return axios.post(`${API_BASE_URL}/bookings/${bookingId}/review`, reviewData);
  }

  // ✅ Thêm mới - kiểm tra booking đã review chưa
  static getByBooking(bookingId) {
    return axios.get(`${API_BASE_URL}/bookings/${bookingId}/review`);
  }

  static update(reviewId, reviewData) {
    return axios.put(`${API_BASE_URL}/reviews/${reviewId}`, reviewData);
  }

  static delete(reviewId) {
    return axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
  }

  static reply(reviewId, replyText) {
    return axios.put(`${API_BASE_URL}/reviews/${reviewId}/reply`, { reply: replyText });
  }
}

export default ReviewService;