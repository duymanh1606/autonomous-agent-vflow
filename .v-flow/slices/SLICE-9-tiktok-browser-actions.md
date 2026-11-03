---
slice_id: SLICE-9
feature: 001-autonomous-agent-vflow
title: "tiktok browser actions"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-6]
enhanced_by: []
hub_extends: []
demoable: "Agent điều khiển Chrome qua CDP, nhận diện màn hình TikTok và thực hiện được một hành động UI dưới cổng chính sách"
seam_rationale: "Seam Ownership: TikTok Web là bề mặt bên ngoài không có hợp đồng ổn định -> HITL (cần người xác nhận selector/hành vi thật). Seam Resilience: recovery/state-verifier đi CÙNG lần gọi tiêu thụ đầu tiên, không trôi về slice sau, để không có consumer nào chạy 'trần'."
demo_status: pending
units:
  - { id: BE-AGT-05, type: backend, story: S-BE-AGT-05 }
  - { id: BE-AGT-07, type: backend, story: S-BE-AGT-07 }
  - { id: BE-AGT-12, type: backend, story: S-BE-AGT-12 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Adapter TikTok Web + Playwright CDP, grounding/perception để định vị phần tử, executor hành động UI; cổng chính sách cho mọi hành động; phát hiện lệch màn hình và khôi phục.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
