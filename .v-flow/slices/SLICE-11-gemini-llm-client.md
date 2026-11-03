---
slice_id: SLICE-11
feature: 001-autonomous-agent-vflow
title: "gemini llm client"
type: HITL
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-6]
enhanced_by: []
hub_extends: []
demoable: "Agent gọi Gemini generateContent lấy structured output và chạy được vision fallback"
seam_rationale: "Seam Ownership: Gemini là nhà cung cấp bên ngoài (quota, API key, định dạng response) -> HITL, tách riêng để một unit external không kéo cả lát auto-reply (SLICE-13) thành HITL."
demo_status: pending
units:
  - { id: BE-AGT-11, type: backend, story: S-BE-AGT-11 }
  - { id: INT-LLM-01, type: integration }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Client Gemini Flash Lite cho structured output, vision fallback khi DOM không đọc được, ghi `llm_usage`.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
