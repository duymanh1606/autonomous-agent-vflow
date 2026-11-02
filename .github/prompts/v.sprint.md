---
description: "Sprint Planning Agent — Lập kế hoạch sprint và tạo sprint-status.md"
phase: "B.1"
agent: "sprint-agent"
---

# /v.sprint

> Orchestration wrapper cho **Sprint Planning Agent**. Đọc `agents/sprint-agent.md` để thực hiện core logic.

## Điều kiện tiên quyết
- Ít nhất 1 feature có `tasks.md` sẵn sàng
- Feature phải đã qua R.0 (Master Check = PASS hoặc PASS_WITH_CONCERNS)
- `spec.md` và `.flow-state.yaml` phải tồn tại cho mỗi feature

## Execution
1. Đọc agent definition: `agents/sprint-agent.md`
2. Thực hiện toàn bộ quy trình trong agent definition
3. Tạo `sprint-status.md`

## Options

### (không có argument) — Sprint cho feature hiện tại
Sprint planning cho 1 feature đang active.

### --all — Sprint planning cho tất cả features
```
/v.sprint --all
```
Quét tất cả features đang eligible, tạo multi-feature sprint backlog.

### --update — Cập nhật sprint hiện tại
```
/v.sprint --update
```
Cập nhật progress trong `sprint-status.md` với trạng thái mới nhất.

---

## 🔀 Routing Rules — Sau Sprint Planning

```
Sprint plan tạo xong
  → Route: /v.implement (bắt đầu code theo sprint backlog)

Có feature chưa eligible
  → Route: /v.check (chạy Master Check cho feature đó)

Tất cả features blocked
  → Human intervention required
```

## Cập nhật State & Session

**Append vào `_session.md`** (mỗi feature trong sprint):
```markdown
### [Sprint] Sprint Planning — [YYYY-MM-DD]
- **Agent**: Sprint Planning Agent
- **Sprint**: Sprint [N]
- **Goal**: [sprint goal 1 câu]
- **Tasks selected**: [N must / M should / K nice-to-have]
- **Dependencies**: [cross-feature dependency summary]
- **Routing**: → /v.implement
```

---

## Ví dụ

```
/v.sprint
/v.sprint --all
/v.sprint --update
/v.sprint feature 001-user-login sprint 2
```
