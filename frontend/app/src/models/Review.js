/**
 * Review Model - Đại diện cho 1 đánh giá sân
 */
class Review {
  constructor(id, userId, venueId, venueName, bookingId, rating, comment, authorName, createdAt, updatedAt, ownerReply) {
    this.id = id;
    this.userId = userId;
    this.venueId = venueId;
    this.venueName = venueName;
    this.bookingId = bookingId;
    this.rating = rating;        // 1 - 5
    this.comment = comment;
    this.authorName = authorName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.ownerReply = ownerReply;
  }

  static fromAPI(data) {
    const authorName = data.userFullname ?? data.authorName ?? data.userName;
    const createdAt = data.createdAt ?? data.updatedAt;
    const updatedAt = data.updatedAt ?? data.createdAt;

    return new Review(
      data.id,
      data.userId,
      data.venueId,
      data.venueName,
      data.bookingId,
      data.rating,
      data.comment,
      authorName,
      createdAt,
      updatedAt,
      data.ownerReply ?? null
    );
  }
}

export default Review;
