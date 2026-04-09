/**
 * Review Model - Đại diện cho 1 đánh giá sân
 */
class Review {
  constructor(id, userId, venueId, rating, comment, authorName, createdAt) {
    this.id = id;
    this.userId = userId;
    this.venueId = venueId;
    this.rating = rating;        // 1 - 5
    this.comment = comment;
    this.authorName = authorName;
    this.createdAt = createdAt;
  }

  static fromAPI(data) {
    return new Review(
      data.id,
      data.userId,
      data.venueId,
      data.rating,
      data.comment,
      data.authorName,
      data.createdAt
    );
  }
}

export default Review;
