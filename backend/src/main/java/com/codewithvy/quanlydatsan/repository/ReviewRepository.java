package com.codewithvy.quanlydatsan.repository;

import com.codewithvy.quanlydatsan.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Lấy tất cả review của một venue
    List<Review> findByVenuesIdOrderByCreatedAtDesc(Long venueId);

    // Kiểm tra xem một booking đã có review chưa
    boolean existsByBookingId(Long bookingId);

    // Lấy review của một booking
    Optional<Review> findByBookingId(Long bookingId);

    // Lấy tất cả review của một user
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Lấy tất cả review thuộc các venue của owner
    List<Review> findByVenuesOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Review r WHERE r.booking.id IN :bookingIds")
    int deleteAllByBookingIds(@Param("bookingIds") List<Long> bookingIds);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Review r WHERE r.user.id = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);

    // Tính rating trung bình của một venue
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.venues.id = :venueId")
    Double calculateAverageRating(@Param("venueId") Long venueId);

    // Đếm số lượng review của một venue
    long countByVenuesId(Long venueId);
}

