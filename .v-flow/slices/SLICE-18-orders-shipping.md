---
slice_id: SLICE-18
feature: 001-autonomous-agent-vflow
title: "orders shipping"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5]
enhanced_by: []
hub_extends: []
demoable: "Operator tạo đơn hàng, đổi trạng thái và cấu hình vận chuyển; đơn chỉ hiện theo đúng account"
seam_rationale: "Nhánh đơn hàng in-house. Seam Ownership: phần export ra Google Sheet bị cắt sang SLICE-19 để slice này AFK."
demo_status: pending
units:
  - { id: BE-SUP-06, type: backend, story: S-BE-SUP-06 }
  - { id: SCR-ORDERS, type: frontend, story: S-SCR-ORDERS }
  - { id: SCR-SHIPPING, type: frontend, story: S-SCR-SHIPPING }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
CRUD đơn hàng, chuyển trạng thái, cấu hình vận chuyển; màn Orders và Shipping.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
