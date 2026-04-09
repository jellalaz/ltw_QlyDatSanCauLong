/**
 * Venue Model - Đại diện cho một Cụm sân (Venue)
 */
class Venue {
  constructor(id, name, description, address, imageUrl, openTime, closeTime, status, ownerId, rating, reviewCount) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.address = address;      // Object Address { street, district, city }
    this.imageUrl = imageUrl;
    this.openTime = openTime;    // VD: "07:00"
    this.closeTime = closeTime;  // VD: "22:00"
    this.status = status;        // ACTIVE | INACTIVE | PENDING
    this.ownerId = ownerId;
    this.rating = rating || 0;
    this.reviewCount = reviewCount || 0;
  }

  static fromAPI(data) {
    const imageUrl = data.imageUrl || (Array.isArray(data.images) ? data.images[0] : undefined);
    const rating = data.rating ?? data.averageRating;
    const reviewCount = data.reviewCount ?? data.totalReviews;
    const openTime = data.openTime ?? data.openingTime;
    const closeTime = data.closeTime ?? data.closingTime;

    return new Venue(
      data.id,
      data.name,
      data.description,
      data.address,
      imageUrl,
      openTime,
      closeTime,
      data.status,
      data.ownerId,
      rating,
      reviewCount
    );
  }
}

export default Venue;
