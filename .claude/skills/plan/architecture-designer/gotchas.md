# Gotchas — Architecture Designer

> Cập nhật liên tục khi Agent gặp edge case mới.
> Mỗi lỗi lặp lại 2 lần → BẮT BUỘC thêm vào đây.

---

## Anti-Patterns

1. ❌ **Over-engineering** — Tạo abstraction layer cho feature đơn giản.
   - **Signal**: Interface với chỉ 1 implementation, Factory cho 1 class.
   - **Fix**: YAGNI — design cho REQ hiện tại, không cho REQ tương lai.

2. ❌ **Ignore No-Go Zones** — Thiết kế modify legacy code mà không kiểm tra context.md.
   - **Hậu quả**: Implement Agent bị block ở B.1, phải quay lại redesign.
   - **Fix**: Check TRƯỚC khi design — tạo adapter nếu cần interact No-Go Zone.

3. ❌ **Vague file paths** — "tạo component ở src/somewhere".
   - **Hậu quả**: Implement Agent tự quyết path → inconsistent structure.
   - **Fix**: Mỗi file path PHẢI chính xác: `src/features/auth/data/auth_repository.dart`.

4. ❌ **Missing error architecture** — Design chỉ có happy path.
   - **Hậu quả**: Error handling ad-hoc, inconsistent response format.
   - **Fix**: Plan PHẢI có Error Architecture section (types, flow, response format).

5. ❌ **Coupling quá chặt** — Component A import trực tiếp B, B import trực tiếp C.
   - **Fix**: Dependency injection, interface tại boundary.

6. ❌ **Circular dependency** — A → B → A hoặc A → B → C → A.
   - **Signal**: Import từ sibling module, shared mutable state.
   - **Fix**: Extract shared logic sang _shared module hoặc event-based communication.

7. ❌ **Design không align constitution** — Plan nói Repository pattern nhưng constitution nói Active Record.
   - **Check**: Đọc constitution trước khi design. Design PHẢI confirm pattern alignment.

8. ❌ **Thiếu REQ traceability** — Component tồn tại mà không trace về REQ nào.
   - **Rule**: Mỗi component trong plan PHẢI reference ≥1 REQ-xxx.

---

## Edge Cases

- ✅ Feature chỉ có 1-2 REQ → Plan đơn giản là OK. Không cần 8 sections nếu feature nhỏ.
- ✅ Constitution chưa có → Cảnh báo human, dùng industry best practices, ghi `[⚠️ No constitution]`.
- ✅ Greenfield (không có context.md) → Skip No-Go Zone checks, design tự do hơn.
