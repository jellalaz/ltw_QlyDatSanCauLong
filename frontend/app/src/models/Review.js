/**
 * Review Model - Đại diện cho 1 đánh giá sân
 */
class Review {
  constructor(id, userId, venueId, rating, comment, authorName, createdAt, ownerReply) {
    this.id = id;
    this.userId = userId;
    this.venueId = venueId;
    this.rating = rating;        // 1 - 5
    this.comment = comment;
    this.authorName = authorName;
    this.createdAt = createdAt;
    this.ownerReply = ownerReply;
  }

  static fromAPI(data) {
    const authorName = data.userFullname ?? data.authorName ?? data.userName;
    const createdAt = data.createdAt ?? data.updatedAt;

    return new Review(
      data.id,
      data.userId,
      data.venueId,
      data.rating,
      data.comment,
      authorName,
      createdAt,
      data.ownerReply ?? null
    );
  }
}

export default Review;
