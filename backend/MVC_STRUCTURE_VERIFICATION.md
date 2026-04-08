# 📋 Xác Minh Cấu Trúc MVC - Dự Án QuanLyDatSan

## ✅ KẾT LUẬN: Project TUÂN THỨ MÔ HÌNH MVC

---

## 1. Cấu Trúc Thư Mục Hiện Tại

```
src/main/java/com/codewithvy/quanlydatsan/
├── QuanLyDatSanApplication.java          # Spring Boot Entry Point
├── common/                                # Common utilities
│   └── BaseEntity.java                   # Base class for all entities
├── config/                                # Spring Configuration
│   ├── AuditingConfig.java
│   ├── FlexibleLocalTimeDeserializer.java
│   ├── JacksonConfig.java
│   ├── OpenApiConfig.java
│   └── WebSecurityConfig.java
├── controller/           ✅ C - CONTROLLER
│   ├── AddressController.java
│   ├── AuthController.java
│   ├── BookingController.java
│   ├── CourtController.java
│   ├── FileController.java
│   ├── HelloController.java
│   ├── NotificationController.java
│   ├── ReviewController.java
│   ├── UserController.java
│   └── VenuesController.java
├── dto/                  ✅ M - MODEL (Data Transfer)
│   ├── AddressDTO.java
│   ├── ApiResponse.java
│   ├── BookingItemRequest.java
│   ├── BookingItemResponse.java
│   ├── BookingRejectRequest.java
│   ├── BookingRequest.java
│   ├── BookingResponse.java
│   ├── CourtRequest.java
│   ├── FileUploadRequest.java
│   ├── NotificationDTO.java
│   ├── OwnerBankInfoDTO.java
│   ├── PaymentProofRequest.java
│   ├── ReviewDTO.java
│   ├── ReviewRequest.java
│   ├── UpdateUserRequest.java
│   ├── UserDTO.java
│   ├── VenuesDTO.java
│   ├── VenuesRequest.java
│   └── validation/
├── exception/                             # Exception Handling Layer
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── RoleNotFoundException.java
│   └── ...
├── mapper/                                # Entity ↔ DTO Mapping
├── model/                ✅ M - MODEL (Entity/Database)
│   ├── Address.java
│   ├── Booking.java
│   ├── BookingItem.java
│   ├── BookingStatus.java
│   ├── Court.java
│   ├── Notification.java
│   ├── NotificationType.java
│   ├── PasswordResetToken.java
│   ├── Review.java
│   ├── Role.java
│   ├── User.java
│   └── Venues.java
├── payload/                               # Other data models
├── repository/           ✅ R - REPOSITORY (Data Access Layer)
│   ├── AddressRepository.java
│   ├── BookingItemRepository.java
│   ├── BookingRepository.java
│   ├── CourtRepository.java
│   ├── NotificationRepository.java
│   ├── PasswordResetTokenRepository.java
│   ├── ReviewRepository.java
│   ├── RoleRepository.java
│   ├── UserRepository.java
│   └── VenuesRepository.java
├── security/                              # Security Configuration
├── service/              ✅ S - SERVICE (Business Logic Layer)
│   ├── BookingExpirationService.java
│   ├── BookingService.java
│   ├── EmailService.java
│   ├── FileStorageService.java
│   ├── NotificationService.java
│   ├── PasswordResetService.java
│   ├── PriceService.java
│   ├── ReviewService.java
│   ├── UserService.java
│   ├── VenuesService.java
│   └── impl/                              # Service Implementations
└── util/                                  # Utility classes
```

---

## 2. Ánh Xạ Tới Mô Hình MVC

### ✅ **M (Model)**
**Chức năng:** Đại diện cho dữ liệu và logic nghiệp vụ cơ bản

| Loại | Thư Mục | Ví Dụ | Mục Đích |
|------|---------|-------|---------|
| **Entity** | `model/` | `User.java`, `Venues.java`, `Booking.java` | JPA Entity - ánh xạ bảng CSDL |
| **DTO** | `dto/` | `UserDTO.java`, `VenuesDTO.java`, `BookingResponse.java` | Data Transfer Object - giao tiếp API |
| **Request** | `dto/` | `VenuesRequest.java`, `BookingRequest.java` | Request input từ client |
| **Response** | `dto/` | `BookingResponse.java`, `BookingItemResponse.java` | Response trả về cho client |

