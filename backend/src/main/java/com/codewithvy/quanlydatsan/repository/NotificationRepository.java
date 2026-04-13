package com.codewithvy.quanlydatsan.repository;

import com.codewithvy.quanlydatsan.model.Notification;
import com.codewithvy.quanlydatsan.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy tất cả thông báo của một user, sắp xếp theo thời gian mới nhất
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    // Đếm số thông báo chưa đọc
    Long countByRecipientAndIsReadFalse(User recipient);

    // Lấy thông báo chưa đọc
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);

    // Đánh dấu tất cả thông báo của user là đã đọc
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Notification n WHERE n.booking.id IN :bookingIds")
    int deleteAllByBookingIds(@Param("bookingIds") List<Long> bookingIds);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId OR n.sender.id = :senderId")
    int deleteAllByRecipientIdOrSenderId(@Param("recipientId") Long recipientId, @Param("senderId") Long senderId);
}

