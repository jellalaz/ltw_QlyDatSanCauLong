# ❓ Call API Thì Không Gọi Là MVC À?

## Câu Trả Lời: **KHÔNG, call API không phải MVC**

---

## 1. Sự Khác Biệt Cơ Bản

### 📱 REST API (Current Project của bạn)

```
Frontend (Mobile/Web App)
    ↓
Call API (HTTP Request)
    ↓
Backend REST API
├── Controller (@RestController)
├── Service
├── Repository
└── Database
    ↓
Response JSON
```

**Đặc điểm:**
- ❌ Không có View trong Backend
- ✅ Backend chỉ xử lý logic và trả JSON
- ✅ Frontend gọi API, tự render UI
- ✅ Frontend và Backend tách biệt hoàn toàn

**Khi nào gọi đây:**
- REST API
- Web Service
- Microservice
- Backend for Frontend (BFF)

---

### 🖥️ MVC (Model-View-Controller)

```
Client (Browser)
    ↓
Call URL / Submit Form
    ↓
Backend MVC
├── Controller → điều hướng
├── Service → logic
├── Repository → database
├── Model → dữ liệu
└── View (HTML) → giao diện
    ↓
Response HTML Page
```

**Đặc điểm:**
- ✅ Có View (HTML, JSP, Thymeleaf, v.v.)
- ✅ Backend tự render HTML trả về cho Browser
- ✅ Backend và Frontend tích hợp trong 1 project
- ✅ Server side rendering

**Khi nào gọi đây:**
- Web App truyền thống
- Server-side rendering (SSR)
- Admin Panel, Dashboard nội bộ

---

## 2. So Sánh Chi Tiết

### 📊 Bảng So Sánh

| Khía Cạnh | REST API (Project Bạn) | MVC |
|-----------|----------------------|-----|
| **Architecture** | REST API + Multi-Layer | MVC Truyền Thống |
| **View** | ❌ Không có | ✅ Có HTML |
| **Frontend** | ✅ Riêng biệt | ❌ Tích hợp |
| **Response Type** | JSON | HTML |
| **How to Call** | AJAX/Fetch/Axios (API) | Form Submit/Link Click |
| **Rendering** | Client-side | Server-side |
| **Server Load** | Nhẹ | Nặng |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Mobile Support** | ✅ Tốt | ❌ Không |
| **Use Case** | Modern Web, Mobile | Traditional Web |

---

## 3. Code Example: Khác Biệt Rõ Ràng

### ❌ REST API (Project Bạn)

**BookingController.java:**
```java
@RestController  // ← Trả JSON
@RequestMapping("/api/bookings")
public class BookingController {
    
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @RequestBody BookingRequest request) {
        
        BookingResponse response = bookingService.createBooking(request);
        
        // Trả về JSON Object
        return ResponseEntity.ok(ApiResponse.ok(response, "Success"));
        
        // Response: {"success": true, "data": {...}, "message": "..."}
    }
}
```

**Frontend (React/Vue) gọi API:**
```javascript
// Frontend code - gọi API, tự render UI
const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer token' },
    body: JSON.stringify(bookingData)
});
const json = await response.json();
console.log(json.data); // Xử lý JSON, render UI
```

---

### ✅ MVC (Nếu Bạn Muốn Chuyển)

**BookingController.java:**
```java
@Controller  // ← NOT @RestController
@RequestMapping("/bookings")
public class BookingController {
    
    @PostMapping
    public String createBooking(
            @ModelAttribute BookingRequest request,
            Model model) {
        
        BookingResponse response = bookingService.createBooking(request);
        
        // Thêm dữ liệu vào Model
        model.addAttribute("booking", response);
        
        // Trả về tên view (HTML file)
        return "bookings/success";
        
        // Spring sẽ tìm file: src/main/resources/templates/bookings/success.html
        // Render HTML và trả về cho Browser
    }
}
```

**View file (HTML):**
```html
<!-- src/main/resources/templates/bookings/success.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
    <h1>Đặt sân thành công!</h1>
    <p>Sân: <span th:text="${booking.venueName}"></span></p>
    <p>Giờ: <span th:text="${booking.startTime}"></span></p>
    <p>Giá: <span th:text="${booking.totalPrice}"></span></p>
</body>
</html>
```

**Frontend (Browser):**
```
Người dùng submit form
    ↓
Server render HTML tại BookingController
    ↓
Browser nhận HTML file
    ↓
Hiển thị giao diện
```

---

## 4. Luồng Gọi Chi Tiết

### REST API Workflow (Bạn Đang Dùng)

```
┌─── Frontend ──────────────────────────────────────────┐
│ React/Vue Component                                    │
│ ├─ Gọi: POST /api/bookings                           │
│ │       Content-Type: application/json                │
│ │       Body: {venueId, date, time...}               │
│ └─ Nhận: {success: true, data: {...}}                │
│                                                        │
│ Xử lý JSON response:                                  │
│ ├─ Nếu success = true → show success message         │
│ ├─ Nếu success = false → show error message          │
│ └─ Update UI state, re-render component              │
└────────────────────────────────────────────────────────┘
                          ↕ (HTTP Request/Response)
┌─── Backend ──────────────────────────────────────────┐
│ @RestController                                       │
│ ├─ Nhận POST request → body: JSON                   │
│ ├─ Gọi Service                                       │
│ ├─ Service gọi Repository, Database                  │
│ └─ Trả về ResponseEntity<JSON>                       │
│                                                        │
│ Response Format: ApiResponse                          │
│ {                                                      │
│   "success": true/false,                             │
│   "data": {...actual data...},                       │
│   "message": "..."                                    │
│ }                                                      │
└────────────────────────────────────────────────────────┘
```

