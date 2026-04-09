import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class BookingService {
  static getPendingBookingsForOwner() {
    return axios.get(`${API_BASE_URL}/bookings/pending`);
  }

  static getAllBookingsForOwner() {
    return axios.get(`${API_BASE_URL}/bookings/owner/all-bookings`);
  }

  static acceptBooking(bookingId) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/accept`);
  }

  static rejectBooking(bookingId, rejectionReason) {
    return axios.put(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
      rejectionReason,
    });
  }
}

export default BookingService;
