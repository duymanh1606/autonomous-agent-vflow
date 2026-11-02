# Gotchas — Bugfix Analyst

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **Unchanged Behavior quá generic** — "Hệ thống phải TIẾP TỤC hoạt động bình thường"
   - **Fix**: Mô tả CỤ THỂ: "Khi user nhập email hợp lệ, hệ thống phải TIẾP TỤC chấp nhận và lưu với response 200"
   - **Hậu quả**: T3 test không viết được → regression không bị phát hiện.

2. ❌ **Root Cause = Symptom** — "Root cause: API trả 500"
   - **Fix**: Đó là symptom. Root cause: "SQL query không escape ký tự đặc biệt trong field `name`, gây SQL syntax error tại `user_repository.dart:42`"
   - **Hậu quả**: Fix symptom (wrap try-catch) → bug vẫn tồn tại, chỉ bị che.

3. ❌ **Skip T3 tests** — "Chắc không break gì" → skip regression tests
   - **Fix**: T3 LUÔN có ≥2 tests. Đây là **giá trị chính** của bugfix flow.
   - **Hậu quả**: Fix gây regression → phải hotfix → vòng lặp chi phí.

4. ❌ **Fix symptom thay vì root cause** — Thêm try-catch wrap error → "hết lỗi 500"
   - **Fix**: Trace đến root cause thực sự. Try-catch chỉ là band-aid.
   - **Signal**: Nếu fix chỉ là wrap/suppress error → almost certainly wrong.

5. ❌ **BUG-B và BUG-E không đối xứng** — 3 BUG-B nhưng chỉ 1 BUG-E
   - **Fix**: Mỗi BUG-B PHẢI có đúng 1 BUG-E tương ứng. Mapping 1:1.
   - **Hậu quả**: Không rõ fix nào cho bug nào → confusion khi implement.

6. ❌ **Quên scan codebase** — Viết root cause dựa trên guess, không trace code
   - **Fix**: PHẢI scan code trước khi viết root cause. Evidence = file + line range.
   - **Hậu quả**: Root cause sai → fix sai → bug vẫn còn.

7. ❌ **Scope creep silent** — Fix 1 bug nhưng "tiện thể" fix 3 bug khác
   - **Fix**: 1 bugfix.md = 1 bug. Các bug khác → tạo bugfix riêng hoặc quickfix.
   - **Hậu quả**: Scope lớn → review khó → regression risk tăng.

8. ❌ **Quên context.md / constitution.md** — Phân tích bug mà không check constraints
   - **Fix**: LUÔN check No-Go Zones + constitution patterns trước khi propose fix.
   - **Hậu quả**: Fix vi phạm No-Go Zone → bị block ở implement.

---

## Edge Cases

- ✅ Root cause không tìm được → Ghi confidence = "Low", recommend pairing/debug session. KHÔNG implement khi low confidence.
- ✅ Bug ảnh hưởng nhiều module (> 10 files) → Escalate sang `/v.specify` full pipeline.
- ✅ Bug 5-10 files → Có thể tiếp tục nhưng ghi warning vào bugfix.md.
- ✅ Bug đã fix trước đó nhưng regression → Đọc git history, document fix cũ trong Root Cause. T3 PHẢI cover case fix cũ gây regression.
- ✅ Unchanged behavior khó xác định → Hỏi: "Code nào call/depend function bị fix?" → Infer BUG-U từ callers/dependents.
- ✅ Bug chỉ reproduce trên specific environment → Document environment rõ ràng, flag trong bugfix.md.
