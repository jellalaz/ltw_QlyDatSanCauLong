package com.codewithvy.quanlydatsan.controller.auth;

import com.codewithvy.quanlydatsan.dto.ApiResponse;
import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.payload.request.ChangePasswordRequest;
import com.codewithvy.quanlydatsan.payload.request.ForgotPasswordRequest;
import com.codewithvy.quanlydatsan.payload.request.LoginRequest;
import com.codewithvy.quanlydatsan.payload.request.ResetPasswordRequest;
import com.codewithvy.quanlydatsan.payload.request.SignupRequest;
import com.codewithvy.quanlydatsan.payload.response.JwtResponse;
import com.codewithvy.quanlydatsan.service.auth.AuthenticationService;
import com.codewithvy.quanlydatsan.service.EmailService;
import com.codewithvy.quanlydatsan.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API xác thực và quản lý tài khoản người dùng")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;


    public AuthController(AuthenticationService authenticationService,
                          PasswordResetService passwordResetService,
                          EmailService emailService) {
        this.authenticationService = authenticationService;
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    @Operation(
        summary = "Đăng nhập",
        description = "Xác thực người dùng bằng số điện thoại và mật khẩu, trả về JWT token"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đăng nhập thành công",
            content = @Content(schema = @Schema(implementation = JwtResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Số điện thoại hoặc mật khẩu không đúng"
        )
    })
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResp = authenticationService.authenticate(loginRequest);
        return ResponseEntity.ok(ApiResponse.ok(jwtResp, "Đăng nhập thành công"));
    }

    @PostMapping("/register")
    @Operation(
        summary = "Đăng ký tài khoản mới",
        description = "Tạo tài khoản người dùng mới với vai trò mặc định là ROLE_USER"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đăng ký thành công"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Số điện thoại hoặc email đã tồn tại, hoặc mật khẩu không khớp"
        )
    })
    public ResponseEntity<ApiResponse<JwtResponse>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return performSignup(signUpRequest);
    }

    @PostMapping("/signup")
    @Operation(
        summary = "Đăng ký tài khoản mới (alias cho /register)",
        description = "Tạo tài khoản người dùng mới với vai trò mặc định là ROLE_USER"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đăng ký thành công"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Số điện thoại hoặc email đã tồn tại, hoặc mật khẩu không khớp"
        )
    })
    public ResponseEntity<ApiResponse<JwtResponse>> signupUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return performSignup(signUpRequest);
    }

    /**
     * Perform signup logic
     */
    private ResponseEntity<ApiResponse<JwtResponse>> performSignup(@Valid SignupRequest signUpRequest) {
        JwtResponse jwtResponse = authenticationService.signup(signUpRequest);
        return ResponseEntity.ok(ApiResponse.ok(jwtResponse, "Đăng ký thành công"));
    }

    @PostMapping("/forgot-password")
    @Operation(
        summary = "Quên mật khẩu",
        description = "Gửi mã đặt lại mật khẩu qua email"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Nếu email hợp lệ, mã đặt lại đã được gửi"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Email không hợp lệ"
        )
    })
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Email là bắt buộc"));
        }
        // Tạo token (nếu email có tồn tại) và gửi – tránh lộ thông tin email tồn tại hay không.
        try {
            String token = passwordResetService.createTokenForEmail(request.getEmail());
            emailService.sendPlainText(request.getEmail(), "Mã Xác Nhận Đặt Lại Mật Khẩu",
                    "Mã xác nhận đặt lại mật khẩu của bạn là: " + token + "\n\nMã này có hiệu lực trong 15 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai.");
        } catch (ResourceNotFoundException ex) {
            // bỏ qua để tránh dò email
        }
        return ResponseEntity.ok(ApiResponse.ok("Nếu email hợp lệ, mã đặt lại đã được gửi", "Gửi thành công"));
    }

    @PostMapping("/reset-password")
    @Operation(
        summary = "Đặt lại mật khẩu",
        description = "Đặt lại mật khẩu sử dụng token nhận được qua email"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đổi mật khẩu thành công"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Token không hợp lệ hoặc đã hết hạn"
        )
    })
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank() ||
            request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Token và mật khẩu mới là bắt buộc"));
        }
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", "Password changed"));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Đổi mật khẩu khi đã đăng nhập",
        description = "Cho phép user đã đăng nhập đổi mật khẩu bằng cách xác thực mật khẩu cũ"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đổi mật khẩu thành công"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Mật khẩu cũ không đúng hoặc mật khẩu mới không khớp"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Chưa đăng nhập"
        )
    })
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String phone = authentication.getName();
        authenticationService.changePassword(phone, request);

        return ResponseEntity.ok(
            ApiResponse.ok("Đổi mật khẩu thành công", "Thành công"));
    }
}