**Ví dụ cấu trúc:**

```java
// model/Venues.java - JPA Entity
@Entity
@Table(name = "venues")
@Data
public class Venues {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    private String description;
    
    @OneToMany
    private List<Court> courts;
}

// dto/VenuesDTO.java - Data Transfer Object
@Data
@Builder
public class VenuesDTO {
    private Long id;
    private String name;
    private String description;
    private AddressDTO address;
}
```

---

### ✅ **V (View)**
**Chức năng:** Giao diện hiển thị dữ liệu

| Loại | Tệp | Mục Đích |
|------|-----|---------|
| **API REST** | `controller/` | Backend trả JSON (không phải HTML) |
| **Frontend** | Riêng biệt | React/Vue/Flutter gọi API |

**Ghi chú:**
- ✅ Project là **REST API** → Response là JSON, không phải HTML
- ✅ Không cần `templates/` folder vì là API backend
- ✅ Frontend gọi API qua HTTP requests
- ✅ Vẫn tuân thủ MVC pattern (V = JSON response)

---

### ✅ **C (Controller)**
**Chức năng:** Xử lý HTTP requests, điều hướng logic, trả response

| Tệp | Điểm Cuối | Chức Năng |
|-----|-----------|----------|
| `AuthController.java` | `/api/auth/**` | Đăng ký, đăng nhập, quên mật khẩu |
| `VenuesController.java` | `/api/venues/**` | CRUD sân cầu lông |
| `BookingController.java` | `/api/bookings/**` | Đặt sân, xem lịch |
| `UserController.java` | `/api/users/**` | Quản lý thông tin người dùng |
| `ReviewController.java` | `/api/reviews/**` | Bình luận & đánh giá |

**Ví dụ:**

```java
@RestController
@RequestMapping("/api/venues")
public class VenuesController {
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<VenuesDTO>>> getAllVenues() {
        // Controller nhận request
        // Gọi Service để xử lý logic
        // Trả response JSON
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<VenuesDTO>> createVenues(
            @RequestBody VenuesRequest request) {
        // Xử lý yêu cầu
    }
}
```

---

### ✅ **Service (Business Logic Layer)**
**Chức năng:** Xử lý logic nghiệp vụ phức tạp

| Tệp | Mục Đích |
|-----|----------|
| `VenuesService.java` | Xử lý logic liên quan sân |
| `BookingService.java` | Xử lý logic đặt sân |
| `UserService.java` | Xử lý logic người dùng |
| `EmailService.java` | Gửi email |
| `PriceService.java` | Tính giá |

**Ví dụ:**

```java
@Service
public class VenuesService {
    
    @Autowired
    private VenuesRepository venuesRepository;
    
    @Autowired
    private CourtRepository courtRepository;
    
    public VenuesDTO createVenues(VenuesRequest request) {
        // Logic validation
        // Save to database
        // Return DTO
    }
}
```

---

### ✅ **Repository (Data Access Layer)**
**Chức năng:** Truy cập CSDL, thực hiện CRUD operations

| Tệp | Entity | Mục Đích |
|-----|--------|----------|
| `VenuesRepository.java` | `Venues` | Truy cập dữ liệu sân |
| `BookingRepository.java` | `Booking` | Truy cập dữ liệu đặt sân |
| `UserRepository.java` | `User` | Truy cập dữ liệu người dùng |
| `CourtRepository.java` | `Court` | Truy cập dữ liệu sân con |

**Ví dụ:**

```java
@Repository
public interface VenuesRepository extends JpaRepository<Venues, Long> {
    List<Venues> findByNameContaining(String name);
    Optional<Venues> findById(Long id);
}
```

---

