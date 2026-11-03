---
slice_id: SLICE-14
feature: 001-autonomous-agent-vflow
title: "takeover conversations"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-7, SLICE-13]
enhanced_by: []
hub_extends: []
demoable: "Operator mở hội thoại, takeover, gửi tin tay rồi release; trong lúc takeover agent không tự trả lời"
seam_rationale: "Seam Read/Write: đường ghi của người vào hội thoại mà agent đang xử lý — phải đi sau khi agent tự trả lời được (SLICE-13) mới demo được mâu thuẫn 'agent im lặng khi người tiếp quản'. In-house -> AFK."
demo_status: pending
units:
  - { id: BE-AGT-09, type: backend, story: S-BE-AGT-09 }
  - { id: BE-SUP-04, type: backend, story: S-BE-SUP-04 }
  - { id: BE-SUP-08, type: backend, story: S-BE-SUP-08 }
  - { id: SCR-CUSTOMERS, type: frontend, story: S-SCR-CUSTOMERS }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Escalation + cổng chặn agent khi takeover, API hội thoại/takeover/gửi tay, dịch tin và đính kèm media; màn Customers.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
