package com.codewithvy.quanlydatsan.service.user;

import com.codewithvy.quanlydatsan.dto.UpdateUserRequest;
import com.codewithvy.quanlydatsan.dto.UserDTO;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserService userService;

    public UserProfileService(UserService userService) {
        this.userService = userService;
    }

    @Transactional
    public String requestOwnerRole() {
        User currentUser = userService.getCurrentUser();
        userService.addOwnerRole(currentUser);
        return "Đã nâng cấp thành chủ sân thành công! Vui lòng đăng nhập lại để cập nhật quyền.";
    }

    public UserDTO getCurrentUserProfile() {
        User user = userService.getCurrentUser();
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public UserDTO updateCurrentUserProfile(UpdateUserRequest request) {
        User updatedUser = userService.updateCurrentUser(request);
        return UserDTO.fromEntity(updatedUser);
    }
}


