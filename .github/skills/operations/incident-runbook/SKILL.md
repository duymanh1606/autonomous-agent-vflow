---
name: incident-runbook
version: "1.0"
agent: operations
phase: O.0
triggers:
  - production_incident
  - hotfix_flow
  - monitoring_alert
dependencies:
  - _shared/context-reader
input:
  - incident report / alert
  - monitoring data (logs, metrics)
  - context.md
  - spec.md (related feature)
output:
  - operations-report.md
  - incident ticket (INC-XXX.md)
complexity: high
---

# Incident Runbook Skill

> **Purpose**: Structured incident response procedure cho production issues.
> **Khi nào dùng**: Khi nhận alert/report từ production — chạy `/v.hotfix`.

## Quick Reference

```
Input:  Incident report + monitoring data + context.md
Output: operations-report.md + INC-XXX.md
Agent:  Operations Agent
Phase:  O.0
```

## What This Skill Does

1. **Triage** — Phân loại severity (P1/P2/P3/P4) và assign response SLA
2. **Investigate** — Root Cause Analysis (RCA) có cấu trúc
3. **Contain** — Immediate mitigation steps
4. **Fix** — Route to appropriate pipeline (hotfix/quickfix/standard)
5. **Learn** — Post-mortem và lessons learned

## Severity Classification

| Level | Impact | Response SLA | Pipeline |
|-------|--------|-------------|----------|
| **P1** | Service down, data loss | < 15 min | `/v.hotfix` |
| **P2** | Major feature broken | < 1 hour | `/v.hotfix` |
| **P3** | Minor feature degraded | < 4 hours | `/v.quickfix` |
| **P4** | Cosmetic, performance | Next sprint | Standard flow |

## Incident Response Steps

### Step 1: Triage (< 5 min)

```markdown
## Incident Triage

**Alert Source**: [monitoring / user report / automated test]
**Timestamp**: [when detected]
**Impact Assessment**:
  - Users affected: [all / segment / single]
  - Feature affected: [feature name]
  - Data integrity: [safe / at risk / compromised]

**Severity**: P[1-4]
**Response SLA**: [time]
```

### Step 2: Investigate (RCA)

```markdown
## Root Cause Analysis

### What happened?
[Description của incident]

### Timeline
| Time | Event |
|------|-------|
| T-0 | Description of the trigger event |
| T+5m | First alert |
| T+10m | Investigation started |

### Root Cause
[Direct cause → Contributing factors → Systemic issues]

### Blast Radius
- Files affected: [list]
- Modules affected: [list]
- No-Go Zones touched: [yes/no — CRITICAL if yes]
```

### Step 3: Contain

```markdown
## Immediate Mitigation

### Actions Taken
1. [Rollback / Feature flag / Rate limit / etc.]
2. [Communication to users]
3. [Monitoring enhanced]

### Verification
- [How to verify the containment is effective]
- [Metrics to watch]
```

### Step 4: Fix (Route to Pipeline)

```markdown
## Fix Strategy

### Route Decision
- P1/P2 → `/v.hotfix` — skip spec, direct implement → review → deploy
- P3 → `/v.quickfix` — minimal spec → implement → review
- P4 → Standard flow with backlog ticket

### Fix Details
- Branch: hotfix/INC-XXX
- Files to change: [list]
- Test strategy: [unit test for fix + regression]
- Deploy strategy: [immediate / canary / next release]
```

### Step 5: Learn (Post-mortem)

```markdown
## Post-Mortem

### What went well
1. [Detection was fast]
2. [Communication was clear]

### What went wrong
1. [Missing test coverage for edge case]
2. [No monitoring for this metric]

### Action Items
| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | Add test for edge case X | Dev | Sprint N |
| 2 | Add monitoring alert for Y | SRE | Sprint N |
| 3 | Update context.md with new no-go zone | Tech Lead | Sprint N |

### Knowledge Base Update
→ File: .v-flow/knowledge/lessons-learned/INC-XXX.md
```

## Integration with V-Flow Pipeline

```
Alert → O.0 (Triage + RCA) → Route Decision:
  ├── P1/P2 → B.1 (Hotfix) → R.1 (Review) → Deploy → O.0 (Verify)
  ├── P3   → S.1 (Quick Spec) → B.1 → R.1 → Deploy
  └── P4   → Backlog → Standard Pipeline
```

## Gotchas

1. **Đừng debug production trên production** — Reproduce locally trước khi fix
2. **No-Go Zones** — Nếu root cause nằm trong no-go zone, PHẢI escalate tới Tech Lead
3. **Hotfix ≠ Skip quality** — Hotfix vẫn cần test và review, chỉ skip spec
4. **Communication** — Cập nhật stakeholders tại mỗi bước, không chỉ khi fix xong
5. **Lessons learned** — Post-mortem PHẢI được ghi vào knowledge base, không chỉ chat/email
