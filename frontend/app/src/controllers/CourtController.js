import CourtService from '../services/CourtService';
import Court from '../models/Court';

/**
 * CourtController - Xử lý logic + validation cho Court
 */
class CourtController {
  static async getByVenue(venueId) {
    const res = await CourtService.getByVenue(venueId);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Court.fromAPI) : [];
  }

  static async getById(courtId) {
    const res = await CourtService.getById(courtId);
    return Court.fromAPI(res.data.data || res.data);
  }

  static async getAvailability(courtId, date) {
    // TODO: Trả về mảng khung giờ trống
    const res = await CourtService.getAvailability(courtId, date);
    return res.data.data || res.data;
  }

  static async create(courtData) {
    // TODO: Thêm validation
    const res = await CourtService.create(courtData);
    return Court.fromAPI(res.data.data || res.data);
  }

  static async update(courtId, courtData) {
    const res = await CourtService.update(courtId, courtData);
    return Court.fromAPI(res.data.data || res.data);
  }

  static async delete(courtId) {
    await CourtService.delete(courtId);
  }
}

export default CourtController;
