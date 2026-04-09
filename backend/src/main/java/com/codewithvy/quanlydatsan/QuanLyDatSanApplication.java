package com.codewithvy.quanlydatsan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.codewithvy.quanlydatsan.model.Role;
import com.codewithvy.quanlydatsan.model.User;
import com.codewithvy.quanlydatsan.repository.RoleRepository;
import com.codewithvy.quanlydatsan.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;
import java.util.TimeZone;

/**
 * Điểm vào chính của ứng dụng Spring Boot (hàm main chạy app).
 * Có kèm CommandLineRunner để seed role mặc định và tài khoản Admin ban đầu.
 */
@SpringBootApplication
@EnableScheduling
public class QuanLyDatSanApplication {

    public static void main(String[] args) {
        // Đặt múi giờ mặc định cho toàn bộ JVM là Việt Nam (UTC+7)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        SpringApplication.run(QuanLyDatSanApplication.class, args);
    }

    /**
     * Seed các role và tài khoản Admin mặc định khi app khởi động lần đầu.
     *
     * Tài khoản Admin mặc định:
     * - Số điện thoại : 0900000000
     * - Email : admin@sancaulong.vn
     * - Mật khẩu : admin123
     *
     * ⚠️ Đổi mật khẩu ngay sau khi deploy lên production!
     */
    @Bean
    public CommandLineRunner initData(
            @Autowired RoleRepository roleRepository,
            @Autowired UserRepository userRepository,
            @Autowired PasswordEncoder passwordEncoder) {
        return args -> {

            // --- 1. Seed Roles ---
            if (roleRepository.findByName("ROLE_USER").isEmpty()) {
                Role r = new Role();
                r.setName("ROLE_USER");
                roleRepository.save(r);
            }
            if (roleRepository.findByName("ROLE_OWNER").isEmpty()) {
                Role r = new Role();
                r.setName("ROLE_OWNER");
                roleRepository.save(r);
            }
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                Role r = new Role();
                r.setName("ROLE_ADMIN");
                roleRepository.save(r);
            }

            // --- 2. Seed tài khoản Admin mặc định (chỉ tạo 1 lần) ---
            String adminPhone = "0900000000";
            if (userRepository.findByPhone(adminPhone).isEmpty()) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);

                User admin = new User();
                admin.setFullname("Quản Trị Viên");
                admin.setPhone(adminPhone);
                admin.setEmail("admin@sancaulong.vn");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRoles(roles);

                userRepository.save(admin);
                System.out.println("[SEED] Tài khoản Admin đã được tạo:");
                System.out.println("   📱 Phone   : " + adminPhone);
                System.out.println("   📧 Email   : admin@sancaulong.vn");
                System.out.println("   🔑 Password: admin123");
            }
        };
    }
}
