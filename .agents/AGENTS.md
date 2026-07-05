# Antigravity Agent Rules

## Brand Isolation & Scope Rules
- **Rule**: Nice Fold and 1997 Laundry are two strictly separated brands.
- **Rule**: Any feature request, modification, or bug fix requested for `behaiday_bot` or Nice Fold MUST ONLY be implemented in the `nice-fold-saigon-premium` project and VPS path `/opt/my-website/`. It must never affect `bebane_bot` or 1997 Laundry.
- **Rule**: Any feature request, modification, or bug fix requested for `bebane_bot` or 1997 Laundry MUST ONLY be implemented in the `1997-laundry` project and VPS path `/opt/laundry1997/`. It must never affect `behaiday_bot` or Nice Fold.
- **Rule**: Always keep all bot tokens, endpoints, and database models separated:
  - Nice Fold: `@behaiday_bot`, `nicefoldsaigon.vn`, port `3000`/`3001`, `goclaw` DB mapping.
  - 1997 Laundry: `@bebane_bot`, `1997laundry.com` (proxied under `nicefoldsaigon.vn/1997/`), port `4000`/`4001`, `LTT` order code prefix, `Bé Ba` name.

## Agent Training & Context Update Workflow (SOP)
Khi người dùng thực hiện kiểm thử (test luồng), trainning botchat hoặc muốn cập nhật bất kỳ kiến thức/chính sách mới nào của 1997 Laundry:
1. **Phân tích thay đổi**: AI phải đọc nội dung chat hoặc yêu cầu mới để xác định chính xác thông tin nào cần thay đổi (ví dụ: bảng giá trong `CAPABILITIES.md`, cách xưng hô trong `SOUL.md`...).
2. **Cập nhật file local**: AI tìm và chỉnh sửa trực tiếp file markdown tương ứng trong thư mục `/Users/oanhtran97/Desktop/Website/1997-laundry/context-files/`.
3. **Báo cáo và Hướng dẫn copy-paste**: AI hiển thị rõ phần nội dung đã cập nhật (được định dạng sẵn trong khối code markdown) để người dùng chỉ cần copy và dán trực tiếp vào mục tài liệu tương ứng trên trang Admin goClaw của Agent `1997-laundry-assistant`.
4. **Không cần câu lệnh kích hoạt**: Luồng này sẽ tự động chạy bất cứ khi nào người dùng nói về việc "cập nhật kiến thức", "sửa thông tin dịch vụ", hoặc đưa ra các quy tắc/câu trả lời mẫu mới cần bot ghi nhớ.

