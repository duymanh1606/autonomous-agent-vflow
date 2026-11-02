# Gotchas — Codebase Scanner

> Cập nhật liên tục khi Agent gặp edge case mới.
> Rule of thumb: Nếu Agent mắc cùng một lỗi 2 lần → bắt buộc phải có gotcha.

---

## Anti-patterns — Output VÔ GIÁ TRỊ

| Anti-pattern | Ví dụ BAD | Ví dụ GOOD |
|---|---|---|
| Liệt kê tên file không giải thích | "Key files: service.ts, controller.ts" | "service.ts (250 LOC): Xử lý CRUD WO, validate business rules (amount > 0, status DRAFT mới cho sửa)" |
| Business rule chung chung | "BR-01: Validate input trước khi lưu" | "BR-01: `amount` phải > 0 và `assignee_id` cùng `branch_id` với user (file: wo_service.dart:89)" |
| API không có chi tiết | "POST /api/orders — Tạo order" | "POST /api/orders — Auth: ROLE_USER. Body: {itemId: required, qty: min:1}. Error 400: qty < 1" |
| State diagram bịa | "Có trạng thái: Created, Done" | "States từ enum `WoStatus` (wo_status.dart): DRAFT, PENDING, APPROVED, COMPLETED, CANCELLED" |
| Permissions chung chung | "Admin toàn quyền, User hạn chế" | "MANAGER: ✅ view/edit WO trong branch (filter branch_id), ❌ delete. USER: ✅ WO do mình tạo, ❌ approve" |

---

## Quality Gate — Tự kiểm tra trước khi output

| Tiêu chí | Câu hỏi tự kiểm | Nếu KHÔNG → |
|---|---|---|
| **Depth** | "Tôi đã ĐỌC code bên trong các hàm chính chưa?" | Quay lại đọc code |
| **Specificity** | "Mỗi business rule có kèm file:line reference?" | Thêm reference |
| **Actionability** | "Dev đọc file này có HIỂU logic mà không cần mở code?" | Viết chi tiết hơn |
| **Completeness** | "Đã phủ HẾT inventory? (mọi endpoint/entity/state/flow/permission/cross-service đều có trong card)" | Bổ sung mục thiếu — phủ inventory, không phải đọc hết file |
| **Honesty** | "Tôi có bịa thông tin? Có gắn [⚠️ AI-inferred]?" | Gắn nhãn |

---

## Gotchas phổ biến

1. ❌ ĐỪNG đoán kiến trúc nếu không có bằng chứng trong code → ghi `[⚠️ AI-inferred]`
2. ❌ ĐỪNG đánh dấu No-Go Zone quá rộng → hỏi Tech Lead trước
3. ❌ File `package.json` không phản ánh thực tế import → scan `src/` thực tế
4. ❌ ĐỪNG chỉ đọc tên file/hàm rồi liệt kê — phải đọc NỘI DUNG bên trong
5. ❌ ĐỪNG bịa state diagram — chỉ vẽ states thực sự có trong enum/const
6. ✅ Ưu tiên đọc README và commit history để hiểu intent gốc
7. ✅ Cross-reference giữa controller → service → repository để verify data flow
8. ✅ Khi gặp business rule phức tạp, trích dẫn code snippet cụ thể
9. ✅ Module lớn (>~30 file / >5k LOC): KHÔNG đọc tuần tự — quy trình **Bước 4.0** (inventory → fan-out theo card → reconcile) trong agent doc + chuẩn **"Module Lớn — Đầy Đủ & Đúng"** trong `SKILL.md`. "Đầy đủ" = phủ hết inventory; "đúng" = mọi claim có `Source:`/nhãn
