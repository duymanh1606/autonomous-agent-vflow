---
name: constitution-reader
description: "Load và parse constitution.md, extract rules áp dụng cho phase hiện tại. Agent PHẢI gọi skill này ở đầu MỖI session."
trigger: "Đầu mỗi agent session / mỗi phase mới"
phase: "All"
used_by:
  - /v.specify
  - /v.plan
  - /v.test
  - /v.check
  - /v.implement
  - /v.review
---

# Constitution Reader — Load Project Rules

> ⚠️ Đây là **Skill dùng chung** — chạy ĐẦU TIÊN trong mọi agent session.
> Nếu constitution.md không tồn tại → WARN, nhưng vẫn tiếp tục.
>
> → Xem `gotchas.md` cho lỗi phổ biến khi đọc constitution.
> → Xem `examples/good/` cho mẫu output per phase.

---

## Khi nào KHÔNG đọc

- Chạy `/v.constitute` (đang TẠO constitution)
- Chạy `/v.understand` lần đầu (chưa có constitution)

---

## Nguồn Constitution

```
Đường dẫn: .v-flow/constitution.md
Nếu không tồn tại → WARN: "No constitution found. Consider running /v.constitute"
```

---

## Mapping Sections → Phases

> 💡 Agent KHÔNG cần đọc toàn bộ constitution. Chỉ đọc sections LIÊN QUAN cho phase hiện tại.

| Constitution Section | Áp dụng cho Phase | Agent đọc |
|---------------------|:------------------:|-----------|
| §1 Architecture Principles | B.0a, B.1 | Plan, Implement |
| §2 Code Standards | B.1, R.1 | Implement, Review |
| §3 Testing Policy | B.0b, B.1 | Test, Implement |
| §4 API Conventions | S.1, B.0a | BA, Plan |
| §5 Security Requirements | ALL | ALL |
| §6 Naming Conventions | B.1, R.1 | Implement, Review |
| §7 No-Go Zones | B.0a, B.1 | Plan, Implement |
| §8 Error Handling | B.0a, B.1 | Plan, Implement |
| §9 Spec Change Policy | S.1 | BA |

## Per-Agent Extraction Depth

> 💡 Mỗi Agent cần KHÁC NHAU từ constitution. Đây là bảng chi tiết:

| Agent | Sections cần | Extraction depth | Quyết định gì từ constitution |
|-------|-------------|:-----:|-----|
| **BA Agent** | §4, §5, §9 | Shallow | API naming style → ảnh hưởng spec endpoint names |
| **Plan Agent** | §1, §4, §5, §7, §8 | Deep | Architecture pattern → ảnh hưởng task breakdown |
| **Test Agent** | §3, §5 | Medium | Coverage target, test strategy → ảnh hưởng TC count |
| **Implement Agent** | §1-§3, §5-§8 | Deep | Everything — most affected by constitution |
| **Review Agent** | §1-§8 | Deep | Review criteria derived from rules |
| **Master Check** | §5, §7 | Shallow | Security và No-Go → blocking concerns |

---

## Cross-Reference With context.md

Nếu context.md tồn tại (legacy project):
- No-Go Zones từ context.md **override** constitution §7
- Technical Debt từ context.md **bổ sung** vào awareness
- Architecture thực tế từ context.md **có thể khác** constitution (→ flag mismatch)

### Conflict Resolution

| Conflict | Rule |
|----------|------|
| context.md nói "monolith" + constitution nói "clean architecture" | Code MỚI → follow constitution. Code CŨ → don't refactor (No-Go) |
| context.md nói "raw SQL" + constitution nói "ORM" | New features → ORM. Existing queries → keep raw SQL |
| constitution §7 lists No-Go + context.md lists MORE No-Go | **Union** — cả hai đều block |
| constitution `[Cần quyết định]` | DỪNG. Ghi _session.md. Hỏi Tech Lead |
| Version mismatch (constitution updated mid-pipeline) | WARN → suggest `/v.sync` |

---

## Đặc Thù

### Constitution có thể chưa hoàn chỉnh
- Sections ghi `[Cần quyết định]` → Agent ghi vào _session.md và hỏi Tech Lead
- KHÔNG tự quyết định thay — **đây là lỗi phổ biến nhất**

### Constitution version
- Check version ở header → so sánh với .flow-state.yaml `constitution_version`
- Nếu mismatch → WARN: "Constitution updated since last pipeline run"
- **Action**: Suggest `/v.sync` để propagate changes

### Multiple projects in monorepo
- Mỗi sub-project có thể có constitution riêng
- Đọc constitution gần nhất theo directory hierarchy

### Edge Case: No constitution + No context
- Greenfield project chưa chạy `/v.constitute`
- Agent PHẢI vẫn chạy được — dùng best-practice defaults
- Ghi WARN vào _session.md: "No project rules found"
