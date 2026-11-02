# Gotchas — Test Case Generator

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **Chỉ test happy path** — Viết TC cho success, quên error cases.
   - **Hậu quả**: Error handling untested → crash production.
   - **Fix**: Mỗi REQ event-driven → ≥1 TC happy + ≥1 TC error.

2. ❌ **TC không trace về REQ** — Test case "kiểm tra login" không reference REQ-xxx.
   - **Hậu quả**: Master Check sẽ flag "REQ coverage gap".
   - **Fix**: TC ID = TC-NN tuần tự; trace bằng field "Gắn với: REQ-xxx" + "AC: AC-NN" trong mỗi TC.

3. ❌ **TC mơ hồ** — "Expected: hệ thống hoạt động đúng."
   - **Hậu quả**: Implement Agent không biết test gì → test useless.
   - **Fix**: Expected Result = cụ thể + measurable: "Response 201, body.id not null".

4. ❌ **TC duplicate** — 3 TCs test cùng behavior nhưng khác wording.
   - **Fix**: 1 behavior = 1 TC. Biến thể = edge cases trong cùng TC.

5. ❌ **Quên edge categories** — Viết 5 TCs nhưng toàn happy path biến thể.
   - **Fix**: Quét 7 categories (Empty, Boundary, Error, Concurrent, Auth, State, Performance).

6. ❌ **Priority tất cả P1** — Mọi TC đều P1 → không biết test nào quan trọng nhất.
   - **Fix**: P1 = core logic + security. P2 = edge cases. P3 = optimization.

7. ❌ **Thiếu preconditions** — TC nói "login" nhưng không nói user phải tồn tại trước.
   - **Fix**: Mỗi TC PHẢI có preconditions rõ ràng: data state, auth state, system state.

8. ❌ **TC quá tightly coupled với implementation** — "Mock UserRepository.findByEmail()".
   - **Fix**: TC mô tả BEHAVIOR, không mô tả implementation detail. Implement Agent quyết mock strategy.

---

## Edge Cases

- ✅ Spec chỉ có 1-2 REQ → Vẫn cần edge cases. REQ ít ≠ test ít.
- ✅ REQ-U (ubiquitous) → Test ở NHIỀU entry points, không chỉ 1.
- ✅ Feature liên quan external API → TC cho API down, slow, wrong format.
