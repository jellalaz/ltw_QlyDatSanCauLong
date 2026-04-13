package com.codewithvy.quanlydatsan.controller.admin;

import com.codewithvy.quanlydatsan.dto.AdminDashboardStatsDTO;
import com.codewithvy.quanlydatsan.dto.AdminCreateUserRequest;
import com.codewithvy.quanlydatsan.dto.AdminRoleUpdateRequest;
import com.codewithvy.quanlydatsan.dto.AdminUpdateUserRequest;
import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.dto.BookingResponse;
import com.codewithvy.quanlydatsan.dto.UserDTO;
import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.service.admin.AdminManagementService;
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

    private final AdminManagementService adminManagementService;

    public AdminController(AdminManagementService adminManagementService) {
        this.adminManagementService = adminManagementService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = adminManagementService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users, "Lấy danh sách người dùng thành công"));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        UserDTO user = adminManagementService.createUser(request);
        return ResponseEntity.ok(ApiResponse.ok(user, "Tạo người dùng thành công"));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        UserDTO user = adminManagementService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok(user, "Cập nhật người dùng thành công"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminManagementService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa người dùng thành công"));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request) {
        UserDTO user = adminManagementService.updateUserRoles(id, request);
        return ResponseEntity.ok(ApiResponse.ok(user, "Cập nhật quyền người dùng thành công"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = adminManagementService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.ok(bookings, "Lấy danh sách booking toàn hệ thống thành công"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDTO>> getDashboardStats() {
        AdminDashboardStatsDTO stats = adminManagementService.getDashboardStats();

        return ResponseEntity.ok(ApiResponse.ok(stats, "Lấy thống kê admin thành công"));
    }

    @GetMapping("/venues")
    public ResponseEntity<ApiResponse<List<VenuesDTO>>> getAllVenues() {
        List<VenuesDTO> venues = adminManagementService.getAllVenues();
        return ResponseEntity.ok(ApiResponse.ok(venues, "Lấy danh sách venues toàn hệ thống thành công"));
    }

    @DeleteMapping("/venues/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVenue(@PathVariable Long id) {
        adminManagementService.deleteVenue(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã xóa venue thành công"));
    }
}

