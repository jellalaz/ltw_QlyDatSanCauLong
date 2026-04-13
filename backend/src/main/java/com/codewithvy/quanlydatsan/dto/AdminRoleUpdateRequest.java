package com.codewithvy.quanlydatsan.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class AdminRoleUpdateRequest {
    @NotEmpty(message = "Danh sách role không được để trống")
    private Set<String> roles;

    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;
}
