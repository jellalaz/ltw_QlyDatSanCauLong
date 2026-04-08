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
    return new Venue(
      data.id,
      data.name,
      data.description,
      data.address,
      data.imageUrl,
      data.openTime,
      data.closeTime,
      data.status,
      data.ownerId,
      data.rating,
      data.reviewCount
    );
  }
}

export default Venue;
