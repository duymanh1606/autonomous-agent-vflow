# Gotchas — No-Go Zone Guard

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **"Chỉ refactor nhỏ thôi"** — Không có refactor nhỏ trong No-Go Zone.
   - **Thực tế**: Rename variable trong payment.js → 3 services import nó break.

2. ❌ **Quên test files** — `test/payment.test.js` cũng thuộc No-Go.
   - **Lý do**: Sửa test → false confidence → miss regression.

3. ❌ **Import chain** — File A import File B (No-Go) → sửa export interface B → A break.
   - **Check**: `grep -r "require.*payment\|import.*payment" src/`

4. ❌ **Config changes** — Sửa `.env` hoặc `config.js` có thể ảnh hưởng No-Go modules.
   - **VD**: `DB_POOL_SIZE=5→10` → payment module connection behavior thay đổi.

5. ❌ **Wrapper modify behavior** — Adapter pattern nhưng thay đổi return value.
   - **Rule**: Adapter chỉ WRAP — pass through data unchanged.

6. ✅ **Hỏi trước khi sửa** — Khi BẮT BUỘC đụng No-Go → DỪNG, ghi _session.md, chờ Tech Lead.

7. ✅ **Document workaround** — Khi dùng adapter → ghi rõ TẠI SAO trong code comment.
