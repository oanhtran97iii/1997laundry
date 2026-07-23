# 🛠️ 1997 Premium Laundry MCP Server

Máy chủ giao thức MCP (Model Context Protocol) sử dụng giao thức **Streamable HTTP** để cung cấp các "tay chân" (tools) quản trị hệ thống 1997 Premium Laundry cho AI Agent (goClaw).

Máy chủ được cấu hình lắng nghe cổng **3001** tại địa chỉ nội bộ **127.0.0.1 (localhost)** để bảo mật tuyệt đối, tránh lộ lọt API ra ngoài internet.

---

## 1. Cấu hình & Cài đặt trên VPS

### Bước A: Di chuyển vào thư mục mcp và cài đặt thư viện
```bash
cd /opt/my-website/mcp
npm install
```

### Bước B: Kiểm tra biến môi trường
Mã nguồn MCP tự động đọc file cấu hình `.env` từ thư mục gốc `/opt/my-website/.env` (hoặc `/opt/my-website/mcp/.env`). Hãy đảm bảo các khóa sau đã tồn tại:
* `RESEND_API_KEY`: API key gửi mail của Resend.

---

## 2. Thiết lập chạy 24/7 bằng Systemd Service

Tạo tệp cấu hình dịch vụ Systemd:
```bash
nano /etc/systemd/system/mywebsite-mcp.service
```

Dán nội dung cấu hình mẫu dưới đây vào tệp:

```ini
[Unit]
Description=1997 Premium Laundry MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/my-website/mcp
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production PORT=3001 DB_PATH=/opt/my-website/brain.db

[Install]
WantedBy=multi-user.target
```

Kích hoạt và khởi động dịch vụ:
```bash
systemctl daemon-reload
systemctl enable mywebsite-mcp
systemctl start mywebsite-mcp
systemctl status mywebsite-mcp
```

---

## 3. Cách test thủ công qua cURL (Giao thức Streamable HTTP)

Vì máy chủ sử dụng giao thức Streamable HTTP, bạn có thể gửi yêu cầu chuẩn JSON-RPC 2.0 tới endpoint `http://127.0.0.1:3001/mcp`:

### A. Liệt kê các Tool hỗ trợ (List Tools)
```bash
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```

### B. Cập nhật trạng thái đơn (update_order_status)
```bash
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"update_order_status","arguments":{"booking_code":"NF1234","status":"Đang giặt","weight_kg":4.5}},"id":2}'
```

### C. Xem danh sách chờ (manage_waitlist - list)
```bash
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"manage_waitlist","action":"list"},"id":3}'
```

### D. Xác nhận thanh toán thủ công (reconcile_payment_manually)
```bash
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"reconcile_payment_manually","arguments":{"booking_code":"NF1234","actual_amount":200000}},"id":4}'
```
