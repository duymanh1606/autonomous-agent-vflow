---
slice_id: SLICE-20
feature: 001-autonomous-agent-vflow
title: "behavior config"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5, SLICE-6]
enhanced_by: []
hub_extends: []
demoable: "Operator sửa kịch bản/phong cách/ngôn ngữ/follow-up/settings và agent nhận được cấu hình mới"
seam_rationale: "Seam Read/Write: đường ghi cấu hình xuống agent, cần cả vỏ UI (SLICE-5) và kênh control (SLICE-6). In-house -> AFK."
demo_status: pending
units:
  - { id: BE-SUP-07, type: backend, story: S-BE-SUP-07 }
  - { id: SCR-SCENARIO, type: frontend, story: S-SCR-SCENARIO }
  - { id: SCR-SETTINGS, type: frontend, story: S-SCR-SETTINGS }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Cấu hình per-account: kịch bản, phong cách trả lời, ngôn ngữ, quy tắc follow-up, runtime settings; đẩy xuống agent qua `PATCH /control/settings`; màn Scenario và Settings.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
