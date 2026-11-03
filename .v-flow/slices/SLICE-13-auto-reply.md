---
slice_id: SLICE-13
feature: 001-autonomous-agent-vflow
title: "auto reply"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-11, SLICE-12]
enhanced_by: []
hub_extends: []
demoable: "Khách nhắn tin mới, agent phân tích ý định và tự gửi đúng một trả lời đã validate; restart không gửi trùng"
seam_rationale: "Lát nghiệp vụ lõi, toàn in-house: mọi bề mặt external (TikTok ở SLICE-9, Gemini ở SLICE-11) đã được nối trước nên slice này giữ được AFK — đúng mục tiêu AFK-first staging."
demo_status: pending
units:
  - { id: BE-AGT-03, type: backend, story: S-BE-AGT-03 }
  - { id: BE-AGT-04, type: backend, story: S-BE-AGT-04 }
  - { id: BE-AGT-13, type: backend, story: S-BE-AGT-13 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Phân tích ý định + định tuyến kịch bản, sinh trả lời kèm validator/ngôn ngữ/độ trễ, tra cứu sản phẩm và bộ nhớ khách làm ngữ cảnh; đường dự phòng khi LLM lỗi hoặc validator từ chối.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
