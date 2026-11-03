---
slice_id: SLICE-22
feature: 001-autonomous-agent-vflow
title: "ops ci backup maintenance"
type: AFK
parent_epics: [BL:autonomous-agent-vflow]
blocked_by: [SLICE-1]
enhanced_by: []
hub_extends: []
demoable: "CI chạy xanh; backup + restore check và maintenance timer hoạt động trên dữ liệu thật"
seam_rationale: "Lát vận hành in-house, chỉ phụ thuộc nền ở SLICE-1. Không chạm luồng nghiệp vụ nên chạy song song được với mọi nhánh khác."
demo_status: pending
units:
  - { id: OPS-05, type: infrastructure, story: S-OPS-05 }
  - { id: OPS-06, type: infrastructure, story: S-OPS-06 }
  - { id: OPS-07, type: infrastructure, story: S-OPS-07 }
approved_by: AutoSystem (V-Flow + ntapp-slice-planning)
approved_at: 2026-11-03
---

## What to build
Backup/restore check, maintenance timer, pipeline CI (ruff + pytest + vitest) và kiểm tra biến môi trường.

## Acceptance criteria
→ Xem AC trong `test-cases.md` / story file của từng unit ở `units` trên. KHÔNG copy lại tại đây.
