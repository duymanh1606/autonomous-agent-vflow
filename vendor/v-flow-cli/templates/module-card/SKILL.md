<!-- HEADING MAP — Agent PHẢI dùng CHÍNH XÁC các heading dưới đây:
# Domain: {Tên Module}
## Quick Summary
## Key Business Rules
## Key Entities
## ⚠️ No-Go Zones (trong module này)
## 📂 Supporting Files
-->
---
name: domain-{tên-module}
version: "1.0"                  # MAJOR.MINOR — bump khi có thay đổi. MAJOR = business rule thay đổi lớn; MINOR = bổ sung/clarification
last_updated: "YYYY-MM-DD"      # auto-set khi bump version
last_updated_by: "v.understand" # "human" | "v.understand" | "v.sync" | tên agent khác
description: "{Mô tả chức năng cốt lõi — module làm gì, tích hợp với gì, dùng pattern gì}"
user-invocable: false
when_to_use: "Khi làm feature liên quan đến {keywords cụ thể}"
---

> ⚠️ **Versioning Convention**: Nếu bạn chỉnh sửa bất kỳ file nào trong thư mục module card này, hãy bump `version` trong file này trước khi commit. **MAJOR** nếu thay đổi business rule/flow. **MINOR** nếu bổ sung chi tiết hoặc fix sai sót nhỏ.

# Domain: {Tên Module}

**Service(s)**: {danh sách service chủ}
**Complexity**: {⭐ đến ⭐⭐⭐⭐⭐} — {giải thích ngắn}
**Last verified**: {YYYY-MM-DD}
**Files count**: {N files} | **LOC ước tính**: {~X dòng}

## Quick Summary

<!-- HƯỚNG DẪN: Viết 3-4 câu PHÂN TÍCH CHUYÊN SÂU kiến trúc module — KHÔNG phải mô tả chung chung.
Phải nêu rõ: pattern sử dụng, cách tổ chức layer, state management, tích hợp gì, thiếu gì.
VD: "Module X sử dụng Clean Architecture (entity → usecases → repository). Frontend dùng Riverpod StateNotifier.
Backend xử lý qua Isolate riêng. Dữ liệu lưu SQLite local. Không có unit test cho business logic."
-->

{Viết phân tích chuyên sâu ở đây — KHÔNG copy đoạn VD trên}

## Key Business Rules

> ⚠️ Trích xuất TỪ CODE CỤ THỂ. Mỗi rule phải kèm file + hàm tham chiếu.

<!-- HƯỚNG DẪN: Mỗi BR phải có dạng:
- Source: `tên_file_thực.dart:dòng`, hàm `tên_hàm_thực`
- Code: `đoạn code ngắn thực tế từ codebase`
KHI CHƯA SCAN: Để trống hoặc ghi [❓ CẦN SCAN CODE]
-->

- **BR-01**: {Rule quan trọng nhất — mô tả chi tiết điều kiện, hành động, ngoại lệ}
  - Source: `{file_thực}:{line}`, hàm `{function_thực}`
  - [⚠️ AI-inferred]
- **BR-02**: {Rule quan trọng thứ 2}
  - Source: `{file_thực}:{line}`
  - [⚠️ AI-inferred]

## Key Entities

> Liệt kê models/entities chính kèm fields quan trọng và bảng DB.

<!-- HƯỚNG DẪN: Lấy TỪ CODE THỰC TẾ — entity/model files, ORM definitions.
Phải ghi đúng tên class, tên bảng, tên fields từ codebase.
-->

- `{EntityName}` — {mô tả ngắn}
  - **Bảng DB**: `{table_name_thực}`
  - **Fields chính**: `{field1}` ({type}), `{field2}` ({type}, {constraint})
  - **Relationships**: → `{RelatedEntity}` (1-n)

## ⚠️ No-Go Zones (trong module này)

> Files/methods nguy hiểm — Agent KHÔNG đụng nếu không có chỉ định rõ ràng.

| File / Method | LOC | Có Test? | Lý do không đụng |
|---|---|---|---|
| `{file_thực}` | {N} | ❌ | {lý do cụ thể} |

## 📂 Supporting Files

- [use-cases.md](use-cases.md) — Luồng E2E, state machines, business rules chi tiết
- [api-specs.md](api-specs.md) — API endpoints, data contracts, enums
- [ui-flows.md](ui-flows.md) — Màn hình, UI components, field mapping
- [tech-context.md](tech-context.md) — Patterns, key files, tech debt
- [cross-service.md](cross-service.md) — Tích hợp với modules/services khác
- [db.md](db.md) — Database schema, quan hệ bảng, DDL links
- [state-diagram.md](state-diagram.md) — Chi tiết state machine, triggers
- [permissions.md](permissions.md) — Ma trận phân quyền, roles, data policies
