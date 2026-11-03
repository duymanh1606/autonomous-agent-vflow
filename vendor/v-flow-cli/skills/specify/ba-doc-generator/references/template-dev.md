# Template: Technical Specification
> Dành cho: Developer / Tech Lead
> Mục đích: Implement solution — đủ chi tiết để code không cần hỏi thêm

---

## Nguyên tắc viết cho Dev/Tech Lead
- Càng chi tiết càng tốt — ambiguity = bug
- Có đủ: business rule, validation rule, edge case, error handling
- Data model rõ ràng: field name, data type, constraint
- API contract nếu liên quan tích hợp
- Không giải thích "tại sao" quá nhiều — dev cần biết "làm gì" và "như thế nào"
- Có thể dùng pseudocode, bảng, diagram

---

## CẤU TRÚC TÀI LIỆU

```
# [Tên tính năng / Module] — Technical Spec
**Ngày**: [Date] | **BA**: [Name] | **Dev**: [Name] | **Phiên bản**: [v0.1]

---

## 1. Tổng quan kỹ thuật
- Mô tả ngắn: [Tính năng này làm gì về mặt kỹ thuật]
- Module / Service liên quan: [Tên module, microservice...]
- Công nghệ: [Stack, framework nếu có ràng buộc]

---

## 2. Actors & Permissions
| Actor/Role | Quyền | Điều kiện |
|-----------|-------|-----------|
| [Role 1] | Create / Read / Update / Delete | [Điều kiện nếu có] |
| [Role 2] | Read only | |

---

## 3. Luồng xử lý chính (Happy Path)

### [Tên luồng 1]
```
1. [Actor] thực hiện [action]
2. Hệ thống kiểm tra [condition]
3. Nếu hợp lệ → [xử lý]
4. Lưu [data] vào [table/collection]
5. Trả về [response]
```

### Exception Flow
| Trường hợp | Điều kiện | Xử lý | Message hiển thị |
|-----------|-----------|-------|-----------------|
| [Case 1] | [Condition] | [Action] | "[Error message]" |

---

## 4. Business Rules & Validation

### Validation Rules
| Field | Rule | Error Message |
|-------|------|---------------|
| [field_name] | Required / Max length X / Format regex | "[Message]" |
| [field_name] | Unique / FK constraint | "[Message]" |

### Business Rules
- BR-01: [Quy tắc nghiệp vụ 1 — mô tả cụ thể]
- BR-02: [Quy tắc nghiệp vụ 2]
- BR-03: [Công thức tính toán nếu có: field_A = field_B * field_C / 100]

---

## 5. Data Model

### Entity: [Tên entity]
| Field | Data Type | Required | Constraint | Mô tả |
|-------|-----------|----------|------------|-------|
| id | UUID | Yes | PK | |
| [field_name] | VARCHAR(255) | Yes | Unique | [Mô tả] |
| [field_name] | DECIMAL(15,2) | No | >= 0 | [Mô tả] |
| created_at | TIMESTAMP | Yes | Default NOW() | |
| status | ENUM | Yes | [ACTIVE, INACTIVE, PENDING] | |

### Quan hệ
- [Entity A] 1 — N [Entity B] qua field [foreign_key]
- [Entity B] N — N [Entity C] qua bảng trung gian [table_name]

---

## 6. API Contract (nếu có)

### [POST] /api/v1/[resource]
**Request:**
```json
{
  "field_1": "string",
  "field_2": 0,
  "field_3": true
}
```
**Response 200:**
```json
{
  "id": "uuid",
  "status": "success",
  "data": { ... }
}
```
**Response 4xx/5xx:**
| HTTP Code | Trường hợp | Message |
|-----------|-----------|---------|
| 400 | Validation fail | "Invalid input: [field]" |
| 403 | Không có quyền | "Access denied" |
| 404 | Không tìm thấy | "[Resource] not found" |

---

## 7. Edge Cases & Lưu ý kỹ thuật
- [Edge case 1: mô tả + cách xử lý]
- [Edge case 2]
- [Performance note nếu có: query này cần index trên field X]
- [Security note: cần sanitize input field Y]

---

## 8. Checklist trước khi dev bắt đầu
- [ ] Đã đọc và hiểu toàn bộ spec
- [ ] Các open question đã được resolve (xem mục 9)
- [ ] Database migration script đã được plan
- [ ] Unit test plan đã có

---

## 9. Open Questions cho Dev
| # | Câu hỏi | Người trả lời | Trạng thái |
|---|---------|--------------|-----------|
| Q1 | [Câu hỏi kỹ thuật cần confirm] | BA / Architect | Pending |
```
