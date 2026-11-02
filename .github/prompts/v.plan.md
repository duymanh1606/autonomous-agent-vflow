---
description: "Plan Agent — Thiết kế kiến trúc và tạo Implementation Plan + Task Breakdown"
phase: "B.0a"
agent: "plan-agent"
optional_agents: ["security", "ux", "api-contract"]
---

# /v.plan

> Orchestration wrapper cho **Plan Agent**. Đọc `agents/plan-agent.md` để thực hiện core logic.

## Điều kiện tiên quyết
- `spec.md` phải tồn tại và đã **Approved**
- `constitution.md` phải tồn tại
- Chạy **SONG SONG** với `/v.test`

## Execution
1. Đọc agent definition: `agents/plan-agent.md`
2. Thực hiện toàn bộ quy trình trong agent definition
3. Áp dụng command options bên dưới (nếu có)

## Options

### --with-security
Kích hoạt **Security Agent** — tạo `security-review.md`.
Dùng khi: Feature có auth, payment, user data, external API.

### --with-ux
Kích hoạt **UX Agent** — tạo `ux-checklist.md` theo `.v-flow/templates/ux-checklist-template.md`.
Dùng khi: Feature có UI/UX components.

### --with-api
Kích hoạt **API Contract Agent** — tạo `contracts/api-contract.md` theo `.v-flow/templates/api-contract-template.md`.
Dùng khi: Feature expose API cho client/3rd party (hoặc contract-first khi có cả FE+BE).

> Các optional agents chạy **SONG SONG** với Plan Agent (Map-Reduce B.0).

---

## 🔀 Routing Rules — Sau Plan

```
Plan + Tasks tạo xong
  → Nếu /v.test chưa xong → Chờ Test Agent
  → Nếu /v.test đã xong   → /v.check (Master Check)
```

## Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "B.0a"
phase_status: "done"
artifacts:
  plan: { exists: true, synced_to_spec: "v1.0" }
  tasks: { exists: true, total: [N] }
b0_outputs:
  plan: { exists: true, agent: "Plan Agent" }
  tests: { exists: true, agent: "Test Agent" }
  security: { exists: true/false, skipped: true/false }
```

**Append vào `_session.md`**:
```markdown
### [B.0a] Plan — [YYYY-MM-DD]
- **Output**: plan.md, tasks.md ([N] tasks)
- **Annotations**: [N] parallel, [N] critical, [N] risky, [N] gates
- **Optional agents**: security=[yes/no], ux=[yes/no], api=[yes/no]
```

---

## Ví dụ

```
/v.plan Feature 001-user-login
/v.plan --with-security --with-api
```
