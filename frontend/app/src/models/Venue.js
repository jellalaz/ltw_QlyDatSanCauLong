import { toAssetUrl } from '../utils/helpers';

/**
 * Venue Model - Đại diện cho một Cụm sân (Venue)
 */
class Venue {
  constructor(id, name, description, address, imageUrl, images, openTime, closeTime, status, ownerId, rating, reviewCount, pricePerHour, phoneNumber, email, courtsCount) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.address = address;      // Object Address { street, district, city }
    this.imageUrl = imageUrl;
    this.images = images || [];
    this.openTime = openTime;    // VD: "07:00"
    this.closeTime = closeTime;  // VD: "22:00"
    this.status = status;        // ACTIVE | INACTIVE | PENDING
    this.ownerId = ownerId;
    this.rating = rating || 0;
    this.reviewCount = reviewCount || 0;
    this.pricePerHour = pricePerHour || 0;
    this.phoneNumber = phoneNumber || '';
    this.email = email || '';
    this.courtsCount = courtsCount || 0;
  }

  static fromAPI(data) {
    const images = Array.isArray(data.images)
      ? data.images.map((item) => toAssetUrl(item)).filter(Boolean)
      : [];
    const imageUrl = toAssetUrl(data.imageUrl) || images[0];
    const rating = data.rating ?? data.averageRating;
    const reviewCount = data.reviewCount ?? data.totalReviews;
    const openTime = data.openTime ?? data.openingTime;
    const closeTime = data.closeTime ?? data.closingTime;
    const address = data.address || {};
    const phoneNumber = data.phoneNumber || data.ownerPhoneNumber || '';

    return new Venue(
      data.id,
      data.name,
      data.description,
      {
        id: address.id,
        provinceOrCity: address.provinceOrCity || address.city || '',
        district: address.district || '',
        detailAddress: address.detailAddress || address.street || '',
      },
      imageUrl,
      images,
      openTime,
      closeTime,
      data.status,
      data.ownerId,
      rating,
      reviewCount,
      data.pricePerHour,
      phoneNumber,
      data.email,
      data.courtsCount ?? data.courtCount ?? 0
    );
  }
}

export default Venue;
