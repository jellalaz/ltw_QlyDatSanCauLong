# 📍 Vị Trí Call API Trong Project QuanLyDatSan

## 1. Tổng Quan: Các API Endpoints Được Định Nghĩa Ở Đâu?

Trong project Spring Boot REST API của bạn, **tất cả API endpoints được định nghĩa trong các file Controller**

```
Cấu trúc gọi API:
┌─────────────────────────────────────────┐
│  Client (Frontend/Mobile App)            │
│  gửi HTTP request                        │
└────────────────┬────────────────────────┘
                 │
                 ↓ (HTTP Request)
         GET http://localhost:8080/api/venues
         POST http://localhost:8080/api/auth/login
         PUT http://localhost:8080/api/bookings/1
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Backend (Spring Boot)                   │
│  ├─ Controller                           │
│  ├─ Service                              │
│  ├─ Repository                           │
│  └─ Database                             │
└─────────────────────────────────────────┘
```

---

## 2. Danh Sách Tất Cả Controller (Nơi Định Nghĩa API)

### 📂 Vị Trí: `/src/main/java/com/codewithvy/quanlydatsan/controller/`

| File | Đường Dẫn | Chức Năng |
|------|----------|----------|
| **AuthController.java** | `/api/auth` | Đăng nhập, đăng ký, quên mật khẩu |
| **UserController.java** | `/api/users` | Quản lý tài khoản người dùng |
| **VenuesController.java** | `/api/venues` | Quản lý sân/địa điểm |
| **CourtController.java** | `/api/courts` | Quản lý sân con |
| **BookingController.java** | `/api/bookings` | Đặt sân, quản lý đặt sân |
| **ReviewController.java** | `/api/reviews` | Đánh giá sân |
| **NotificationController.java** | `/api/notifications` | Thông báo |
| **AddressController.java** | `/api/addresses` | Quản lý địa chỉ |
| **FileController.java** | `/api/files` | Upload/download file |
| **HelloController.java** | `/` hoặc `/api/hello` | Test API |

---

## 3. Chi Tiết Các Endpoints Theo Controller

### 🔐 AuthController - `/api/auth`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/AuthController.java`

#### Endpoints:
```
POST   /api/auth/login                    → Đăng nhập
POST   /api/auth/register                 → Đăng ký tài khoản mới
POST   /api/auth/forgot-password          → Quên mật khẩu
POST   /api/auth/reset-password           → Đặt lại mật khẩu
POST   /api/auth/change-password          → Đổi mật khẩu
POST   /api/auth/refresh-token            → Refresh JWT token
GET    /api/auth/verify-email/{token}     → Xác nhận email
```

**Request Body Example:**
```json
{
  "phone": "0123456789",
  "password": "password123"
}
```

---

### 👤 UserController - `/api/users`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/UserController.java`

#### Endpoints:
```
GET    /api/users/me                      → Lấy thông tin user hiện tại
GET    /api/users/{id}                    → Lấy thông tin user theo ID
PUT    /api/users/{id}                    → Cập nhật thông tin user
DELETE /api/users/{id}                    → Xóa user
GET    /api/users                         → Lấy danh sách tất cả users (ADMIN)
```

---

### 🏟️ VenuesController - `/api/venues`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/VenuesController.java`

#### Endpoints:
```
GET    /api/venues                        → Lấy danh sách tất cả sân
GET    /api/venues/my-venues              → Lấy danh sách sân của tôi (OWNER)
GET    /api/venues/search?q=keyword       → Tìm kiếm sân
GET    /api/venues/{id}                   → Lấy thông tin sân chi tiết
POST   /api/venues                        → Tạo sân mới (OWNER)
PUT    /api/venues/{id}                   → Cập nhật thông tin sân (OWNER)
DELETE /api/venues/{id}                   → Xóa sân (OWNER)
POST   /api/venues/{id}/images            → Upload ảnh sân (OWNER)
GET    /api/venues/{id}/courts            → Lấy danh sách sân con
```