### MVC Workflow (Nếu Chuyển)

```
┌─── Frontend (Browser) ─────────────────────────────────┐
│ HTML Form                                              │
│ <form action="/bookings" method="POST">               │
│   <input name="venueId">                              │
│   <input name="date">                                 │
│   <button type="submit">Đặt sân</button>             │
│ </form>                                               │
└────────────────────────────────────────────────────────┘
                          ↕ (Form Submit)
┌─── Backend ──────────────────────────────────────────┐
│ @Controller                                            │
│ ├─ Nhận form data (application/x-www-form-urlencoded)│
│ ├─ Gọi Service, Database                             │
│ ├─ model.addAttribute("booking", response)           │
│ └─ return "bookings/success" (view name)             │
│                                                        │
│ Thymeleaf Template Engine:                            │
│ ├─ Tìm: templates/bookings/success.html              │
│ ├─ Render HTML bằng dữ liệu trong Model              │
│ └─ Trả về HTML string                                │
└────────────────────────────────────────────────────────┘
                          ↕ (HTML Response)
┌─── Frontend (Browser) ─────────────────────────────────┐
│ Nhận HTML string, render trang                        │
│ Hiển thị: "Đặt sân thành công!"                      │
│          "Sân: Sân ABC"                               │
│          "Giờ: 09:00 - 10:00"                         │
│          "Giá: 100.000đ"                              │
└────────────────────────────────────────────────────────┘
```

---

## 5. Khi Nào Call API ≠ MVC

### ✅ REST API (Call API) - Project Bạn

**Cấu trúc:**
```
Backend:
├── Controllers (@RestController)
│   └── Trả JSON
├── Services
├── Repositories
└── Models

Frontend: (Riêng biệt)
├── React/Vue
├── HTML/CSS/JS
└── Gọi API lấy JSON
```

**Ví dụ thực tế:**
- 📱 Mobile App Android/iOS gọi API backend
- 🌐 Web Frontend (React, Vue) gọi API backend
- 🖥️ Desktop App gọi API backend
- 🤖 Bot/Automation gọi API backend

**Response:** JSON
```json
{
  "success": true,
  "data": {
    "id": 1,
    "venueName": "Sân ABC",
    "startTime": "2026-04-07T09:00:00"
  },
  "message": "Thành công"
}
```

---

## 6. Khi Nào Call API = MVC?

### ❌ KHÔNG CÓ!

**MVC không bao giờ "call API" ở backend, vì:**
1. MVC trả HTML, không phải JSON
2. Browser không gọi API từ HTML form
3. MVC là server-side rendering, không client-side

**Nhưng MVC trên Frontend CÓ thể gọi API:**

```
┌────────────────────────────────┐
│ Frontend (React/Vue) - MVC App │
│ ├─ Model: State, Data          │
│ ├─ View: Components, HTML      │
│ ├─ Controller: Event handlers  │
│                                 │
│ User click → Controller         │
│            → Call API (/api/...) │
│            → Update Model       │
│            → Re-render View     │
└────────────────────────────────┘
```

---

## 7. Kết Luận

### **Để Trả Lời Câu Hỏi Của Bạn:**

| Câu Hỏi | Trả Lời | Giải Thích |
|--------|--------|-----------|
| **Call API thì có phải MVC không?** | ❌ KHÔNG | Call API là REST API, không phải MVC |
| **Project hiện tại gọi là gì?** | REST API | Backend trả JSON, Frontend gọi API |
| **Thêm View vào project thì gọi là gì?** | MVC | Backend trả HTML (Thymeleaf template) |
| **Call API từ Frontend (React) có phải MVC không?** | ✅ CÓ | Frontend có M+V+C, call API là phần C |

---

## 8. Tóm Tắt Nhanh

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Call API (HTTP Request/Response JSON)                  │
│       ≠ MVC (Server-side Rendering HTML)               │
│                                                           │
│  REST API + Frontend React = Modern Pattern             │
│  MVC Traditional = Old Pattern                           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### **Your Project: REST API**
- Backend: Controllers trả JSON (không phải HTML)
- Frontend: Gọi API qua JavaScript/Axios
- Kiến trúc: API Gateway + Frontend SPA
- ≠ MVC (vì thiếu View HTML trong backend)

### **Nếu Muốn MVC:**
- Thêm Thymeleaf
- Tạo `templates/` folder
- Sửa `@RestController` → `@Controller`
- Trả về HTML string thay vì JSON
- Xóa Frontend riêng (hoặc giữ lại làm 2 project)

---

## 🎯 Final Answer

**"Call API thì không gọi là MVC"** ✅ **ĐÚNG!**

- **Call API** = REST API architecture
- **MVC** = Server-side rendering, trả HTML

**Project của bạn:**
- 🔴 **Không phải MVC** (thiếu View)
- 🟢 **Là REST API** (trả JSON)
- 🟢 **Có Model, Controller, Service, Repository** (tầng xử lý)
- 🔴 **Không có View** (HTML Template)

**Để trở thành MVC:** Cần thêm View (HTML/Thymeleaf) vào backend.

