# Ví dụ XẤU — Plan mơ hồ (KHÔNG làm theo)

> ⚠️ Đây là **anti-pattern**. Đối chiếu với `examples/good/plan-structure.md`.
> Mỗi khối dưới đây minh họa một lỗi trong `gotchas.md`.

---

## ❌ 1. File path mơ hồ + thiếu loại New/Modify

```
| Component | Vị trí | Mô tả |
|-----------|--------|-------|
| Login | đâu đó trong src/ | xử lý đăng nhập |
| Token   | core           | lưu token |
```

**Sai vì**: "đâu đó trong src/", "core" → Implement Agent tự quyết path → cấu trúc lệch chuẩn; không biết file MỚI hay SỬA.
**Sửa**: `lib/features/auth/data/auth_repository_impl.dart` (NEW) — path chính xác + đánh dấu New/Modify.

---

## ❌ 2. Thiếu REQ traceability (over-engineering)

```
Components: LoginService, AuthCache, RetryManager, CircuitBreaker, MetricsCollector, PluginRegistry
```

**Sai vì**: spec chỉ có REQ về đăng nhập email/password. `PluginRegistry`, `CircuitBreaker` không trace về REQ nào → YAGNI, thừa.
**Sửa**: mỗi component PHẢI map ≥1 REQ-xxx. Không có REQ → bỏ.

---

## ❌ 3. Chỉ có happy path — thiếu Error Architecture

```
Luồng: User nhập → gọi API → nhận token → vào Home. Xong.
```

**Sai vì**: không nói gì khi 401 / mất mạng / account khóa → error handling ad-hoc, format lỗi mỗi nơi mỗi kiểu.
**Sửa**: bảng Error Architecture (type → HTTP → handler → message), xem `examples/good`.

---

## ❌ 4. Đụng No-Go Zone mà không kiểm tra

```
Sửa trực tiếp `legacy/sso_handler.dart` để thêm field role.
```

**Sai vì**: `sso_handler.dart` nằm trong No-Go Zone (context.md §4). Sửa trực tiếp → Implement Agent bị block ở B.1, phải re-plan.
**Sửa**: tạo adapter/wrapper, KHÔNG sửa code vùng cấm; ghi rõ ở §9 No-Go Verification.

---

## ❌ 5. Mô tả thay đổi chung chung (brownfield)

```
- AuthService: cập nhật logic để hỗ trợ role.
```

**Sai vì**: "cập nhật logic" → dev phải hỏi lại sửa hàm nào, sửa gì.
**Sửa**: `AuthService.login()` — hiện trả token ngay sau verify password → thêm bước check `user.role ∈ allowed` trước khi cấp token; ném `ForbiddenError` nếu fail.
