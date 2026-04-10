import { toAssetUrl } from '../utils/helpers';

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
    const rawActive = data.isActive ?? data.active;
    const isActive = (() => {
      if (typeof rawActive === 'boolean') return rawActive;
      if (typeof rawActive === 'number') return rawActive === 1;
      if (typeof rawActive === 'string') {
        const normalized = rawActive.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return true;
        if (normalized === 'false' || normalized === '0') return false;
      }
      return true;
    })();

    return new Court(
      id,
      name,
      data.description,
      data.venueId || data.venuesId,
      data.pricePerHour,
      data.status,
      isActive,
      toAssetUrl(data.imageUrl)
    );
  }
}

export default Court;
