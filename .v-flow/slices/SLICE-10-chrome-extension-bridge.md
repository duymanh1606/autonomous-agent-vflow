---
slice_id: SLICE-10
feature: 001-autonomous-agent-vflow
title: "chrome extension bridge"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-9]
enhanced_by: []
hub_extends: []
demoable: "Extension quan sát DOM TikTok và thực thi hành động qua bridge tới agent local"
seam_rationale: "Seam Ownership: MV3 extension + chính sách cài đặt doanh nghiệp là bề mặt do browser/IT sở hữu -> HITL. Cắt sau SLICE-9 vì đây là đường perception/action thay thế, không phải điều kiện của nó."
demo_status: pending
units:
  - { id: BE-EXT-01, type: backend, story: S-BE-EXT-01 }
  - { id: BE-EXT-02, type: backend, story: S-BE-EXT-02 }
  - { id: BE-EXT-03, type: backend, story: S-BE-EXT-03 }
  - { id: INT-EXT-01, type: integration }
  - { id: OPS-08, type: infrastructure, story: S-OPS-08 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Content script quan sát/trích xuất DOM, executor hành động, background bridge gọi `127.0.0.1:8765` kèm `X-Agent-Token`; đóng gói extension và cài policy.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
