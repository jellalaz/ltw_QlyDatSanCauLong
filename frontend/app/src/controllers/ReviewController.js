import ReviewService from '../services/ReviewService';
import Review from '../models/Review';

/**
 * ReviewController - Xử lý logic + validation cho Review
 */
class ReviewController {
  static async getByVenue(venueId) {
    const res = await ReviewService.getByVenue(venueId);
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Review.fromAPI) : [];
  }

  static async create(bookingId, reviewData) {
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Vui lòng chọn số sao từ 1 đến 5');
    }
    if (!reviewData.comment?.trim()) {
      throw new Error('Vui lòng nhập nội dung đánh giá');
    }
    const res = await ReviewService.create(bookingId, reviewData);
    return Review.fromAPI(res.data.data || res.data);
  }

  static async getMyReviews() {
    const res = await ReviewService.getMyReviews();
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Review.fromAPI) : [];
  }

  static async getOwnerReviews() {
    const res = await ReviewService.getOwnerReviews();
    const data = res.data.data || res.data;
    return Array.isArray(data) ? data.map(Review.fromAPI) : [];
  }

  static async update(reviewId, reviewData) {
    const res = await ReviewService.update(reviewId, reviewData);
    return Review.fromAPI(res.data.data || res.data);
  }

  static async delete(reviewId) {
    await ReviewService.delete(reviewId);
  }

  static async reply(reviewId, replyText) {
    if (!replyText?.trim()) {
      throw new Error('Vui lòng nhập nội dung phản hồi');
    }
    const res = await ReviewService.reply(reviewId, replyText.trim());
    return Review.fromAPI(res.data.data || res.data);
  }
}

export default ReviewController;
