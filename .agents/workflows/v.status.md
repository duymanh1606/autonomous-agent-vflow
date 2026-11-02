---
description: "Status Command — Hiển thị trạng thái pipeline visual, đề xuất bước tiếp theo"
phase: "Any"
agent: "status-agent"
---

# /v.status

> Orchestration wrapper cho **Status Agent**. Đọc `agents/status-agent.md` để thực hiện core logic.

Hiển thị **dashboard trực quan** trạng thái pipeline của feature.

## Điều kiện tiên quyết
- `.v-flow/features/` phải có ít nhất 1 feature
- `.flow-state.yaml` nên tồn tại (fallback: file-based detection)

## Execution
1. Đọc agent definition: `agents/status-agent.md`
2. Thực hiện quy trình trong agent definition
3. Áp dụng Routing Rules bên dưới để đề xuất bước tiếp theo

---

## 🔀 Routing Rules — V Flow (cho Status Agent tham khảo)

| State | Route |
|---|---|
| Chưa có spec | `/v.specify` |
| Spec draft/reviewed | ⏳ Chờ human approve |
| Spec approved, thiếu plan/test | `/v.plan` + `/v.test` |
| Có artifact out-of-sync | `/v.sync` TRƯỚC |
| Không có validation | `/v.check` |
| Validation = PENDING_RECHECK | `/v.check` |
| Validation = FAIL + spec_gap | `/v.specify` |
| Validation = FAIL + plan_gap | `/v.plan` |
| Validation = FAIL + test_gap | `/v.test` |
| Validation = FAIL + nogo/constitution | Fix → `/v.plan` |
| Validation = PASS/CONCERNS | `/v.implement` |
| Tasks có [/] | Tiếp tục implement |
| Tất cả tasks [x] | `/v.review` |
| Review = CHANGES_REQUIRED | Fix → `/v.review` |
| Review = APPROVED | 🚀 Deploy → Retrospective → Metrics |

---

## Cập nhật State & Session

**Không cập nhật `.flow-state.yaml`** — Status là read-only.

**Có thể auto-fix `phase_status`** nếu phát hiện stale state (ví dụ: phase_status = "in_progress" nhưng không có active work).

---

## Ví dụ

```
/v.status                              ← feature hiện tại
/v.status 001-user-login               ← feature cụ thể
/v.status all                          ← tất cả features
/v.status --sprint                     ← sprint dashboard
/v.status 001 002 --compare            ← so sánh 2 features
```
