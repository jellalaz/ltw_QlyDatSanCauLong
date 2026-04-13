package com.codewithvy.quanlydatsan.service.admin;

import com.codewithvy.quanlydatsan.dto.AdminCreateUserRequest;
import com.codewithvy.quanlydatsan.dto.AdminDashboardStatsDTO;
import com.codewithvy.quanlydatsan.dto.AdminRoleUpdateRequest;
import com.codewithvy.quanlydatsan.dto.AdminUpdateUserRequest;
import com.codewithvy.quanlydatsan.dto.BookingResponse;
import com.codewithvy.quanlydatsan.dto.UserDTO;
import com.codewithvy.quanlydatsan.dto.VenuesDTO;
import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.model.Booking;
import com.codewithvy.quanlydatsan.model.BookingStatus;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.model.Venues;
import com.codewithvy.quanlydatsan.repository.BookingRepository;
import com.codewithvy.quanlydatsan.repository.VenuesRepository;
import com.codewithvy.quanlydatsan.service.BookingService;
import com.codewithvy.quanlydatsan.service.UserService;
import com.codewithvy.quanlydatsan.service.venue.VenuesService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminManagementService {

    private final UserService userService;
    private final BookingService bookingService;
    private final VenuesService venuesService;
    private final BookingRepository bookingRepository;
    private final VenuesRepository venuesRepository;

    public AdminManagementService(UserService userService,
                                  BookingService bookingService,
                                  VenuesService venuesService,
                                  BookingRepository bookingRepository,
                                  VenuesRepository venuesRepository) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.venuesService = venuesService;
        this.bookingRepository = bookingRepository;
        this.venuesRepository = venuesRepository;
    }

    public List<UserDTO> getAllUsers() {
        return userService.getManageableUsers().stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    @Transactional
    public UserDTO createUser(AdminCreateUserRequest request) {
        User user = userService.createUserByAdmin(request);
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userService.updateUserByAdmin(id, request);
        return UserDTO.fromEntity(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        userService.deleteUserByAdmin(id);
    }

    @Transactional
    public UserDTO updateUserRoles(Long id, AdminRoleUpdateRequest request) {
        User user = userService.updateUserRoles(
                id,
                request.getRoles(),
                request.getBankName(),
                request.getBankAccountNumber(),
                request.getBankAccountName()
        );
        return UserDTO.fromEntity(user);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByIdDesc().stream()
                .map(Booking::getId)
                .map(bookingService::getBookingById)
                .toList();
    }

    public AdminDashboardStatsDTO getDashboardStats() {
        return AdminDashboardStatsDTO.builder()
                .totalUsers(userService.getAllUsers().size())
                .totalBookings(bookingRepository.count())
                .pendingPaymentBookings(bookingRepository.countByStatus(BookingStatus.PENDING_PAYMENT))
                .paymentUploadedBookings(bookingRepository.countByStatus(BookingStatus.PAYMENT_UPLOADED))
                .confirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                .rejectedBookings(bookingRepository.countByStatus(BookingStatus.REJECTED))
                .build();
    }

    public List<VenuesDTO> getAllVenues() {
        return venuesService.getAll();
    }

    @Transactional
    public void deleteVenue(Long id) {
        Venues venue = venuesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
        venuesRepository.delete(venue);
    }
}


