/**
 * Court Model - Đại diện cho một Sân lẻ bên trong Cụm sân
 */
class Court {
  constructor(id, name, description, venueId, pricePerHour, status, isActive, imageUrl) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.venueId = venueId;
    this.pricePerHour = pricePerHour;  // Giá theo giờ (VND)
    this.status = status;              // AVAILABLE | UNAVAILABLE | MAINTENANCE
    this.isActive = isActive;
    this.imageUrl = imageUrl;
  }

  static fromAPI(data) {
    const id = data.id;
    const name = data.name || `Sân ${id}`;

    return new Court(
      id,
      name,
      data.description,
      data.venueId,
      data.pricePerHour,
      data.status,
      data.isActive,
      data.imageUrl
    );
  }
}

export default Court;
