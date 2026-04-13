package com.codewithvy.quanlydatsan.service.auth;

import com.codewithvy.quanlydatsan.exception.ResourceNotFoundException;
import com.codewithvy.quanlydatsan.exception.RoleNotFoundException;
import com.codewithvy.quanlydatsan.model.Role;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.payload.request.ChangePasswordRequest;
import com.codewithvy.quanlydatsan.payload.request.LoginRequest;
import com.codewithvy.quanlydatsan.payload.request.SignupRequest;
import com.codewithvy.quanlydatsan.payload.response.JwtResponse;
import com.codewithvy.quanlydatsan.repository.RoleRepository;
import com.codewithvy.quanlydatsan.repository.UserRepository;
import com.codewithvy.quanlydatsan.security.UserDetailsImpl;
import com.codewithvy.quanlydatsan.security.jwt.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthenticationService(AuthenticationManager authenticationManager,
                                 UserRepository userRepository,
                                 RoleRepository roleRepository,
                                 PasswordEncoder encoder,
                                 JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    public JwtResponse authenticate(LoginRequest loginRequest) {
        User existingUser = userRepository.findByPhone(loginRequest.getPhone()).orElse(null);
        if (existingUser == null) {
            throw new UsernameNotFoundException("Tài khoản không tồn tại. Vui lòng đăng ký trước khi đăng nhập");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getPhone(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String jwt = jwtUtils.generateJwtToken(authentication);
        return new JwtResponse(jwt, userDetails.getId(), userDetails.getPhone(), roles);
    }

    @Transactional
    public JwtResponse signup(SignupRequest signUpRequest) {
        logger.info("Signup request received: {}", signUpRequest);

        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            logger.warn("Password mismatch for phone: {}", signUpRequest.getPhone());
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        boolean phoneExists = userRepository.existsByPhone(signUpRequest.getPhone());
        logger.info("Checking phone: {} - exists: {}", signUpRequest.getPhone(), phoneExists);
        if (phoneExists) {
            Optional<User> existingUser = userRepository.findByPhone(signUpRequest.getPhone());
            if (existingUser.isPresent()) {
                logger.warn("Phone {} already exists - User ID: {}, Email: {}",
                        signUpRequest.getPhone(), existingUser.get().getId(), existingUser.get().getEmail());
            }
            throw new IllegalArgumentException("Số điện thoại đã được đăng ký");
        }

        boolean emailExists = userRepository.existsByEmail(signUpRequest.getEmail());
        logger.info("Checking email: {} - exists: {}", signUpRequest.getEmail(), emailExists);
        if (emailExists) {
            Optional<User> existingUser = userRepository.findByEmail(signUpRequest.getEmail());
            if (existingUser.isPresent()) {
                logger.warn("Email {} already exists - User ID: {}, Phone: {}",
                        signUpRequest.getEmail(), existingUser.get().getId(), existingUser.get().getPhone());
            }
            throw new IllegalArgumentException("Email đã được đăng ký");
        }

        User user = new User();
        user.setFullname(signUpRequest.getFullname());
        user.setPhone(signUpRequest.getPhone());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setEmail(signUpRequest.getEmail());

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RoleNotFoundException("ROLE_USER not found"));
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully - ID: {}, Phone: {}", savedUser.getId(), savedUser.getPhone());

        List<String> rolesList = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        String jwtToken = jwtUtils.generateJwtTokenFromUser(savedUser);
        return new JwtResponse(jwtToken, savedUser.getId(), savedUser.getPhone(), rolesList);
    }

    @Transactional
    public void changePassword(String phone, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu cũ");
        }

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        logger.info("User {} changed password successfully", phone);
    }
}




