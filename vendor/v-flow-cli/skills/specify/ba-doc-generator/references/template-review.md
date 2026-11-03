# Template: Review & Approval Package
> Dành cho: Stakeholder Review (Business + Technical)
> Mục đích: Xin review chính thức, thu thập phản hồi, phê duyệt

---

## Nguyên tắc viết cho Review Package
- Đủ thông tin để reviewer hiểu mà không cần hỏi thêm
- Có phần comment rõ ràng để reviewer ghi ý kiến
- Highlight những điểm cần quyết định / xác nhận
- Nêu rõ deadline review và hành động tiếp theo

---

## CẤU TRÚC TÀI LIỆU

```
# Review Package: [Tên tính năng / Dự án]
**Ngày gửi**: [Date] | **Deadline review**: [Date]
**BA**: [Name] | **Phiên bản**: [v0.1]
**Trạng thái**: Chờ review

---

## Hướng dẫn review
Vui lòng đọc tài liệu và phản hồi trước **[Deadline]** bằng cách:
1. Ghi ý kiến vào cột "Comment" của từng mục
2. Xác nhận trạng thái: ✅ Đồng ý / ❌ Không đồng ý / 💬 Cần thảo luận
3. Gửi lại cho: [Email BA]

---

## 1. Tóm tắt nội dung
[2-3 câu mô tả tổng quan: đây là gì, tại sao cần review, quyết định nào cần đưa ra]

---

## 2. Nội dung cần review

### 2.1 Phạm vi (Scope)
| Trong scope | Ngoài scope |
|-------------|-------------|
| [Tính năng 1] | [Tính năng X — sẽ làm sau] |
| [Tính năng 2] | [Tính năng Y — ngoài phạm vi] |

**Reviewer comment:**
> _[Để trống cho reviewer điền]_
**Trạng thái:** ⬜ Chưa review

---

### 2.2 Yêu cầu chức năng
| # | Yêu cầu | Mức độ ưu tiên | Reviewer comment | Trạng thái |
|---|---------|---------------|-----------------|-----------|
| REQ-01 | [Mô tả yêu cầu] | Must/Should/Could | | ⬜ |
| REQ-02 | | | | ⬜ |

---

### 2.3 Quy trình nghiệp vụ
[Mô tả luồng quy trình hoặc đính kèm diagram]

**Reviewer comment:**
> _[Để trống]_
**Trạng thái:** ⬜ Chưa review

---

### 2.4 Quy tắc nghiệp vụ (Business Rules)
| BR# | Quy tắc | Reviewer comment | Trạng thái |
|-----|---------|-----------------|-----------|
| BR-01 | [Quy tắc 1] | | ⬜ |
| BR-02 | [Quy tắc 2] | | ⬜ |

---

### 2.5 Assumption & Constraint
| Loại | Nội dung | Cần confirm? |
|------|---------|-------------|
| Assumption | [Giả định BA đang dựa vào] | ✅ Cần confirm |
| Constraint | [Ràng buộc kỹ thuật / nghiệp vụ] | |

**Reviewer comment:**
> _[Để trống]_

---

## 3. Điểm cần quyết định
| # | Câu hỏi / Vấn đề | Option A | Option B | Quyết định | Owner |
|---|-----------------|----------|----------|------------|-------|
| D-01 | [Vấn đề cần chọn] | [Phương án A] | [Phương án B] | _[Để trống]_ | [Tên] |

---

## 4. Open Issues
| # | Vấn đề | Mức độ | Người xử lý | Deadline |
|---|--------|--------|------------|----------|
| I-01 | [Vấn đề còn mở] | Blocker / Major / Minor | [Tên] | [Date] |

---

## 5. Kết quả review tổng hợp *(BA điền sau khi nhận feedback)*
| Reviewer | Ngày | Trạng thái | Ghi chú |
|---------|------|-----------|---------|
| [Tên 1] | | ✅ Approved / ❌ Rejected / 💬 Approved with comments | |
| [Tên 2] | | | |

---

## 6. Các thay đổi sau review
| # | Nội dung thay đổi | Lý do | Phiên bản |
|---|-----------------|-------|-----------|
| 1 | [Thay đổi gì] | [Feedback từ ai] | v0.2 |
```
