---
slice_id: SLICE-21
feature: 001-autonomous-agent-vflow
title: "followup"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-13, SLICE-20]
enhanced_by: []
hub_extends: []
demoable: "Khách im lặng đủ ngưỡng nhận đúng một tin follow-up; đã nudge / đang takeover / ngoài giờ thì bỏ qua"
seam_rationale: "Phải đi sau cả auto-reply (SLICE-13) và cấu hình follow-up (SLICE-20) mới demo được quy tắc thật. Slice một-unit hợp lệ: tự verify độc lập qua ngưỡng im lặng."
demo_status: pending
units:
  - { id: BE-AGT-08, type: backend, story: S-BE-AGT-08 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Scheduler follow-up và policy bỏ qua (đã nudge, đang takeover, ngoài giờ).

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
