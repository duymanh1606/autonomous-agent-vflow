# Gotchas — TDD Driver

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **Implement trước, test sau** — Test sẽ bias theo code đã viết. "Green bar = proof" là ảo.
   - **Hậu quả**: Test chỉ confirm code hoạt động, không confirm requirement.

2. ❌ **Skip test vì "đơn giản"** — Bugs hay ẩn ở code đơn giản nhất.
   - **VD**: Off-by-one, null check, empty array.

3. ❌ **Test quá lớn** — 1 test cover 5 behaviors → khi fail, không biết cái nào sai.
   - **Fix**: 1 test = 1 assertion = 1 behavior.

4. ❌ **Mock quá nhiều** — Test full mocks → integration issues leak ra production.
   - **Rule**: Mock external deps only. Business logic test real code.

5. ❌ **Sửa test để pass** — Nếu test fail → fix CODE, KHÔNG fix test.
   - **Exception**: Test implementation sai (sai mock setup, sai expected value) → fix test.

6. ❌ **Quên concerns** — W-xxx carry-forward từ R.0 phải được resolve trong TDD cycle.
   - **Check**: Đọc `_session.md` → search `W-` → resolve trong task assigned.

7. ❌ **Test depend test khác** — Test 2 fail vì Test 1 setup shared state.
   - **Fix**: Mỗi test PHẢI chạy standalone. Fresh state per test.

8. ❌ **Test tên vô nghĩa** — `test1`, `testLogin` → khi fail, không biết test gì.
   - **Fix**: `should_return_404_when_product_not_found`.

9. ✅ **Nếu test PASS ngay ở RED** — Test SAI, không phải code ĐÚNG. Xem lại.
