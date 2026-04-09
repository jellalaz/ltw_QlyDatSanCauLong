import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * NotificationService - Gọi các API thông báo
 * Tương ứng với: NotificationController.java
 */
class NotificationService {
  /** Lấy danh sách thông báo của mình */
  static getAll() {
    return axios.get(`${API_BASE_URL}/notifications`);
  }

  /** Đánh dấu 1 thông báo là đã đọc */
  static markAsRead(notificationId) {
    return axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
  }

  /** Đánh dấu tất cả là đã đọc */
  static markAllAsRead() {
    return axios.put(`${API_BASE_URL}/notifications/read-all`);
  }

  /** Đếm số thông báo chưa đọc */
  static countUnread() {
    return axios.get(`${API_BASE_URL}/notifications/unread-count`);
  }
}

export default NotificationService;
