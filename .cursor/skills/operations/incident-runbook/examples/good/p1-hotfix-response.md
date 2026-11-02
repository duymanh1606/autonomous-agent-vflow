# Incident Runbook — Good Example: P1 Hotfix

> Ví dụ output chuẩn khi Operations Agent xử lý P1 incident.

## Scenario

**Alert**: Login API returning 500 after deployment at 14:30
**Impact**: All users unable to login — service effectively down

## Output — operations-report.md

```markdown
## 🚨 Incident Report — INC-042

**Status**: ✅ Resolved
**Severity**: P1 — Service Down
**Detected**: 2026-04-25 14:35 (monitoring alert)
**Resolved**: 2026-04-25 15:10 (35 min total)
**Impact**: 100% users unable to login for 35 minutes

---

### Triage (T+0 → T+5 min)

**Alert Source**: Automated monitoring (5xx spike > 50%)
**Impact Assessment**:
  - Users affected: ALL (100%)
  - Feature affected: Authentication (login, register, password reset)
  - Data integrity: ✅ Safe (no write operations affected)

**Severity**: P1 — Service Down
**Response SLA**: < 15 min (started investigation at T+5m)

---

### Root Cause Analysis

**Timeline**:

| Time | Event |
|------|-------|
| 14:30 | Deploy v2.3.1 to production |
| 14:32 | First 500 errors appear in logs |
| 14:35 | Monitoring alert fires (5xx > 50%) |
| 14:37 | On-call engineer acknowledges alert |
| 14:40 | Investigation started — review deploy diff |
| 14:45 | Root cause identified: JWT_SECRET env var missing |
| 14:50 | Hotfix: restore env var in deployment config |
| 14:55 | Redeployed with fix |
| 15:00 | 5xx rate drops to 0% |
| 15:10 | Confirmed stable — incident resolved |

**Root Cause**: Deployment script v2.3.1 introduced new config template that didn't include `JWT_SECRET` environment variable. Auth middleware threw unhandled exception when trying to verify tokens → 500 for all authenticated routes.

**Direct cause**: Missing env var in deployment config template
**Contributing factor**: No pre-deploy env var validation
**Systemic issue**: Deployment config not versioned with code

---

### Containment

**Actions Taken**:
1. ✅ Restored `JWT_SECRET` in deployment config
2. ✅ Redeployed with correct config
3. ✅ Verified login flow working end-to-end
4. ✅ Posted status update to #incidents channel

**Verification**:
- Login success rate: 99.9% (back to normal)
- 5xx rate: 0%
- Response time: 120ms (normal baseline: 100-150ms)

---

### Fix Details

**Route**: `/v.hotfix` (skip spec, direct implement → review → deploy)
**Branch**: `hotfix/INC-042-jwt-secret`
**Files changed**: 1 (`deploy/config.template.yaml`)
**Test**: ✅ Smoke test — login flow works
**Rollback plan**: Revert to v2.3.0 deployment config

---

### Post-Mortem

**What went well**:
1. Fast detection (3 min from deploy to alert)
2. Clear RCA — identified in 10 minutes
3. Fix was minimal and non-invasive

**What went wrong**:
1. No pre-deploy env var validation check
2. Config template change not reviewed for env var completeness
3. No canary deployment — went straight to 100%

**Action Items**:

| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | Add env var validation to deploy pipeline | DevOps | Sprint 12 | ⬜ |
| 2 | Add config template change to review checklist | Tech Lead | Sprint 12 | ⬜ |
| 3 | Implement canary deployment (10% → 50% → 100%) | DevOps | Sprint 13 | ⬜ |
| 4 | Add integration test for auth middleware startup | Dev | Sprint 12 | ⬜ |

### Knowledge Base Update
→ File: `.v-flow/knowledge/lessons-learned/INC-042-jwt-secret.md`
→ Added No-Go note: deployment config templates require env var review
```

## Why This Is Good

1. ✅ **Structured timeline** — rõ ràng từng phút xảy ra gì
2. ✅ **Multi-level RCA** — direct, contributing, systemic causes
3. ✅ **Containment verified** — metrics chứng minh fix hoạt động
4. ✅ **Actionable post-mortem** — 4 specific items với owner và deadline
5. ✅ **Knowledge captured** — lessons learned filed for future prevention
6. ✅ **Non-blame** — focus vào process improvement, không blame cá nhân
