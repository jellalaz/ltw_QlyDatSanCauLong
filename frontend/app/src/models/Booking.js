/**
 * Booking Model - Đại diện cho 1 đơn đặt sân
 */
class Booking {
  constructor(id, userId, courtId, venueName, courtName, bookingDate, startTime, endTime, totalPrice, status, bookingItems) {
    this.id = id;
    this.userId = userId;
    this.courtId = courtId;
    this.venueName = venueName;
    this.courtName = courtName;
    this.bookingDate = bookingDate;    // VD: "2024-11-15"
    this.startTime = startTime;        // VD: "08:00"
    this.endTime = endTime;            // VD: "10:00"
    this.totalPrice = totalPrice;
    this.status = status;              // PENDING | APPROVED | REJECTED | COMPLETED | CANCELLED
    this.bookingItems = bookingItems || [];
  }

  getStatusLabel() {
    const map = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return map[this.status] || this.status;
  }

  static fromAPI(data) {
    return new Booking(
      data.id,
      data.userId,
      data.courtId,
      data.venueName,
      data.courtName,
      data.bookingDate,
      data.startTime,
      data.endTime,
      data.totalPrice,
      data.status,
      data.bookingItems
    );
  }
}

export default Booking;
