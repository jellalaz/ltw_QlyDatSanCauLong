package com.codewithvy.quanlydatsan.service;

import com.codewithvy.quanlydatsan.dto.UpdateUserRequest;
import com.codewithvy.quanlydatsan.model.Role;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.exception.RoleNotFoundException;
import com.codewithvy.quanlydatsan.repository.RoleRepository;
import com.codewithvy.quanlydatsan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Lấy thông tin user hiện tại từ SecurityContext
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String phone = authentication.getName();
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Thêm role OWNER cho user (nâng cấp thành chủ sân)
     */
    @Transactional
    public void addOwnerRole(User user) {
        // Kiểm tra xem user đã có role OWNER chưa
        boolean hasOwnerRole = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_OWNER"));

        if (hasOwnerRole) {
            throw new RuntimeException("Bạn đã là chủ sân rồi!");
        }

        // Tìm role OWNER trong database
        Role ownerRole = roleRepository.findByName("ROLE_OWNER")
                .orElseThrow(() -> new RoleNotFoundException("ROLE_OWNER not found"));

        // Thêm role OWNER vào danh sách roles của user (KHÔNG XÓA role cũ)
        user.getRoles().add(ownerRole);
        userRepository.save(user);
    }

    /**
     * Cập nhật thông tin user hiện tại
     */
    @Transactional
    public User updateCurrentUser(UpdateUserRequest request) {
        User user = getCurrentUser();

        // Cập nhật thông tin cơ bản (nếu có)
        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Kiểm tra email đã tồn tại chưa (trừ email của chính user hiện tại)
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
                    throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác");
                }
            });
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            // Kiểm tra số điện thoại đã tồn tại chưa (trừ số điện thoại của chính user hiện tại)
            userRepository.findByPhone(request.getPhone()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
                    throw new RuntimeException("Số điện thoại đã được sử dụng bởi tài khoản khác");
                }
            });
            user.setPhone(request.getPhone());
        }

        // Cập nhật thông tin ngân hàng (thường dùng cho OWNER)
        if (request.getBankName() != null) {
            user.setBankName(request.getBankName());
        }

        if (request.getBankAccountNumber() != null) {
            user.setBankAccountNumber(request.getBankAccountNumber());
        }

        if (request.getBankAccountName() != null) {
            user.setBankAccountName(request.getBankAccountName());
        }

        return userRepository.save(user);
    }

    /**
     * Lấy toàn bộ users (dành cho ADMIN)
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Cập nhật danh sách role cho một user (dành cho ADMIN)
     */
    @Transactional
    public User updateUserRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("Danh sách role không được để trống");
        }

        Set<Role> roles = roleNames.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RoleNotFoundException("Role not found: " + roleName)))
                .collect(java.util.stream.Collectors.toSet());

        user.setRoles(roles);
        return userRepository.save(user);
    }
}
