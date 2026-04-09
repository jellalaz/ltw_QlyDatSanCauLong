package com.codewithvy.quanlydatsan.controller;

import com.codewithvy.quanlydatsan.dto.AdminDashboardStatsDTO;
import com.codewithvy.quanlydatsan.dto.AdminRoleUpdateRequest;
import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.dto.BookingResponse;
import com.codewithvy.quanlydatsan.dto.UserDTO;
import com.codewithvy.quanlydatsan.model.Booking;
import com.codewithvy.quanlydatsan.model.BookingStatus;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.repository.BookingRepository;
import com.codewithvy.quanlydatsan.service.BookingService;
import com.codewithvy.quanlydatsan.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    public AdminController(UserService userService,
                           BookingService bookingService,
                           BookingRepository bookingRepository) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers().stream()
                .map(UserDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(users, "Lấy danh sách người dùng thành công"));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request) {
        User user = userService.updateUserRoles(id, request.getRoles());
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user), "Cập nhật quyền người dùng thành công"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingRepository.findAllByOrderByIdDesc().stream()
                .map(Booking::getId)
                .map(bookingService::getBookingById)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(bookings, "Lấy danh sách booking toàn hệ thống thành công"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDTO>> getDashboardStats() {
        AdminDashboardStatsDTO stats = AdminDashboardStatsDTO.builder()
                .totalUsers(userService.getAllUsers().size())
                .totalBookings(bookingRepository.count())
                .pendingPaymentBookings(bookingRepository.countByStatus(BookingStatus.PENDING_PAYMENT))
                .paymentUploadedBookings(bookingRepository.countByStatus(BookingStatus.PAYMENT_UPLOADED))
                .confirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                .rejectedBookings(bookingRepository.countByStatus(BookingStatus.REJECTED))
                .build();

        return ResponseEntity.ok(ApiResponse.ok(stats, "Lấy thống kê admin thành công"));
    }
}
