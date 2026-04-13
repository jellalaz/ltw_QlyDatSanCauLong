package com.codewithvy.quanlydatsan.controller.user;

import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.dto.UpdateUserRequest;
import com.codewithvy.quanlydatsan.dto.UserDTO;
import com.codewithvy.quanlydatsan.service.user.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý thông tin user và nâng cấp vai trò
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    /**
     * API "Trở thành chủ sân" - nâng cấp từ USER lên OWNER
     * Chỉ cho phép người dùng đã đăng nhập với role USER gọi API này
     */
    @PostMapping("/me/request-owner-role")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<String>> requestOwnerRole() {
        String message = userProfileService.requestOwnerRole();
        return ResponseEntity.ok(ApiResponse.ok(message, "Success"));
    }

    /**
     * API lấy thông tin user hiện tại
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserDTO userDTO = userProfileService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(userDTO, "Success"));
    }

    /**
     * API cập nhật thông tin user (bao gồm thông tin ngân hàng)
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> updateCurrentUser(@RequestBody UpdateUserRequest request) {
        UserDTO userDTO = userProfileService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.ok(userDTO, "Cập nhật thông tin thành công"));
    }
}

