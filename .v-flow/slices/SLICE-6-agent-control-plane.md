---
slice_id: SLICE-6
feature: 001-autonomous-agent-vflow
title: "agent control plane"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-4]
enhanced_by: []
hub_extends: []
demoable: "Supervisor gọi /control/status, pause/resume một agent và nhận được event qua SSE"
seam_rationale: "Seam Trust/auth lần hai: `X-Control-Token` là quyết định nền cho mọi lệnh Supervisor -> agent, cô lập vào một slice riêng cùng hai hợp đồng nội bộ. Chưa chạm TikTok thật nên vẫn AFK."
demo_status: pending
units:
  - { id: BE-AGT-10, type: backend, story: S-BE-AGT-10 }
  - { id: INT-AGT-01, type: integration }
  - { id: INT-AGT-02, type: integration }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Control server FastAPI per-account (`/control/*`): status, pause/drain/resume/shutdown, tasks, takeover, settings; stream SSE `/control/events`; hai hợp đồng nội bộ tương ứng.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
