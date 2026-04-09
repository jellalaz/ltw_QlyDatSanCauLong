import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class AdminService {
  static getDashboardStats() {
    return axios.get(`${API_BASE_URL}/admin/stats`);
  }

  static getUsers() {
    return axios.get(`${API_BASE_URL}/admin/users`);
  }

  static updateUserRoles(userId, roles) {
    return axios.put(`${API_BASE_URL}/admin/users/${userId}/roles`, { roles });
  }

  static getAllBookings() {
    return axios.get(`${API_BASE_URL}/admin/bookings`);
  }

  static getVenues() {
    return axios.get(`${API_BASE_URL}/admin/venues`);
  }

  static deleteVenue(venueId) {
    return axios.delete(`${API_BASE_URL}/admin/venues/${venueId}`);
  }
}

export default AdminService;
