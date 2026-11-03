---
slice_id: SLICE-8
feature: 001-autonomous-agent-vflow
title: "dashboard runs"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-5, SLICE-7]
enhanced_by: []
hub_extends: []
demoable: "Operator xem Dashboard, lập và huỷ một run đa account, tìm nhanh bằng command palette"
seam_rationale: "Lát điều phối in-house trên realtime đã có. BE-SUP-15 (search) được kéo vào đúng slice của consumer duy nhất của nó (command palette) để thoả G8 Precedence thay vì để thành slice lẻ."
demo_status: pending
units:
  - { id: BE-SUP-11, type: backend, story: S-BE-SUP-11 }
  - { id: BE-SUP-15, type: backend, story: S-BE-SUP-15 }
  - { id: SCR-DASHBOARD, type: frontend, story: S-SCR-DASHBOARD }
  - { id: WGT-COMMAND-PALETTE, type: frontend, story: S-WGT-COMMAND-PALETTE }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Lập/huỷ kế hoạch chạy đa account, màn Dashboard tổng quan trạng thái, command palette + API tìm kiếm toàn cục.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
