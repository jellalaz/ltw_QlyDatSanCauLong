package com.codewithvy.quanlydatsan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để chủ sân phản hồi review.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReplyRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(max = 1000, message = "Phản hồi không được vượt quá 1000 ký tự")
    private String reply;
}
