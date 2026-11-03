---
name: ears-notation
description: "Quick reference EARS notation cho mọi Agent cần viết hoặc đọc requirements. Gọi khi cần interpret REQ-xxx IDs."
trigger: "Khi cần viết, đọc, hoặc validate requirements"
phase: "S.1, B.0a, B.0b, R.0"
used_by:
  - /v.specify
  - /v.plan
  - /v.test
  - /v.check
  - /v.ba-critic
---

# EARS Notation — Quick Reference Card

> 💡 Đây là **reference card** — không phải skill dạy viết EARS.
> Để viết EARS chi tiết → xem `specify/ears-writer`.
>
> → Xem `gotchas.md` cho lỗi phổ biến khi interpret EARS.

---

## EARS Templates

| Type | Keyword | Template | Signal nhận biết |
|------|---------|----------|-----------------|
| **Ubiquitous** | `phải` | Hệ thống **phải** `<action>` | Luôn đúng, không điều kiện |
| **Event-driven** | `Khi` | **Khi** `<trigger>`, hệ thống phải `<action>` | Có sự kiện cụ thể |
| **State-driven** | `Trong khi` | **Trong khi** `<state>`, hệ thống phải `<action>` | Suốt thời gian ở state |
| **Optional** | `Nếu` | **Nếu** `<condition>`, hệ thống phải `<action>` | Có điều kiện tiên quyết |

---

## ID Convention

| Prefix | Type | Example |
|--------|------|---------|
| `REQ-U` | Ubiquitous | REQ-U01 |
| `REQ-E` | Event-driven | REQ-E01 |
| `REQ-S` | State-driven | REQ-S01 |
| `REQ-O` | Optional | REQ-O01 |

---

## Interpretation Guide Per Agent

> 💡 Phần này giúp Agent DOWNSTREAM hiểu mỗi loại REQ gợi ý implementation pattern gì.

| REQ Type | Plan Agent → | Test Agent → | Implement Agent → |
|:--------:|-------------|-------------|-------------------|
| **REQ-U** | Always-on component, middleware | Unit test: assert always true | Core module, no conditional |
| **REQ-E** | Event handler, route handler | Event test: given trigger → expect action | Handler/callback function |
| **REQ-S** | State management, lifecycle | State test: while in state → verify behavior | Stateful component, BLoC |
| **REQ-O** | Conditional logic, feature flag | Branch test: if true → A, else → B | if/guard clause |

### Mapping sang Test Strategy

| REQ Type | Test Strategy | Minimum TCs |
|:--------:|--------------|:-----------:|
| REQ-U | Invariant check — test ở mọi state | 1-2 |
| REQ-E | Trigger → Action → Assert | 2-3 (success + errors) |
| REQ-S | Enter state → verify → exit state | 2-4 (enter + during + exit) |
| REQ-O | Condition true → A, condition false → B | 2+ (mỗi branch) |
