---
slice_id: SLICE-5
feature: 001-autonomous-agent-vflow
title: "home shell"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-4]
enhanced_by: [SLICE-24]
hub_extends: []
demoable: "Operator thấy danh sách workspace ở Home, mở dialog tạo workspace mới và điều hướng bằng sidebar/topbar"
seam_rationale: "Hoàn tất lớp vỏ điều hướng in-house trên lifecycle API đã có. SCR-HOME là **hub growable** (nhiều slice sau nối thêm hành động vào nó) nên được build lần đầu ở đây với đường đọc/xem; EGW (external) bị cắt sang SLICE-24 theo seam Ownership để Home không bị kéo thành HITL."
demo_status: pending
units:
  - { id: SCR-HOME, type: frontend, story: S-SCR-HOME, growable: true }
  - { id: WGT-SIDEBAR, type: frontend, story: S-WGT-SIDEBAR }
  - { id: WGT-TOPBAR, type: frontend, story: S-WGT-TOPBAR }
  - { id: WGT-ACCOUNT-DIALOG, type: frontend, story: S-WGT-ACCOUNT-DIALOG }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Màn Home liệt kê workspace theo quyền của operator, dialog tạo/sửa workspace, sidebar + topbar điều hướng.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
