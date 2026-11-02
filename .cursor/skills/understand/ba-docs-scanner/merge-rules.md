# Merge Rules — U.0d (BA Docs) ↔ U.0b (Code Scan)

> Khi chạy `/v.understand --module {tên}` trên module đã có U.0d data,
> Agent PHẢI tuân thủ merge rules dưới đây để tránh ghi đè nội dung BA.

---

## Bảng Merge

| File | U.0d đã tạo? | U.0b hành động |
|------|-------------|---------------|
| SKILL.md | ✅ Có draft (+ Glossary, Constraints) | **Merge**: giữ business rules + glossary từ U.0d, bổ sung tech info từ code scan |
| use-cases.md | ✅ Có draft (trích dẫn nguyên văn) | **Merge**: giữ BA content + quotes, bổ sung code references (`Source code: file:line`) |
| api-specs.md | ⏳ Placeholder | **Fill**: Generate từ code scan |
| tech-context.md | ⏳ Placeholder | **Fill**: Generate từ code scan |
| state-diagram.md | ✅ Có draft / ⏳ Placeholder | **Merge**: giữ states từ BA docs, verify + bổ sung enum values từ code. Nếu placeholder → **Fill** |
| permissions.md | ✅ Có draft / ⏳ Placeholder | **Merge**: giữ role matrix từ BA docs, verify + bổ sung guards/decorators từ code. Nếu placeholder → **Fill** |
| db.md | ✅ Có draft / ⏳ Placeholder | **Merge**: giữ entity descriptions từ BA, verify + bổ sung schema chi tiết từ code. Nếu placeholder → **Fill** |
| ui-flows.md | ✅ Có draft / ⏳ Placeholder | **Merge**: giữ user flows từ BA, verify + bổ sung component mapping từ code. Nếu placeholder → **Fill** |
| cross-service.md | ✅ Có draft | **Merge**: giữ BA context, bổ sung code-level dependencies |

---

## Merge Rules

1. **Giữ nguyên nội dung BA**: Nội dung có tag `[⚠️ AI-inferred from NotebookLM]` → giữ nguyên, bổ sung code evidence bên dưới.

2. **Conflict resolution**:
   - Nếu code **mâu thuẫn** với BA docs → gắn `[⚠️ CONFLICT: code vs BA doc — CẦN BA VERIFY]`
   - Nếu code **xác nhận** BA docs → xóa tag `[⚠️ AI-inferred]`, thay bằng `[✅ Verified by code scan]`

3. **Placeholder → Fill**: Nếu file U.0d là placeholder → U.0b generate đầy đủ (không cần merge).

4. **Human-verified content**: Nội dung đã được BA xóa tag `[⚠️ AI-inferred]` → KHÔNG ghi đè. Chỉ bổ sung code references bên dưới.

---

## Detect U.0d Data

Cách nhận biết module đã có U.0d data:

```
Nếu tồn tại .v-flow/modules/{module}/raw/sources/*.txt
  → Module có U.0d data → áp dụng Merge rules
Nếu không
  → Module chưa có U.0d → U.0b generate bình thường
```
