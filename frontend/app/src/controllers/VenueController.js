import VenueService from '../services/VenueService';
import Venue from '../models/Venue';

/**
 * VenueController - Xử lý logic + validation cho Venue
 */
class VenueController {
  static async getAll(params) {
    // TODO: Gọi API và map sang Venue model
    const res = await VenueService.getAll(params);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Venue.fromAPI) : [];
  }

  static async search(keyword) {
    const res = await VenueService.search(keyword);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Venue.fromAPI) : [];
  }

  static async getById(venueId) {
    const res = await VenueService.getById(venueId);
    return Venue.fromAPI(res.data.data || res.data);
  }

  static async getMyVenues() {
    const res = await VenueService.getMyVenues();
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Venue.fromAPI) : [];
  }

  static async create(venueData) {
    // TODO: Thêm validation trước khi gửi
    const res = await VenueService.create(venueData);
    return Venue.fromAPI(res.data.data || res.data);
  }

  static async update(venueId, venueData) {
    const res = await VenueService.update(venueId, venueData);
    return Venue.fromAPI(res.data.data || res.data);
  }

  static async delete(venueId) {
    await VenueService.delete(venueId);
  }

  static async uploadImages(venueId, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const res = await VenueService.uploadImages(venueId, formData);
    return res.data.data || res.data || [];
  }

  static async deleteImage(venueId, imageUrl) {
    await VenueService.deleteImage(venueId, imageUrl);
  }
}

export default VenueController;
