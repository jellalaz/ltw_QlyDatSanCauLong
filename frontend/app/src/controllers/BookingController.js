import BookingService from '../services/BookingService';
import Booking from '../models/Booking';

/**
 * BookingController - Xử lý logic + validation cho Booking
 */
class BookingController {
  static async create(bookingData) {
    // TODO: Validate trước khi gửi API
    const res = await BookingService.create(bookingData);
    return Booking.fromAPI(res.data.data || res.data);
  }

  static async getMyBookings() {
    const res = await BookingService.getMyBookings();
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Booking.fromAPI) : [];
  }

  static async cancel(bookingId) {
    await BookingService.cancel(bookingId);
  }

  static async pay(bookingId) {
    await BookingService.pay(bookingId);
  }

  // Owner actions
  static async getOwnerBookings(params) {
    const res = await BookingService.getOwnerBookings(params);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Booking.fromAPI) : [];
  }

  static async approve(bookingId) {
    await BookingService.approve(bookingId);
  }

  static async reject(bookingId) {
    await BookingService.reject(bookingId);
  }

  static async finish(bookingId) {
    await BookingService.finish(bookingId);
  }
}

export default BookingController;
