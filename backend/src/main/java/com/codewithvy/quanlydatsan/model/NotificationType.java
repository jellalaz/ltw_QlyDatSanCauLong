package com.codewithvy.quanlydatsan.model;

/**
 * Enum định nghĩa các loại thông báo trong hệ thống
 */
public enum NotificationType {
    BOOKING_CREATED,          // Có người vừa tạo đơn đặt sân mới
    PAYMENT_UPLOADED,         // Người dùng đã upload chứng minh chuyển khoản
    BOOKING_CONFIRMED,        // Chủ sân đã xác nhận booking
    BOOKING_REJECTED,         // Chủ sân đã từ chối booking
    BOOKING_EXPIRED,          // Booking hết hạn thanh toán
    BOOKING_CANCELLED,        // Người thuê đã hủy đơn đặt sân
    REVIEW_RECEIVED,          // Chủ sân nhận được đánh giá mới
    REVIEW_REPLIED            // Người thuê nhận được phản hồi từ chủ sân
}
