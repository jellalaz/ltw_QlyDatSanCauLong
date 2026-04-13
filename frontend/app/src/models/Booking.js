/**
 * Booking Model - Đại diện cho 1 đơn đặt sân
 */
class Booking {
  constructor(id, userId, courtId, venueName, courtName, bookingDate, startTime, endTime, totalPrice, status, bookingItems, expireTime, paymentProofUploaded, paymentProofUrl, paymentProofUploadedAt, rejectionReason, ownerBankInfo) {
    this.id = id;
    this.userId = userId;
    this.courtId = courtId;
    this.venueName = venueName;
    this.courtName = courtName;
    this.bookingDate = bookingDate;    // VD: "2024-11-15"
    this.startTime = startTime;        // VD: "08:00"
    this.endTime = endTime;            // VD: "10:00"
    this.totalPrice = totalPrice;
    this.status = status;
    this.bookingItems = bookingItems || [];
    this.expireTime = expireTime;
    this.paymentProofUploaded = paymentProofUploaded;
    this.paymentProofUrl = paymentProofUrl;
    this.paymentProofUploadedAt = paymentProofUploadedAt;
    this.rejectionReason = rejectionReason;
    this.ownerBankInfo = ownerBankInfo || null;
  }

  getStatusLabel() {
    const map = {
      PENDING_PAYMENT: 'Chờ thanh toán',
      PAYMENT_UPLOADED: 'Chờ chủ sân duyệt',
      CONFIRMED: 'Đã xác nhận',
      REJECTED: 'Từ chối',
      COMPLETED: 'Phê duyệt',
      CANCELLED: 'Đã hủy',
      EXPIRED: 'Hết hạn',
    };
    return map[this.status] || this.status;
  }

  static fromAPI(data) {
    const toIsoDateTime = (value) => {
      if (!value) return '';
      if (Array.isArray(value)) {
        const [y, m = 1, d = 1, hh = 0, mm = 0, ss = 0] = value.map((item) => Number(item) || 0);
        return new Date(y, Math.max(0, m - 1), d, hh, mm, ss).toISOString();
      }
      if (typeof value === 'object') {
        const y = Number(value.year ?? 0);
        const m = Number(value.monthValue ?? value.month ?? 1);
        const d = Number(value.dayOfMonth ?? value.day ?? 1);
        const hh = Number(value.hour ?? 0);
        const mm = Number(value.minute ?? 0);
        const ss = Number(value.second ?? 0);
        if (y > 0) {
          return new Date(y, Math.max(0, m - 1), d, hh, mm, ss).toISOString();
        }
      }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? '' : date.toISOString();
    };

    const bookingItems = Array.isArray(data.bookingItems) ? data.bookingItems : [];
    const normalizedItems = bookingItems.map((item) => ({
      ...item,
      startTime: toIsoDateTime(item.startTime),
      endTime: toIsoDateTime(item.endTime),
    }));
    const firstItem = normalizedItems[0] || {};
    const startTime = toIsoDateTime(data.startTime) || firstItem.startTime;
    const endTime = toIsoDateTime(data.endTime) || firstItem.endTime;
    const expireTime = toIsoDateTime(data.expireTime);
    const paymentProofUploadedAt = toIsoDateTime(data.paymentProofUploadedAt);

    return new Booking(
      data.id,
      data.userId,
      data.courtId,
      data.venuesName || data.venueName,
      data.courtName,
      startTime ? String(startTime).slice(0, 10) : '',
      startTime,
      endTime,
      data.totalPrice,
      data.status,
      normalizedItems,
      expireTime,
      data.paymentProofUploaded,
      data.paymentProofUrl,
      paymentProofUploadedAt,
      data.rejectionReason,
      data.ownerBankInfo
    );
  }
}

export default Booking;
