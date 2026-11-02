# Good Example — Email Validation Bugfix

## Bugfix Analysis (3-Behavior Model)

### 2.1 Current Behavior (Defect) 🔴
- **BUG-B01**: Khi user nhập email có khoảng trắng đầu/cuối (vd: " user@test.com "),
  hệ thống chấp nhận và lưu email chứa khoảng trắng vào database
- **BUG-B02**: Khi user nhập email " user@test.com " và sau đó đăng nhập với "user@test.com",
  hệ thống báo "Email không tồn tại" vì so sánh exact match

### 2.2 Expected Behavior (Correct) 🟢
- **BUG-E01**: Khi user nhập email có khoảng trắng đầu/cuối,
  hệ thống phải trim khoảng trắng trước khi validate và lưu "user@test.com" (đã trim)
- **BUG-E02**: Khi user nhập email có khoảng trắng và sau đó đăng nhập với email không khoảng trắng,
  hệ thống phải authenticate thành công (vì email đã được trim khi lưu)

### 2.3 Unchanged Behavior (Regression Prevention) 🛡️
- **BUG-U01**: Khi user nhập email hợp lệ không có khoảng trắng (vd: "user@test.com"),
  hệ thống phải TIẾP TỤC chấp nhận và lưu bình thường với response 200
- **BUG-U02**: Khi user nhập email không hợp lệ (thiếu @, domain sai, vd: "user@", "user"),
  hệ thống phải TIẾP TỤC từ chối với error "Email không hợp lệ" và response 400
- **BUG-U03**: Khi user nhập các field khác (name, phone),
  hệ thống phải TIẾP TỤC validate theo rules hiện tại, không bị ảnh hưởng bởi fix email

---

## Root Cause Analysis

### Hypothesis
- **Root Cause**: Hàm `validateEmail()` trong `lib/validators/email_validator.dart:28`
  validate format nhưng KHÔNG trim whitespace trước khi validate và lưu
- **Confidence**: high
- **Evidence**: Code line 28: `return emailRegex.hasMatch(input)` — `input` chưa được `.trim()`

### Affected Code
| File | Line(s) | Mô tả vấn đề |
|------|---------|---------------|
| `lib/validators/email_validator.dart` | L28 | `hasMatch(input)` thiếu `.trim()` |
| `lib/repositories/user_repository.dart` | L45 | `save(email)` lưu email raw, chưa trim |

---

## Test Plan (3-Tier) — Mapping Matrix

| Behavior | Test Tier | Test ID | Trước fix | Sau fix |
|----------|-----------|---------|-----------|---------|
| BUG-B01 | T1 (Red) | TC-R01 | ❌ FAIL | ✅ PASS |
| BUG-B02 | T1 (Red) | TC-R02 | ❌ FAIL | ✅ PASS |
| BUG-E01 | T2 (Green) | TC-G01 | ❌ FAIL | ✅ PASS |
| BUG-E02 | T2 (Green) | TC-G02 | ❌ FAIL | ✅ PASS |
| BUG-U01 | T3 (Protect) | TC-P01 | ✅ PASS | ✅ PASS |
| BUG-U02 | T3 (Protect) | TC-P02 | ✅ PASS | ✅ PASS |
| BUG-U03 | T3 (Protect) | TC-P03 | ✅ PASS | ✅ PASS |
