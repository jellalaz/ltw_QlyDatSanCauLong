package com.codewithvy.quanlydatsan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    @NotBlank(message = "Họ tên là bắt buộc")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    private String fullname;

    @NotBlank(message = "Email là bắt buộc")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Pattern(regexp = "^[0-9]{8,15}$", message = "Số điện thoại phải gồm 8-15 chữ số")
    private String phone;

    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;
}

