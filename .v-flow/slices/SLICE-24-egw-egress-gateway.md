---
slice_id: SLICE-24
feature: 001-autonomous-agent-vflow
title: "egw egress gateway"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5]
enhanced_by: []
hub_extends: [SLICE-5]
demoable: "Operator gán egress proxy EGW cho một workspace và agent đi ra internet qua proxy đó"
seam_rationale: "Seam Ownership: EGW Admin API do hệ bên ngoài sở hữu -> HITL. Đây là **story mở rộng** cho hub growable SCR-HOME đã build ở SLICE-5 (`hub_extends: [SLICE-5]`), không tái-liệt-kê SCR-HOME để giữ G1."
demo_status: pending
units:
  - { id: BE-SUP-10, type: backend, story: S-BE-SUP-10 }
  - { id: INT-EGW-01, type: integration }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Gán/gỡ route EGW và cấp token proxy per-account qua EGW Admin API; nối thêm hành động gán proxy vào màn Home.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
