# 🧺 1997 Premium Laundry - Hotel Laundry Web App & Chatbot

Dự án ứng dụng web đặt lịch giặt sấy cao cấp dành cho khách du lịch và khách lưu trú khách sạn tại Quận 1, TP.HCM cho thương hiệu 1997 Premium Laundry. Hệ thống tích hợp tính toán chi phí tự động, Chatbot tư vấn khách hàng đa ngôn ngữ (@bebane_bot), hệ thống gửi email xác nhận tự động qua Resend, và Trang quản lý (Admin Dashboard) thân thiện.

---

## 📂 Cấu Trúc Thư Mục Dự Án

* `api.php`: API xử lý backend chính (PHP), chịu trách nhiệm điều hướng đặt lịch, khảo sát ý kiến, lưu dữ liệu đơn hàng và khách hàng dạng JSON, gửi email qua Resend và tích hợp Webhook thanh toán SePay.
* `app.js`: Tệp xử lý logic chính ở frontend (Javascript) bao gồm Chatbot AI, bảng tính phí, kiểm tra định dạng email/SĐT, và gửi yêu cầu đến backend.
* `index.html`: Giao diện trang chủ (Landing Page) giới thiệu dịch vụ và tích hợp khung Chatbot.
* `booking.html`: Giao diện trang đặt lịch giặt sấy trực tuyến và tính giá tự động.
* `pay.html`: Giao diện hiển thị mã QR thanh toán tích hợp nội dung chuyển khoản tự động.
* `shoes.html`: Giao diện đặt lịch riêng cho dịch vụ vệ sinh giày cao cấp.
* `admin/index.html`: Trang quản trị nội bộ dành cho tiệm để đối soát danh sách khách hàng, đơn hàng và sản phẩm.
* `resend_config.txt`: Tệp lưu trữ **Resend API Key** để gửi email tự động.
* `brain.db`: Cơ sở dữ liệu SQLite cục bộ lưu trữ các thiết lập giọng nói thương hiệu, dữ liệu khách hàng và đơn hàng (cho mục đích đối soát và AI).
* `email_log.txt` & `read_logs.php`: Tệp ghi nhật ký gửi email và trang web chẩn đoán lỗi gửi mail trực quan trên host.
* `context-files/`: Thư mục lưu trữ toàn bộ các file tài liệu nghiệp vụ (Soul, Identity, Capabilities...) của Agent goClaw nhằm phục vụ đồng bộ và version control.

---

## 🚀 Hướng Dẫn Triển Khai Lên Server Hosting

### **Bước 1: Tải mã nguồn lên Hosting/VPS**
1. Đăng nhập vào trình quản lý tệp trên VPS/Hosting.
2. Tải toàn bộ các tệp trong thư mục dự án lên thư mục chạy web của 1997 Laundry (`/opt/laundry1997/` trên VPS).
3. Đảm bảo chạy dịch vụ node thông qua file `bot_manager.js` để kết nối bot Telegram `@bebane_bot`.

### **Bước 2: Cấu hình Khóa gửi mail (Resend API Key) và Môi trường**
1. Mở tệp `.env` hoặc cấu hình biến môi trường trên server.
2. Cung cấp API Key từ Resend.com, Telegram Bot Token, và `AGENT_ID=1997-laundry-assistant` để kết nối với chatbot của goClaw.

### **Bước 3: Phân quyền thư mục (Permissions)**
Để đảm bảo PHP và Node.js ghi được dữ liệu đơn hàng và ảnh chụp:
* Hãy đảm bảo thư mục gốc chạy web có quyền ghi (**Write Permission**).
* Thư mục `uploads/` phải phân quyền cho phép ghi để lưu trữ ảnh hóa đơn/ảnh cân nặng và mã QR.

---

## 🛠️ Chẩn Đoán Lỗi & Mẹo Vận Hành

### **1. Chatbot không nhận diện được câu hỏi mới?**
* **Nguyên nhân:** Do trình duyệt của khách hàng hoặc Telegram lưu cache file logic rất nặng.
* **Cách xử lý:** Đảm bảo tăng phiên bản script hoặc xóa cache của Telegram bot nếu cần thiết.

### **2. Cập nhật tài liệu nghiệp vụ cho Bot**
* **Cách xử lý:** Cập nhật nội dung các file trong thư mục `context-files/` cục bộ, sau đó đồng bộ lên Postgres DB của goClaw và dán đè vào Admin site của goClaw Agent.
