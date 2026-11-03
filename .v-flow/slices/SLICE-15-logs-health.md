---
slice_id: SLICE-15
feature: 001-autonomous-agent-vflow
title: "logs health"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5]
enhanced_by: []
hub_extends: []
demoable: "Operator xem log và tình trạng health/healthz của workspace"
seam_rationale: "Đường đọc vận hành, độc lập với mọi luồng nghiệp vụ; chỉ cần vỏ UI (SLICE-5). AFK."
demo_status: pending
units:
  - { id: BE-SUP-13, type: backend, story: S-BE-SUP-13 }
  - { id: SCR-LOGS, type: frontend, story: S-SCR-LOGS }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Đọc log theo workspace, health monitor + `/healthz` + `/api/system`; màn Logs.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
