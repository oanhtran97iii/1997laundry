# Antigravity Agent Rules

## Brand Isolation & Scope Rules
- **Rule**: 1997 Laundry and 1997 Laundry are two strictly separated brands.
- **Rule**: Any feature request, modification, or bug fix requested for `behaiday_bot` or 1997 Laundry MUST ONLY be implemented in the `1997-laundry-saigon-premium` project and VPS path `/opt/my-website/`. It must never affect `bebane_bot` or 1997 Laundry.
- **Rule**: Any feature request, modification, or bug fix requested for `bebane_bot` or 1997 Laundry MUST ONLY be implemented in the `1997-laundry` project and VPS path `/opt/laundry1997/`. It must never affect `behaiday_bot` or 1997 Laundry.
- **Rule**: Always keep all bot tokens, endpoints, and database models separated:
  - 1997 Laundry: `@behaiday_bot`, `1997laundry.com`, port `3000`/`3001`, `goclaw` DB mapping.
  - 1997 Laundry: `@bebane_bot`, `1997laundry.com` (proxied under `1997laundry.com/1997/`), port `4000`/`4001`, `LTT` order code prefix, `Bé Ba` name.

## Agent Training & Context Update Workflow (SOP)
Khi người dùng thực hiện kiểm thử (test luồng), trainning botchat hoặc muốn cập nhật bất kỳ kiến thức/chính sách mới nào của 1997 Laundry:
1. **Phân tích thay đổi**: AI phải đọc nội dung chat hoặc yêu cầu mới để xác định chính xác thông tin nào cần thay đổi (ví dụ: bảng giá trong `CAPABILITIES.md`, cách xưng hô trong `SOUL.md`...).
2. **Cập nhật file local**: AI tìm và chỉnh sửa trực tiếp file markdown tương ứng trong thư mục `/Users/oanhtran97/Desktop/Website/1997-laundry/context-files/`.
3. **Báo cáo và Hướng dẫn copy-paste**: AI hiển thị rõ phần nội dung đã cập nhật (được định dạng sẵn trong khối code markdown) để người dùng chỉ cần copy và dán trực tiếp vào mục tài liệu tương ứng trên trang Admin goClaw của Agent `1997-laundry-assistant`.
4. **Không cần câu lệnh kích hoạt**: Luồng này sẽ tự động chạy bất cứ khi nào người dùng nói về việc "cập nhật kiến thức", "sửa thông tin dịch vụ", hoặc đưa ra các quy tắc/câu trả lời mẫu mới cần bot ghi nhớ.

## Goclaw Skill Connection Requirement
- **Rule**: Whenever the user requests to write a Facebook post, draft a marketing article, create content, or generate social media posts (e.g., matching keywords "viết bài facebook", "lên bài fb", "write facebook post", "tạo content"), you MUST trigger and connect to the GoClaw Skill **`1997-fb-post-expert`** to perform the task. Do NOT write the post using your own general memory; always delegate the logic to the `1997-fb-post-expert` Skill.
- **Rule**: For all customer support, booking requests, service inquiries, payments, or complaints (e.g., matching questions about packages, pricing, ironing, dry cleaning, damaged items, no cash), you MUST trigger and connect to the GoClaw Skill **`laundry-customer-support-expert`** to handle the response, ensuring correct guidelines and escalation rules.
- **Rule**: Whenever the user requests to generate an Instagram feed, write Instagram posts, or design 5 photos/captions for Instagram (e.g., matching keywords "lên bài instagram", "thiết kế instagram feed", "tạo 5 ảnh đăng instagram", "viết bài insta", "instagram post"), you MUST trigger and connect to the GoClaw Skill **`laundry-instagram-creator`** to perform the task.

