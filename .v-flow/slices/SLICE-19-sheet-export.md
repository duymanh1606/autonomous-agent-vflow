---
slice_id: SLICE-19
feature: 001-autonomous-agent-vflow
title: "sheet export"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-18]
enhanced_by: []
hub_extends: []
demoable: "Một đơn hàng được export thành hàng dữ liệu trên Google Sheet qua Apps Script"
seam_rationale: "Seam Ownership: webhook Apps Script do bên ngoài sở hữu (URL, quota, lỗi/timeout) -> HITL. Seam Resilience: đường best-effort + retry đi cùng call tiêu thụ đầu tiên, không để SLICE-18 chạy trần rồi vá sau."
demo_status: pending
units:
  - { id: BE-SUP-14, type: backend, story: S-BE-SUP-14 }
  - { id: INT-SHEET-01, type: integration }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Export đơn/khách sang Google Sheet qua webhook Apps Script, xử lý lỗi/timeout best-effort và backfill.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
