---
slice_id: SLICE-7
feature: 001-autonomous-agent-vflow
title: "realtime activity"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5, SLICE-6]
enhanced_by: []
hub_extends: []
demoable: "Operator mở Activity và thấy event của agent chảy về realtime"
seam_rationale: "Nối hai đầu đã có (SSE của agent ở SLICE-6, vỏ UI ở SLICE-5) thành đường đọc realtime. Seam Read/Write: chỉ đọc, không ghi -> demo độc lập, AFK."
demo_status: pending
units:
  - { id: BE-SUP-12, type: backend, story: S-BE-SUP-12 }
  - { id: INT-SUP-02, type: integration }
  - { id: SCR-ACTIVITY, type: frontend, story: S-SCR-ACTIVITY }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Event hub gom SSE của các agent và phát WebSocket `/api/events`; màn Activity hiển thị dòng sự kiện.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
