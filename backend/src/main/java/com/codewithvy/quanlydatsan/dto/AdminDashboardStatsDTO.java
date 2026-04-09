package com.codewithvy.quanlydatsan.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalBookings;
    private long pendingPaymentBookings;
    private long paymentUploadedBookings;
    private long confirmedBookings;
    private long rejectedBookings;
}
