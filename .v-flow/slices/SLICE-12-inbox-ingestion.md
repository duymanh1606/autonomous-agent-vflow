---
slice_id: SLICE-12
feature: 001-autonomous-agent-vflow
title: "inbox ingestion"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-9]
enhanced_by: []
hub_extends: []
demoable: "Tin nhắn mới trên TikTok được phát hiện, dedupe/lease đúng một lần và tạo task LangGraph có checkpoint"
seam_rationale: "Đường tiếp nhận thuần in-house trên bề mặt browser đã mở ở SLICE-9. Seam Read/Write: chỉ ghi sổ + tạo task, chưa gửi gì ra ngoài -> demo được độc lập, AFK."
demo_status: pending
units:
  - { id: BE-AGT-01, type: backend, story: S-BE-AGT-01 }
  - { id: BE-AGT-02, type: backend, story: S-BE-AGT-02 }
  - { id: BE-AGT-06, type: backend, story: S-BE-AGT-06 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Watcher + scan scheduler phát hiện tin mới, inbox ledger dedupe và cấp lease idempotent, workflow LangGraph với checkpoint Postgres.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
