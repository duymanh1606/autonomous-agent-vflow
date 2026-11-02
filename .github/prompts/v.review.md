---
description: "Code Review Agent — Adversarial review đủ 5 chiều có bằng chứng (không ép số lượng issue)"
phase: "R.1"
agent: "review-agent"
---

# /v.review

> Orchestration wrapper cho **Review Agent**. Đọc `agents/review-agent.md` để thực hiện core logic.

> ⚠️ **Nguyên tắc cốt lõi**: Review đủ 5 chiều **có bằng chứng** — không ép số lượng issue; "no material findings" hợp lệ nếu kèm residual risk + test gap

## Điều kiện tiên quyết
- Code đã được implement (tasks `[x]` trong `tasks.md`)
- Có `spec.md` để đối chiếu requirements
- Có `plan.md` để đối chiếu architecture
- Có `constitution.md` để đối chiếu standards

## Execution
1. Đọc agent definition: `agents/review-agent.md`
2. Thực hiện toàn bộ quy trình review trong agent definition
3. Tạo `code-review-report.md`

---

## 🔀 Routing Rules — Sau Code Review

```
Verdict = APPROVED
  → Route: Deploy 🚀
  → Sau deploy: /v.retrospective → /v.metrics

Verdict = APPROVED_WITH_NOTES
  → Route: Deploy 🚀
  → Notes phải được track trong knowledge/lessons-learned/ hoặc issue tracker
  → Sau deploy: /v.retrospective

Verdict = CHANGES_REQUIRED
  → Route: Fix issues cụ thể → /v.review lại
  → Không cần chạy lại /v.check trừ khi:
    - Issues ảnh hưởng đến spec/architecture → escalate lên /v.check
    - Issues lộ ra spec thiếu → escalate lên /v.specify
```

## Cập nhật State & Session

**Cập nhật `.flow-state.yaml`**:
```yaml
current_phase: "R.1"
phase_status: "done"
artifacts:
  code_review:
    exists: true
    verdict: "APPROVED"
routing:
  after_review:
    last_verdict: "APPROVED"
    route_decision: "deploy"
```

**Append vào `_session.md`**:
```markdown
### [R.1] Code Review — [YYYY-MM-DD]
- **Verdict**: [APPROVED | APPROVED_WITH_NOTES | CHANGES_REQUIRED]
- **Issues**: [N] critical, [N] major, [N] minor
- **Concerns verified**: [W-001 resolved ✅ | W-002 nếu chưa resolved ❌]
- **Routing**: → [deploy | fix giải quyết vấn đề | escalate]
```

---

## Ví dụ

```
/v.review
/v.review feature 001-user-login
/v.review file src/auth/login.ts
```
