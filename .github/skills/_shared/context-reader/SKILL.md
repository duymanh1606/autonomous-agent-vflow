---
name: context-reader
description: "Load context.md cho legacy projects, extract No-Go Zones, Technical Debt, và architecture thực tế. Agent PHẢI gọi skill này khi context.md tồn tại."
trigger: "Đầu mỗi agent session — khi .v-flow/context.md tồn tại"
phase: "All"
used_by:
  - /v.specify
  - /v.plan
  - /v.test
  - /v.check
  - /v.implement
  - /v.review
---

# Context Reader — Hiểu Thực Trạng Legacy

> ⚠️ Đây là **Skill dùng chung cho legacy projects**.
> Nếu context.md KHÔNG tồn tại → Skip (greenfield project).
> Nếu TỒN TẠI → **BẮT BUỘC đọc TRƯỚC mọi thứ**.
>
> → Xem `gotchas.md` cho lỗi khi đọc context.
> → Xem `examples/good/` cho mẫu output legacy project.

---

## Khi nào KHÔNG đọc

- Greenfield project (không có context.md)
- Đang chạy `/v.understand` (đang TẠO context.md)

---

## Trust Levels — Đánh Giá Độ Tin Cậy

> 💡 KHÔNG phải mọi thông tin trong context.md đều đáng tin như nhau.

| Marker | Trust Level | Agent nên |
|:------:|:----------:|---------|
| (không marker) | 🟢 **Verified** | Tin tưởng — human đã review |
| `[⚠️ AI-inferred]` | 🟡 **Inferred** | Double-check với code trước khi rely |
| `[❓ CẦN VERIFY]` | 🔴 **Unverified** | KHÔNG dựa vào — chờ human confirm |

### Staleness Score

```
Last updated < 7 ngày  → 🟢 Fresh — tin tưởng nguyên văn
Last updated 7-30 ngày → 🟡 Aging — verify No-Go Zones và Tech Stack
Last updated > 30 ngày → 🔴 Stale — WARN + suggest /v.understand --refresh
Không có date           → 🔴 Unknown — treat như Stale
```

---

## Fields Cần Extract

> 💡 Mỗi field ảnh hưởng khác nhau đến các Agent downstream.

| Field | Section trong context.md | Ảnh hưởng tới Agent |
|-------|------------------------|-------------------|
| **Tech Stack** | §1 Tech Stack Thực Tế | Implement: dùng đúng framework |
| **Architecture** | §2 Kiến Trúc Thực Tế | Plan: thiết kế phù hợp reality |
| **Module Map** | §3 Module Map | All: biết scope, dependencies |
| **No-Go Zones** | §4 🚫 No-Go Zones | Implement: **BLOCK** nếu đụng |
| **Technical Debt** | §5 Technical Debt | Plan: aware risks, budget fix |
| **Test Coverage** | §6 Test Coverage | Test: biết baseline, Plan: allocate effort |
| **Patterns** | §7 Patterns Đang Dùng | Implement: follow existing patterns |

## Per-Agent Impact Matrix

> 💡 Mỗi field ảnh hưởng KHÁC NHAU tới từng Agent:

| Field | BA | Plan | Test | Implement | Review |
|-------|:--:|:----:|:----:|:---------:|:------:|
| **Tech Stack** | • | • | • | ⭐ CRITICAL | • |
| **Architecture** | • | ⭐ CRITICAL | • | ⭐ CRITICAL | ⭐ CRITICAL |
| **No-Go Zones** | • | ⭐ CRITICAL | • | ⭐ CRITICAL | ⭐ CRITICAL |
| **Tech Debt** | • | ⭐ CRITICAL | • | • | ⭐ CRITICAL |
| **Test Coverage** | • | • | ⭐ CRITICAL | • | • |
| **Patterns** | • | • | • | ⭐ CRITICAL | • |

• = Awareness. ⭐ = Must extract để làm việc đúng.

---

## Đặc Thù — Những Điều KHÔNG Obvious

### 1. AI-inferred ≠ verified
- LLM hay treat AI-inferred như fact → SAI
- VD: AI infer "JWT auth" nhưng thực tế dùng session-based
- **Rule**: Cross-reference `[⚠️ AI-inferred]` items với code TRƯỚC khi plan/implement

### 2. Tech Debt là input cho Plan Agent
- context.md liệt kê sql injection risk → Plan Agent PHẢI address
- Không được ignore — ít nhất phải explicit acknowledge trong plan.md
- Nếu task chồng No-Go Zone + Tech Debt → BLOCK + escalate

### 3. Reality ≠ Rules
- context.md mô tả **đang dùng gì** (reality)
- constitution.md mô tả **nên dùng gì** (rules)
- Code MỚI → follow constitution. Code CŨ → giữ nguyên (No-Go)
- Flag conflicts rõ ràng trong _session.md

### 4. No-Go Zones là HARD STOP
- Khi task cần sửa file No-Go → DỪNG ngay
- Cross-reference với `no-go-zone-guard` skill
- KHÔNG cố workaround mà không báo

### 5. Module Map = Scope Control
- Agent chỉ chạm vào modules liệt kê trong Module Map
- Nếu task cần module KHÔNG có trong map → likely out of scope
- Ghi _session.md và hỏi trước khi expand scope
