---
description: "Constitute Agent — AI phân tích dự án và tự động draft constitution.md v2"
phase: "S.0a"
agent: "constitute-agent"
---

# /v.constitute

> Orchestration wrapper cho **Constitute Agent**. Đọc `agents/constitute-agent.md` để thực hiện core logic.

> ⚠️ **Khác với `/v.constitution`**: Lệnh cũ hỏi user từng bước (interactive). Lệnh này **tự scan codebase và draft**, user chỉ cần review sau.

## Điều kiện tiên quyết
- `.v-flow/` phải tồn tại (đã chạy `v-flow init`)
- `.v-flow/constitution.md` nên tồn tại (v1 template từ init)
- Ưu tiên đọc `.v-flow/context.md` nếu đã có

## Execution
1. Đọc agent definition: `agents/constitute-agent.md`
2. Thực hiện toàn bộ quy trình trong agent definition
3. Ghi đè `constitution.md` với v2 (AI-drafted)

## Options

### (không có argument) — Scan codebase tự động
AI scan codebase, infer patterns, draft constitution.

### --from-context — Ưu tiên đọc context.md
```
/v.constitute --from-context
```
Ưu tiên đọc `context.md` thay vì scan lại codebase từ đầu.

### [text kèm] — Kèm mô tả ngắn
```
/v.constitute Dự án Flutter mobile app, team 5 người
```
Kèm context bổ sung giúp AI draft chính xác hơn.

---

## 🔀 Routing Rules — Sau Constitute

```
Constitution v2 được tạo
  → Tech Lead review:
    1. Xác nhận / chỉnh sửa [⚠️ AI-inferred]
    2. Điền [Cần quyết định] (đặc biệt AI models, privacy)
    3. Xóa header warning → constitution có hiệu lực
  → Sau approve: S.0b (agent-config.md) hoặc S.1 (/v.specify)

Dự án legacy chưa có module cards
  → /v.understand --module (generate Module Cards)
```

## Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "S.0a"
phase_status: "awaiting_human"
```

**Append vào `_session.md`**:
```markdown
### [S.0a] Constitution — [YYYY-MM-DD]
- **Agent**: Constitute Agent
- **Output**: `constitution.md` v2 (AI-drafted)
- **Sections inferred**: [N]/7
- **Sections needing human**: [N] `[Cần quyết định]`
- **Routing**: → Await Tech Lead review
```

---

## Output
- `.v-flow/constitution.md` **(v2 — AI-drafted, cần Tech Lead review & approve)**

---

## Ví dụ

```
/v.constitute
/v.constitute Dự án Flutter mobile app, team 5 người
/v.constitute --from-context
```
