package com.codewithvy.quanlydatsan.service;

import com.codewithvy.quanlydatsan.dto.AdminCreateUserRequest;
import com.codewithvy.quanlydatsan.dto.AdminUpdateUserRequest;
import com.codewithvy.quanlydatsan.dto.UpdateUserRequest;
import com.codewithvy.quanlydatsan.model.Role;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.exception.RoleNotFoundException;
import com.codewithvy.quanlydatsan.model.Venues;
import com.codewithvy.quanlydatsan.repository.BookingItemRepository;
import com.codewithvy.quanlydatsan.repository.BookingRepository;
import com.codewithvy.quanlydatsan.repository.NotificationRepository;
import com.codewithvy.quanlydatsan.repository.PasswordResetTokenRepository;
import com.codewithvy.quanlydatsan.repository.ReviewRepository;
import com.codewithvy.quanlydatsan.repository.RoleRepository;
import com.codewithvy.quanlydatsan.repository.UserRepository;
import com.codewithvy.quanlydatsan.repository.VenuesRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Set<String> PROTECTED_SYSTEM_ADMIN_PHONES = Set.of("09000000", "0900000000");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final VenuesRepository venuesRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       BookingRepository bookingRepository,
                       BookingItemRepository bookingItemRepository,
                       ReviewRepository reviewRepository,
                       NotificationRepository notificationRepository,
                       VenuesRepository venuesRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.bookingRepository = bookingRepository;
        this.bookingItemRepository = bookingItemRepository;
        this.reviewRepository = reviewRepository;
        this.notificationRepository = notificationRepository;
        this.venuesRepository = venuesRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

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

    public List<User> getManageableUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !isProtectedSystemAdmin(user))
                .collect(Collectors.toList());
    }

    @Transactional
    public User createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RoleNotFoundException("ROLE_USER not found"));

        User user = new User();
        user.setFullname(request.getFullname().trim());
        user.setPhone(request.getPhone().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(userRole));

        return userRepository.save(user);
    }

    @Transactional
    public User updateUserByAdmin(Long userId, AdminUpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        assertSystemAdminEditable(user);

        String normalizedEmail = request.getEmail().trim();
        String normalizedPhone = request.getPhone().trim();

        userRepository.findByEmail(normalizedEmail).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(userId)) {
                throw new IllegalArgumentException("Email đã được sử dụng bởi tài khoản khác");
            }
        });

        userRepository.findByPhone(normalizedPhone).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(userId)) {
                throw new IllegalArgumentException("Số điện thoại đã được sử dụng bởi tài khoản khác");
            }
        });

        user.setFullname(request.getFullname().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);

        if (hasRole(user.getRoles(), "ROLE_OWNER")) {
            validateOwnerBankInfo(request.getBankName(), request.getBankAccountNumber(), request.getBankAccountName());
            user.setBankName(trimToNull(request.getBankName()));
            user.setBankAccountNumber(trimToNull(request.getBankAccountNumber()));
            user.setBankAccountName(trimToNull(request.getBankAccountName()));
        } else {
            user.setBankName(trimToNull(request.getBankName()));
            user.setBankAccountNumber(trimToNull(request.getBankAccountNumber()));
            user.setBankAccountName(trimToNull(request.getBankAccountName()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUserByAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        assertSystemAdminEditable(user);

        boolean isOwner = hasRole(user.getRoles(), "ROLE_OWNER");

        Set<Long> bookingIds = new HashSet<>(bookingRepository.findByUserId(userId).stream()
                .map(com.codewithvy.quanlydatsan.model.Booking::getId)
                .collect(Collectors.toSet()));

        if (isOwner) {
            bookingIds.addAll(bookingRepository.findDistinctByOwnerVenues(userId).stream()
                    .map(com.codewithvy.quanlydatsan.model.Booking::getId)
                    .collect(Collectors.toSet()));
        }

        cleanupBookings(bookingIds);

        if (isOwner) {
            List<Venues> ownerVenues = venuesRepository.findByOwnerId(userId);
            venuesRepository.deleteAll(ownerVenues);
        }

        reviewRepository.deleteByUserId(userId);
        notificationRepository.deleteByRecipientIdOrSenderId(userId, userId);
        passwordResetTokenRepository.deleteByUserId(userId);

        userRepository.delete(user);
    }

    /**
     * Cập nhật danh sách role cho một user (dành cho ADMIN)
     */
    @Transactional
    public User updateUserRoles(Long userId, Set<String> roleNames) {
        return updateUserRoles(userId, roleNames, null, null, null);
    }

    @Transactional
    public User updateUserRoles(Long userId, Set<String> roleNames,
                                String bankName, String bankAccountNumber, String bankAccountName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        assertSystemAdminEditable(user);

        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("Danh sách role không được để trống");
        }

        Set<Role> roles = roleNames.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RoleNotFoundException("Role not found: " + roleName)))
                .collect(java.util.stream.Collectors.toSet());

        boolean hadOwnerRole = hasRole(user.getRoles(), "ROLE_OWNER");
        boolean hasOwnerRole = hasRole(roles, "ROLE_OWNER");

        if (!hadOwnerRole && hasOwnerRole) {
            validateOwnerBankInfo(bankName, bankAccountNumber, bankAccountName);
            user.setBankName(trimToNull(bankName));
            user.setBankAccountNumber(trimToNull(bankAccountNumber));
            user.setBankAccountName(trimToNull(bankAccountName));
        } else if (hasOwnerRole) {
            if (StringUtils.hasText(bankName)) user.setBankName(trimToNull(bankName));
            if (StringUtils.hasText(bankAccountNumber)) user.setBankAccountNumber(trimToNull(bankAccountNumber));
            if (StringUtils.hasText(bankAccountName)) user.setBankAccountName(trimToNull(bankAccountName));
            validateOwnerBankInfo(user.getBankName(), user.getBankAccountNumber(), user.getBankAccountName());
        } else {
            user.setBankName(null);
            user.setBankAccountNumber(null);
            user.setBankAccountName(null);
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }

    private void cleanupBookings(Set<Long> bookingIds) {
        if (bookingIds == null || bookingIds.isEmpty()) {
            return;
        }
        List<Long> ids = bookingIds.stream().filter(Objects::nonNull).toList();
        if (ids.isEmpty()) {
            return;
        }

        reviewRepository.deleteByBookingIdIn(ids);
        notificationRepository.deleteByBookingIdIn(ids);
        bookingItemRepository.deleteByBookingIdIn(ids);
        bookingRepository.deleteAllByIdInBatch(ids);
    }

    private void assertSystemAdminEditable(User user) {
        if (isProtectedSystemAdmin(user)) {
            throw new IllegalArgumentException("Không thể chỉnh sửa hoặc xóa tài khoản quản trị mặc định");
        }
    }

    private boolean isProtectedSystemAdmin(User user) {
        return user != null && PROTECTED_SYSTEM_ADMIN_PHONES.contains(user.getPhone());
    }

    private boolean hasRole(Set<Role> roles, String roleName) {
        if (roles == null || roles.isEmpty()) return false;
        return roles.stream().anyMatch(role -> roleName.equals(role.getName()));
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }

    private void validateOwnerBankInfo(String bankName, String bankAccountNumber, String bankAccountName) {
        if (!StringUtils.hasText(bankName) || !StringUtils.hasText(bankAccountNumber) || !StringUtils.hasText(bankAccountName)) {
            throw new IllegalArgumentException("Cần nhập đầy đủ thông tin ngân hàng khi cấp quyền Chủ sân");
        }
    }
}