**Request Body Example (Tạo Venue):**
```json
{
  "name": "Sân cầu lông ABC",
  "address": "123 Đường XYZ, TP HCM",
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "phone": "0123456789",
  "email": "abc@gmail.com",
  "description": "Sân cầu lông chất lượng cao"
}
```

---

### 🎾 CourtController - `/api/courts`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/CourtController.java`

#### Endpoints:
```
GET    /api/courts/{id}                   → Lấy thông tin sân con
POST   /api/courts                        → Tạo sân con mới (OWNER)
PUT    /api/courts/{id}                   → Cập nhật sân con (OWNER)
DELETE /api/courts/{id}                   → Xóa sân con (OWNER)
GET    /api/courts/venue/{venueId}        → Lấy danh sách sân con theo venue
```

---

### 📅 BookingController - `/api/bookings`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/BookingController.java`

#### Endpoints:
```
POST   /api/bookings                      → Đặt sân mới (USER)
GET    /api/bookings/my-bookings          → Lấy danh sách booking của tôi (USER)
GET    /api/bookings/{id}                 → Lấy chi tiết booking
PUT    /api/bookings/{id}/confirm-payment → Xác nhận thanh toán (USER)
PUT    /api/bookings/{id}/accept          → Chủ sân chấp nhận booking (OWNER)
PUT    /api/bookings/{id}/reject          → Chủ sân từ chối booking (OWNER)
GET    /api/bookings/venue/{venueId}      → Lấy danh sách booking của venue (OWNER)
GET    /api/bookings/venue/{venueId}/pending → Lấy booking chờ xác nhận (OWNER)
GET    /api/bookings/pending              → Lấy tất cả booking chờ xác nhận (OWNER)
GET    /api/bookings/calendar/{venueId}   → Lấy lịch đặt sân (hiển thị calendar)
```

**Request Body Example (Đặt Sân):**
```json
{
  "venueId": 1,
  "bookingItems": [
    {
      "courtId": 1,
      "startTime": "2026-04-07T09:00:00",
      "endTime": "2026-04-07T10:00:00"
    }
  ],
  "note": "Đặt sân cho giải đấu"
}
```

---

### ⭐ ReviewController - `/api/reviews`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/ReviewController.java`

#### Endpoints:
```
POST   /api/reviews                       → Tạo đánh giá (USER)
GET    /api/reviews/venue/{venueId}       → Lấy danh sách đánh giá của venue
GET    /api/reviews/my-reviews            → Lấy danh sách đánh giá của tôi (USER)
PUT    /api/reviews/{id}                  → Cập nhật đánh giá (USER)
DELETE /api/reviews/{id}                  → Xóa đánh giá (USER)
```

---

### 🔔 NotificationController - `/api/notifications`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/NotificationController.java`

#### Endpoints:
```
GET    /api/notifications                 → Lấy danh sách thông báo của tôi
GET    /api/notifications/{id}            → Lấy chi tiết thông báo
PUT    /api/notifications/{id}/read       → Đánh dấu thông báo là đã đọc
DELETE /api/notifications/{id}            → Xóa thông báo
```

---

### 📍 AddressController - `/api/addresses`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/AddressController.java`

#### Endpoints:
```
GET    /api/addresses                     → Lấy danh sách địa chỉ
POST   /api/addresses                     → Tạo địa chỉ mới
PUT    /api/addresses/{id}                → Cập nhật địa chỉ
DELETE /api/addresses/{id}                → Xóa địa chỉ
```

---

### 📁 FileController - `/api/files`

**File:** `src/main/java/com/codewithvy/quanlydatsan/controller/FileController.java`

#### Endpoints:
```
POST   /api/files/upload                  → Upload file
GET    /api/files/{filename}              → Download file
DELETE /api/files/{filename}              → Xóa file
```

