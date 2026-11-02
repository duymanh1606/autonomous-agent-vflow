# Template: Test Basis Document
> Dành cho: Tester / QA Engineer
> Mục đích: Cơ sở để viết test case, kiểm thử nghiệm thu

---

## Nguyên tắc viết cho Tester/QA
- Liệt kê đầy đủ acceptance criteria — mỗi criteria = 1 test case tiềm năng
- Bao gồm cả positive và negative scenarios
- Edge case phải được mô tả rõ
- Data test gợi ý nếu có thể
- Không mơ hồ: "hệ thống hoạt động đúng" không phải acceptance criteria

---

## CẤU TRÚC TÀI LIỆU

```
# [Tên tính năng] — Test Basis
**Ngày**: [Date] | **BA**: [Name] | **QA**: [Name] | **Phiên bản**: [v0.1]

---

## 1. Phạm vi kiểm thử
- **Trong scope test**: [Danh sách chức năng cần test]
- **Ngoài scope test**: [Chức năng không test trong sprint này]
- **Môi trường**: [Dev / Staging / UAT]

---

## 2. Actors & Preconditions
| Actor | Điều kiện tiên quyết |
|-------|---------------------|
| [Role 1] | Đã đăng nhập, có quyền [X], dữ liệu [Y] đã tồn tại |
| [Role 2] | Tài khoản chưa kích hoạt |

---

## 3. Acceptance Criteria

### [Use Case / Feature 1]: [Tên]

#### ✅ Positive Scenarios
| AC# | Mô tả | Input | Expected Output | Priority |
|-----|-------|-------|----------------|----------|
| AC-01 | [Tên scenario] | [Data input] | [Kết quả mong đợi cụ thể] | High |
| AC-02 | | | | Medium |

#### ❌ Negative Scenarios
| AC# | Mô tả | Input | Expected Output | Priority |
|-----|-------|-------|----------------|----------|
| AC-N01 | [Nhập sai format] | [Data sai] | [Error message cụ thể] | High |
| AC-N02 | [Bỏ trống field bắt buộc] | null / empty | "[Validation message]" | High |

#### ⚠️ Edge Cases
| AC# | Mô tả | Input | Expected Output |
|-----|-------|-------|----------------|
| AC-E01 | [Giá trị biên: max length] | [255 ký tự] | [Chấp nhận / Từ chối] |
| AC-E02 | [Giá trị âm / zero] | -1 / 0 | [Xử lý như thế nào] |

---

## 4. Business Rules cần verify
| BR# | Rule | Cách verify |
|-----|------|------------|
| BR-01 | [Quy tắc 1] | [Test scenario tương ứng] |
| BR-02 | [Công thức tính: A = B + C] | Input B=[X], C=[Y] → A phải = [Z] |

---

## 5. Integration Test Points
| Điểm tích hợp | Hệ thống liên quan | Cần verify |
|--------------|-------------------|------------|
| [API call đến hệ thống X] | [Hệ thống X] | Response đúng format, timeout handling |
| [Gửi email / notification] | [Email service] | Email được gửi, nội dung đúng |

---

## 6. Gợi ý Data Test
| Loại data | Giá trị gợi ý | Mục đích |
|-----------|--------------|----------|
| Valid input | [Example] | Happy path |
| Boundary value | [Min/Max] | Kiểm tra biên |
| Invalid format | [Example] | Negative test |
| Special characters | `<script>`, `'`, `"` | Security / XSS |
| Empty / null | "" / null | Validation |

---

## 7. Non-Functional Requirements cần test
- **Performance**: [Trang load trong X giây với Y concurrent users]
- **Security**: [Phân quyền đúng theo role, không lộ data]
- **Compatibility**: [Browser / Device cần test]

---

## 8. Regression Impact
Các chức năng hiện có có thể bị ảnh hưởng khi deploy tính năng này:
- [Module A] — vì [lý do]
- [Module B] — vì [lý do]

---

## 9. Open Questions cho QA
| # | Câu hỏi | Người trả lời | Trạng thái |
|---|---------|--------------|-----------|
| Q1 | [Chưa rõ behavior khi...] | BA | Pending |
```
