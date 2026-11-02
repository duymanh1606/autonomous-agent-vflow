# Bad Examples — Bugfix Analysis Anti-Patterns

---

❌ **Unchanged Behavior quá generic**:
```
### Unchanged Behavior 🛡️
- BUG-U01: Hệ thống phải TIẾP TỤC hoạt động bình thường
```
→ Vấn đề: "Hoạt động bình thường" không test được. Không rõ behavior cụ thể nào phải giữ.
→ Fix: Mô tả chính xác behavior: "Khi user nhập email hợp lệ không có khoảng trắng, hệ thống phải TIẾP TỤC chấp nhận với response 200"

---

❌ **Root Cause = Symptom**:
```
### Root Cause
- Root Cause: API trả về lỗi 500
- Confidence: high
```
→ Vấn đề: 500 là symptom, không phải root cause. Tại sao 500? SQL error? Null pointer? Timeout?
→ Fix: "SQL query không escape ký tự `'` trong field name, gây syntax error tại user_repository.dart:42"

---

❌ **BUG-B và BUG-E không đối xứng**:
```
### Current Behavior 🔴
- BUG-B01: Form chấp nhận email sai format
- BUG-B02: Form cho phép submit khi field trống
- BUG-B03: Error message không hiện

### Expected Behavior 🟢  
- BUG-E01: Form phải validate đúng
```
→ Vấn đề: 3 defects nhưng chỉ 1 expected behavior. Không rõ BUG-E01 fix bug nào.
→ Fix: BUG-B01 ↔ BUG-E01, BUG-B02 ↔ BUG-E02, BUG-B03 ↔ BUG-E03 (mapping 1:1)

---

❌ **Thiếu Unchanged Behavior hoàn toàn**:
```
## Bugfix Analysis
### Current Behavior 🔴
- BUG-B01: ...
### Expected Behavior 🟢
- BUG-E01: ...
(không có section Unchanged)
```
→ Vấn đề: Thiếu regression prevention. Fix có thể break behaviors liên quan.
→ Fix: LUÔN có ≥2 BUG-U. Hỏi: "Code nào call function bị fix?" → Infer unchanged behaviors.

---

❌ **Test plan chỉ có T2 (Green)**:
```
## Test Plan
- [ ] Test verify email validation hoạt động đúng
- [ ] Test verify form submit thành công
```
→ Vấn đề: Chỉ test fix hoạt động. Không test bug reproduce (T1) và không test regression (T3).
→ Fix: Phải có cả 3 tiers: T1 (reproduce bug) + T2 (verify fix) + T3 (no regression).

---

❌ **Scope creep — fix nhiều bug trong 1 analysis**:
```
# Bugfix — Email validation + Password strength + Login redirect
```
→ Vấn đề: 3 bug khác nhau trong 1 bugfix.md. Scope quá lớn, regression risk cao.
→ Fix: 1 bugfix.md = 1 bug. Tạo bugfix riêng cho mỗi bug hoặc dùng /v.quickfix cho bug nhỏ.
