# Gotchas — Task Breakdown

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **Task quá lớn** — "Implement toàn bộ feature" = 1 task.
   - **Hậu quả**: Implement Agent không biết khi nào xong, test khó viết.
   - **Fix**: 1 task ≈ 1 component ≈ 1 TDD cycle.

2. ❌ **Task quá nhỏ** — "Tạo file X.dart", "Import package Y".
   - **Hậu quả**: 50 tasks → overwhelming, overhead tracking lớn hơn work.
   - **Fix**: Group related micro-tasks vào 1 task có meaning.

3. ❌ **Thiếu ENTRYPOINT** — Task list không có task nào đánh dấu bắt đầu.
   - **Fix**: Luôn có ĐÚNG 1 task `[ENTRYPOINT]`.

4. ❌ **Circular dependency** — T-001 depends T-002, T-002 depends T-001.
   - **Fix**: Tách shared logic sang T-000, cả T-001 và T-002 depend T-000.

5. ❌ **Fake PARALLEL** — 2 tasks đánh dấu parallel nhưng share cùng file.
   - **Fix**: Track file paths — nếu 2 tasks modify cùng file → sequential.

6. ❌ **Thiếu REQ traceability** — Task tồn tại nhưng không gắn REQ nào.
   - **Rule**: Task không có REQ = task thừa. Hỏi: "Task này serve req nào?"

7. ❌ **Quên task testing cuối** — Implement xong nhưng không có integration test task.
   - **Fix**: Luôn có task cuối: "T-N: Integration test + cleanup" với `[GATE]` nếu cần.

---

## Edge Cases

- ✅ Feature chỉ có 1 REQ → 2-3 tasks vẫn OK (setup, implement, test).
- ✅ Feature cross-cutting (auth, logging) → Tách task _shared trước, feature task sau.
- ✅ Legacy refactor → Mỗi task PHẢI check No-Go Zone, thêm `[RISKY]` nếu gần boundary.
