---
name: ears-writer
description: "Hướng dẫn BA Agent viết requirements theo EARS notation chính xác. Agent PHẢI đọc skill này trước khi viết bất kỳ requirement nào trong spec.md."
trigger: "Khi viết hoặc review requirements trong spec.md"
phase: "S.1"
used_by:
  - /v.specify
  - /v.ba-critic
---

# EARS Writer — Viết Requirements Đúng Chuẩn

> ⚠️ Đây là **Skill bắt buộc** cho BA Agent khi viết requirements.
> Đọc trước khi viết bất kỳ REQ nào. Không có EARS → spec mơ hồ, không testable.
>
> → Xem `gotchas.md` cho Anti-patterns phổ biến.
> → Xem `examples/good/` và `examples/bad/` cho ví dụ thực tế.
> → Xem `config.json` để customize EARS settings (language, ID style).
> → Chạy `.v-flow/skills/specify/ears-writer/scripts/check-ears-compliance.sh <spec.md>` để validate tự động.

---

## Khi nào KHÔNG cần skill này

- Viết mô tả feature tổng quan (không phải requirement)
- Viết user story dạng "As a... I want... So that..." (dùng ở 1.1 Mô tả, không phải §3 Requirements)
- Viết acceptance criteria (AC là con của REQ, không phải REQ)

---

## 4 Templates EARS

Mỗi requirement thuộc ĐÚNG 1 loại. Chọn loại dựa trên bản chất yêu cầu:

| Type | Keyword khởi đầu | Template | Signal nhận biết |
|------|-------------------|----------|-----------------|
| **Ubiquitous** | `phải` | `Hệ thống phải <action>` | Luôn đúng, không phụ thuộc event |
| **Event-driven** | `Khi` | `Khi <trigger>, hệ thống phải <action>` | Có sự kiện rõ ràng kích hoạt |
| **State-driven** | `Trong khi` | `Trong khi <state>, hệ thống phải <action>` | Áp dụng SUỐT thời gian ở trạng thái |
| **Optional** | `Nếu` | `Nếu <condition>, hệ thống phải <action>` | Có điều kiện tiên quyết |

### Cách chọn đúng loại

```
Yêu cầu luôn đúng? ───────────────────── Ubiquitous (REQ-U)
Có sự kiện trigger? ──────────────────── Event-driven (REQ-E)  
Áp dụng suốt 1 trạng thái? ───────────── State-driven (REQ-S)
Chỉ áp dụng khi condition thỏa? ──────── Optional (REQ-O)
```

### ID Convention

| Prefix | Loại | Ví dụ |
|--------|------|-------|
| REQ-U | Ubiquitous | REQ-U01, REQ-U02 |
| REQ-E | Event-driven | REQ-E01, REQ-E02 |
| REQ-S | State-driven | REQ-S01, REQ-S02 |
| REQ-O | Optional | REQ-O01, REQ-O02 |

---

## Đặc thù và Quy ước Nội bộ

> 💡 Đây là phần **QUAN TRỌNG NHẤT** — những gì LLM thường sai khi viết EARS.

### 1. Mỗi REQ = 1 action duy nhất
- ❌ "Hệ thống phải validate input và lưu vào DB"
- ✅ Tách thành REQ-U01 (validate) + REQ-E01 (lưu DB)
- **Lý do**: 1 REQ → 1 test case → 1 task. Trộn lẫn = trace mất.

### 2. Acceptance Criteria ngay dưới REQ
- Mỗi REQ phải có ≥1 AC dạng checkbox `- [ ] ...`
- AC phải **measurable** — có số cụ thể hoặc boolean outcome

### 3. Security requirements luôn có ít nhất 1 REQ-U
- Feature có auth/data → phải có REQ-U cho security
- VD: REQ-U01: "Hệ thống phải hash password bằng bcrypt trước khi lưu"

### 4. Error handling = REQ riêng
- Happy path: REQ-E01 (POST valid → 201)
- Error path: REQ-E02 (POST invalid → 400 + details)
- Đừng nhồi error vào REQ-E01

### 5. Từ ngữ cấm trong requirements
Grep spec output trước khi submit — nếu tìm thấy bất kỳ từ nào, requirement SAI:

| Từ cấm | Vấn đề | Thay bằng |
|--------|--------|----------|
| "nên", "should" | Không bắt buộc → không testable | "phải", "must" |
| "nhanh", "fast" | Không measurable | "trong vòng 200ms" |
| "dễ dùng", "user-friendly" | Chủ quan → không testable | Mô tả behavior cụ thể |
| "hợp lý", "reasonable" | Mơ hồ | Số cụ thể |
| "có thể", "can" | Feature description, không phải requirement | "phải" |
| "v.v.", "etc." | Incomplete specification | Liệt kê hết |

---

## Mapping EARS → Downstream Agents

> 💡 Mỗi loại REQ gợi ý implementation pattern cho các Agent phía sau:

| REQ Type | Plan Agent nên | Test Agent nên | Implement Agent nên |
|----------|---------------|---------------|-------------------|
| REQ-U | Always-on component, middleware, interceptor | Unit test (always true — test mọi entry point) | Core module, no conditional logic |
| REQ-E | Event handler, controller action, callback | Event-triggered test (given trigger → expect action) | Handler function, route handler |
| REQ-S | State management, state machine, lifecycle | State-based test (while in state → verify behavior) | Stateful component, BLoC, StateNotifier |
| REQ-O | Conditional logic, feature flag, guard | Condition branch test (if condition → expect, else → expect different) | if/guard clause, optional adapter |

---

## Checklist Trước Khi Submit Spec

```
[ ] Mỗi requirement có ID đúng convention (REQ-U/E/S/O + số)
[ ] Mỗi requirement bắt đầu bằng keyword EARS đúng loại
[ ] Mỗi requirement chỉ có 1 action chính
[ ] Mọi số liệu đều cụ thể (thời gian, kích thước, số lượng)
[ ] Mỗi requirement có ≥1 Acceptance Criteria
[ ] Không có từ cấm: "nên", "nhanh", "dễ dùng", "hợp lý", "có thể", "v.v."
[ ] Có ≥1 REQ-U cho security (nếu feature involve auth/data)
[ ] Error cases có REQ riêng (tách khỏi happy path)
[ ] Không có REQ nào vi phạm No-Go Zones (kiểm tra context.md)
```

---

## Gotchas

→ Xem `gotchas.md` cho danh sách lỗi phổ biến — cập nhật liên tục khi Agent mắc lỗi mới.