## 3. Luồng Dữ Liệu (Data Flow) MVC

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (React/Vue/Mobile App)                                  │
│ Gửi HTTP Request: POST /api/venues                              │
│ Content-Type: application/json                                  │
│ Body: { "name": "Sân ABC", "address": {...} }                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ C - CONTROLLER: VenuesController                              │
│ ├─ @PostMapping                                                 │
│ ├─ Nhận @RequestBody VenuesRequest                             │
│ ├─ Gọi VenuesService.createVenues(request)                     │
│ └─ Trả ResponseEntity<ApiResponse<VenuesDTO>>                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ VenuesRequest → VenuesDTO
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ S - SERVICE: VenuesService                                    │
│ ├─ Validate dữ liệu (kiểm tra name, address...)                │
│ ├─ Tính toán logic (price, availability, etc.)                 │
│ ├─ Gọi Repository để lưu dữ liệu                               │
│ └─ Map Entity → DTO                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ VenuesRequest
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ R - REPOSITORY: VenuesRepository                              │
│ ├─ venuesRepository.save(new Venues(...))                       │
│ ├─ SQL: INSERT INTO venues (name, address) VALUES (...)        │
│ └─ Trả về Entity đã lưu (có ID)                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Entity
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ M - MODEL: Entity (Venues.java)                               │
│ └─ @Entity Venues { id, name, address, courts... }             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Entity
                           ▼
                       Database (MySQL)
                    INSERT venues VALUES (...)
                           │ Entity with ID
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Service: Map Entity → DTO                                     │
│ └─ new VenuesDTO(id, name, address, null)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ VenuesDTO
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Controller: Tạo Response                                      │
│ └─ ApiResponse.ok(venuesDTO, "Tạo sân thành công")             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ JSON Response
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend nhận Response:                                          │
│ {                                                               │
│   "success": true,                                              │
│   "data": {                                                     │
│     "id": 1,                                                    │
│     "name": "Sân ABC",                                          │
│     "address": {...}                                           │
│   },                                                            │
│   "message": "Tạo sân thành công"                              │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Tương Ứng Chi Tiết

### 📊 Bảng Ánh Xạ MVC

| MVC Component | Trong Project | Chi Tiết | Ví Dụ File |
|---|---|---|---|
| **M (Model)** | `model/` + `dto/` | Entity JPA + DTO objects | `Venues.java`, `VenuesDTO.java` |
| **V (View)** | `controller/` (JSON) | API responses, không HTML template | `@RestController` responses |
| **C (Controller)** | `controller/` | REST controllers xử lý HTTP | `VenuesController.java` |
| **Service** | `service/` | Business logic layer | `VenuesService.java` |
| **Repository** | `repository/` | Data access layer | `VenuesRepository.java` |

---

## 5. Các Thành Phần MVC Chi Tiết

### 5.1 Model Layer (M)

**Entity (`model/` folder):**
```
model/
├── User.java              → JPA Entity @Entity
├── Venues.java            → JPA Entity @Entity
├── Booking.java           → JPA Entity @Entity
├── Court.java             → JPA Entity @Entity
├── Review.java            → JPA Entity @Entity
├── Address.java           → JPA Entity @Entity
├── BookingItem.java       → JPA Entity @Entity
├── Role.java              → JPA Entity @Entity
├── Notification.java      → JPA Entity @Entity
└── ...
```

**DTO (`dto/` folder):**
```
dto/
├── UserDTO.java           → Request/Response format
├── VenuesDTO.java         → Request/Response format
├── BookingRequest.java    → Input data format
├── BookingResponse.java   → Output data format
├── ApiResponse.java       → Wrapper for all responses
└── ...
```

---

### 5.2 View Layer (V)

**JSON Response (không phải HTML):**
```java
// Controller trả JSON
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sân cầu lông A",
    "address": "123 Đường ABC"
  },
  "message": "Success"
}
```

---

### 5.3 Controller Layer (C)

**REST Controllers:**
```
controller/
├── AuthController.java        → /api/auth/* (đăng ký, đăng nhập)
├── VenuesController.java      → /api/venues/* (CRUD sân)
├── BookingController.java     → /api/bookings/* (đặt sân)
├── UserController.java        → /api/users/* (quản lý user)
├── CourtController.java       → /api/courts/* (quản lý sân con)
├── ReviewController.java      → /api/reviews/* (bình luận)
├── NotificationController.java → /api/notifications/* (thông báo)
└── ...
```

---

## 6. So Sánh: MVC vs REST API vs Multi-Layer Architecture

| Đặc Điểm | MVC | REST API | Project Bạn |
|---|---|---|---|
| **View** | HTML Template | JSON/XML | ✅ JSON (REST API) |
| **Controller** | Xử lý HTTP | REST Endpoint | ✅ REST Endpoint |
| **Model** | Entity | Entity + DTO | ✅ Entity + DTO |
| **Service** | Business Logic | Business Logic | ✅ Service Layer |
| **Repository** | Data Access | Data Access | ✅ Repository Layer |
| **Pattern** | Server-side render | API-driven | ✅ API-driven MVC |
| **Frontend** | JSP/Thymeleaf | React/Vue/Mobile | ✅ Riêng biệt |

---

## 7. Kết Luận

### ✅ Project **TUÂN THỨ MVC Pattern**

**Xác nhận các thành phần:**

| Thành Phần | Có? | Nơi | Trạng Thái |
|---|---|---|---|
| **Model** | ✅ YES | `model/` (Entity) + `dto/` (DTO) | Đầy đủ |
| **View** | ✅ YES | `controller/` (JSON responses) | Là REST API |
| **Controller** | ✅ YES | `controller/` | Đầy đủ |
| **Service** | ✅ YES | `service/` | Đầy đủ |
| **Repository** | ✅ YES | `repository/` | Đầy đủ |

---

## 8. Phân Loại Kiến Trúc

```
┌─────────────────────────────────────────────┐
│        Kiến Trúc của Project                │
├─────────────────────────────────────────────┤
│ • REST API (Backend)                        │
│ • Multi-Layer Architecture (Model-Service-  │
│   Repository-Controller)                    │
│ • MVC Pattern (trong context REST API)      │
│ • SOLID Principles                          │
│ • Dependency Injection (Spring)             │
└─────────────────────────────────────────────┘
```

---

## 9. Cấu Trúc Hoàn Chỉnh

### **Model Layer (M)**
```
├── Entity Classes (JPA @Entity)
│   ├── User.java
│   ├── Venues.java
│   ├── Booking.java
│   └── ...
│
└── Data Transfer Objects (DTO)
    ├── UserDTO.java
    ├── VenuesDTO.java
    ├── BookingRequest.java
    ├── BookingResponse.java
    └── ApiResponse.java
```

### **View Layer (V)** - REST API
```
└── JSON Responses via @RestController
    ├── HTTP 200 OK with JSON
    ├── HTTP 400 Bad Request with error JSON
    └── HTTP 401 Unauthorized with error JSON
```

### **Controller Layer (C)**
```
├── AuthController.java (@RestController)
├── VenuesController.java (@RestController)
├── BookingController.java (@RestController)
└── ...
```

### **Service Layer (S)** - Business Logic
```
├── VenuesService.java
├── BookingService.java
├── UserService.java
└── ...impl/
```

### **Repository Layer (R)** - Data Access
```
├── VenuesRepository extends JpaRepository
├── BookingRepository extends JpaRepository
└── ...
```

---

## 📝 Tóm Tắt

### **Kết Luận Cuối Cùng:**

**❓ Câu Hỏi:** Backend có tuân theo mô hình MVC không?

**✅ Trả Lời:** **CÓ**, project tuân thủ MVC pattern:

- ✅ **M (Model):** `model/` (Entity JPA) + `dto/` (DTO objects)
- ✅ **V (View):** `controller/` (JSON REST API responses)
- ✅ **C (Controller):** `controller/` (REST controllers)
- ✅ **Service:** `service/` (Business logic layer)
- ✅ **Repository:** `repository/` (Data access layer)

### **Phân Loại Kiến Trúc:**
- ✅ **REST API Architecture** (trả JSON, không phải HTML)
- ✅ **Multi-Layer Architecture** (Model-Service-Repository-Controller)
- ✅ **MVC Pattern** (trong context API)

**Không cần thay đổi cấu trúc** - Project đã tuân thủ MVC pattern đúng chuẩn!

---

## 📚 Tài Liệu Tham Khảo

- **Spring MVC Documentation:** https://spring.io/projects/spring-framework
- **Spring Data JPA:** https://spring.io/projects/spring-data-jpa
- **REST API Best Practices:** https://restfulapi.net/

---

*Cập nhật: April 7, 2026*