---

## 4. Luồng Call API Hoàn Chỉnh

### Ví dụ: Người Dùng Đặt Sân

```
Frontend (Client)                    Backend (Server)
     │                                  │
     │─ 1. Call POST /api/auth/login ──→│ AuthController.authenticateUser()
     │←─ 2. Trả về JWT Token ──────────│
     │                                  │
     │─ 3. Call GET /api/venues ──────→│ VenuesController.getAllVenues()
     │←─ 4. Trả về danh sách sân ──────│
     │                                  │
     │─ 5. Call POST /api/bookings ───→│ BookingController.createBooking()
     │                                  │  ↓
     │                                  │ BookingService.createBooking()
     │                                  │  ↓
     │                                  │ BookingItemRepository.findBookedSlots()
     │                                  │  ↓
     │                                  │ BookingRepository.save(booking)
     │←─ 6. Trả về BookingResponse ───│
     │                                  │
```

---

## 5. Cách Gọi API Từ Frontend

### 5.1 Với Curl (Postman/Terminal)

```bash
# Đăng nhập
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0123456789","password":"password123"}'

# Lấy danh sách sân (cần token)
curl -X GET http://localhost:8080/api/venues \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Đặt sân
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "venueId": 1,
    "bookingItems": [{
      "courtId": 1,
      "startTime": "2026-04-07T09:00:00",
      "endTime": "2026-04-07T10:00:00"
    }]
  }'
```

### 5.2 Với JavaScript/React (Frontend)

```javascript
// Đăng nhập
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '0123456789',
    password: 'password123'
  })
});
const data = await loginResponse.json();
const token = data.data.accessToken;

// Lấy danh sách sân
const venuesResponse = await fetch('http://localhost:8080/api/venues', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const venues = await venuesResponse.json();

// Đặt sân
const bookingResponse = await fetch('http://localhost:8080/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    venueId: 1,
    bookingItems: [{
      courtId: 1,
      startTime: '2026-04-07T09:00:00',
      endTime: '2026-04-07T10:00:00'
    }]
  })
});
const booking = await bookingResponse.json();
```

### 5.3 Với Axios (React/Vue)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_BASE_URL
});

// Thêm interceptor để tự động gắn token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Đăng nhập
api.post('/auth/login', {
  phone: '0123456789',
  password: 'password123'
}).then(res => {
  localStorage.setItem('token', res.data.data.accessToken);
});

// Lấy danh sách sân
api.get('/venues').then(res => {
  console.log(res.data.data); // Danh sách sân
});

