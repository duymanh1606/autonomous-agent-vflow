# V-Flow Lessons Learned

> Bài học rút ra từ các feature cycles. Cập nhật sau mỗi `/v.retrospective`.

---

## Template Entry

```markdown
### LL-{N}: {Tiêu đề}
- **Feature**: {feature name}
- **Phase**: {phase khi phát hiện}
- **Mô tả**: {bối cảnh + vấn đề}
- **Bài học**: {rút ra điều gì}
- **Action**: {thay đổi process/skill/constitution}
```

---

## Entries

### LL-001: Master Check bắt issues BA/Plan bỏ sót
- **Feature**: 001-user-login
- **Phase**: R.0 (Master Check)
- **Mô tả**: BA Agent và Plan Agent không đề cập rate limiting cho login API. Master Check phát hiện qua concern W-001.
- **Bài học**: Cross-validation giữa 3 artifacts (Spec↔Plan↔Tests) hiệu quả hơn review từng artifact riêng.
- **Action**: Thêm "Security considerations" checklist vào BA Agent spec.

### LL-002: API response format change là breaking change
- **Feature**: 002-legacy-crud
- **Phase**: R.0 (Master Check)
- **Mô tả**: GET /api/products đổi từ array sang `{ data, pagination }` object. Master Check phát hiện W-002.
- **Bài học**: Mọi API response format change cần explicit approval từ Tech Lead, kèm migration plan cho consumers.
- **Action**: Thêm "Backward Compatibility Check" vào Plan Agent checklist cho legacy projects.

### LL-003: EARS notation giúp tránh requirement ambiguity
- **Feature**: 001-user-login
- **Phase**: S.1 (Specification)
- **Mô tả**: Trước EARS: "User đăng nhập được" → không measurable. Sau EARS: "Khi user nhấn Đăng nhập, hệ thống phải validate email format" → clear, testable.
- **Bài học**: EARS notation bắt buộc Agent viết requirements có structure, mỗi loại (U/E/S/O) map rõ vào component type.
- **Action**: EARS notation là standard bắt buộc cho tất cả projects, không phải optional.
