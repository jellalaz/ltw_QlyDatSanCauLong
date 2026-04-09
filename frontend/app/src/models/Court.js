/**
 * Court Model - Đại diện cho một Sân lẻ bên trong Cụm sân
 */
class Court {
  constructor(id, name, description, venueId, pricePerHour, status) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.venueId = venueId;
    this.pricePerHour = pricePerHour;  // Giá theo giờ (VND)
    this.status = status;              // AVAILABLE | UNAVAILABLE | MAINTENANCE
  }

  static fromAPI(data) {
    return new Court(
      data.id,
      data.name,
      data.description,
      data.venueId,
      data.pricePerHour,
      data.status
    );
  }
}

export default Court;