// Đặt sân
api.post('/bookings', {
  venueId: 1,
  bookingItems: [{
    courtId: 1,
    startTime: '2026-04-07T09:00:00',
    endTime: '2026-04-07T10:00:00'
  }]
}).then(res => {
  console.log(res.data.data); // Booking info
});
```

---

## 6. Cấu Trúc Thư Mục Chi Tiết

```
src/main/java/com/codewithvy/quanlydatsan/
│
├── controller/                           ← API ENDPOINTS ĐƯỢC ĐỊNH NGHĨA TẠI ĐÂY
│   ├── AuthController.java               ← /api/auth/*
│   ├── UserController.java               ← /api/users/*
│   ├── VenuesController.java             ← /api/venues/*
│   ├── CourtController.java              ← /api/courts/*
│   ├── BookingController.java            ← /api/bookings/*
│   ├── ReviewController.java             ← /api/reviews/*
│   ├── NotificationController.java       ← /api/notifications/*
│   ├── AddressController.java            ← /api/addresses/*
│   ├── FileController.java               ← /api/files/*
│   └── HelloController.java              ← /api/hello
│
├── service/                              ← LOGIC XỬ LÝ BUSINESS
│   ├── AuthService.java
│   ├── UserService.java
│   ├── VenuesService.java
│   ├── BookingService.java
│   ├── EmailService.java
│   └── ... (các service khác)
│
├── repository/                           ← TRUY VẤN DATABASE
│   ├── UserRepository.java
│   ├── VenuesRepository.java
│   ├── BookingRepository.java
│   ├── CourtRepository.java
│   ├── BookingItemRepository.java        ← Các custom query như existsConflictingBooking()
│   └── ... (các repository khác)
│
├── model/                                ← ENTITY (ORM MAPPING)
│   ├── User.java
│   ├── Venues.java
│   ├── Booking.java
│   ├── Court.java
│   ├── BookingItem.java
│   ├── Review.java
│   └── ... (các entity khác)
│
├── dto/                                  ← DATA TRANSFER OBJECT
│   ├── BookingRequest.java
│   ├── BookingResponse.java
│   ├── VenuesDTO.java
│   └── ... (các DTO khác)
│
├── payload/                              ← REQUEST/RESPONSE PAYLOAD
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── SignupRequest.java
│   │   └── ...
│   └── response/
│       ├── JwtResponse.java
│       └── ...
│
├── security/                             ← SECURITY (JWT, AUTHENTICATION)
│   ├── JwtUtils.java
│   ├── UserDetailsImpl.java
│   └── ...
│
├── exception/                            ← EXCEPTION HANDLING
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── ...
│
├── config/                               ← CONFIGURATION
│   ├── WebSecurityConfig.java
│   ├── JacksonConfig.java
│   └── ...
│
└── util/                                 ← UTILITIES
    └── ... (các utility class)
```

---

## 7. Authentication & Authorization

### 🔑 JWT Token Flow

```
1. Frontend gửi POST /api/auth/login
   ↓
2. Backend (AuthController) xác thực user
   ↓
3. Backend sinh JWT token (AccessToken + RefreshToken)
   ↓
4. Frontend nhận token, lưu vào localStorage
   ↓
5. Frontend gọi API khác, gắn Authorization: Bearer <token>
   ↓
6. Backend kiểm tra token (via JwtUtils), cho phép/từ chối request
```

### 🔐 Các Role & Permission

```
- ROLE_USER   → Người dùng thường, có thể đặt sân, đánh giá
- ROLE_OWNER  → Chủ sân, quản lý venue, xác nhận booking
- ROLE_ADMIN  → Admin, quản lý toàn bộ hệ thống
```

---

## 8. Testing API với Postman

**File Collection:** `/POSTMAN/BookingCourt_Postman_Collection.json`

Các bước:
1. Mở Postman
2. Import collection từ file trên
3. Chọn environment (local, dev, prod)
4. Test từng endpoint

---

## 9. Swagger/OpenAPI Documentation

**URL:** `http://localhost:8080/swagger-ui.html`

Sau khi chạy server, bạn có thể xem interactive API documentation tại URL trên.

---

## 10. Summary - Tóm Tắt

| Câu Hỏi | Trả Lời |
|--------|---------|
| **API được gọi ở đâu?** | Trong file **Controller** (9 file trong `/controller/`) |
| **Endpoints được định nghĩa bằng gì?** | Annotations: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` |
| **Business logic ở đâu?** | Trong file **Service** (các class xử lý logic) |
| **Truy vấn DB ở đâu?** | Trong file **Repository** (extends JpaRepository) |
| **Làm sao gọi API từ frontend?** | Dùng `fetch()`, `axios`, hay `curl` kèm Authorization Bearer token |
| **Xác thực ở đâu?** | AuthController + SecurityConfig + JwtUtils |

---

## 📚 Tham Khảo Thêm

- **Request/Response Example:** `/POSTMAN/` folder
- **API Documentation:** Swagger UI tại `/swagger-ui.html`
- **Models:** Xem file trong `/model/` để hiểu cấu trúc data
- **DTOs:** Xem file trong `/dto/` để hiểu format gửi/nhận dữ liệu

