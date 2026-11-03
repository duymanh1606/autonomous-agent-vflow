---
slice_id: SLICE-16
feature: 001-autonomous-agent-vflow
title: "notifications alerts"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-14, SLICE-15]
enhanced_by: []
hub_extends: []
demoable: "Một escalation sinh ra thông báo in-app, Web Push và email; cảnh báo hiện ở màn Alerts"
seam_rationale: "Seam Ownership: Web Push (VAPID) và SMTP là kênh bên ngoài, cần cấu hình/khoá thật -> HITL. Gom hai hợp đồng external vào đúng slice tiêu thụ chúng, để SLICE-2 và SLICE-14 ở trước vẫn AFK."
demo_status: pending
units:
  - { id: BE-SUP-09, type: backend, story: S-BE-SUP-09 }
  - { id: INT-PUSH-01, type: integration }
  - { id: INT-MAIL-01, type: integration }
  - { id: SCR-ALERTS, type: frontend, story: S-SCR-ALERTS }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Thông báo in-app, Web Push VAPID, email SMTP và cảnh báo từ escalation/health; màn Alerts.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
