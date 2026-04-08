# 🏐 Quản Lý Đặt Sân Cầu Lông - Setup & Run

## 📌 LƯU Ý QUAN TRỌNG TRƯỚC KHI BẮT ĐẦU

Project sử dụng các file cấu hình riêng cho mỗi máy (`application.properties` ở backend và `.env` ở frontend). Để tránh những lỗi conflict phiền phức mỗi khi team `git pull` code, các file này cùng với thư mục build (`target`, `node_modules`) **MẶC ĐỊNH ĐÃ ĐƯỢC THÊM VÀO `.gitignore`**.


---

## ⚙️ BƯỚC 1: TẠO FILE CẤU HÌNH (Làm 1 lần duy nhất)

### 1️⃣ Tạo file cấu hình Backend (`application.properties`)


**Tạo file mới:** `backend/src/main/resources/application.properties`

**Copy nội dung sau vào file và THAY ĐỔI username/password MySQL của bạn:**

```properties
spring.application.name=QuanLyDatSan
server.port=8080

## Cau hinh ket noi den database MySQL
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/quanlydatsan?createDatabaseIfNotExist=true
spring.datasource.username= <Tai khoan MySQL cua ban>
spring.datasource.password= <Mat khau MySQL cua ban>

# Cau hinh cua JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
# TAT SQL logging de tang toc (bat lai neu can debug: spring.jpa.show-sql=true)
spring.jpa.show-sql=false

# JWT Configuration
jwt.secret=MySuperSecretKeyForJwtToken1234567890!@#
jwt.expirationMs=86400000

# GIAM log level de tang toc (bat lai neu can debug: logging.level.org.springframework.security=DEBUG)
logging.level.org.springframework.security=DEBUG
# T?t INFO log c?a scheduled tasks
logging.level.com.codewithvy.quanlydatsan.service.BookingExpirationService=WARN

# --- Mail (placeholder - replace with real credentials) ---
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=vyp8269@gmail.com
spring.mail.password=veeu ipav zyeq msoc
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
# N?u ch?a c?u h?nh t?i kho?n th?t, EmailService s? log warning khi g?i mail

# --- Swagger/OpenAPI Configuration ---
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
springdoc.swagger-ui.tryItOutEnabled=true

# --- Timezone Configuration ---
# S? d?ng múi gi? Vi?t Nam (UTC+7) cho toàn b? ?ng d?ng
spring.jackson.time-zone=Asia/Ho_Chi_Minh
spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Ho_Chi_Minh
# Không serialize LocalDateTime v?i UTC (không thêm Z)
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.deserialization.adjust-dates-to-context-time-zone=false

# --- File Upload Configuration ---
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=uploads

```

### 2️⃣ Tạo file cấu hình Frontend (`.env`)

File này sẽ chứa đường link trỏ gọi xuống Backend (API).

**Tự tay tạo file `frontend/app/.env`.

**Nội dung sẽ như sau:**

```env
# Link tới backend API
VITE_API_URL=http://localhost:8080/api
```

## 🚀 BƯỚC 2: CHẠY PROJECT

Bạn chia Terminal làm 2 Tab.

### Terminal 1: Chạy Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

⏳ Đợi cho tới khi thấy dòng text báo hiệu **khởi động thành công**: `Tomcat started on port(s): 8080`!

### Terminal 2: Chạy Frontend (React/Vite)

```bash
cd frontend/app

# Lần đầu tiên tải code về thì cần chạy NPM Install để TẢI thư viện, 
# Từ lần sau thì không cần
npm install

# Khởi động con Server Frontend
npm run dev
```

⏳ Đợi cho tới khi màn hình xuất hiện link `http://localhost:5173` -> bấm vào

---

## ✅ HOÀN TẤT & KIỂM TRA

Mở Website qua đường link trên:
👉 **[http://localhost:5173](http://localhost:5173)**

Nó sẽ ra giao diện Web đăng nhập. 