package com.codewithvy.quanlydatsan.controller;

import com.codewithvy.quanlydatsan.dto.AdminDashboardStatsDTO;
import com.codewithvy.quanlydatsan.dto.AdminCreateUserRequest;
import com.codewithvy.quanlydatsan.dto.AdminRoleUpdateRequest;
import com.codewithvy.quanlydatsan.dto.AdminUpdateUserRequest;
import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.dto.BookingResponse;
import com.codewithvy.quanlydatsan.dto.UserDTO;
import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.model.Booking;
import com.codewithvy.quanlydatsan.model.BookingStatus;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.model.Venues;
import com.codewithvy.quanlydatsan.repository.BookingRepository;
import com.codewithvy.quanlydatsan.repository.VenuesRepository;
import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.mapper.VenuesMapper;
import com.codewithvy.quanlydatsan.service.BookingService;
import com.codewithvy.quanlydatsan.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final VenuesRepository venuesRepository;

    public AdminController(UserService userService,
                           BookingService bookingService,
                           BookingRepository bookingRepository,
                           VenuesRepository venuesRepository) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.venuesRepository = venuesRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.getManageableUsers().stream()
                .map(UserDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(users, "Lấy danh sách người dùng thành công"));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        User user = userService.createUserByAdmin(request);
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user), "Tạo người dùng thành công"));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        User user = userService.updateUserByAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.fromEntity(user), "Cập nhật người dùng thành công"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUserByAdmin(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa người dùng thành công"));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request) {
        User user = userService.updateUserRoles(
                id,
                request.getRoles(),
                request.getBankName(),
                request.getBankAccountNumber(),
                request.getBankAccountName()
        );
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

    @GetMapping("/venues")
    public ResponseEntity<ApiResponse<List<VenuesDTO>>> getAllVenues() {
        List<VenuesDTO> venues = venuesRepository.findAll().stream()
                .map(VenuesMapper::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(venues, "Lấy danh sách venues toàn hệ thống thành công"));
    }

    @DeleteMapping("/venues/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVenue(@PathVariable Long id) {
        Venues venue = venuesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
        venuesRepository.delete(venue);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã xóa venue thành công"));
    }
}
