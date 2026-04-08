package com.codewithvy.quanlydatsan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entity lưu địa chỉ hành chính (tỉnh/thành, quận/huyện, địa chỉ chi tiết).
 * Một địa chỉ gắn với một Venues duy nhất (1-1 relationship).
 * Address là inverse side - không sở hữu foreign key.
 */
@Entity
@Table(name = "address")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // id địa chỉ

    @Column(nullable = false)
    private String provinceOrCity; // Tỉnh/Thành phố
    @Column(nullable = false)
    private String district; // Quận/Huyện
    @Column(nullable = false)
    private String detailAddress; // Địa chỉ chi tiết

    // Inverse side - không sở hữu foreign key
    // Không dùng cascade hoặc orphanRemoval ở đây
    @OneToOne(mappedBy = "address")
    @JsonIgnore // tránh vòng lặp Address -> Venues -> Address khi serialize JSON
    private Venues venues; // venues thuộc địa chỉ này (1-1 relationship - inverse side)
}
